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
    const spNo = String(req.query.sp || '')
      .trim()
      .replace(/^SP\s*/i, '');

    if (!spNo) {
      return res.status(400).json({
        ok: false,
        message: 'SP 번호가 입력되지 않았습니다.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('imdg_special_provisions')
      .select('sp_no, marker, content, source_name, updated_at')
      .eq('sp_no', spNo)
      .single();

    if (error) {
      return res.status(404).json({
        ok: false,
        message: `SP ${spNo} 정보를 찾을 수 없습니다.`
      });
    }

    return res.status(200).json({
      ok: true,
      data
    });
  } catch (err) {
    console.error('[api/sp-lookup] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'Special Provision 조회 실패'
    });
  }
};