const { supabaseAdmin } = require('./_supabase');

// 단일 행 JSONB 저장소 (public.inquiry_state)
//   id='faq'   → { items: [...] }   (게시판 답변·이메일에서 생성된 동적 FAQ 항목)
//   id='board' → { posts: [...] }   (상세문의 게시판 글)
// 서버리스(서비스 롤)만 접근하므로 RLS는 잠가둔 채로 동작합니다.

const TABLE = 'inquiry_state';

async function getState(id) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('data').eq('id', id).maybeSingle();
  if (error) throw error;
  if (data && data.data) return data.data;
  return id === 'board' ? { posts: [] } : { items: [] };
}

async function setState(id, obj) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .upsert({ id, data: obj, updated_at: new Date().toISOString() });
  if (error) throw error;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (id !== 'faq' && id !== 'board') return res.status(400).json({ ok: false, message: 'invalid id' });
      return res.status(200).json({ ok: true, data: await getState(id) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { id, action } = body;

      if (id === 'faq') {
        const state = await getState('faq');
        state.items = state.items || [];
        if (action === 'upsert') {
          const item = body.item;
          if (!item || !item.id) return res.status(400).json({ ok: false, message: 'item.id required' });
          const i = state.items.findIndex(x => x.id === item.id);
          if (i >= 0) state.items[i] = item; else state.items.unshift(item);
        } else if (action === 'delete') {
          if (!body.postId) return res.status(400).json({ ok: false, message: 'postId required' });
          state.items = state.items.filter(x => x.id !== body.postId);
        } else {
          return res.status(400).json({ ok: false, message: 'bad faq action' });
        }
        await setState('faq', state);
        return res.status(200).json({ ok: true, data: state });
      }

      if (id === 'board') {
        const state = await getState('board');
        state.posts = state.posts || [];
        if (action === 'create') {
          const post = body.post;
          if (!post || !post.id) return res.status(400).json({ ok: false, message: 'post.id required' });
          state.posts = state.posts.filter(p => p.id !== post.id);
          state.posts.unshift(post);
        } else if (action === 'answer') {
          const p = state.posts.find(x => x.id === body.postId);
          if (!p) return res.status(404).json({ ok: false, message: 'post not found' });
          p.answer = body.answer || '';
          p.answeredAt = new Date().toISOString();
          p.answerBy = body.answerBy || '담당자';
          p.status = 'answered';
        } else if (action === 'delete') {
          state.posts = state.posts.filter(x => x.id !== body.postId);
        } else {
          return res.status(400).json({ ok: false, message: 'bad board action' });
        }
        await setState('board', state);
        return res.status(200).json({ ok: true, data: state });
      }

      return res.status(400).json({ ok: false, message: 'invalid id' });
    }

    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('[api/inquiry] error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'inquiry api error' });
  }
};
