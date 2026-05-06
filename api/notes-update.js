// api/notes-update.js
import { supabaseAdmin } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
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
      .select('id, title, author, content, file_url, file_name, created_at, updated_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (err) {
    console.error('[notes-update] error:', err);

    return res.status(400).json({
      ok: false,
      message: '비밀번호가 일치하지 않거나 수정에 실패했습니다.'
    });
  }
}