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
    const { id, password } = req.body || {};

    if (!id || !password) {
      return res.status(400).json({
        ok: false,
        message: '삭제에 필요한 값이 부족합니다.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('DG_NOTES')
      .delete()
      .eq('id', id)
      .eq('password', password)
      .select('id');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(403).json({
        ok: false,
        message: '비밀번호가 일치하지 않습니다.'
      });
    }

    return res.status(200).json({
      ok: true
    });
  } catch (err) {
    console.error('[api/notes-delete] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to delete note'
    });
  }
};