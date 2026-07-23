const { supabaseAdmin } = require('./_supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // 외부 프로그램(운항팀 연동)에서 자유롭게 조회할 수 있도록 CORS 허용 (읽기 전용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  try {
    const keyword = String(req.query.q || '').trim();

    let query = supabaseAdmin
      .from('DG_NOTES')
      .select('id, title, author, content, file_url, file_name, created_at, updated_at');

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
  } catch (err) {
    console.error('[api/notes] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Failed to fetch notes'
    });
  }
};