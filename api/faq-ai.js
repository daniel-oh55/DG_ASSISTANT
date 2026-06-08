// FAQ AI — 사내 FAQ·문의답변 DB를 근거로 LLM(Gemini)이 처리
//   mode 'answer'(기본): FAQ 질문 답변
//   mode 'reply': 이메일 회신 초안 (2단계: 초안 생성 → 검증·교정으로 일관성 확보)
//   mode 'audit': 답변 오류·모순 검토
//   (Vercel Hobby 함수 12개 제한 때문에 단일 함수에 통합)
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    // Gemini 호출 헬퍼 — temperature 지정(낮을수록 일관/결정적)
    async function gen(promptText, temperature) {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { temperature: temperature }
        })
      });
      const t = await r.text();
      if (!r.ok) { console.error('[api/faq-ai] Gemini error:', t); throw new Error('Gemini API 호출 실패'); }
      const j = JSON.parse(t);
      return (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim();
    }

    const body = req.body || {};
    const mode = body.mode === 'reply' ? 'reply' : (body.mode === 'audit' ? 'audit' : 'answer');
    const { question, context, subject, inquiry, dgData, unnos } = body;

    const ctx = Array.isArray(context) ? context : [];
    const ctxText = ctx
      .map((c, i) => `[자료 ${i + 1}] (분류: ${c.cat || '-'})\nQ: ${c.q || ''}\nA: ${c.a || ''}`)
      .join('\n\n---\n\n')
      .slice(0, 40000);

    // ───────────────────────── 회신 초안 (2단계 검증) ─────────────────────────
    if (mode === 'reply') {
      if ((!subject || !String(subject).trim()) && (!inquiry || !String(inquiry).trim())) {
        return res.status(400).json({ ok: false, message: '제목 또는 문의 내용이 필요합니다.' });
      }
      const dgRows = Array.isArray(dgData) ? dgData : [];
      const dgText = dgRows.length
        ? dgRows.map((r, i) => `[DG ${i + 1}] ` + JSON.stringify(r)).join('\n').slice(0, 12000)
        : '(조회된 DG 상세 없음 — UN번호 미언급 또는 미등록)';
      const unText = (Array.isArray(unnos) && unnos.length) ? unnos.join(', ') : '(없음)';
      const subjText = String(subject || '').trim() || '(제목 없음)';
      const inqText = String(inquiry || '').trim() || '(본문 없음 — 제목 기준으로 작성)';

      const sources = `[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[조회된 위험물 상세 — DG_TABLE (문의 내 UN번호: ${unText})]
${dgText}`;

      // 1단계: 초안 생성 (간결·종합판단)
      const draftPrompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 담당자를 대신해 회신 초안을 쓰는 보조 AI입니다.
아래 자료를 **종합 판단**해 받은 문의에 대한 한국어 회신 본문을 **간결하게** 작성하세요.

판단 근거 순서: ① 사내 DB의 회사 정책(선적금지·혼적 제한 등) ② 조회된 위험물 상세(class·격리그룹) ③ IMDG Code 격리표/격리그룹.
- 혼적 가능여부는 각 UN의 class를 보고 IMDG 격리요건을 적용해 가능/조건부/불가를 판정.
- 결론은 **하나로 명확히**. 추측 남발 금지, 불확실하면 담당자 확인 권고.

${sources}

[문의 제목] ${subjText}
[문의 내용] ${inqText}

요구: 인사말 → 핵심 답변(결론+간단 근거) → 맺음말. 군더더기 없이 간결하게. 본문 텍스트만.`;

      const draft = await gen(draftPrompt, 0);   // temperature 0 → 결정적

      // 2단계: 검증·교정 (오류/모순 제거, 일관성, 간결)
      const verifyPrompt = `다음 [회신 초안]을 [근거 자료] 및 IMDG Code에 비추어 **검증·교정**하세요.
점검: ① 사실/규정 오류 ② 자기모순·논리 비일관 ③ 과장·이중 결론. 문제가 있으면 바로잡고, **하나의 일관된 결론**으로 정리하세요.
결과는 교정된 **최종 회신 본문만** 출력합니다(설명·메타코멘트 금지). 간결한 이메일체(인사말→핵심 결론과 근거→맺음말).
마지막 줄에 반드시: "※ 본 회신은 AI 초안이며, 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."

${sources}

[문의 제목] ${subjText}
[문의 내용] ${inqText}

[회신 초안]
${draft}`;

      const finalReply = await gen(verifyPrompt, 0);
      return res.status(200).json({ ok: true, model, reply: finalReply || draft, used: ctx.length, verified: true });
    }

    // ───────────────────────── 답변 검토(audit) ─────────────────────────
    if (mode === 'audit') {
      const auditPrompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 품질 검토 AI입니다.
아래 [사내 DG FAQ·문의답변 모음]을 검토해, 담당자가 확인·수정해야 할 문제를 찾아 **한국어**로 보고하세요.

찾을 항목:
1) **상호 모순** — 서로 다른 항목이 같은 사안을 다르게 안내.
2) **규정 오류** — IMDG Code 기준 명백히 틀린 내용.
3) **애매/위험 안내** — 단정적이거나 근거 불충분.

출력(마크다운): 각 건을 번호 목록으로 **[유형]** 관련 질문 제목 → 문제 요약 → 권고. 의심 건은 "검토 필요" 표시. 사실을 지어내지 마세요.
문제가 없으면 "검토 결과 뚜렷한 모순·오류는 발견되지 않았습니다."만 답하세요.
마지막 줄: "※ AI 검토 의견이며, 최종 수정은 담당자가 IMDG Code·사내 규정과 대조해 확인하세요."

[사내 DG FAQ·문의답변 모음]
${ctxText || '(제공된 자료 없음)'}`;
      const audit = await gen(auditPrompt, 0.2);
      if (!audit) return res.status(500).json({ ok: false, message: 'AI가 응답을 반환하지 않았습니다.' });
      return res.status(200).json({ ok: true, model, audit, used: ctx.length });
    }

    // ───────────────────────── FAQ 답변(answer, 기본) ─────────────────────────
    if (!question || !String(question).trim()) {
      return res.status(400).json({ ok: false, message: '질문 내용이 필요합니다.' });
    }
    const answerPrompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 상담 보조 AI입니다.
아래 [사내 DG FAQ·문의답변 데이터베이스]를 최우선 근거로 사용자 질문에 한국어로 답하세요.

규칙:
- DB에 근거가 있으면 종합·요약해 구체적으로 답하고, 참고한 자료 제목을 언급하세요.
- DB에 직접 근거가 없으면 먼저 "사내 DB에는 직접 자료가 없어 일반 규정 기준으로 안내드립니다"라고 밝히고 일반 IMDG Code 지식으로 신중히 답하세요.
- 회사 정책과 IMDG 일반 규정을 구분하세요. 불확실하면 담당자 확인 권고. 사실을 지어내지 마세요.
- 마크다운으로 읽기 쉽게. 끝에 "※ 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[사용자 질문]
${String(question).trim()}`;
    const answer = await gen(answerPrompt, 0.3);
    if (!answer) return res.status(500).json({ ok: false, message: 'AI가 답변을 반환하지 않았습니다.' });
    return res.status(200).json({ ok: true, model, answer, used: ctx.length });
  } catch (err) {
    console.error('[api/faq-ai] error:', err);
    return res.status(500).json({ ok: false, message: err.message || 'AI 처리 중 오류가 발생했습니다.' });
  }
};
