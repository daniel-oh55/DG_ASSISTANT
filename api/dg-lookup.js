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
    const unno = String(req.query.unno || '').trim();

    if (!unno) {
      return res.status(400).json({
        ok: false,
        message: 'UNNO가 입력되지 않았습니다.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('DG_TABLE')
      .select('*')
      .eq('UNNO', unno);

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data: data || []
    });
  } catch (err) {
    console.error('[api/dg-lookup] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'DG 상세조회 실패'
    });
  }
};