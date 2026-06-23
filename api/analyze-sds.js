const { supabaseAdmin } = require('./_supabase');

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb'
    }
  }
};

function extractJsonFromText(text) {
  const raw = String(text || '').trim();

  try {
    return JSON.parse(raw);
  } catch (_) {
    // ```json ... ``` 형태로 반환될 경우 대비
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (_) {
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first >= 0 && last > first) {
        return JSON.parse(cleaned.slice(first, last + 1));
      }
      throw new Error('Gemini 응답을 JSON으로 해석할 수 없습니다.');
    }
  }
}

function normalizeUnno(value) {
  const raw = String(value || '').trim().replace(/^UN\s*/i, '');
  if (/^\d+$/.test(raw)) return String(Number(raw)).padStart(4, '0');
  return raw;
}

function normalizeResult(result) {
  const normalized = {
    document_type: result.document_type || 'UNKNOWN',
    dg_status: result.dg_status || 'UNCLEAR',
    confidence: result.confidence || 'LOW',
    product_name: result.product_name || '-',
    substance_name: result.substance_name || '-',
    manufacturer: result.manufacturer || '-',
    manufacturer_status: result.manufacturer_status || 'N/A',
    unno: normalizeUnno(result.unno || ''),
    proper_shipping_name: result.proper_shipping_name || '-',
    class: result.class || '-',
    subsidiary_risk: result.subsidiary_risk || '-',
    packing_group: result.packing_group || '-',
    watt_hour: result.watt_hour || '-',
    special_provisions: result.special_provisions || '-',
    marine_pollutant: result.marine_pollutant || 'UNKNOWN',
    transport_mode_basis: result.transport_mode_basis || 'IMDG / Sea transport',
    basis: result.basis || '-',
    section_14_found: Boolean(result.section_14_found),
    not_regulated_text_found: Boolean(result.not_regulated_text_found),
    evidence_quotes: Array.isArray(result.evidence_quotes) ? result.evidence_quotes.slice(0, 5) : [],
    warnings: Array.isArray(result.warnings) ? result.warnings.slice(0, 5) : []
  };

  const status = String(normalized.dg_status).toUpperCase().replace(/[^A-Z_-]/g, '');
  if (['DG', 'NON_DG', 'NON-DG', 'UNCLEAR'].includes(status)) {
    normalized.dg_status = status.replace('-', '_');
  } else {
    normalized.dg_status = 'UNCLEAR';
  }

  const confidence = String(normalized.confidence).toUpperCase();
  normalized.confidence = ['HIGH', 'MEDIUM', 'LOW'].includes(confidence) ? confidence : 'LOW';

  return normalized;
}

