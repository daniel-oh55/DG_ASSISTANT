// FAQ AI — 사내 FAQ·문의답변 DB를 근거로 LLM(Gemini)이 처리
//   mode 'answer'(기본): FAQ 질문 답변   |   mode 'reply': 이메일 회신 초안 작성
//   (Vercel Hobby 플랜 함수 12개 제한 때문에 faq-reply를 이 파일에 통합)
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

    const body = req.body || {};
    const mode = body.mode === 'reply' ? 'reply' : 'answer';
    const { question, context, subject, inquiry } = body;

    const ctx = Array.isArray(context) ? context : [];
    const ctxText = ctx
      .map((c, i) => `[자료 ${i + 1}] (분류: ${c.cat || '-'})\nQ: ${c.q || ''}\nA: ${c.a || ''}`)
      .join('\n\n---\n\n')
      .slice(0, 40000);

    let prompt;
    if (mode === 'reply') {
      // ── 이메일 회신 초안 작성 ──
      if ((!subject || !String(subject).trim()) && (!inquiry || !String(inquiry).trim())) {
        return res.status(400).json({ ok: false, message: '제목 또는 문의 내용이 필요합니다.' });
      }
      prompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 담당자를 대신해 고객 문의 이메일에 대한 **회신 초안**을 작성하는 보조 AI입니다.
아래 [사내 DG FAQ·문의답변 데이터베이스]를 최우선 근거로, 받은 문의에 대한 한국어 회신 이메일 본문을 작성하세요.

작성 규칙:
- 형식: 정중한 인사말 → 문의에 대한 구체적 답변 → 맺음말(필요 시 추가 확인 안내) 순의 **이메일 본문**으로 작성하세요.
- 사내 DB에 근거가 있으면 그 내용을 종합해 구체적으로 답하세요. 회사 정책(금지/RFDG 필수/승인 제조사 등)과 IMDG 일반 규정을 구분해 안내하세요.
- 사내 DB에 직접 근거가 없으면, 일반 IMDG Code 기준으로 신중히 안내하되 단정하지 말고 담당자 최종 확인을 권고하세요. 사실을 지어내지 마세요.
- 어디까지나 담당자가 검토·수정 후 발송할 **초안**입니다. 과한 확약 표현은 피하세요.
- 받는사람 이름을 모르면 "안녕하세요, 담당자님." 정도로 시작하세요.
- 제목·머리말(To/From 등)·서명 블록은 넣지 말고, 메일 본문 텍스트만 출력하세요. (수신/참조/발신은 시스템이 자동 입력합니다.)
- 마지막 줄에 "※ 본 회신은 AI 초안이며, 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다." 를 덧붙이세요.

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[받은 문의 - 제목]
${String(subject || '').trim() || '(제목 없음)'}

[받은 문의 - 내용]
${String(inquiry || '').trim() || '(본문 없음 — 제목 기준으로 작성)'}`;
    } else {
      // ── FAQ AI 답변 (기존 동작) ──
      if (!question || !String(question).trim()) {
        return res.status(400).json({ ok: false, message: '질문 내용이 필요합니다.' });
      }
      prompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 상담 보조 AI입니다.
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
    }

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
    const text = (geminiJson?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('\n')
      .trim();

    if (!text) {
      return res.status(500).json({ ok: false, message: 'AI가 응답을 반환하지 않았습니다. 잠시 후 다시 시도해 주세요.' });
    }

    if (mode === 'reply') {
      return res.status(200).json({ ok: true, model, reply: text, used: ctx.length });
    }
    return res.status(200).json({ ok: true, model, answer: text, used: ctx.length });
  } catch (err) {
    console.error('[api/faq-ai] error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'AI 처리 중 오류가 발생했습니다.' });
  }
};
