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
      title,
      author,
      password,
      content,
      file_url,
      file_name
    } = req.body || {};

    if (!title || !author || !password || !content) {
      return res.status(400).json({
        ok: false,
        message: '제목, 작성자, 비밀번호, 내용을 모두 입력해 주세요.'
      });
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
      .select('id, title, author, content, file_url, file_name, created_at, updated_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (err) {
    console.error('[api/notes-save] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to save note'
    });
  }
};