async function lookupDgTable(unno) {
  if (!unno) return null;

  const { data, error } = await supabaseAdmin
    .from('DG_TABLE')
    .select('UNNO, Name, Class, SUB, PG, "Special Provisions", "Stowage and Handling", Segregation')
    .eq('UNNO', unno)
    .limit(1);

  if (error) {
    console.error('[api/analyze-sds] DG_TABLE lookup error:', error);
    return null;
  }

  return data && data.length ? data[0] : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const newsKeyRaw = process.env.GEMINI_NEWS_API_KEY;   // 뉴스 전용 키(있으면) — SDS의 예비 키로 빌려 씀
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.'
      });
    }

    // SDS/MSDS 판독은 메인 기능 — 메인 키 우선, 토큰 소진(429)·과부하(503)로 막히면
    // 뉴스 키를 예비 연료로 자동 전환해 끝까지 시도한다. (뉴스는 비필수이므로 메인 기능을 우선 보호)
    const KEYS = (newsKeyRaw && newsKeyRaw !== apiKey) ? [apiKey, newsKeyRaw] : [apiKey];
    // 모델 폴백 순서(사용자 지정): 3.5 Flash → (한도소진/과부하 시) 3.1 Flash Lite → 3 Flash
    const MODELS = [...new Set([model, 'gemini-3.1-flash-lite', 'gemini-3-flash'])];
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const { file_name, file_type, file_base64 } = req.body || {};

    if (!file_name || !file_base64) {
      return res.status(400).json({
        ok: false,
        message: 'PDF 파일 정보가 부족합니다.'
      });
    }

    if (file_type !== 'application/pdf') {
      return res.status(400).json({
        ok: false,
        message: 'PDF 파일만 분석할 수 있습니다.'
      });
    }

    const approxBytes = Math.ceil(file_base64.length * 0.75);
    const maxBytes = 3 * 1024 * 1024;

    if (approxBytes > maxBytes) {
      return res.status(400).json({
        ok: false,
        message: 'PDF 파일은 6MB 이하만 분석할 수 있습니다.'
      });
    }

    const prompt = `
You are a maritime dangerous goods compliance assistant for a container shipping company.

Task:
Analyze the uploaded PDF document and determine whether the product/substance is regulated as Dangerous Goods for sea transport under IMDG context.

Important rules:
- Focus on SDS/MSDS Section 14 Transport Information.
- Prefer IMDG / Sea transport information over IATA, ADR, DOT, TDG, or other modes.
- If Section 14 is missing or unclear, return dg_status as "UNCLEAR".
- If the document says "Not regulated as dangerous goods" specifically for IMDG/Sea transport, return "NON_DG".
- If UN number, hazard class, or proper shipping name is found for IMDG/Sea transport, return "DG".
- ALSO handle lithium battery/cell documents (SDS, UN 38.3 test report/summary, datasheet), not only Section 14. Extract the Watt-hour (Wh) rating per cell/battery (and lithium content in grams for lithium metal), and whether the item is a CELL or a BATTERY.
- Reflect special provisions / exceptions that make an item NOT regulated as dangerous goods for sea transport:
  * SP188 (lithium batteries/cells): a lithium ION cell <= 20 Wh or battery <= 100 Wh, OR a lithium METAL cell <= 1 g or battery <= 2 g lithium content, that meets the SP188 conditions, is EXCEPTED -> set dg_status = "NON_DG", put "SP188" in special_provisions, and explain the threshold in basis (e.g., "17.96 Wh <= 20 Wh per cell, excepted under SP188"). Still record the reference UN number (UN3480 / UN3481 / UN3090 / UN3091) in unno.
  * If any other special provision, limited/excepted quantity, or an explicit "not subject to the IMDG Code" statement applies, set "NON_DG" and cite it in special_provisions / basis.
- When a special provision exempts the item, dg_status MUST be "NON_DG" even though a UN number exists.
- LITHIUM BATTERY MANUFACTURER CHECK (only for lithium battery/cell docs — UN3480 / UN3481 / UN3090 / UN3091): Extract the cell/battery manufacturer (maker) from the document (usually Section 1 product/company identifier, the brand, or the UN 38.3 test applicant). The carrier's operations team (운항팀) approves ONLY these makers for DG lithium batteries: **SAMSUNG SDI, LG ENERGY SOLUTION (incl. LG Chem), SK ON**.
  * ⚠️ The manufacturer restriction applies ONLY when the battery is shipped AS DANGEROUS GOODS (DG). If dg_status is "NON_DG" (e.g., excepted under SP188 — lithium ion cell <=20Wh / battery <=100Wh, etc.), there is NO manufacturer restriction at all -> set manufacturer_status = "N/A" regardless of the maker (still extract the manufacturer name for reference if visible), and in basis (Korean) note "SP188 비위험물(NON-DG)로 분류되어 제조사 제한이 적용되지 않습니다". Perform the APPROVED / NOT_APPROVED / UNKNOWN maker checks below ONLY when dg_status is "DG".
  * Manufacturer clearly matches one of the approved makers -> manufacturer_status = "APPROVED". In basis (Korean): note "승인 제조사(<maker>) — 위험물 리튬배터리 선적 가능 대상".
  * Manufacturer is clearly a different maker (e.g., CATL, BYD, EVE, Gotion, Panasonic, etc.) -> manufacturer_status = "NOT_APPROVED". In basis (Korean): "승인 제조사 아님(<maker>) — 운항팀(DG Center)에 선적 가능한 제조사인지 확인 필요" and add the same to warnings.
  * Manufacturer missing or cannot be reliably identified -> manufacturer_status = "UNKNOWN". In basis (Korean): "제조사 확인 불가 — 운항팀(DG Center)에 선적 가능한 제조사인지 확인 필요" and add the same to warnings.
  * For non-lithium-battery documents, set manufacturer = "" and manufacturer_status = "N/A".
- Do not invent UN numbers or classes.
- Evidence quotes must be short exact snippets from the document.
- Return JSON only. No markdown. No code block.

Return this exact JSON structure:
{
  "document_type": "SDS | MSDS | TEST_REPORT | COMMERCIAL_DOC | UNKNOWN",
  "dg_status": "DG | NON_DG | UNCLEAR",
  "confidence": "HIGH | MEDIUM | LOW",
  "product_name": "string",
  "substance_name": "string",
  "manufacturer": "battery/cell maker if found (e.g. 'SAMSUNG SDI'), else empty string",
  "manufacturer_status": "APPROVED | NOT_APPROVED | UNKNOWN | N/A",
  "unno": "4 digit UN number or empty string",
  "proper_shipping_name": "string",
  "class": "string",
  "subsidiary_risk": "string",
  "packing_group": "string",
  "watt_hour": "Watt-hour rating per cell/battery if present (e.g. '17.96 Wh'), else empty string",
  "special_provisions": "applicable special provision(s) such as 'SP188' if any, else empty string",
  "marine_pollutant": "Yes | No | Unknown",
  "transport_mode_basis": "IMDG / Sea transport basis",
  "section_14_found": true,
  "not_regulated_text_found": false,
  "basis": "short explanation",
  "evidence_quotes": ["short quote 1", "short quote 2"],
  "warnings": ["warning 1"]
}
`;

    const reqBody = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file_type,
                data: file_base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    });

    // 키 우선순위(메인→예비 뉴스 키) × 모델 폴백으로 호출. 한 키가 쿼터소진(429)·과부하(503)·키오류(401/403)면 다음 키로.
    async function callGemini() {
      let lastStatus = 0, lastDetail = '';
      for (let k = 0; k < KEYS.length; k++) {
        const useKey = KEYS[k];
        let keyErr = false;
        for (const mdl of MODELS) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${encodeURIComponent(useKey)}`;
          for (let attempt = 0; attempt < 2; attempt++) {
            if (attempt) await sleep(800);
            const r = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: reqBody
            });
            const t = await r.text();
            if (r.ok) {
              const j = JSON.parse(t);
              const text = (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim();
              return { outputText: text, usedModel: mdl };
            }
            lastStatus = r.status; lastDetail = t.slice(0, 300);
            console.error('[api/analyze-sds] Gemini error', `key#${k + 1}/${KEYS.length}`, mdl, r.status, t.slice(0, 150));
            if (r.status === 503) continue;                          // 과부하 → 같은 모델 1회 재시도
            if (r.status === 429) break;                             // 쿼터 소진 → 같은 키의 다음 모델로
            if (r.status === 404 || r.status === 400) break;         // 모델 미지원 → 다음 모델
            if (r.status === 401 || r.status === 403) { keyErr = true; break; } // 키 무효 → 다음 키
            break;                                                   // 그 외 → 다음 모델 시도
          }
          if (keyErr) break;   // 키 자체가 무효 → 남은 모델 건너뛰고 다음 키로 폴백
        }
        if (k < KEYS.length - 1) {
          console.error('[api/analyze-sds] 키 폴백:', `key#${k + 1} 소진(status ${lastStatus}) → 예비 key#${k + 2} 시도`);
        }
      }
      const e = new Error('Gemini API 호출 실패'); e.detail = lastDetail; throw e;
    }

    let outputText = '', usedModel = model;
    try {
      const g = await callGemini();
      outputText = g.outputText; usedModel = g.usedModel;
    } catch (e) {
      return res.status(500).json({
        ok: false,
        message: 'Gemini API 호출 실패',
        detail: e.detail || ''
      });
    }

    if (!outputText) {
      return res.status(500).json({
        ok: false,
        message: 'Gemini가 분석 결과를 반환하지 않았습니다.'
      });
    }

    const parsed = extractJsonFromText(outputText);
    const result = normalizeResult(parsed);

    const dgTableMatch = result.unno
      ? await lookupDgTable(result.unno)
      : null;

    return res.status(200).json({
      ok: true,
      provider: 'gemini',
      model: usedModel,
      file_name,
      result,
      dg_table_match: dgTableMatch,
      disclaimer: '본 결과는 업로드된 문서 기반 AI 1차 판독 결과입니다. 최종 선적 가능 여부는 IMDG Code, 선사별 제한, 터미널 규정, POL/POD 국가 규정 및 최신 SDS 원본을 기준으로 담당자가 확인해야 합니다.'
    });
  } catch (err) {
    console.error('[api/analyze-sds] error:', err);

    return res.status(500).json({
      ok: false,
      message: err.message || 'SDS/MSDS 분석 중 오류가 발생했습니다.'
    });
  }
};