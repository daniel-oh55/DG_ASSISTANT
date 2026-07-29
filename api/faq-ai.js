// FAQ AI — 사내 FAQ·문의답변 DB를 근거로 LLM(Gemini)이 처리
//   mode 'answer'(기본): FAQ 질문 답변
//   mode 'reply': 이메일 회신 초안 (2단계: 초안 생성 → 검증·교정으로 일관성 확보)
//   mode 'audit': 답변 오류·모순 검토
//   (Vercel Hobby 함수 12개 제한 때문에 단일 함수에 통합)
module.exports.config = {
  api: { bodyParser: { sizeLimit: '6mb' } },   // AI 문의 첨부파일(이미지·PDF base64) 수용
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
    async function genWithKeys(promptText, temperature, keys, extraParts) {
      const keyList = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
      // 텍스트 프롬프트 + (선택) 첨부 inlineData(이미지/PDF/텍스트) 파트
      const parts = [{ text: promptText }];
      if (Array.isArray(extraParts) && extraParts.length) parts.push(...extraParts);
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
                contents: [{ role: 'user', parts }],
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
    const gen = (promptText, temperature, extraParts) => genWithKeys(promptText, temperature, MAIN_KEYS, extraParts);

    const body = req.body || {};
    const mode = ['reply', 'audit', 'auditrows', 'news'].includes(body.mode) ? body.mode : 'answer';
    const { question, context, subject, inquiry, dgData, unnos, segInfo, rows } = body;

    // SKR/HAL(자사) 선적 금지·제한 리스트 조회 결과 — 선적 가부 판단의 근거. (HAS=HAL 동일 자사, 타 선사는 제외)
    const skrCarrier = Array.isArray(body.skrCarrier) ? body.skrCarrier : [];
    const skrText = skrCarrier.length
      ? skrCarrier.map(c => {
          const head = `UN${c.unno}${c.name ? ' ' + c.name : ''}: ${c.status_label || c.status || '-'}`;
          const rs = (c.rules || []).map(r => `   - [${r.status || '-'}] ${[r.remark, r.document_required ? '필요서류: ' + r.document_required : ''].filter(Boolean).join(' / ') || '리스트 등재'}`).join('\n');
          return rs ? head + '\n' + rs : head;
        }).join('\n')
      : '';

    // SKR/HAL RFDG 혼적 금지 — 클라이언트가 결정론적으로 판정해 보낸 자사 규정 결론(IMDG 일반 격리표보다 우선).
    //   리튬이온 배터리(UN3480·3481)를 DG로 선적 시 RFDG(Reefer) 필수이고, RFDG는 다른 UNNO 화물과 혼적 불가.
    const rfdgConflict = !!(segInfo && segInfo.rfdgConflict);
    const rfdgUnsTxt = (segInfo && Array.isArray(segInfo.rfdgUns)) ? segInfo.rfdgUns.join(', ') : 'UN3480/UN3481';
    const rfdgDryTxt = (segInfo && Array.isArray(segInfo.dryCargos)) ? segInfo.dryCargos.join(', ') : '나머지 DRY DG 화물';
    const rfdgBlock = rfdgConflict
      ? `[SKR/HAL RFDG 혼적 금지 — 자사 규정(권위 결론, IMDG 일반 격리표보다 우선)]
${rfdgUnsTxt}(리튬이온 배터리)을 위험물(DG)로 선적하면 RFDG(Reefer) 컨테이너가 필수이며, RFDG 화물은 **다른 위험물(DG)** 과 같은 컨테이너 혼적이 금지됩니다(단 UN3480·UN3481끼리는 허가). **단, RFDG 위험물 1개와 비위험물(일반화물/NON-DG)의 혼적은 가능합니다 — 혼적 금지는 위험물 화물 간에만 적용됩니다.** 따라서:
- ${rfdgUnsTxt} → 다른 위험물과는 분리(별도 RFDG 컨테이너 단독), 비위험물(일반화물)과는 혼적 가능.
- ${rfdgDryTxt} → 그들끼리만 별도 DRY DG 컨테이너에 IMDG 격리표 기준으로 혼적.
→ 전체 혼적 결론: 위 화물들이 모두 위험물이면 'SKR/HAL 사내 규정에 따라' 혼적 불가(분리 선적). IMDG 일반 격리표가 '같은 컨테이너 적재 가능(X)'이어도 이 RFDG 규정이 우선합니다. (예외 ①: 상대가 비위험물(일반화물)이면 혼적 가능. 예외 ②: 해당 리튬배터리가 SP188로 비위험물(NON-DG)로 분류되면 DRY 혼적 가능)
※ 답변 작성 시 이 RFDG 혼적 금지가 IMDG 국제규정이 아니라 **'SKR/HAL 사내 규정'**임을 반드시 명시하세요(예: "SKR/HAL 사내 규정에 따라 ~"). 읽는 사람이 국제규정으로 오해하지 않도록, IMDG 일반 격리표상으로는 같은 컨테이너 적재가 가능하다는 점과 구분해 설명하세요.

`
      : '';

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
      // 유사(중복) 뉴스 제거 — 같은 사건을 표현만 다르게 쓴 헤드라인을 1건으로 묶는다.
      // 핵심 신호: 두 제목이 '식별성 있는' 공통 부분문자열(회사·지명 등)을 5자 이상 공유하면 같은 사건으로 본다.
      //   (예: "SK하이닉스 청주공장 화학물질 누출" 4건 → 'sk하이닉스청주' 공유 → 1건)
      //   반대로 '화학물질 누출' 같은 일반 표현만 겹치는 건 서로 다른 사건일 수 있으므로 합치지 않는다.
      const newsNorm = s => String(s || '').toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
      const GENERIC_NEWS = /화학물질|유해물질|위험물질|화학사고|가스누출|유독가스|화재|폭발|누출|유출|사고|물질/g;
      // 식별성 없는 일반 단어 — 이 단어만 겹치는 건 같은 사건 근거로 보지 않는다.
      const GENERIC_WORDS = new Set('화학물질 유해물질 위험물질 위험물 화학 물질 가스 유독가스 독성가스 화재 불 폭발 폭음 누출 유출 전복 충돌 침몰 사고 부상 사망 중상 대피 긴급 종합 속보 신고 발생 현장 공장 창고 사업장 캠퍼스 건물 실시 적발 지적 명 건 보'.split(' '));
      const distinctWords = s => {
        const ws = String(s || '').toLowerCase().replace(/[^0-9a-z가-힣\s]/g, ' ').split(/\s+/);
        return new Set(ws.filter(w => w.length >= 2 && !GENERIC_WORDS.has(w)));
      };
      const bigrams = s => { const g = new Set(); for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; };
      const bgContain = (a, b) => { const sm = Math.min(a.size, b.size); if (sm < 4) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / sm; };
      // 최장 공통 부분문자열(연속 일치) 반환
      const lcsStr = (a, b) => {
        const m = a.length, n = b.length; if (!m || !n) return '';
        let prev = new Array(n + 1).fill(0), best = 0, end = 0;
        for (let i = 1; i <= m; i++) {
          const cur = new Array(n + 1).fill(0);
          for (let j = 1; j <= n; j++) if (a[i - 1] === b[j - 1]) { cur[j] = prev[j - 1] + 1; if (cur[j] > best) { best = cur[j]; end = i; } }
          prev = cur;
        }
        return a.slice(end - best, end);
      };
      const sameEvent = (x, y) => {
        const sub = lcsStr(x._n, y._n);
        // ① 고유 부분(일반 표현 제외)을 충분히 길게 연속 공유 → 같은 사건
        if (sub.length >= 5 && sub.replace(GENERIC_NEWS, '').length >= 3) return true;
        // ② 식별성 있는(일반어 제외) 단어를 2개 이상 공유 → 같은 사건(예: '충북대'+'실험실서')
        let shared = 0; for (const w of x._w) if (y._w.has(w)) shared++;
        if (shared >= 2) return true;
        // ③ 표현이 거의 동일(글자 bigram 포함률 매우 높음)
        return bgContain(x._g, y._g) >= 0.6;
      };
      const cand = [];
      for (const it of results.flat()) {
        const base = it.title.replace(/\s*-\s*[^-]+$/, '');   // " - 출처" 제거
        if (IRRELEVANT.test(base)) continue;                   // 점검·단속·캠페인 등 비사건성 뉴스 제외
        const nrm = newsNorm(base);
        if (!nrm) continue;
        cand.push({ title: base, link: it.link, source: it.source, pub: it.pub, ts: Date.parse(it.pub) || 0, _n: nrm, _g: bigrams(nrm), _w: distinctWords(base) });
      }
      cand.sort((a, b) => b.ts - a.ts);                        // 최신 우선 — 유사군에서 가장 최근 기사를 남긴다
      const merged = [];
      for (const c of cand) {
        if (merged.some(k => sameEvent(k, c))) continue;       // 같은 사건이면 제외
        merged.push(c);
      }
      merged.forEach(n => { delete n._n; delete n._g; delete n._w; });   // 내부 비교용 필드 제거
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
- substance는 제목과 당신이 아는 실제 사건 정보로 판단하세요. 제목에 화합물명이 직접 없더라도, 특정 사업장·지역의 잘 알려진 사고여서 어떤 화학물질이 관련됐는지 **확신**할 수 있으면 그 정식명칭을 채우세요(예: "SK하이닉스 청주공장 화학물질 누출" → 수산화테트라메틸암모늄(TMAH), substance_en="Tetramethylammonium hydroxide"). 다만 일반어(가스·세척제·화학물질 등)만 있고 어떤 물질인지 확신이 없으면 빈 문자열로 두고 절대 지어내지 마세요.

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
 - 제조사: ${a.manufacturer || '-'} (승인여부=${a.manufacturer_status || 'N/A'}; 승인 제조사=SAMSUNG SDI/LG ENERGY SOLUTION(LG 합작 PT.HLI GREEN POWER 포함)/SK ON, 그 외·미상이면 "운항팀에 가능 제조사 확인" 안내)
 - 품명/물질: ${a.product_name || '-'} / ${a.substance_name || '-'}
 - 정식운송명(PSN): ${a.proper_shipping_name || '-'}
 - 근거: ${String(a.basis || '').slice(0, 300)}`).join('\n\n').slice(0, 8000)
        : '(첨부 MSDS 없음)';
      // 자동 분석되지 않은 첨부(용량초과·실패 등) — 제조사 미확인이라 단정 금지의 근거
      const attUnread = Array.isArray(body.attachUnread) ? body.attachUnread : [];
      const attUnreadBlock = attUnread.length
        ? `[자동 분석되지 않은 첨부 — 제조사 미확인]
${attUnread.map((a, i) => ` ${i + 1}) ${a.name || '(파일)'} — ${a.reason || '자동 분석되지 않음'}`).join('\n')}
※ 위 자료는 제조사를 확인하지 못했습니다. 리튬배터리 제조사 승인 판단 시 분석된 자료만으로 '선적 가능'을 단정하지 말고, 이 자료(특히 TEST REPORT/성적서)의 제조사 확인을 요청할 것.

`
        : '';

      // 문의가 전부 영문이면 영문으로 회신 (lang='en')
      const lang = body.lang === 'en' ? 'en' : 'ko';

      // 격리표 판정 블록은 '혼적 판정이 실제로 있을 때만' 프롬프트에 포함한다.
      //   (혼적을 묻지 않은 문의에 격리 결과를 넣어두면 AI가 묻지도 않은 혼적 답변을 하게 됨)
      const hasSeg = !!(segInfo && segInfo.verdict);
      const segBlock = hasSeg
        ? `[격리표 판정 결과 — 시스템이 IMDG 일반 격리표로 계산함(권위 있는 결론, 임의로 뒤집지 말 것)]
${segText}

`
        : '';
      const skrBlock = skrText
        ? `[SKR/HAL(자사) 선적 금지·제한 리스트 조회 결과 — 선적 가부 판단의 권위 근거. 타 선사는 제외]
${skrText}

`
        : '';
      const sources = `${rfdgBlock}${segBlock}${skrBlock}${attUnreadBlock}[첨부 MSDS/SDS 판독 결과 — 첨부파일을 AI가 분석한 1차 결과]
${attText}

[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}

[조회된 위험물 상세 — DG_TABLE (문의 내 UN번호: ${unText})]
${dgText}`;

      const replyPrompt = lang === 'en'
        ? `You are an assistant drafting a reply on behalf of the Dangerous Goods (DG) desk of Sinokor / Heung-A Line operations team.
Write a CONCISE reply body in ENGLISH (the inquiry is written in English).

Decision rules (important):
- FIRST, identify exactly what the inquiry actually asks, and answer ONLY that. Do NOT add topics the inquiry did not ask about (especially segregation / co-loading).
- If it asks whether a SINGLE item can be SHIPPED (on a given route/vessel, RF/RFDG feasibility, etc.) -> answer only its shippability (company prohibited list + route/vessel/temperature conditions). Do NOT bring up segregation.
- Address COMPATIBILITY (segregation) ONLY when the inquiry asks whether two or more cargoes can be loaded together / in the same container. Only then use the [Segregation table verdict] as the sole basis (do not override it by physical properties alone), and express "no segregation" as IMDG-standard "X (may be stowed in the same container)", never "code 0". If no [Segregation table verdict] is provided above, do not mention segregation at all.
- If the attached MSDS/SDS readout provides UN number / class / packing group, use it as the basis; do not invent values. If MSDS is needed for an accurate decision, say so.
- LITHIUM BATTERIES (UN3480/3481) shipped AS DG must be carried in an RFDG (Reefer) container per SKR/HAL internal policy. RFDG co-loading is prohibited only BETWEEN dangerous goods (one RFDG DG item may still be co-loaded with NON-dangerous / general cargo). State that this RFDG rule is an SKR/HAL internal rule, not an IMDG international rule.
- MANUFACTURER restriction applies ONLY when the lithium battery is shipped as DG. Approved makers: SAMSUNG SDI / LG ENERGY SOLUTION (incl. LG Chem and its JV production entity PT. HLI GREEN POWER) / SK ON. If the battery is NON-DG under SP188, there is NO manufacturer restriction.
- ⚠️ MULTIPLE ATTACHMENTS: a single inquiry may include several documents (e.g., MSDS and a UN 38.3 TEST REPORT) whose manufacturers DIFFER. Check the maker in EVERY analyzed attachment. Even if one document shows an approved maker, if ANY other document shows a non-approved or unclear maker, do NOT conclude "acceptable/shippable" — point out which document shows which maker and ask the customer to confirm the correct manufacturer (non-approved-maker documents cannot be shipped). Conclude the manufacturer requirement is met only when ALL documents show approved makers.
- ⚠️ If an [Attachments not auto-analyzed] block is present above (documents whose manufacturer could not be verified, e.g., oversized/failed), do NOT conclude acceptable based only on the analyzed documents. Explicitly state that the manufacturer of that document (especially the TEST REPORT) must be confirmed, and request the accurate manufacturer information.
- One clear conclusion. No speculation. Do not pad the answer with unasked content.

${sources}

[Inquiry subject] ${subjText}
[Inquiry body] ${inqText}

Output format (STRICT): Output ONLY the answer body — the key conclusion to what was asked plus a brief basis (reference the MSDS if attached). Be concise.
Do NOT add any greeting, closing, signature, company info, or AI-disclaimer line. The system automatically wraps your text in a fixed company template (greeting + signature), so output the body text only.`
        : `당신은 장금상선/흥아라인 운항팀 위험물(DG) 담당자를 대신해 회신 초안을 쓰는 보조 AI입니다.
받은 문의에 대해 한국어 회신 본문을 **간결하게** 작성하세요.

판정 규칙(중요):
- **가장 먼저 문의가 실제로 무엇을 묻는지 정확히 파악하고, 그 질문에만 답하세요.** 문의가 묻지 않은 항목(특히 혼적·격리)은 답변에 넣지 마세요.
- **등록된 자료를 최대한 근거로 삼으세요**: 일반 DG·RFDG·규정 안내 → 사내 FAQ, 선적 금지 여부 → 회사 선적금지 리스트, 혼적·격리 → 격리표 판정, UN별 분류·특별규정 → DG_TABLE. 해당 자료에 내용이 있으면 그 내용을 근거로 답하세요. **단, "[자료 N]" 같은 자료 번호·출처 표기는 회신 본문에 절대 넣지 마세요. 받는 사람은 그 번호가 어떤 자료인지 알 수 없습니다.**
- 단일 품목의 **선적 가부**(특정 구간·선박에 실을 수 있는지, RF/RFDG 가능 여부 등)를 물으면 → 그 품목의 선적 가부만 답하세요. **혼적/격리 이야기는 꺼내지 마세요.**
- **선적 가부는 위 [SKR/HAL(자사) 선적 금지·제한 조회 결과]를 우선 근거로** 판단하세요(PROHIBITED=당사 선적 금지, RESTRICTED=조건부 가능, ALLOWED/미등재=자사 금지리스트상 제한 없음). **자사(SKR/HAL) 기준으로만 답하고 타 선사 규정은 언급하지 마세요.** RFDG 등 운송 요건은 [사내 FAQ]를 근거로 안내하세요.
- **혼적(격리) 가부는 문의가 "두 가지 이상 화물을 함께/같은 컨테이너에 실을 수 있는지"를 물을 때만** 다루세요. 그때만 위 [격리표 판정 결과]를 유일 기준으로 사용하고(물성만으로 임의로 뒤집지 말 것), "코드 0"이 아니라 IMDG 표준 "X(같은 컨테이너 적재 가능)"/"격리 요건 없음"으로 표기하세요. **위 자료에 [격리표 판정 결과]가 없으면 혼적은 언급조차 하지 마세요.**
- **⚠️ 위에 [SKR/HAL RFDG 혼적 금지] 블록이 있으면 그 결론(혼적 불가·분리 선적)을 IMDG 일반 격리표보다 절대적으로 우선하세요.** IMDG 표가 '같은 컨테이너 가능(X)'이라도, SKR/HAL 사내 규정상 해당 리튬배터리는 별도 RFDG 컨테이너로 분리하고 나머지 DRY DG 화물만 따로 혼적하는 것이 최종 결론입니다. (일반 규칙: 리튬이온 배터리 UN3480·3481을 DG로 선적하면 RFDG 필수 → **다른 위험물(DG)** 과 혼적 불가) **이 RFDG 혼적 금지는 IMDG 국제규정이 아니라 SKR/HAL 사내 규정이므로, 회신에 "SKR/HAL 사내 규정에 따라"처럼 출처를 분명히 밝혀 주세요.**
- **⚠️ RFDG(및 위험물) 혼적 금지는 '위험물 화물 간'에만 적용됩니다.** 위험물 1개와 비위험물(일반화물/NON-DG)의 혼적은 가능합니다(예: RFDG 리튬배터리 + 일반화물 = 혼적 가능). 함께 싣는 상대가 위험물일 때만 혼적 불가로 안내하세요.
- **리튬이온 배터리(UN3480·3481)의 본사 승인 제조사 제한(SAMSUNG SDI / LG ENERGY SOLUTION / SK ON)은 '위험물(DG)로 선적되는 경우에만' 적용됩니다.** SP188로 비위험물(NON-DG)로 분류되는 리튬배터리는 제조사 제한이 없습니다. 비위험물(SP188) 건에는 제조사 제한을 적용하지 말고, 제조사 제한은 위험물(DG/RFDG)로 선적되는 경우에만 안내하세요.
- **⚠️ 첨부 MSDS가 2개 이상일 때는 각 자료의 제조사를 모두 확인하세요.** 리튬배터리(DG) 선적 가부 판단 시 한 자료가 승인 제조사(삼성SDI/LG에너지솔루션(LG 합작 PT.HLI GREEN POWER 포함)/SK ON)라도 다른 자료(특히 UN38.3 TEST REPORT/성적서)에서 미승인·불명확 제조사가 발견되면, 어느 자료가 어떤 제조사인지 지적하고 정확한 제조사 정보 확인을 요청하세요(미승인 제조사 자료는 선적 불가). 모든 자료가 승인 제조사로 일치할 때만 제조사 요건 충족으로 안내하세요.
- **⚠️ 위 [자동 분석되지 않은 첨부] 목록이 있으면**(용량 초과·분석 실패 등으로 제조사를 확인 못 한 자료), 분석된 자료만으로 '선적 가능/제조사 요건 충족'을 단정하지 마세요. 해당 미확인 자료(특히 TEST REPORT/성적서)의 제조사를 반드시 확인해야 한다고 명시하고, 정확한 제조사 정보를 회신으로 요청하세요.
- 첨부 MSDS 판독 결과에 UN번호·Class·PG가 있으면 그 값을 근거로 활용하세요(값을 지어내지 마세요). 정확한 판단에 MSDS가 필요하면 그 점을 안내하세요.
- 결론은 하나로 명확히. 추측 금지. **묻지 않은 내용으로 답을 늘리지 마세요.**

${sources}

[문의 제목] ${subjText}
[문의 내용] ${inqText}

출력 형식(반드시 지킬 것):
- 맨 첫 줄: \`수신: <문의를 보낸 사람의 팀·직책·이름>\` — 문의 본문이나 서명에서 찾아 적으세요. 알 수 없으면 \`수신: 담당자님\` 으로 하세요.
- 둘째 줄부터: 답변 본문(핵심 결론 + 간단 근거, 첨부 MSDS가 있으면 참고)만 간결하게.
- 인사말·맺음말·서명·회사정보·AI 안내문구는 절대 넣지 마세요. 시스템이 정해진 회사 양식(인사말 + 서명)으로 자동으로 감쌉니다. 당신은 수신 한 줄과 본문만 출력하세요.`;

      const aiBody = (await gen(replyPrompt, 0) || '').trim();

      // ── 회사 표준 양식으로 감싸기 (국문/영문) ──
      const SIG = `-----------------------------------------------
Liner Management Team
Sinokor Merchant Marine Co., Ltd.
E-MAIL : dgcenter@sinokor.co.kr / vot@sinokor.co.kr
-----------------------------------------------`;
      let formatted;
      if (lang === 'en') {
        formatted = `Dear Partner

Good day.

${aiBody}

Thanks & Best Regards.
${SIG}`;
      } else {
        // 첫 줄에서 '수신:' 추출 (없으면 기본값), 나머지는 본문
        let recipient = '담당자님';
        let bodyKo = aiBody;
        const m = bodyKo.match(/^\s*수신\s*[:：]\s*(.+?)\s*(?:\r?\n|$)/);
        if (m) { if (m[1].trim()) recipient = m[1].trim(); bodyKo = bodyKo.slice(m[0].length).trim(); }
        formatted = `수신 : ${recipient}
발신 : 장금상선 운항팀

안녕하십니까! 오늘도 좋은 하루 보내십시오~!

${bodyKo}

감사합니다.

${SIG}`;
      }
      return res.status(200).json({ ok: true, model, reply: formatted, used: ctx.length, seg: segInfo ? segInfo.verdict : null, attachments: attRows.length, lang });
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

    // 첨부파일(이미지·PDF·텍스트) — Gemini에 inlineData로 직접 전달해 질문과 종합 판독
    const ansAtt = Array.isArray(body.attachments) ? body.attachments : [];
    const ansAttParts = []; const ansAttNames = [];
    ansAtt.forEach(a => {
      const mime = a.mime || a.mimeType || '';
      const data = a.data || a.b64 || '';
      if (!data) return;
      if (/^image\//.test(mime) || mime === 'application/pdf' || /^text\//.test(mime)) {
        ansAttParts.push({ inlineData: { mimeType: mime, data } });
        ansAttNames.push(a.name || '(파일)');
      }
    });
    const attBlock = ansAttParts.length
      ? `\n[첨부파일 — 사용자가 함께 올린 자료]
사용자가 다음 파일을 첨부했습니다: ${ansAttNames.join(', ')}. 첨부한 이미지/문서의 내용을 직접 읽고, 질문과 **종합**해 답하세요.
- 첨부에서 UN번호·Class·정식운송명(PSN)·품명·제조사·Wh(와트시)·포장등급(PG)·해양오염 여부 등 위험물 정보가 보이면 근거로 인용하세요.
- 단, 자사 선적 가부는 위 [SKR/HAL(자사) 선적 금지·제한 조회 결과]를, 혼적·격리는 위 [IMDG 격리표 판정 결과]를 우선 근거로 삼으세요(첨부 내용이 이들과 충돌하면 권위 자료 우선).
- 첨부에 근거가 없는 내용은 지어내지 말고, 첨부에서 읽은 내용과 읽지 못한(불명확한) 부분을 구분해 안내하세요.
- **⚠️ 첨부파일이 2개 이상이고 리튬이온 배터리(UN3480·3481) 선적 가부를 판단할 때는, 각 첨부 자료의 제조사(maker)를 모두 추출해 교차 확인하세요.** 위험물(DG)로 선적되는 리튬배터리의 승인 제조사는 SAMSUNG SDI / LG ENERGY SOLUTION(LG Chem 및 LG 합작 생산법인 PT. HLI GREEN POWER 포함) / SK ON 뿐입니다. **자료마다 제조사가 다를 수 있으니(예: MSDS와 UN38.3 TEST REPORT의 제조사가 다른 경우), 모든 자료의 제조사를 각각 확인하고, 한 자료가 승인 제조사라도 다른 자료에서 미승인(또는 불명확) 제조사가 발견되면 "선적 가능"으로 단정하지 말고, 어느 자료의 제조사가 무엇인지(예: MSDS=PT.HLI GREEN POWER(승인), TEST REPORT=○○(미승인)) 구체적으로 지적하고 "정확한 제조사 정보 확인이 필요하다 / 미승인 제조사 자료는 선적 불가"라고 안내하세요.** 모든 자료의 제조사가 승인 제조사로 일치할 때만 제조사 요건 충족으로 답하세요. (단, 해당 배터리가 SP188 비위험물(NON-DG)이면 제조사 제한 자체가 없습니다.)
`
      : '';
    const answerPrompt = `당신은 장금상선/흥아라인 운항팀의 위험물(DG) 상담 보조 AI입니다.
아래 [사내 DG FAQ·문의답변 데이터베이스]를 최우선 근거로 사용자 질문에 한국어로 답하세요.

규칙:
- **먼저 질문이 정확히 무엇을 묻는지 파악하고, 그 질문에만 답하세요(묻지 않은 내용은 덧붙이지 마세요).**
- **등록된 자료를 최대한 근거로 삼으세요.** 주제별로: 일반 DG·RFDG·규정 안내 → [사내 DG FAQ], 선적 가부(실을 수 있는지) → [SKR/HAL(자사) 선적 금지·제한 조회 결과], 혼적·격리 → [IMDG 격리표 판정 결과], UN별 분류·격리·특별규정 → [조회된 위험물 상세 — DG_TABLE]. 해당 자료에 내용이 있으면 그 내용을 인용해 답하세요.
- **선적 가부는 [SKR/HAL(자사) 선적 금지·제한 조회 결과] 기준으로만** 판단하세요(PROHIBITED=당사 금지, RESTRICTED=조건부, ALLOWED/미등재=자사 금지리스트상 제한 없음). **타 선사 규정은 언급하지 마세요.**
- **⚠️ 선적 가부(실을 수 있는지/금지 여부)를 묻는데 위 [SKR/HAL(자사) 선적 금지·제한 조회 결과]가 제공되지 않았다면(빈 경우), 절대 '선적 가능'이라고 단정하지 마세요.** 자사 금지리스트를 조회하지 못한 상태이므로 일반 IMDG 지식만으로 '실을 수 있다'고 답해서는 안 됩니다. 대신 다음을 그대로 안내하세요: "정확한 선적 가부는 UN번호 기준 자사(SKR/HAL) 금지리스트 확인이 필요합니다. 품목의 UN번호를 알려주시거나 좌측 [선사별 선적가부] 메뉴에서 조회해 주세요. 최근 신규 금지된 품목일 수 있으니(예: 불화수소 UN1052·UN1790) 반드시 확인이 필요합니다." (금지 품목을 '가능'으로 잘못 답하면 안전사고로 이어질 수 있으므로, 모를 때는 단정하지 말고 확인을 권고하는 것이 원칙입니다.)
- **⚠️ 불화수소(UN1052 무수불화수소 · UN1790 불산/불화수소산)는 2026.07.21부터 SKR/HAL 전 선박 선적 전면 금지입니다. 농도(함량)와 무관하게 금지되므로, IMDG 품명의 'HF 60% 초과/이하' 표기나 포장등급(PG I/II) 구분을 근거로 '60% 이하는 가능'처럼 안내하지 마세요. 60% 이하라도 선적 불가임을 분명히 하세요.** (더 일반적으로도, 자사 금지 품목의 UN번호 전체가 금지 대상이며, DG_TABLE 품명에 붙은 농도·함량 표현으로 금지 범위를 임의로 좁히지 마세요.)
- DB에 근거가 있으면 종합·요약해 구체적으로 답하세요. **단, "[자료 1]", "[자료 6]", "자료 7·24에 근거하여" 같은 자료 번호·출처 표기는 답변에 절대 넣지 마세요. 사용자는 그 번호가 어떤 자료인지 알 수 없어 혼선만 줍니다. 자료 내용을 자연스럽게 녹여서 결론과 근거만 전달하세요.**
- DB에 직접 근거가 없으면 먼저 "사내 DB에는 직접 자료가 없어 일반 규정 기준으로 안내드립니다"라고 밝히고 일반 IMDG Code 지식으로 신중히 답하세요. **단, '선적 가부(금지 여부)'만은 예외로, 위 규칙대로 자사 금지리스트 근거 없이 '가능'으로 단정하지 마세요.**
- **혼적·격리 코드 질문은 아래 [IMDG 격리표 판정 결과]만을 유일한 근거로 사용하세요. 임의로 다른 코드로 바꾸지 마세요(예: 표가 'Separated from(2)'이면 'Away from(1)'으로 답하지 말 것).**
- **격리 요건이 없을 때는 "코드 0"이 아니라 IMDG 표준 표기 "X(같은 컨테이너 적재 가능)" 또는 "격리 요건 없음"으로 표현하세요. 격리표 판정이 '확인 필요/미상'이면 단정하지 말고 그 사유를 안내하세요.**
- **격리코드가 '세부분류에 따라 상이'로 제공되면 하나로 단정하지 말고, 제공된 그대로 분류별로(예: 2.1(인화성)이면 …, 2.2(비인화성)면 …) 나눠 안내하고 실제 제품 분류 확인을 권고하세요.**
- **⚠️ 혼적·격리를 답할 때는 반드시 답변 안에 다음 안내를 포함하세요: "위험물 격리·혼적 여부는 좌측 [격리규정/혼적 확인] 메뉴에 UN번호를 입력하면 IMDG 격리표(SG코드·격리그룹 포함)로 확인하시는 것이 가장 정확하고 빠릅니다."** 위 [격리표 판정 결과]도 이 개별 메뉴와 동일한 엔진(클래스 격리표 + SG코드·격리그룹)으로 계산된 것이니 그 결론을 근거로 답하되, 사용자가 표로 직접 재확인할 수 있도록 이 메뉴 안내를 함께 제시하세요.
- **⚠️ 위에 [SKR/HAL RFDG 혼적 금지] 블록이 있으면 그 결론(혼적 불가·분리 선적)을 IMDG 일반 격리표보다 절대적으로 우선하세요.** IMDG 표가 '같은 컨테이너 가능(X)'이라도, SKR/HAL 사내 규정상 해당 리튬배터리(UN3480·3481)는 별도 RFDG 컨테이너에 단독 선적하고 나머지 DRY DG 화물만 따로 혼적하는 것이 최종 결론입니다. 일반 규칙으로도, 리튬이온 배터리(UN3480·3481)를 위험물(DG)로 선적하면 자사 규정상 RFDG(Reefer)가 필수이고 RFDG 화물은 **다른 위험물(DG)** 과 혼적할 수 없습니다(단 UN3480·3481끼리는 허가, SP188 비위험물 예외). **이 RFDG 혼적 금지는 IMDG 국제규정이 아니라 SKR/HAL 사내 규정이므로, 답변에 "SKR/HAL 사내 규정에 따라"처럼 출처를 분명히 밝혀 국제규정과 혼선이 없게 하세요.**
- **⚠️ RFDG(및 위험물) 혼적 금지의 기준은 '위험물 화물 간'에만 적용됩니다.** 위험물 1개와 **비위험물(일반화물/NON-DG)** 의 혼적은 가능합니다. 즉 'RFDG 리튬배터리 + 일반화물'은 같은 컨테이너 혼적 가능하고, 금지되는 것은 'RFDG 위험물 + 다른 위험물'입니다. 따라서 함께 싣는 상대 화물이 위험물인지 비위험물인지 먼저 구분해서, 위험물끼리일 때만 혼적 불가로 안내하세요(상대가 일반화물이면 혼적 가능). 상대 화물의 위험물 여부가 불명확하면 그 점을 확인하도록 안내하세요.
- **리튬이온 배터리(UN3480·3481)의 본사 승인 제조사 제한(SAMSUNG SDI / LG ENERGY SOLUTION / SK ON)은 '위험물(DG)로 선적되는 경우에만' 적용됩니다.** SP188로 비위험물(NON-DG)로 분류되는 리튬배터리(리튬이온 셀 ≤20Wh·배터리 ≤100Wh 등 SP188 충족)는 **제조사 제한이 없습니다.** 따라서 비위험물(SP188) 건에는 제조사(삼성·LG·SK) 제한을 적용하지 말고 'SP188 비위험물은 제조사 제한 없이 선적 가능'으로 안내하고, 제조사 제한은 위험물(DG/RFDG)로 선적되는 경우에만 안내하세요. 위험물/비위험물 여부가 불명확하면 두 경우를 구분해 안내하세요.
- **⚠️ 혼적·격리 코드를 묻는 질문인데 위 [IMDG 격리표 판정 결과]가 '해당 없음'으로 비어 있으면(시스템이 화물 2개를 인식하지 못한 경우), 절대 격리코드를 추정·단정하지 마세요. 대신 다음을 그대로 안내하세요: "혼적 격리는 화물 2개 이상을 인식해야 자동 판정됩니다. ①UN번호(예: UN1950, UN1993) ②클래스(예: Class 2.1, Class 3) ③표기가 헷갈리면 'CLASS/UNNO' 형식(예: 2.1/1950, 8/1760, 3/1993) 중 한 가지로 다시 입력해 주시거나, 좌측 사이드바의 [격리규정/혼적 확인] 메뉴에서 UN번호로 조회해 주세요." (틀린 코드를 말하는 것보다 입력/조회 방법을 안내하는 것이 안전합니다.)**
- 회사 정책과 IMDG 일반 규정을 구분하세요. 불확실하면 담당자 확인 권고. 사실을 지어내지 마세요.
- 마크다운으로 읽기 쉽게. 끝에 "※ 최종 선적 가부는 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다."

${rfdgBlock}[IMDG 격리표 판정 결과 — 시스템이 7.2.4 격리표로 계산함(권위 결론, 임의로 뒤집지 말 것)]
${ansSegText}
${ansDgText ? '\n[조회된 위험물 상세 — DG_TABLE]\n' + ansDgText + '\n' : ''}${skrText ? '\n[SKR/HAL(자사) 선적 금지·제한 조회 결과 — 선적 가부 근거, 타 선사 제외]\n' + skrText + '\n' : ''}
[사내 DG FAQ·문의답변 데이터베이스]
${ctxText || '(제공된 자료 없음)'}
${attBlock}
[사용자 질문]
${String(question).trim()}`;
    const answer = await gen(answerPrompt, 0.3, ansAttParts);
    if (!answer) return res.status(500).json({ ok: false, message: 'AI가 답변을 반환하지 않았습니다.' });
    return res.status(200).json({ ok: true, model, answer, used: ctx.length });
  } catch (err) {
    console.error('[api/faq-ai] error:', err);
    return res.status(err && err.code === 503 ? 503 : 500).json({ ok: false, message: err.message || 'AI 처리 중 오류가 발생했습니다.' });
  }
};
