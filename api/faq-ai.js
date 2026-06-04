// FAQ AI 문의 — 사내 FAQ·문의답변 DB를 근거로 LLM(Gemini)이 답변
module.exports.config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
};

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) {
      return res.status(500).json({ ok: false, message: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.' });
    }

    const { question, context } = req.body || {};
    if (!question || !String(question).trim()) {
      return res.status(400).json({ ok: false, message: '질문 내용이 필요합니다.' });
    }

    const ctx = Array.isArray(context) ? context : [];
    const ctxText = ctx
      .map((c, i) => `[자료 ${i + 1}] (분류: ${c.cat || '-'})\nQ: ${c.q || ''}\nA: ${c.a || ''}`)
      .join('\n\n---\n\n')
      .slice(0, 40000);

    const prompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 상담 보조 AI입니다.
아래 [사내 DG FAQ·문의답변 데이터베이스]를 최우선 근거로 사용자 질문에 한국어로 답하세요.

규칙:
- DB에 근거가 있으면 그 내용을 종합·요약해 구체적으로 답하고, 참고한 자료의 질문 제목을 함께 언급하세요.
- DB에 직접적인 근거가 없으면, 일반 IMDG Code 지식으로 신중히 답하되 먼저 "사내 DB에는 직접 자료가 없어 일반 규정 기준으로 안내드립니다"라고 밝히세요.
- 회사 정책(금지/RFDG 필수/승인 제조사 등)과 IMDG 일반 규정을 구분해 설명하세요.
- 불확실하면 단정하지 말고 담당자 확인을 권고하세요. 사실을 지어내지 마세요.
- 마크다운(굵게, 목록, 표)을 적절히 사용해 읽기 쉽게 작성하세요.
- 답변 맨 끝에 한 줄로 "※ 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다." 를 덧붙이세요.

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[사용자 질문]
${String(question).trim()}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    });

    const geminiText = await geminiResponse.text();
    if (!geminiResponse.ok) {
      console.error('[api/faq-ai] Gemini error:', geminiText);
      return res.status(500).json({ ok: false, message: 'Gemini API 호출 실패', detail: geminiText.slice(0, 300) });
    }

    const geminiJson = JSON.parse(geminiText);
    const answer = (geminiJson?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('\n')
      .trim();

    if (!answer) {
      return res.status(500).json({ ok: false, message: 'AI가 답변을 반환하지 않았습니다. 잠시 후 다시 시도해 주세요.' });
    }

    return res.status(200).json({ ok: true, model, answer, used: ctx.length });
  } catch (err) {
    console.error('[api/faq-ai] error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'AI 답변 생성 중 오류가 발생했습니다.' });
  }
};
