// FAQ AI — 사내 FAQ·문의답변 DB를 근거로 LLM(Gemini)이 처리
//   mode 'answer'(기본): FAQ 질문 답변
//   mode 'reply': 이메일 회신 초안 (2단계: 초안 생성 → 검증·교정으로 일관성 확보)
//   mode 'audit': 답변 오류·모순 검토
//   (Vercel Hobby 함수 12개 제한 때문에 단일 함수에 통합)
module.exports.config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
  maxDuration: 60   // 뉴스 모드: 본문 수집 + PubChem 조회로 시간이 걸릴 수 있어 상향
};

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const newsKeyRaw = process.env.GEMINI_NEWS_API_KEY;   // 뉴스 전용 키(있으면)
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (!apiKey) {
      return res.status(500).json({ ok: false, message: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.' });
    }

    // ── 키 우선순위 정책 ──
    //  메인 기능(FAQ답변·회신초안·검토·SDS): 메인 키 먼저 쓰고, 토큰 소진(429)·과부하(503)로 막히면
    //    뉴스 키를 '예비 연료'로 자동 전환해 끝까지 시도한다. → 메인 기능은 두 키를 모두 동원.
    //  뉴스(비필수): 뉴스 키만 사용해 메인 키의 쿼터를 보호한다(= 메인이 우선, 남는 토큰으로 뉴스).
    //    단, 뉴스 키가 설정돼 있지 않으면 어쩔 수 없이 메인 키로 폴백.
    const MAIN_KEYS = (newsKeyRaw && newsKeyRaw !== apiKey) ? [apiKey, newsKeyRaw] : [apiKey];
    const NEWS_KEYS = newsKeyRaw ? [newsKeyRaw] : [apiKey];

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // 과부하(503) 대비 모델 폴백 목록 (설정 모델 우선, 막히면 대체 모델로)
    const MODELS = [...new Set([model, 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'])];
    // Gemini 호출 헬퍼 — 키 우선순위 목록(keys)을 받아: 각 키마다 모델 폴백을 시도하고,
    //   한 키가 쿼터소진(429)·과부하(503)·키오류(401/403)로 막히면 다음 키(예비 키)로 자동 전환.
    async function genWithKeys(promptText, temperature, keys) {
      const keyList = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
      let lastStatus = 0;
      for (let k = 0; k < keyList.length; k++) {
        const useKey = keyList[k];
        let keyErr = false;   // 이 키 자체가 무효(401/403)면 모델 더 볼 필요 없이 다음 키로
        for (const mdl of MODELS) {
          const ep = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${encodeURIComponent(useKey)}`;
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
            console.error('[api/faq-ai] Gemini error', `key#${k + 1}/${keyList.length}`, mdl, r.status, t.slice(0, 150));
            if (r.status === 503) continue;                          // 과부하 → 같은 모델 1회 재시도
            if (r.status === 429) break;                             // 쿼터 소진 → 같은 키의 다음 모델로(재시도 무의미)
            if (r.status === 404 || r.status === 400) break;         // 모델 미지원 → 다음 모델
            if (r.status === 401 || r.status === 403) { keyErr = true; break; } // 키 무효 → 다음 키
            throw new Error('Gemini API 호출 실패');                  // 그 외 → 중단
          }
          if (keyErr) break;   // 키 자체가 무효 → 남은 모델 건너뛰고 다음 키로 폴백
        }
        if (k < keyList.length - 1) {
          console.error('[api/faq-ai] 키 폴백:', `key#${k + 1} 소진(status ${lastStatus}) → 예비 key#${k + 2} 시도`);
        }
      }
      if (lastStatus === 503 || lastStatus === 429) {
        const e = new Error('AI 사용량 한도에 도달했거나 서버가 혼잡합니다(잠시 후 다시 시도해 주세요).'); e.code = 503; throw e;
      }
      throw new Error('Gemini API 호출 실패');
    }
    // 메인 기능 기본 호출 — 메인 키 우선, 막히면 뉴스 키로 보조
    const gen = (promptText, temperature) => genWithKeys(promptText, temperature, MAIN_KEYS);

    const body = req.body || {};
    const mode = ['reply', 'audit', 'auditrows', 'news'].includes(body.mode) ? body.mode : 'answer';
    const { question, context, subject, inquiry, dgData, unnos, segInfo, rows } = body;

    // ───────────────────────── 위험물 사고 뉴스 (news) ─────────────────────────
    if (mode === 'news') {
      const decode = s => String(s || '')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
        .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d)).trim();
      const queries = [
        '컨테이너 화재 위험물', '위험물 폭발 사고', '물류창고 화재 위험물',
        '화학물질 누출 사고', '유독가스 누출', '암모니아 황산 염소 누출',
        'dangerous goods container fire'
      ];
      const results = await Promise.all(queries.map(async q => {
        try {
          const rr = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!rr.ok) return [];
          const xml = await rr.text();
          const out = []; const re = /<item>([\s\S]*?)<\/item>/g; let m;
          while ((m = re.exec(xml)) && out.length < 8) {   // 쿼리당 수집량 축소(무료 쿼터·노이즈 절감)
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
      // 행정성·비사건성 뉴스(운송차량 점검·단속·캠페인·교육·협약 등)는 특정 위험물질/사고 내용이 아니어서
      // 선적 판단에 도움이 안 되므로 제외한다. (실제 사고: 화재·폭발·유출·누출·전복 등은 통과)
      const IRRELEVANT = /가두\s*검사|차량.{0,10}(점검|검사|단속)|(점검|검사|단속).{0,10}차량|(일제|합동|특별|불시|정기|민관|안전|가두)\s*(점검|검사|단속)|점검\s*(실시|추진|강화|예정|나서|벌|당부|계획)|검사\s*(실시|추진|강화|예정|계획)|단속\s*(실시|강화|벌|나서)|계도|캠페인|홍보|교육|훈련|간담회|협약|업무협약|워크[숍샵]|세미나|설명회|공모|발대식|예방\s*활동|안전\s*문화|소방\s*안전\s*관리|안전\s*관리\s*강화|법안|발의|입법|조례|개정안/;
      const seen = new Set(); const merged = [];
      for (const it of results.flat()) {
        const base = it.title.replace(/\s*-\s*[^-]+$/, '');   // " - 출처" 제거
        if (IRRELEVANT.test(base)) continue;                   // 점검·단속·캠페인 등 비사건성 뉴스 제외
        const norm = base.toLowerCase().replace(/[^0-9a-z가-힣]/g, '').slice(0, 30);
        if (!norm || seen.has(norm)) continue;
        // 앞 12자 겹치면 유사 중복으로 간주
        const pre = norm.slice(0, 12);
        if ([...seen].some(s => s.slice(0, 12) === pre)) continue;
        seen.add(norm);
        merged.push({ title: base, link: it.link, source: it.source, pub: it.pub, ts: Date.parse(it.pub) || 0 });
      }
      merged.sort((a, b) => b.ts - a.ts);
      // 무료 쿼터 절약 + 정예화: 실제 사고(화재·폭발·유출·전복 등) 뉴스를 우선 선별하고 최대 6건만 사용.
      // (Gemini에 보내는 헤드라인 수↓ → 토큰·쿼터 절감, 화면도 꼭 필요한 사고 위주)
      const INCIDENT = /화재|불이|폭발|폭음|폭발물|유출|누출|새어|샜|전복|충돌|추돌|침몰|좌초|중독|질식|화상|사고|사상|사망|부상|대피|재난|연소|방사능|피폭|독성|기름\s*유출|가스\s*누출/;
      const incidents = merged.filter(n => INCIDENT.test(n.title));
      let news = incidents.slice(0, 6);
      if (news.length < 4) news = incidents.concat(merged.filter(n => !INCIDENT.test(n.title))).slice(0, 6);   // 사고 뉴스가 적으면 나머지로 보충(최대 6)

      const fetchWithTimeout = async (url, ms, opts) => {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), ms);
        try { return await fetch(url, Object.assign({ signal: ctrl.signal }, opts || {})); }
        finally { clearTimeout(to); }
      };

      // ── Gemini: 위험물 의견 + 핵심 물질명(한글/영문) 추출 (제목 + 모델 자체 지식) ──
      if (news.length) {
        try {
          const list = news.map((n, i) => `${i + 1}. ${n.title}`).join('\n');
          const op = await genWithKeys(`다음은 컨테이너물류/위험물 관련 사고 뉴스 헤드라인입니다. 각 항목을 한국어로 분석해 **JSON 배열로만** 답하세요(JSON 외 텍스트·코드펜스 금지).
형식: [{"i":번호,"dg":"관련 위험물 추정(모르면 '미상')","hazard":"핵심 위험성 한 줄","opinion":"우리(선사)가 해당 화물 선적 금지/제한을 검토할 필요가 있는지 한 줄 의견","substance":"이 사건과 관련된 핵심 화학물질 1개의 한글 정식명칭(없거나 불명확하면 빈 문자열)","substance_en":"그 물질의 정확한 영문 정식명칭 — PubChem 검색용, IUPAC/관용명(없으면 빈 문자열)"}]
- substance는 제목과 당신이 아는 사건 정보로 판단하세요. 일반어(가스·세척제·화학물질 등)가 아니라 식별 가능한 단일 화합물명일 때만 채우세요(예: 다이클로로에틸렌, 질산암모늄). 확실하지 않으면 빈 문자열로 두고 절대 지어내지 마세요.

${list}`, 0.2, NEWS_KEYS);
          const jsonText = (op.match(/\[[\s\S]*\]/) || [op])[0];
          const arr = JSON.parse(jsonText);
          arr.forEach(o => {
            const idx = (+o.i) - 1;
            if (news[idx]) {
              news[idx].dg = o.dg; news[idx].hazard = o.hazard; news[idx].opinion = o.opinion;
              news[idx].substance = (o.substance || '').trim();
              news[idx].substance_en = (o.substance_en || '').trim();
            }
          });
        } catch (e) { console.error('[news] opinion fail', e.message); }
      }

      // ── 물질 보강: PubChem(공식 DB)로 CAS·링크 검증 + DG_TABLE로 UN번호 대조 ──
      let sbAdmin = null;
      try { sbAdmin = require('./_supabase').supabaseAdmin; } catch (_) {}
      const fetchJsonT = async (url, ms) => {
        try { const r = await fetchWithTimeout(url, ms, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!r || !r.ok) return null; return await r.json(); }
        catch (_) { return null; }
      };
      const PC = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound';
      await Promise.all(news.map(async n => {
        const q0 = (n.substance_en || n.substance || '').trim();
        if (!q0 || !n.substance) return;   // 표시할 한글 물질명이 있을 때만 보강
        let cid = null, cas = '', un = '', dgName = '';
        // 1) 우리 DG_TABLE 먼저 — 정식 규제명칭 + UN번호 (영문명 부분일치)
        if (sbAdmin) {
          try {
            const { data } = await sbAdmin.from('DG_TABLE').select('UNNO,Name').ilike('Name', `%${q0}%`).limit(1);
            if (data && data.length) { un = String(data[0].UNNO || '').replace(/^0+/, ''); dgName = data[0].Name || ''; }
          } catch (_) {}
        }
        // 2) PubChem — DG 정식명칭이 있으면 그 이름으로(더 정확), 없으면 AI 영문명으로 CAS·링크 확보
        const q = dgName || q0;
        const cidJson = await fetchJsonT(`${PC}/name/${encodeURIComponent(q)}/cids/JSON`, 5000);
        cid = cidJson && cidJson.IdentifierList && cidJson.IdentifierList.CID && cidJson.IdentifierList.CID[0];
        if (cid) {
          n.chemLink = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
          const synJson = await fetchJsonT(`${PC}/cid/${cid}/synonyms/JSON`, 5000);
          const syns = (synJson && synJson.InformationList && synJson.InformationList.Information && synJson.InformationList.Information[0] && synJson.InformationList.Information[0].Synonym) || [];
          cas = syns.find(s => /^\d{2,7}-\d{2}-\d$/.test(String(s).trim())) || '';
          if (!un) { const unSyn = syns.map(s => String(s).trim()).find(s => /^UN\s?\d{4}$/i.test(s)); if (unSyn) un = (unSyn.match(/\d{4}/) || [''])[0]; }
        } else {
          n.chemLink = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(q)}`;
        }
        n.cas = cas;
        n.un = un;
      }));

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
      // 첨부 MSDS(SDS) 판독 결과 — 클라이언트가 /api/analyze-sds로 분석해 넘겨준 요약
      const attRows = Array.isArray(body.attachments) ? body.attachments : [];
      const attText = attRows.length
        ? attRows.map((a, i) => `[첨부 MSDS ${i + 1}] ${a.name || ''}
 - 판독: DG여부=${a.dg_status || '?'}, UN=${a.unno || '-'}, Class=${a.class || '-'}, 부위험성=${a.subsidiary_risk || '-'}, PG=${a.packing_group || '-'}, 해양오염=${a.marine_pollutant || '-'}
 - 품명/물질: ${a.product_name || '-'} / ${a.substance_name || '-'}
 - 정식운송명(PSN): ${a.proper_shipping_name || '-'}
 - 근거: ${String(a.basis || '').slice(0, 300)}`).join('\n\n').slice(0, 8000)
        : '(첨부 MSDS 없음)';

      // 문의가 전부 영문이면 영문으로 회신 (lang='en')
      const lang = body.lang === 'en' ? 'en' : 'ko';

      const sources = `[격리표 판정 결과 — 시스템이 IMDG 일반 격리표로 계산함(권위 있는 결론, 임의로 뒤집지 말 것)]
${segText}

[첨부 MSDS/SDS 판독 결과 — 첨부파일을 AI가 분석한 1차 결과]
${attText}

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[조회된 위험물 상세 — DG_TABLE (문의 내 UN번호: ${unText})]
${dgText}`;

      const replyPrompt = lang === 'en'
        ? `You are an assistant drafting a reply on behalf of the Dangerous Goods (DG) desk of Sinokor / Heung-A Line operations team.
Write a CONCISE reply body in ENGLISH (the inquiry is written in English).

Decision rules (important):
- Judge and state COMPATIBILITY (segregation) and SHIPPABILITY (acceptance) SEPARATELY.
  - Compatibility = decided ONLY by the [Segregation table verdict] above (the table is the sole basis). Do not override it to "cannot mix" based on physical properties (toxicity/corrosivity) alone.
  - Shippability = judged separately against the COMPANY prohibited-cargo list in the internal DB.
- Example: if the table allows mixing but the item is on the company prohibited list -> "Stowage/segregation itself is acceptable, but the cargo cannot be shipped as it is on our prohibited list."
- When no segregation is required, express it as IMDG-standard "X (may be stowed in the same container)" or "No segregation required" — never "code 0".
- If the attached MSDS/SDS readout provides UN number / class / packing group, use it as the basis; do not invent values.
- If the verdict is "needs check", do not assert — explain why. If a segregation code is given as "varies by sub-division", present it per division (e.g., if 2.1 then …, if 2.2 then …) and advise confirming the actual classification.
- One clear conclusion. No speculation.

${sources}

[Inquiry subject] ${subjText}
[Inquiry body] ${inqText}

Format: greeting -> key conclusion (+ brief basis: each UN class and the segregation result, referencing the MSDS if attached) -> closing. Concise, body text only.
Last line: "* This is an AI-generated draft. Final acceptance is subject to the IMDG Code, carrier/terminal/national regulations and confirmation by the person in charge."`
        : `당신은 장금상선/흥아라인 운항팀 위험물(DG) 담당자를 대신해 회신 초안을 쓰는 보조 AI입니다.
받은 문의에 대해 한국어 회신 본문을 **간결하게** 작성하세요.

판정 규칙(중요):
- **혼적(격리) 가부**와 **선적 가부**는 반드시 **분리해서** 판단·안내하세요.
  · 혼적 가부 = 위 [격리표 판정 결과]만으로 결정(격리표가 유일 기준). 물성(독성·부식성 등)만 보고 임의로 "혼적 불가"로 뒤집지 마세요.
  · 선적 가부 = 사내 DB의 **회사 선적금지 리스트** 기준으로 별도 판단.
- 예시: 격리표상 혼적은 가능하나 해당 품목이 사내 금지품목이면 → "혼적 자체는 가능하나, 당사 금지 위험물이므로 선적은 불가합니다"로 안내.
- 격리 요건이 없을 때는 "코드 0"이 아니라 IMDG 표준 표기대로 **"X(같은 컨테이너 적재 가능)"** 또는 **"격리 요건 없음"**으로 표현하세요.
- 첨부 MSDS 판독 결과에 UN번호·Class·PG가 있으면 그 값을 근거로 활용하세요(값을 지어내지 마세요).
- 격리표 판정이 '확인 필요'면 단정하지 말고 해당 사유를 안내하세요. 격리코드가 '세부분류에 따라 상이'로 제공되면 분류별로(예: 2.1이면 …, 2.2면 …) 나눠 안내하고 실제 분류 확인을 권고하세요.
- 결론은 하나로 명확히. 추측 금지.

${sources}

[문의 제목] ${subjText}
[문의 내용] ${inqText}

형식: 인사말 → 핵심 결론(+간단 근거: 각 UN class와 격리표 결과, 첨부 MSDS가 있으면 그 내용도 참고) → 맺음말. 군더더기 없이 간결하게. 본문 텍스트만.
마지막 줄: "※ 본 회신은 AI 초안이며, 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."`;

      const finalReply = await gen(replyPrompt, 0);
      return res.status(200).json({ ok: true, model, reply: finalReply, used: ctx.length, seg: segInfo ? segInfo.verdict : null, attachments: attRows.length, lang });
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

    // ─── 항목별 답변 오류·모순 검출 (auditrows) — JSON 배열 반환 ───
    if (mode === 'auditrows') {
      const list = Array.isArray(rows) ? rows.slice(0, 80) : [];
      if (list.length < 1) return res.status(200).json({ ok: true, issues: [] });
      const listText = list.map((r, i) =>
        `${i}. (분류: ${r.cat || '-'})`
        + (r.seg ? `\n[격리표 정답(IMDG 7.2.4 결정론적 계산): ${String(r.seg).slice(0, 400)}]` : '')
        + `\nQ: ${String(r.q || '').slice(0, 500)}\nA: ${String(r.a || '').slice(0, 1500)}`
      ).join('\n---\n');
      const prompt = `당신은 장금상선/흥아라인 운항팀 위험물(DG) 품질 검토 AI입니다.
아래 번호가 매겨진 [문의·답변] 목록에서, 답변에 **IMDG Code 기준 명백한 오류**가 있거나 다른 항목과 **서로 모순**되는 항목만 골라내세요.
규칙:
- 확실한 것만 보고하세요(애매하거나 단지 더 자세히 쓸 수 있는 정도는 제외).
- **항목에 [격리표 정답]이 제공되면, 혼적·격리 판단은 그 격리표 결과를 정답 기준으로 삼으세요.** 답변이 격리표와 다르면 오류로 보고하고, 격리표와 일치하면 격리 부분은 오류로 보지 마세요(당신의 임의 판단으로 격리표를 뒤집지 말 것).
- 출력은 **JSON 배열만** 출력하세요(설명·마크다운·코드펜스 금지).
- 형식: [{"i": <번호>, "issue": "<무엇이 왜 오류인지, 또는 몇 번 항목과 어떻게 모순인지 1~2문장 한국어>"}]
- 오류·모순이 없으면 [] 만 출력하세요.

[문의·답변 목록]
${listText}`;
      const raw = await gen(prompt, 0);
      let issues = [];
      try {
        let s = String(raw || '').replace(/```json|```/gi, '').trim();
        const a = s.indexOf('['), b = s.lastIndexOf(']');
        if (a >= 0 && b > a) s = s.slice(a, b + 1);
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) issues = parsed
          .filter(x => x && typeof x.i === 'number' && x.issue)
          .map(x => ({ i: x.i, issue: String(x.issue).slice(0, 600) }));
      } catch (e) { /* 파싱 실패 → 빈 결과 */ }
      return res.status(200).json({ ok: true, model, issues, checked: list.length });
    }

    // ───────────────────────── FAQ 답변(answer, 기본) ─────────────────────────
    if (!question || !String(question).trim()) {
      return res.status(400).json({ ok: false, message: '질문 내용이 필요합니다.' });
    }
    // 혼적/격리 질문이면 클라이언트가 IMDG 7.2.4 격리표로 계산한 결정론적 판정을 권위 근거로 사용
    let ansSegText = '(혼적/격리 판정 해당 없음 — UN번호 2개 미만이거나 클래스 미확인)';
    if (segInfo && segInfo.verdict) {
      ansSegText = `판정: ${segInfo.verdict}\n대상: ${(segInfo.cargos || []).join(' / ')}`
        + (segInfo.detail && segInfo.detail.length ? `\n클래스 간 격리코드: ${segInfo.detail.join(', ')}` : '');
    }
    const ansDgRows = Array.isArray(dgData) ? dgData : [];
    const ansDgText = ansDgRows.length ? ansDgRows.map((r, i) => `[DG ${i + 1}] ` + JSON.stringify(r)).join('\n').slice(0, 8000) : '';
    const answerPrompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 상담 보조 AI입니다.
아래 [사내 DG FAQ·문의답변 데이터베이스]를 최우선 근거로 사용자 질문에 한국어로 답하세요.

규칙:
- DB에 근거가 있으면 종합·요약해 구체적으로 답하고, 참고한 자료 제목을 언급하세요.
- DB에 직접 근거가 없으면 먼저 "사내 DB에는 직접 자료가 없어 일반 규정 기준으로 안내드립니다"라고 밝히고 일반 IMDG Code 지식으로 신중히 답하세요.
- **혼적·격리 코드 질문은 아래 [IMDG 격리표 판정 결과]만을 유일한 근거로 사용하세요. 임의로 다른 코드로 바꾸지 마세요(예: 표가 'Separated from(2)'이면 'Away from(1)'으로 답하지 말 것).**
- **격리 요건이 없을 때는 "코드 0"이 아니라 IMDG 표준 표기 "X(같은 컨테이너 적재 가능)" 또는 "격리 요건 없음"으로 표현하세요. 격리표 판정이 '확인 필요/미상'이면 단정하지 말고 그 사유를 안내하세요.**
- **격리코드가 '세부분류에 따라 상이'로 제공되면 하나로 단정하지 말고, 제공된 그대로 분류별로(예: 2.1(인화성)이면 …, 2.2(비인화성)면 …) 나눠 안내하고 실제 제품 분류 확인을 권고하세요.**
- **⚠️ 혼적·격리 코드를 묻는 질문인데 위 [IMDG 격리표 판정 결과]가 '해당 없음'으로 비어 있으면(시스템이 화물 2개를 인식하지 못한 경우), 절대 격리코드를 추정·단정하지 마세요. 대신 다음을 그대로 안내하세요: "혼적 격리는 화물 2개 이상을 인식해야 자동 판정됩니다. ①UN번호(예: UN1950, UN1993) ②클래스(예: Class 2.1, Class 3) ③표기가 헷갈리면 'CLASS/UNNO' 형식(예: 2.1/1950, 8/1760, 3/1993) 중 한 가지로 다시 입력해 주시거나, 좌측 사이드바의 [격리규정 확인] 메뉴에서 UN번호로 조회해 주세요." (틀린 코드를 말하는 것보다 입력/조회 방법을 안내하는 것이 안전합니다.)**
- 회사 정책과 IMDG 일반 규정을 구분하세요. 불확실하면 담당자 확인 권고. 사실을 지어내지 마세요.
- 마크다운으로 읽기 쉽게. 끝에 "※ 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."

[IMDG 격리표 판정 결과 — 시스템이 7.2.4 격리표로 계산함(권위 결론, 임의로 뒤집지 말 것)]
${ansSegText}
${ansDgText ? '\n[조회된 위험물 상세 — DG_TABLE]\n' + ansDgText + '\n' : ''}
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
