const { supabaseAdmin } = require('./_supabase');

function normalizeUNNO(value) {
  const raw = String(value ?? '').trim().replace(/^UN\s*/i, '');
  if (/^\d+$/.test(raw)) return String(Number(raw)).padStart(4, '0');
  return raw.toUpperCase();
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMainClass(classValue) {
  const cls = normalizeText(classValue);
  if (!cls || cls === '-') return '';
  return cls.split('.')[0];
}

function getCarrierStatusLabel(status) {
  if (status === 'ALLOWED') return '선적 가능';
  if (status === 'RESTRICTED') return '조건부 가능 / 제한';
  if (status === 'PROHIBITED') return '선적 금지';
  return '-';
}

function decideStatus(rules) {
  if (!rules || rules.length === 0) return 'ALLOWED';
  if (rules.some(r => r.status === 'PROHIBITED')) return 'PROHIBITED';
  return 'RESTRICTED';
}

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
    // ── 포트별 위험물 제한 조회 (장금상선 SVMS API 프록시) ──
    //   GET /api/carrier-check?port=CNSHA&comp=SNKO  → 해당 포트의 제한 UN/CLASS 목록 반환
    //   (선사별 조회와 한 함수에 통합 — Vercel Hobby 함수 12개 제한 대응)
    if (req.query.port) {
      const key = process.env.SVMS_API_KEY;
      const base = process.env.SVMS_API_BASE || 'https://svmsapi.sinokor.co.kr';
      if (!key) {
        return res.status(200).json({ ok: false, code: 'NO_KEY', message: 'SVMS_API_KEY 미설정 — 포트별 자동판정을 사용하려면 환경변수를 등록하세요.' });
      }
      const port = String(req.query.port).trim().toUpperCase();
      const comp = String(req.query.comp || 'SNKO').trim().toUpperCase();
      if (!port) return res.status(400).json({ ok: false, message: 'port가 필요합니다.' });
      try {
        const r = await fetch(base + '/api/v1/internal', {
          method: 'POST',
          headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: 'api', package_name: 'pkg_opms_etc', procedure_name: 'sp_getrestrictitem4port',
            params: { P_COMP_CD: comp, P_PORT_CD: port }
          })
        });
        const t = await r.text();
        if (!r.ok) return res.status(502).json({ ok: false, message: 'SVMS 호출 실패 (status ' + r.status + ')', detail: t.slice(0, 300) });
        let j; try { j = JSON.parse(t); } catch (e) { return res.status(502).json({ ok: false, message: 'SVMS 응답 파싱 실패' }); }
        const data = Array.isArray(j.data) ? j.data : [];
        return res.status(200).json({ ok: true, port, comp, count: data.length, data });
      } catch (e) {
        return res.status(502).json({ ok: false, code: 'UNREACHABLE', message: 'SVMS 서버에 연결할 수 없습니다(서버 환경에서 사내망 접근 불가일 수 있음): ' + (e.message || e) });
      }
    }

    const inputUnno = normalizeUNNO(req.query.unno);

    if (!inputUnno) {
      return res.status(400).json({
        ok: false,
        message: 'UNNO가 입력되지 않았습니다.'
      });
    }

    // 1) DG_TABLE에서 기본 DG 정보 조회
    const { data: dgData, error: dgError } = await supabaseAdmin
      .from('DG_TABLE')
      .select('*')
      .eq('UNNO', inputUnno);

    if (dgError) throw dgError;

    if (!dgData || dgData.length === 0) {
      return res.status(404).json({
        ok: false,
        message: `UN ${inputUnno} 를 DG_TABLE에서 찾을 수 없습니다.`
      });
    }

    const dgItem = dgData[0];
    const classNo = normalizeText(dgItem.Class);
    const mainClass = getMainClass(classNo);

    // 2) 활성화된 선사 그룹 조회
    // 현재는 룰 테이블에 있는 carrier_group 기준으로 자동 구성
    const { data: carrierRows, error: carrierError } = await supabaseAdmin
      .from('dg_carrier_rules')
      .select('carrier_group, carrier_name')
      .eq('is_active', true);

    if (carrierError) throw carrierError;

    const carrierMap = new Map();
    (carrierRows || []).forEach(row => {
      if (!carrierMap.has(row.carrier_group)) {
        carrierMap.set(row.carrier_group, {
          carrier_group: row.carrier_group,
          carrier_name: row.carrier_name
        });
      }
    });

    const carriers = Array.from(carrierMap.values());

    // 3) 정확한 UNNO 룰 + Class ALL 룰 조회
    const { data: ruleRows, error: ruleError } = await supabaseAdmin
  .from('dg_carrier_rules')
  .select('*')
  .eq('is_active', true)
  .or(`unno.eq.${inputUnno},unno.eq.ALL,unno.eq.COMMON`)
  .order('carrier_group', { ascending: true })
  .order('sort_order', { ascending: true });

    if (ruleError) throw ruleError;

    const results = carriers.map(carrier => {
  const carrierRules = (ruleRows || []).filter(rule => {
    return rule.carrier_group === carrier.carrier_group;
  });

  const exactRules = carrierRules.filter(rule => {
  const ruleUnno = normalizeUNNO(rule.unno);
  return ruleUnno === inputUnno;
});

const classAllRules = carrierRules.filter(rule => {
  const ruleClass = normalizeText(rule.class_no);
  return rule.unno === 'ALL' && (ruleClass === classNo || ruleClass === mainClass);
});

// 정확한 UNNO 룰이 있으면 Class ALL보다 우선 적용
// 예: TSL Class 2.1 ALL PROHIBITED + UN1030 acceptable exception
const matchedRules = exactRules.length ? exactRules : classAllRules;


  // COMMON 룰은 판정에는 직접 반영하지 않고, 화면 안내용으로만 내려줌
  const commonRules = carrierRules.filter(rule => {
    return normalizeText(rule.unno).toUpperCase() === 'COMMON';
  });

  const status = decideStatus(matchedRules);

  const mapRule = rule => ({
    id: rule.id,
    class_no: rule.class_no,
    unno: rule.unno,
    psn: rule.psn,
    status: rule.status,
    remark_code: rule.remark_code,
    remark_text: rule.remark_text,
    source_file: rule.source_file,
    version_no: rule.version_no,
    effective_date: rule.effective_date,
    condition_type: rule.condition_type,
    condition_text: rule.condition_text,
    booking_scope: rule.booking_scope,
    origin_condition: rule.origin_condition,
    destination_condition: rule.destination_condition,
    container_condition: rule.container_condition,
    stowage_condition: rule.stowage_condition,
    document_required: rule.document_required
  });

  return {
    carrier_group: carrier.carrier_group,
    carrier_name: carrier.carrier_name,
    status,
    status_label: getCarrierStatusLabel(status),
    matched_rules: matchedRules.map(mapRule),
    common_rules: commonRules.map(mapRule)
  };
});

    return res.status(200).json({
      ok: true,
      dg: {
        UNNO: dgItem.UNNO,
        Name: dgItem.Name,
        Class: dgItem.Class,
        SUB: dgItem.SUB
      },
      results
    });
  } catch (err) {
    console.error('[api/carrier-check] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || '선사별 선적가부 조회 실패'
    });
  }
};