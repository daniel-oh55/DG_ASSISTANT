const { supabaseAdmin } = require('./_supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  try {
    const {
      id,
      title,
      author,
      password,
      content,
      file_url,
      file_name
    } = req.body || {};

    if (!id || !title || !author || !password || !content) {
      return res.status(400).json({
        ok: false,
        message: '수정에 필요한 값이 부족합니다.'
      });
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
      .select('id, title, author, content, file_url, file_name, created_at, updated_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(403).json({
        ok: false,
        message: '비밀번호가 일치하지 않거나 수정할 노트를 찾을 수 없습니다.'
      });
    }

    return res.status(200).json({
      ok: true,
      data: data[0]
    });
  } catch (err) {
    console.error('[api/notes-update] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to update note'
    });
  }
};