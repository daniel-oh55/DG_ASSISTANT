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
    const { file_name, file_type, file_base64 } = req.body || {};

    if (!file_name || !file_base64) {
      return res.status(400).json({
        ok: false,
        message: '파일 정보가 부족합니다.'
      });
    }

    const buffer = Buffer.from(file_base64, 'base64');

    const safeFileName = `${Date.now()}_${file_name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `notes/${safeFileName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('dg_files')
      .upload(storagePath, buffer, {
        contentType: file_type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('dg_files')
      .getPublicUrl(storagePath);

    return res.status(200).json({
      ok: true,
      file_url: publicUrlData.publicUrl,
      file_name
    });
  } catch (err) {
    console.error('[api/upload] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || '파일 업로드 실패'
    });
  }
};