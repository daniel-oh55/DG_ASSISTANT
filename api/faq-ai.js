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

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // 과부하(503) 대비 모델 폴백 목록 (설정 모델 우선, 막히면 대체 모델로)
    const MODELS = [...new Set([model, 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'])];
    // Gemini 호출 헬퍼 — temperature 지정 + 503/429/404 시 다음 모델로 폴백
    async function gen(promptText, temperature) {
      let lastStatus = 0;
      for (const mdl of MODELS) {
        const ep = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        for (let attempt = 0; attempt < 2; attempt++) {
          if (attempt) await sleep(800);
          const r = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: promptText }] }],
              generationConfig: { temperature: temperature }
            })
          });
          const t = await r.text();
          if (r.ok) {
            const j = JSON.parse(t);
            return (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim();
          }
          lastStatus = r.status;
          console.error('[api/faq-ai] Gemini error', mdl, r.status, t.slice(0, 150));
          if (r.status === 503 || r.status === 429) continue;        // 같은 모델 1회 재시도
          if (r.status === 404 || r.status === 400) break;            // 모델 문제 → 다음 모델
          throw new Error('Gemini API 호출 실패');                     // 그 외(키 등) → 중단
        }
        // 이 모델 소진 → 다음 모델로 폴백
      }
      if (lastStatus === 503 || lastStatus === 429) {
        const e = new Error('AI 서버가 일시적으로 혼잡합니다(잠시 후 다시 시도해 주세요).'); e.code = 503; throw e;
      }
      throw new Error('Gemini API 호출 실패');
    }

    const body = req.body || {};
    const mode = ['reply', 'audit', 'news'].includes(body.mode) ? body.mode : 'answer';
    const { question, context, subject, inquiry, dgData, unnos, segInfo } = body;

    // ───────────────────────── 위험물 사고 뉴스 (news) ─────────────────────────
    if (mode === 'news') {
      const decode = s => String(s || '')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
        .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d)).trim();
      const queries = [
        '컨테이너 화재 위험물', '위험물 폭발 사고', '물류창고 화재 위험물',
        '위험물 운송 사고', 'dangerous goods container fire'
      ];
      const results = await Promise.all(queries.map(async q => {
        try {
          const rr = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!rr.ok) return [];
          const xml = await rr.text();
          const out = []; const re = /<item>([\s\S]*?)<\/item>/g; let m;
          while ((m = re.exec(xml)) && out.length < 15) {
            const b = m[1];
            const title = decode((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
            const link = decode((b.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '');
            const pub = decode((b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '');
            const source = decode((b.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '');
            if (title && link) out.push({ title, link, pub, source });
          }
          return out;
        } catch (_) { return []; }
      }));
      // 병합 + 중복 제거 (제목 정규화)
      const seen = new Set(); const merged = [];
      for (const it of results.flat()) {
        const base = it.title.replace(/\s*-\s*[^-]+$/, '');   // " - 출처" 제거
        const norm = base.toLowerCase().replace(/[^0-9a-z가-힣]/g, '').slice(0, 30);
        if (!norm || seen.has(norm)) continue;
        // 앞 12자 겹치면 유사 중복으로 간주
        const pre = norm.slice(0, 12);
        if ([...seen].some(s => s.slice(0, 12) === pre)) continue;
        seen.add(norm);
        merged.push({ title: base, link: it.link, source: it.source, pub: it.pub, ts: Date.parse(it.pub) || 0 });
      }
      merged.sort((a, b) => b.ts - a.ts);
      const news = merged.slice(0, 10);
      // Gemini로 위험물/선적금지 의견 (실패해도 헤드라인은 제공)
      if (news.length) {
        try {
          const list = news.map((n, i) => `${i + 1}. ${n.title}`).join('\n');
          const op = await gen(`다음은 컨테이너물류/위험물 관련 사고 뉴스 헤드라인입니다. 각 항목을 한국어로 분석해 **JSON 배열로만** 답하세요(JSON 외 텍스트·코드펜스 금지).
형식: [{"i":번호,"dg":"관련 위험물 추정(모르면 '미상')","hazard":"핵심 위험성 한 줄","opinion":"우리(선사)가 해당 화물 선적 금지/제한을 검토할 필요가 있는지 한 줄 의견"}]
- 헤드라인만으로 신중히 추정하고, 불확실하면 '추정'이라고 표시. 과장 금지.

${list}`, 0.2);
          const jsonText = (op.match(/\[[\s\S]*\]/) || [op])[0];
          const arr = JSON.parse(jsonText);
          arr.forEach(o => { const idx = (+o.i) - 1; if (news[idx]) { news[idx].dg = o.dg; news[idx].hazard = o.hazard; news[idx].opinion = o.opinion; } });
        } catch (e) { console.error('[news] opinion fail', e.message); }
      }
      return res.status(200).json({ ok: true, count: news.length, news });
    }

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

      // 시스템이 IMDG 일반 격리표로 계산한 결정론적 판정(있으면 권위 결론으로 사용)
      let segText = '(혼적/격리 판정 해당 없음 — 단일 품목이거나 클래스 미확인)';
      if (segInfo && segInfo.verdict) {
        segText = `판정: ${segInfo.verdict}\n대상: ${(segInfo.cargos || []).join(' / ')}`
          + (segInfo.detail && segInfo.detail.length ? `\n클래스 간 격리코드: ${segInfo.detail.join(', ')}` : '');
      }
      const sources = `[격리표 판정 결과 — 시스템이 IMDG 일반 격리표로 계산함(권위 있는 결론, 임의로 뒤집지 말 것)]
${segText}

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[조회된 위험물 상세 — DG_TABLE (문의 내 UN번호: ${unText})]
${dgText}`;

      const replyPrompt = `당신은 장금상선/흥아라인 운항팀 위험물(DG) 담당자를 대신해 회신 초안을 쓰는 보조 AI입니다.
받은 문의에 대해 한국어 회신 본문을 **간결하게** 작성하세요.

판정 규칙(중요):
- 혼적/격리 가능여부는 위 [격리표 판정 결과]를 **그대로 결론**으로 사용하세요. 물성(독성·부식성 등)만 보고 임의로 "불가"로 뒤집지 마세요.
- 단, 사내 DB에 해당 품목의 **회사 선적금지/특별 격리 규정**이 명시돼 있으면 그 제한을 함께 반영하세요(회사 규정이 더 엄격할 수 있음).
- 격리표 판정이 '확인 필요'면 단정하지 말고 해당 사유를 안내하세요.
- 결론은 하나로 명확히. 추측 금지.

${sources}

[문의 제목] ${subjText}
[문의 내용] ${inqText}

형식: 인사말 → 핵심 결론(+간단 근거: 각 UN class와 격리표 결과) → 맺음말. 군더더기 없이 간결하게. 본문 텍스트만.
마지막 줄: "※ 본 회신은 AI 초안이며, 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."`;

      const finalReply = await gen(replyPrompt, 0);
      return res.status(200).json({ ok: true, model, reply: finalReply, used: ctx.length, seg: segInfo ? segInfo.verdict : null });
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
    return res.status(err && err.code === 503 ? 503 : 500).json({ ok: false, message: err.message || 'AI 처리 중 오류가 발생했습니다.' });
  }
};
