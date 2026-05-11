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
    unno: normalizeUnno(result.unno || ''),
    proper_shipping_name: result.proper_shipping_name || '-',
    class: result.class || '-',
    subsidiary_risk: result.subsidiary_risk || '-',
    packing_group: result.packing_group || '-',
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
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.'
      });
    }

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
    const maxBytes = 6 * 1024 * 1024;

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
  "unno": "4 digit UN number or empty string",
  "proper_shipping_name": "string",
  "class": "string",
  "subsidiary_risk": "string",
  "packing_group": "string",
  "marine_pollutant": "Yes | No | Unknown",
  "transport_mode_basis": "IMDG / Sea transport basis",
  "section_14_found": true,
  "not_regulated_text_found": false,
  "basis": "short explanation",
  "evidence_quotes": ["short quote 1", "short quote 2"],
  "warnings": ["warning 1"]
}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
      })
    });

    const geminiText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      console.error('[api/analyze-sds] Gemini error:', geminiText);
      return res.status(500).json({
        ok: false,
        message: 'Gemini API 호출 실패',
        detail: geminiText.slice(0, 500)
      });
    }

    const geminiJson = JSON.parse(geminiText);
    const outputText =
      geminiJson?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('\n')
        .trim() || '';

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
      model,
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