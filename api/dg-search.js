const { supabaseAdmin } = require('./_supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // 외부 프로그램(운항팀 연동)에서 자유롭게 조회할 수 있도록 CORS 허용 (읽기 전용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { unnos } = req.body || {};

    if (!Array.isArray(unnos) || unnos.length === 0) {
      return res.status(400).json({
        ok: false,
        message: '조회할 UNNO 목록이 없습니다.'
      });
    }

    const uniqueUnnos = [...new Set(
      unnos
        .map(v => String(v || '').trim())
        .filter(Boolean)
    )];

    const { data, error } = await supabaseAdmin
      .from('DG_TABLE')
      .select('*')
      .in('UNNO', uniqueUnnos);

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data: data || []
    });
  } catch (err) {
    console.error('[api/dg-search] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'DG_TABLE 조회 실패'
    });
  }
};