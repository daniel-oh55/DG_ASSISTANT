// ════════════════════════════════════════════════════════════════
// 선사 규정 업데이트 (관리자 전용) — PDF 업로드 → AI 판독 → 미리보기 → 적용 / 되돌리기
//   서버: /api/carrier-update (관리자 여부는 서버가 매 요청 확인)
//   위치: 선사별/포트별 선적가부 조회 화면 우측 상단 버튼
// ════════════════════════════════════════════════════════════════
(function () {
  const API = '/api/carrier-update';
  const esc = v => String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const $ = id => document.getElementById(id);
  const isAdmin = () => typeof dgIsAdmin === 'function' && dgIsAdmin();

  const S = { carriers: [], maxPdf: 3 * 1024 * 1024, group: '', file: null, b64: '', pdfUnnos: [], rows: [], preview: null, busy: false };

  async function api(action, payload) {
    const res = await fetch(API, {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action }, payload || {}))
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* 아래에서 처리 */ }
    if (!res.ok || !data || !data.ok) {
      throw new Error((data && data.message) || (res.status === 413 ? '파일이 너무 큽니다 (3MB 이하).' : res.status === 504 ? 'AI 판독 시간이 초과됐습니다.' : '요청 실패 (HTTP ' + res.status + ')'));
    }
    return data;
  }

  // ── 원본 규정 링크: 업로드로 바뀐 선사는 서버 정보로 덮어씀 ─────────
  async function loadDocs() {
    try {
      const r = await fetch(API + '?action=docs');
      const j = await r.json();
      if (j && j.ok && j.docs && typeof CARRIER_DOCS === 'object') {
        Object.keys(j.docs).forEach(k => { if (j.docs[k] && j.docs[k].url) CARRIER_DOCS[k] = { url: j.docs[k].url, label: j.docs[k].label || k }; });
      }
    } catch (e) { /* 실패하면 기본(코드에 적힌) 링크 그대로 */ }
  }

  // ── 버튼 표시 (관리자만) ─────────────────────────────────────────
  function applyAccess() {
    const tools = $('carrierTools') || document.querySelector('#tab-carrier-check .carrier-header');
    if (!tools) return;
    const histBtn = $('cuHistBtn');
    if (histBtn && !histBtn.dataset.bound) { histBtn.dataset.bound = '1'; histBtn.addEventListener('click', openHistModal); }
    let btn = $('cuOpenBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'cuOpenBtn'; btn.type = 'button'; btn.className = 'carrier-tool-btn is-admin';
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>선사 규정 업데이트';
      btn.addEventListener('click', openModal);
      tools.appendChild(btn);
    }
    btn.style.display = isAdmin() ? '' : 'none';
    if (!isAdmin()) closeModal();
  }

  // ── 모달 뼈대 ────────────────────────────────────────────────────
  function ensureModal() {
    let m = $('cuModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'cuModal'; m.className = 'cu-modal'; m.hidden = true;
    m.innerHTML = `
      <div class="cu-box" role="dialog" aria-modal="true" aria-labelledby="cuTitle">
        <div class="cu-head"><span id="cuTitle">⚙ 선사 규정 업데이트 <small>관리자 전용</small></span>
          <button type="button" class="cu-x" id="cuClose" aria-label="닫기">✕</button></div>
        <div class="cu-body">
          <div class="cu-step">
            <div class="cu-row">
              <label class="cu-field"><span>선사</span><select id="cuCarrier"></select></label>
              <label class="cu-field cu-grow"><span>새 규정 PDF (3MB 이하)</span><input type="file" id="cuFile" accept="application/pdf,.pdf"></label>
              <button type="button" class="btn accent2 cu-btn" id="cuParseBtn">AI 판독 시작</button>
            </div>
            <div class="cu-now" id="cuNow"></div>
            <div class="cu-msg" id="cuMsg"></div>
          </div>
          <div id="cuPreview"></div>
          <details class="cu-history" id="cuHistoryBox">
            <summary>↩ 이전 버전으로 되돌리기</summary>
            <div id="cuHistory" class="cu-history-list"></div>
          </details>
        </div>
      </div>`;
    document.body.appendChild(m);
    $('cuClose').addEventListener('click', closeModal);
    m.addEventListener('mousedown', e => { if (e.target === m && !S.busy) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden && !S.busy) closeModal(); });
    $('cuCarrier').addEventListener('change', onCarrierChange);
    $('cuFile').addEventListener('change', () => { S.rows = []; S.preview = null; $('cuPreview').innerHTML = ''; msg(''); });
    $('cuParseBtn').addEventListener('click', startParse);
    $('cuHistoryBox').addEventListener('toggle', () => { if ($('cuHistoryBox').open) loadHistory(); });
    return m;
  }

  function msg(text, kind) {
    const el = $('cuMsg');
    if (!el) return;
    el.className = 'cu-msg' + (kind ? ' cu-' + kind : '');
    el.textContent = text || '';
  }

  function setBusy(on) {
    S.busy = on;
    document.querySelectorAll('#cuModal button, #cuModal select, #cuModal input[type=file]').forEach(el => { if (el.id !== 'cuClose') el.disabled = on; });
  }

  async function openModal() {
    if (!isAdmin()) return;
    const m = ensureModal();
    m.hidden = false;
    msg('선사 목록을 불러오는 중…');
    try {
      const r = await api('carriers');
      S.carriers = r.carriers || [];
      S.maxPdf = r.max_pdf || S.maxPdf;
      const sel = $('cuCarrier');
      sel.innerHTML = '<option value="">선택하세요</option>' + S.carriers.filter(c => !c.locked)
        .map(c => `<option value="${esc(c.carrier_group)}">${esc(c.carrier_name)} (${esc(c.carrier_group)})</option>`).join('');
      if (S.group) sel.value = S.group;
      onCarrierChange();
      msg('');
    } catch (e) { msg(e.message, 'err'); }
  }

  function closeModal() {
    const m = $('cuModal');
    if (m) m.hidden = true;
  }

  function currentCarrier() { return S.carriers.find(c => c.carrier_group === S.group) || null; }

  function onCarrierChange() {
    S.group = $('cuCarrier').value;
    S.rows = []; S.preview = null;
    $('cuPreview').innerHTML = '';
    const c = currentCarrier();
    $('cuNow').innerHTML = c
      ? `현재 등록: <b>${esc(c.version_no || '판 표시 없음')}</b> · 시행일 ${esc(c.effective_date || '-')} · ${c.count}행 · 원본 ${esc(c.source_file || '-')}`
      : '';
    $('cuHistoryBox').open = false;
    $('cuHistory').innerHTML = '';
  }

  // ── PDF 읽기 (쪽 수 + 본문에 보이는 4자리 숫자 = 누락 점검용) ─────
  function toBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  async function inspectPdf(bytes) {
    if (!window.pdfjsLib) return { pages: 1, unnos: null };
    try { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; } catch (e) { /* 무시 */ }
    const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    const found = new Set();
    let chars = 0;
    for (let i = 1; i <= pdf.numPages; i++) {
      const tc = await (await pdf.getPage(i)).getTextContent();
      const text = tc.items.map(it => it.str).join(' ');
      chars += text.length;
      (text.match(/(?<![\d.,%\/-])\d{4}(?![\d.,%\/-])/g) || []).forEach(n => found.add(n));
    }
    return { pages: pdf.numPages, unnos: chars > 200 ? [...found] : null };   // 스캔본(글자 없음)은 점검 생략
  }

  async function startParse() {
    if (S.busy) return;
    const file = $('cuFile').files[0];
    if (!S.group) return msg('선사를 선택해 주세요.', 'err');
    if (!file) return msg('PDF 파일을 선택해 주세요.', 'err');
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return msg('PDF 파일만 올릴 수 있습니다.', 'err');
    if (file.size > S.maxPdf) return msg('파일이 ' + (file.size / 1048576).toFixed(1) + 'MB 입니다. 3MB 이하로 줄여서 올려 주세요.', 'err');
    setBusy(true);
    $('cuPreview').innerHTML = '';
    try {
      msg('PDF 를 읽는 중…');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const info = await inspectPdf(bytes);
      S.file = file; S.b64 = toBase64(bytes); S.pdfUnnos = info.unnos;
      const pages = info.pages, results = new Array(pages);
      let done = 0, next = 1;
      const worker = async () => {
        while (next <= pages) {
          const p = next++;
          let r = null, lastErr = null;
          for (let t = 0; t < 2 && !r; t++) {
            try { r = await api('parse', { carrier_group: S.group, file_base64: S.b64, page: p, pages }); } catch (e) { lastErr = e; }
          }
          if (!r) throw new Error(p + '쪽 판독 실패: ' + (lastErr ? lastErr.message : ''));
          if (r.truncated) throw new Error(p + '쪽의 내용이 너무 길어 판독이 잘렸습니다.');
          results[p - 1] = r;
          msg('AI 가 규정을 읽는 중… ' + (++done) + ' / ' + pages + '쪽');
        }
      };
      msg('AI 가 규정을 읽는 중… 0 / ' + pages + '쪽 (쪽당 10~40초)');
      await Promise.all([worker(), worker()]);
      S.rows = [].concat(...results.map(r => r.rows));
      const doc = results.map(r => r.doc).find(d => d && (d.version_no || d.effective_date || d.title)) || {};
      if (!S.rows.length) throw new Error('규정 행을 하나도 찾지 못했습니다. 금지·제한 목록 PDF 가 맞는지 확인해 주세요.');
      S.meta = buildMeta(doc);
      await runPreview(true);
    } catch (e) {
      msg(e.message, 'err');
    } finally { setBusy(false); }
  }

  function buildMeta(doc) {
    const c = currentCarrier() || {};
    const version = doc.version_no || (doc.effective_date ? doc.effective_date.replace(/-/g, '.') : '');
    const title = doc.title || ((c.carrier_name || S.group) + ' DG Prohibited & Restricted List');
    return { version_no: version, effective_date: doc.effective_date || '', label: title + (version ? ' (' + version + ')' : '') };
  }

  // ── 미리보기 ─────────────────────────────────────────────────────
  function readTable() {
    const body = $('cuRows');
    if (!body) return S.rows;
    return [...body.querySelectorAll('tr')].map(tr => ({
      class_no: tr.querySelector('.cu-c').value, unno: tr.querySelector('.cu-u').value, psn: tr.querySelector('.cu-p').value,
      status: tr.querySelector('.cu-s').value, remark_code: tr.dataset.rc || null, remark_text: tr.querySelector('.cu-r').value
    }));
  }

  function readMeta() {
    if (!$('cuVersion')) return S.meta || {};
    return { version_no: $('cuVersion').value.trim(), effective_date: $('cuEff').value.trim(), label: $('cuLabel').value.trim() };
  }

  async function runPreview(fromParse) {
    if (!fromParse) { S.rows = readTable(); S.meta = readMeta(); }
    msg('현재 규정과 비교하는 중…');
    const p = await api('preview', { carrier_group: S.group, rows: S.rows, pdf_unnos: S.pdfUnnos || undefined });
    S.preview = p; S.rows = p.rows;
    renderPreview();
    msg(p.errors.length ? '고쳐야 할 줄이 ' + p.errors.length + '개 있습니다. 아래 안내를 확인해 주세요.' : '판독이 끝났습니다. 아래 내용을 확인한 뒤 [적용]을 눌러 주세요.', p.errors.length ? 'err' : 'ok');
  }

  const keyOf = r => String(r.unno).toUpperCase() + '|' + r.class_no;
  const statusKo = s => (s === 'PROHIBITED' ? '금지' : '제한');

  function briefList(list, cls) {
    return list.map(r => `<li class="${cls}"><b>${esc(r.unno)}</b> · Class ${esc(r.class_no)} · ${statusKo(r.status)} · ${esc(r.psn)}${r.remark_text ? ' <i>— ' + esc(r.remark_text) + '</i>' : ''}</li>`).join('');
  }

  function renderPreview() {
    const p = S.preview, m = S.meta || {}, d = p.diff;
    const addedKeys = new Set(d.added.map(keyOf));
    const changedKeys = new Set([].concat(...d.changed.map(c => c.after.map(keyOf))));
    const warn = p.warnings.map(w => `<div class="cu-warn"><b>⚠ ${esc(w.message)}</b>${w.items && w.items.length ? '<div class="cu-chips">' + w.items.map(u => '<span>' + esc(u) + '</span>').join('') + '</div>' : ''}</div>`).join('');
    const errs = p.errors.length ? `<div class="cu-errbox"><b>고쳐야 적용할 수 있는 줄</b><ul>${p.errors.slice(0, 20).map(e => '<li>' + esc(e) + '</li>').join('')}</ul></div>` : '';
    const changed = d.changed.map(c => `<li class="cu-chg"><b>${esc(c.after[0].unno)}</b> · Class ${esc(c.after[0].class_no)} · ${esc(c.after[0].psn)}
        <div class="cu-ba"><span>이전</span> ${c.before.map(b => statusKo(b.status) + (b.remark_text ? ' — ' + esc(b.remark_text) : '')).join(' / ')}</div>
        <div class="cu-ba"><span>변경</span> ${c.after.map(b => statusKo(b.status) + (b.remark_text ? ' — ' + esc(b.remark_text) : '')).join(' / ')}</div></li>`).join('');
    const rows = S.rows.map(r => {
      const k = keyOf(r), cls = addedKeys.has(k) ? 'cu-tr-add' : (changedKeys.has(k) ? 'cu-tr-chg' : '');
      return `<tr class="${cls}" data-rc="${esc(r.remark_code || '')}">
        <td><input class="cu-c" value="${esc(r.class_no)}"></td>
        <td><input class="cu-u" value="${esc(r.unno)}"></td>
        <td><input class="cu-p" value="${esc(r.psn)}"></td>
        <td><select class="cu-s"><option value="PROHIBITED"${r.status === 'PROHIBITED' ? ' selected' : ''}>금지</option><option value="RESTRICTED"${r.status === 'RESTRICTED' ? ' selected' : ''}>제한</option></select></td>
        <td><input class="cu-r" value="${esc(r.remark_text || '')}"></td>
        <td><button type="button" class="cu-del" title="이 줄 삭제">✕</button></td></tr>`;
    }).join('');

    $('cuPreview').innerHTML = `
      <div class="cu-summary">
        <div class="cu-stat"><b>${p.counts.total}</b><span>새 규정 행</span></div>
        <div class="cu-stat"><b>${p.counts.prohibited}</b><span>금지</span></div>
        <div class="cu-stat"><b>${p.counts.restricted}</b><span>제한</span></div>
        <div class="cu-stat cu-add"><b>+${d.added.length}</b><span>추가</span></div>
        <div class="cu-stat cu-rem"><b>−${d.removed.length}</b><span>삭제</span></div>
        <div class="cu-stat cu-mod"><b>${d.changed.length}</b><span>변경</span></div>
        <div class="cu-stat"><b>${d.same}</b><span>그대로</span></div>
      </div>
      ${errs}${warn}
      <details class="cu-diff" ${d.added.length + d.removed.length + d.changed.length ? 'open' : ''}>
        <summary>현재 규정과 달라지는 내용 (추가 ${d.added.length} · 삭제 ${d.removed.length} · 변경 ${d.changed.length})</summary>
        ${d.added.length + d.removed.length + d.changed.length ? `<ul class="cu-difflist">${briefList(d.added, 'cu-addli')}${briefList(d.removed, 'cu-remli')}${changed}</ul>` : '<p class="cu-none">달라지는 내용이 없습니다.</p>'}
      </details>
      <div class="cu-meta">
        <label class="cu-field"><span>판(버전)</span><input id="cuVersion" value="${esc(m.version_no || '')}" placeholder="예: 2026.11.19"></label>
        <label class="cu-field"><span>시행일</span><input id="cuEff" type="date" value="${esc(m.effective_date || '')}"></label>
        <label class="cu-field cu-grow"><span>문서 이름 (원본 규정 보기에 표시)</span><input id="cuLabel" value="${esc(m.label || '')}"></label>
      </div>
      <details class="cu-tablebox">
        <summary>전체 ${S.rows.length}행 보기·고치기 <small>(초록 = 추가, 노랑 = 변경)</small></summary>
        <div class="cu-tablewrap"><table class="cu-table">
          <thead><tr><th>Class</th><th>UN번호</th><th>품명</th><th>구분</th><th>조건·비고</th><th></th></tr></thead>
          <tbody id="cuRows">${rows}</tbody></table></div>
        <div class="cu-tableact"><button type="button" class="btn secondary cu-btn" id="cuAddRow">+ 줄 추가</button>
          <button type="button" class="btn secondary cu-btn" id="cuRecheck">고친 내용으로 다시 비교</button></div>
      </details>
      ${p.shrink ? '<label class="cu-check"><input type="checkbox" id="cuShrinkOk"> 행 수가 크게 줄어든 것을 확인했습니다.</label>' : ''}
      <div class="cu-apply">
        <span>적용하면 이 선사의 조회 결과가 즉시 바뀝니다. 직전 규정은 자동 보관되어 되돌릴 수 있습니다.</span>
        <button type="button" class="btn accent2 cu-btn" id="cuApplyBtn"${p.errors.length ? ' disabled' : ''}>이 내용으로 적용</button>
      </div>`;

    $('cuRows').addEventListener('click', e => { if (e.target.classList.contains('cu-del')) e.target.closest('tr').remove(); });
    $('cuAddRow').addEventListener('click', () => {
      const tr = document.createElement('tr');
      tr.className = 'cu-tr-add';
      tr.innerHTML = '<td><input class="cu-c"></td><td><input class="cu-u"></td><td><input class="cu-p"></td><td><select class="cu-s"><option value="PROHIBITED">금지</option><option value="RESTRICTED">제한</option></select></td><td><input class="cu-r"></td><td><button type="button" class="cu-del">✕</button></td>';
      $('cuRows').appendChild(tr);
      tr.querySelector('.cu-c').focus();
    });
    $('cuRecheck').addEventListener('click', async () => {
      if (S.busy) return;
      setBusy(true);
      try { await runPreview(false); } catch (e) { msg(e.message, 'err'); } finally { setBusy(false); }
    });
    $('cuApplyBtn').addEventListener('click', applyNow);
  }

  async function applyNow() {
    if (S.busy || !S.preview) return;
    const c = currentCarrier() || {};
    setBusy(true);
    try {
      const shrinkChecked = !!($('cuShrinkOk') && $('cuShrinkOk').checked);
      await runPreview(false);                        // 화면에서 고친 내용을 서버 검증에 다시 통과시킨 뒤 적용
      if ($('cuShrinkOk')) $('cuShrinkOk').checked = shrinkChecked;
      setBusy(true);
      const p = S.preview, m = S.meta;
      if (p.errors.length) return;
      if (!m.version_no) return msg('판(버전)을 입력해 주세요.', 'err');
      if (!m.effective_date) return msg('시행일을 입력해 주세요.', 'err');
      if (!m.label) return msg('문서 이름을 입력해 주세요.', 'err');
      const shrinkOk = !p.shrink || ($('cuShrinkOk') && $('cuShrinkOk').checked);
      if (!shrinkOk) return msg('행 수가 크게 줄었습니다. 확인란을 체크해 주세요.', 'err');
      const d = p.diff;
      if (!confirm(`${c.carrier_name || S.group} 규정을 ${m.version_no} 판으로 바꿉니다.\n\n새 규정 ${p.counts.total}행 (추가 ${d.added.length} · 삭제 ${d.removed.length} · 변경 ${d.changed.length})\n\n적용할까요?`)) return msg('적용을 취소했습니다.');
      msg('적용하는 중…');
      const r = await api('apply', { carrier_group: S.group, rows: S.rows, version_no: m.version_no, effective_date: m.effective_date,
        label: m.label, file_name: S.file ? S.file.name : '', file_base64: S.b64, confirm_shrink: !!p.shrink });
      if (r.doc && typeof CARRIER_DOCS === 'object') CARRIER_DOCS[S.group] = { url: r.doc.url, label: r.doc.label };
      $('cuPreview').innerHTML = `<div class="cu-done">✅ <b>${esc(c.carrier_name || S.group)}</b> 규정을 <b>${esc(m.version_no)}</b> 판으로 바꿨습니다 (${r.inserted}행 등록, 이전 ${r.removed}행 교체). 선적가부 조회에 바로 반영됩니다.</div>`;
      $('cuFile').value = '';
      S.rows = []; S.preview = null; S.b64 = '';
      msg('');
      const list = await api('carriers');
      S.carriers = list.carriers || S.carriers;
      const keep = S.group; onCarrierChange(); S.group = keep;
    } catch (e) { msg(e.message, 'err'); } finally { setBusy(false); }
  }

  // ── 되돌리기 ─────────────────────────────────────────────────────
  async function loadHistory() {
    const box = $('cuHistory');
    if (!S.group) { box.innerHTML = '<p class="cu-none">선사를 먼저 선택해 주세요.</p>'; return; }
    box.innerHTML = '<p class="cu-none">불러오는 중…</p>';
    try {
      const r = await api('history', { carrier_group: S.group });
      if (!r.backups.length) { box.innerHTML = '<p class="cu-none">보관된 이전 버전이 없습니다. (이 기능으로 적용한 뒤부터 보관됩니다)</p>'; return; }
      box.innerHTML = r.backups.map(b => `<div class="cu-hrow">
          <div><b>${esc(b.version_no || '판 표시 없음')}</b> · ${b.count}행 · 시행일 ${esc(b.effective_date || '-')}
            <small>${esc(new Date(b.saved_at).toLocaleString('ko-KR'))} 보관 · ${esc(b.saved_by || '')} · ${esc(b.note || '')}</small></div>
          <button type="button" class="btn secondary cu-btn" data-backup="${esc(b.name)}" data-ver="${esc(b.version_no || '')}">이 시점으로 되돌리기</button></div>`).join('');
      box.querySelectorAll('button[data-backup]').forEach(btn => btn.addEventListener('click', () => rollback(btn.dataset.backup, btn.dataset.ver)));
    } catch (e) { box.innerHTML = '<p class="cu-none">' + esc(e.message) + '</p>'; }
  }

  async function rollback(name, ver) {
    if (S.busy) return;
    const c = currentCarrier() || {};
    if (!confirm(`${c.carrier_name || S.group} 규정을 ${ver || '선택한'} 판으로 되돌립니다.\n지금 규정도 자동 보관됩니다. 진행할까요?`)) return;
    setBusy(true);
    try {
      msg('되돌리는 중…');
      const r = await api('rollback', { carrier_group: S.group, backup: name });
      await loadDocs();
      const list = await api('carriers');
      S.carriers = list.carriers || S.carriers;
      const keep = S.group; onCarrierChange(); S.group = keep; $('cuCarrier').value = keep;
      $('cuPreview').innerHTML = `<div class="cu-done">↩ <b>${esc(c.carrier_name || S.group)}</b> 규정을 <b>${esc(r.version_no || '이전')}</b> 판으로 되돌렸습니다 (${r.inserted}행).</div>`;
      msg('');
    } catch (e) { msg(e.message, 'err'); } finally { setBusy(false); }
  }

  // ── 타사 규정 변경 이력 (로그인한 회원 누구나) ───────────────────
  //   기준 자료: carriers/carrier_versions.json (예전 규정 파일 비교본) + 업데이트 기능이 적용할 때마다 남기는 기록
  const H = { data: null, group: '' };

  async function loadHistData() {
    const out = {};
    try {
      const r = await fetch('/carriers/carrier_versions.json', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        Object.keys(j.carriers || {}).forEach(g => { out[g] = { name: j.carriers[g].name || g, versions: (j.carriers[g].versions || []).slice() }; });
      }
    } catch (e) { /* 기준 자료가 없어도 적용 기록만으로 표시 */ }
    try {
      const r = await fetch(API + '?action=changes');
      const j = await r.json();
      if (j && j.ok) {
        Object.keys(j.changes || {}).forEach(g => {
          const list = j.changes[g] || [];
          if (!out[g]) out[g] = { name: (list[0] && list[0].carrier_name) || g, versions: [] };
          list.forEach(e => out[g].versions.push({
            version: e.version, date: e.date, count: e.count, added: e.added || [], removed: e.removed || [], changed: e.changed || [],
            applied_at: e.applied_at, totals: [e.added_total, e.removed_total, e.changed_total],
            remark: (e.remark ? e.remark + ' · ' : '') + '추가 ' + (e.added_total || 0) + ' · 삭제 ' + (e.removed_total || 0) + ' · 변경 ' + (e.changed_total || 0)
          }));
        });
      }
    } catch (e) { /* 무시 */ }
    if (typeof CARRIER_DOCS === 'object') {                     // 이력이 아직 없는 선사도 목록에는 보이게
      const NAMES = { NSS_DYS: 'NSS & DYS', TSL: 'TSL', SITC: 'SITC' };
      Object.keys(CARRIER_DOCS).forEach(g => { if (!out[g]) out[g] = { name: NAMES[g] || g, versions: [] }; });
    }
    delete out.SKR_HAL;                                         // 자사 이력은 왼쪽 버튼(SKR/HAS 규정 변경 이력)
    return out;
  }

  function ensureHistModal() {
    let m = $('cuHistModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'cuHistModal'; m.className = 'skr-modal'; m.hidden = true;
    m.innerHTML = `
      <div class="skr-modal-box" role="dialog" aria-modal="true" aria-label="타사 규정 변경 이력">
        <div class="skr-modal-head"><span>타사 규정 변경 이력</span>
          <button type="button" class="skr-modal-close" id="cuHistClose" aria-label="닫기">✕</button></div>
        <div class="skr-modal-body">
          <div class="skr-hist-list"><select id="cuHistCarrier" class="cu-hist-carrier" aria-label="선사 선택"></select><div id="cuHistVers"></div></div>
          <div class="cu-hist-detail" id="cuHistDetail"></div>
        </div>
      </div>`;
    document.body.appendChild(m);
    $('cuHistClose').addEventListener('click', () => { m.hidden = true; });
    m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) m.hidden = true; });
    $('cuHistCarrier').addEventListener('change', () => { H.group = $('cuHistCarrier').value; renderHistList(); });
    return m;
  }

  async function openHistModal() {
    const m = ensureHistModal();
    m.hidden = false;
    $('cuHistVers').innerHTML = '<div class="skr-hist-title">이력을 불러오는 중…</div>';
    $('cuHistDetail').innerHTML = '';
    H.data = await loadHistData();
    const groups = Object.keys(H.data).sort((a, b) => (H.data[b].versions.length ? 1 : 0) - (H.data[a].versions.length ? 1 : 0) || String(H.data[a].name).localeCompare(String(H.data[b].name)));
    if (!groups.length) { $('cuHistVers').innerHTML = '<div class="skr-hist-title">표시할 이력이 없습니다.</div>'; return; }
    if (!H.group || !H.data[H.group]) H.group = groups[0];
    $('cuHistCarrier').innerHTML = groups.map(g => `<option value="${esc(g)}">${esc(H.data[g].name)}${H.data[g].versions.length ? ' (' + H.data[g].versions.length + '개 판)' : ' (이력 없음)'}</option>`).join('');
    $('cuHistCarrier').value = H.group;
    renderHistList();
  }

  function renderHistList() {
    const c = H.data[H.group], box = $('cuHistVers');
    if (!c || !c.versions.length) {
      box.innerHTML = '<div class="skr-hist-title">기록된 변경 이력이 없습니다.</div>';
      $('cuHistDetail').innerHTML = '<p class="cu-none" style="padding:0">이 선사는 아직 판별 비교 자료가 없습니다. 선사 규정 업데이트 기능으로 새 판을 적용하면 그때부터 변경 내용이 자동으로 기록됩니다.</p>';
      return;
    }
    box.innerHTML = '<div class="skr-hist-title">판 목록 (최신순)</div>' + c.versions.map((v, i) => i).reverse().map(i => {
      const v = c.versions[i];
      return `<div class="skr-ver" data-vi="${i}"><div class="skr-ver-head"><b>${esc(v.version || '-')}</b> <span class="skr-ver-date">${esc(v.date || '')}</span> <span class="skr-ver-cnt">${v.count != null ? v.count + '행' : ''}</span></div>
        <div class="skr-ver-remark">${esc(v.remark || '')}</div></div>`;
    }).join('');
    box.querySelectorAll('.skr-ver').forEach(el => el.addEventListener('click', () => showHistVersion(+el.dataset.vi)));
    showHistVersion(c.versions.length - 1);
  }

  function showHistVersion(i) {
    const c = H.data[H.group], v = c && c.versions[i];
    if (!v) return;
    $('cuHistVers').querySelectorAll('.skr-ver').forEach(el => el.classList.toggle('active', +el.dataset.vi === i));
    const added = v.added || [], removed = v.removed || [], changed = v.changed || [];
    const t = v.totals || [added.length, removed.length, changed.length];
    const when = v.applied_at ? ' · ' + new Date(v.applied_at).toLocaleDateString('ko-KR') + ' 적용' : '';
    let html = `<h3>${esc(c.name)} · ${esc(v.version || '-')}</h3><div class="cu-hist-sub">시행일 ${esc(v.date || '-')} · ${v.count != null ? v.count + '행' : ''}${when}</div>`;
    if (!added.length && !removed.length && !changed.length) {
      html += `<p class="cu-none" style="padding:0">${esc(v.remark || '이전 판 대비 변경 없음')}</p>`;
    } else {
      const ch = changed.map(x => `<li class="cu-chg"><b>${esc(x.after[0].unno)}</b> · Class ${esc(x.after[0].class_no)} · ${esc(x.after[0].psn)}
          <div class="cu-ba"><span>이전</span> ${x.before.map(b => statusKo(b.status) + (b.remark_text ? ' — ' + esc(b.remark_text) : '')).join(' / ')}</div>
          <div class="cu-ba"><span>변경</span> ${x.after.map(b => statusKo(b.status) + (b.remark_text ? ' — ' + esc(b.remark_text) : '')).join(' / ')}</div></li>`).join('');
      const more = (t[0] > added.length || t[1] > removed.length || t[2] > changed.length) ? '<p class="cu-none" style="padding:6px 0 0">건수가 많아 일부만 표시합니다.</p>' : '';
      html += `<div class="skr-change-title">이전 판 대비 변경 내용 — 추가 ${t[0]} · 삭제 ${t[1]} · 변경 ${t[2]}</div>
        <ul class="cu-difflist">${briefList(added, 'cu-addli')}${briefList(removed, 'cu-remli')}${ch}</ul>${more}`;
    }
    $('cuHistDetail').innerHTML = html;
  }

  // ── 초기화 ───────────────────────────────────────────────────────
  window.cuApplyAccess = applyAccess;
  loadDocs();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAccess); else applyAccess();
})();
