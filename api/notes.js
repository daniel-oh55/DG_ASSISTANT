// api/notes.js
import { supabaseAdmin } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('DG_NOTES')
      .select('id, title, author, content, file_url, file_name, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data: data || []
    });
  } catch (err) {
    console.error('[notes] error:', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to fetch notes'
    });
  }
}