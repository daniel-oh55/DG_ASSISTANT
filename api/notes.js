const { supabaseAdmin } = require('./_supabase');

// 노트 API 통합 핸들러 (Vercel Hobby 플랜 서버리스 함수 12개 제한 때문에 1개 함수로 통합)
//   GET  /api/notes?q=키워드      → 목록/검색 (읽기 전용, CORS 허용)
//   POST /api/notes-save          → 등록   (vercel.json rewrite: /api/notes?op=save)
//   POST /api/notes-update        → 수정   (vercel.json rewrite: /api/notes?op=update)
//   POST /api/notes-delete        → 삭제   (vercel.json rewrite: /api/notes?op=delete)

const COLUMNS = 'id, title, author, content, file_url, file_name, created_at, updated_at';

function fail(res, status, message) {
  return res.status(status).json({ ok: false, message });
}

async function list(req, res) {
  const keyword = String(req.query.q || '').trim();

  let query = supabaseAdmin.from('DG_NOTES').select(COLUMNS);

  // 제목 또는 내용에 키워드가 포함된 노트 검색
  if (keyword) {
    const safeKeyword = keyword.replace(/[%_]/g, '\\$&');
    query = query.or(`title.ilike.%${safeKeyword}%,content.ilike.%${safeKeyword}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  return res.status(200).json({
    ok: true,
    keyword,
    count: data ? data.length : 0,
    data: data || []
  });
}

async function save(req, res) {
  const { title, author, password, content, file_url, file_name } = req.body || {};

  if (!title || !author || !password || !content) {
    return fail(res, 400, '제목, 작성자, 비밀번호, 내용을 모두 입력해 주세요.');
  }

  const { data, error } = await supabaseAdmin
    .from('DG_NOTES')
    .insert([{
      title,
      author,
      password,
      content,
      file_url: file_url || null,
      file_name: file_name || null
    }])
    .select(COLUMNS)
    .single();
  if (error) throw error;

  return res.status(200).json({ ok: true, data });
}

async function update(req, res) {
  const { id, title, author, password, content, file_url, file_name } = req.body || {};

  if (!id || !title || !author || !password || !content) {
    return fail(res, 400, '수정에 필요한 값이 부족합니다.');
  }

  const { data, error } = await supabaseAdmin
    .from('DG_NOTES')
    .update({
      title,
      author,
      content,
      file_url: file_url || null,
      file_name: file_name || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('password', password)
    .select(COLUMNS);
  if (error) throw error;

  if (!data || data.length === 0) {
    return fail(res, 403, '비밀번호가 일치하지 않거나 수정할 노트를 찾을 수 없습니다.');
  }

  return res.status(200).json({ ok: true, data: data[0] });
}

async function remove(req, res) {
  const { id, password } = req.body || {};

  if (!id || !password) {
    return fail(res, 400, '삭제에 필요한 값이 부족합니다.');
  }

  const { data, error } = await supabaseAdmin
    .from('DG_NOTES')
    .delete()
    .eq('id', id)
    .eq('password', password)
    .select('id');
  if (error) throw error;

  if (!data || data.length === 0) {
    return fail(res, 403, '비밀번호가 일치하지 않습니다.');
  }

  return res.status(200).json({ ok: true });
}

const POST_OPS = { save, update, delete: remove };

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 외부 프로그램(운항팀 연동)에서 자유롭게 조회할 수 있도록 GET만 CORS 허용 (쓰기 API는 동일 출처만)
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();

  const op = String(req.query.op || '');

  try {
    if (req.method === 'GET') return await list(req, res);

    if (req.method === 'POST' && Object.prototype.hasOwnProperty.call(POST_OPS, op)) {
      return await POST_OPS[op](req, res);
    }

    return fail(res, 405, 'Method not allowed');
  } catch (err) {
    console.error('[api/notes' + (op ? ':' + op : '') + '] error:', err);
    return fail(res, 500, err.message || 'Notes API error');
  }
};
