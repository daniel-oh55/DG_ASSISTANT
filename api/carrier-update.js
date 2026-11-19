const { supabaseAdmin } = require('./_supabase');
const A = require('./_auth');

// 선사 규정 업데이트 API (관리자 전용) — PDF 업로드 → AI 판독 → 미리보기 → 적용 / 되돌리기
//   규정 표: public.dg_carrier_rules (서비스 롤로만 수정)
//   보관:   Storage 버킷 dg_files / carrier_rules/ (원본 PDF · 적용 전 백업 · 문서 링크 정보 docs.json)
//   권한:   모든 POST 는 로그인 쿠키(dg_session) → dg_members.role = 'admin' 을 매 요청 DB에서 확인
//   공개:   GET ?action=docs (원본 규정 링크 정보), GET ?action=pdf&g=GROUP (업로드된 원본 PDF)

const RULES = 'dg_carrier_rules';
const BUCKET = 'dg_files';
const ROOT = 'carrier_rules';
const DOCS_PATH = ROOT + '/docs.json';
const MAX_PDF = 3 * 1024 * 1024;          // Vercel 요청 본문 4.5MB 한도 → base64 로 약 4MB
const MAX_ROWS = 1500;
const LOCKED_GROUPS = ['SKR_HAL'];        // 자사 규정은 화면 고정 안내문과 묶여 있어 이 기능으로 바꾸지 않는다
const GROUP_RE = /^[A-Z][A-Z0-9_]{1,29}$/;
const STATUSES = ['PROHIBITED', 'RESTRICTED'];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const str = v => (v === null || v === undefined ? '' : String(v)).replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 권한 ─────────────────────────────────────────────────────────
async function requireAdmin(req) {
  const s = A.verifySession(A.readCookie(req, A.COOKIE_NAME));
  if (!s) throw new HttpError(401, '로그인이 필요합니다.');
  const { data: m, error } = await supabaseAdmin.from('dg_members').select('*')
    .eq('id_lower', String(s.sub).toLowerCase()).maybeSingle();
  if (error) throw error;
  if (!m || m.status !== 'approved') throw new HttpError(401, '로그인이 필요합니다.');
  if (m.pw_changed_at && s.iat < new Date(m.pw_changed_at).getTime()) throw new HttpError(401, '다시 로그인해 주세요.');
  if (m.role !== 'admin') throw new HttpError(403, '관리자만 사용할 수 있습니다.');
  return m;
}

function checkGroup(g) {
  const group = str(g).toUpperCase();
  if (!GROUP_RE.test(group)) throw new HttpError(400, '선사를 선택해 주세요.');
  if (LOCKED_GROUPS.includes(group)) throw new HttpError(400, '이 선사 규정은 이 기능으로 변경할 수 없습니다.');
  return group;
}

// ── 규정 표 읽기 (1,000행 제한을 넘겨도 전부 읽도록 나눠 읽음) ──────
async function selectAll(build) {
  const out = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

const groupRows = group => selectAll(() => supabaseAdmin.from(RULES).select('*')
  .eq('carrier_group', group).order('sort_order', { ascending: true }).order('id', { ascending: true }));

// ── Storage ──────────────────────────────────────────────────────
async function readJson(path) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  try { return JSON.parse(Buffer.from(await data.arrayBuffer()).toString('utf8')); } catch (e) { return null; }
}

async function writeJson(path, obj) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, Buffer.from(JSON.stringify(obj), 'utf8'),
    { contentType: 'application/json; charset=utf-8', upsert: true });
  if (error) throw error;
}

// ── 행 정리·검증 ─────────────────────────────────────────────────
function normClass(v) {
  const s = str(v).toUpperCase();
  if (!s) return '';
  if (s === 'COMMON' || s === 'ETC' || s === 'ALL') return s === 'ETC' ? 'Etc' : s;
  const m = s.replace(/^CLASS\s*/, '').match(/^(\d)(?:\.(\d))?([A-Z])?$/);
  return m ? m[1] + (m[2] ? '.' + m[2] : '') + (m[3] || '') : str(v);
}

function normUnno(v) {
  const s = str(v).toUpperCase().replace(/^UN\s*/, '');
  if (s === 'ALL' || s === 'COMMON') return s;
  return /^\d{1,4}$/.test(s) ? s.padStart(4, '0') : s;
}

// 화면/AI 가 준 행 → 저장용 행. 문제 있는 행은 errors 에 사유를 담는다.
function cleanRows(input) {
  if (!Array.isArray(input)) throw new HttpError(400, '규정 행이 없습니다.');
  if (input.length > MAX_ROWS) throw new HttpError(400, '행이 너무 많습니다 (최대 ' + MAX_ROWS + '행).');
  const rows = [], errors = [], seen = new Set();
  input.forEach((r, i) => {
    if (!r || typeof r !== 'object') return;
    const row = {
      class_no: normClass(r.class_no), unno: normUnno(r.unno), psn: str(r.psn).slice(0, 600),
      status: str(r.status).toUpperCase(), remark_code: str(r.remark_code).slice(0, 60) || null,
      remark_text: str(r.remark_text).slice(0, 3000) || null
    };
    if (!row.class_no && !row.unno && !row.psn) return;                      // 빈 줄
    const at = (i + 1) + '번째 줄';
    if (!STATUSES.includes(row.status)) { errors.push(at + ': 구분은 PROHIBITED 또는 RESTRICTED 여야 합니다.'); return; }
    if (!/^(\d{4}|ALL|COMMON)$/.test(row.unno)) { errors.push(at + ': UN번호는 4자리 숫자, ALL, COMMON 중 하나여야 합니다 (' + (row.unno || '빈칸') + ').'); return; }
    if (!row.class_no) { errors.push(at + ': Class 가 비어 있습니다 (UN ' + row.unno + ').'); return; }
    if (row.unno === 'ALL' && !/^\d(\.\d)?[A-Z]?$/.test(row.class_no)) { errors.push(at + ': ALL 행은 Class 번호가 필요합니다.'); return; }
    const key = [row.class_no, row.unno, row.status, row.psn.toLowerCase(), (row.remark_text || '').toLowerCase()].join('|');
    if (seen.has(key)) return;                                               // 완전히 같은 줄은 한 번만
    seen.add(key);
    rows.push(row);
  });
  return { rows, errors };
}

const ruleKey = r => str(r.unno).toUpperCase() + '|' + normClass(r.class_no);

function diffRows(current, next) {
  const group = list => {
    const m = new Map();
    list.forEach(r => { const k = ruleKey(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); });
    return m;
  };
  const sig = list => list.map(r => r.status + '::' + str(r.remark_text).toLowerCase()).sort().join('||');
  const brief = r => ({ class_no: r.class_no, unno: r.unno, psn: r.psn, status: r.status, remark_text: r.remark_text || null });
  const a = group(current), b = group(next);
  const added = [], removed = [], changed = [];
  let same = 0;
  b.forEach((list, k) => {
    if (!a.has(k)) { added.push(...list.map(brief)); return; }
    if (sig(a.get(k)) === sig(list)) { same += list.length; return; }
    changed.push({ before: a.get(k).map(brief), after: list.map(brief) });
  });
  a.forEach((list, k) => { if (!b.has(k)) removed.push(...list.map(brief)); });
  return { added, removed, changed, same };
}

// UN번호가 IMDG 표(DG_TABLE)에 있는지 — AI 가 숫자를 잘못 읽었는지 가려내는 용도
async function knownUnnos(unnos) {
  const list = [...new Set(unnos.filter(u => /^\d{4}$/.test(u)))];
  const known = new Set();
  for (let i = 0; i < list.length; i += 100) {
    const part = list.slice(i, i + 100);
    const variants = [...new Set(part.concat(part.map(u => String(Number(u)))))];
    const { data, error } = await supabaseAdmin.from('DG_TABLE').select('UNNO').in('UNNO', variants);
    if (error) throw error;
    (data || []).forEach(d => known.add(String(d.UNNO).trim().padStart(4, '0')));
  }
  return known;
}

// ── AI 판독 (Gemini — analyze-sds 와 같은 키·모델 폴백) ────────────
function extractJson(text) {
  const raw = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(raw); } catch (e) { /* 아래에서 중괄호 구간만 재시도 */ }
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
  if (s >= 0 && e > s) { try { return JSON.parse(raw.slice(s, e + 1)); } catch (err) { /* 무시 */ } }
  return null;
}

function buildPrompt(page, pages) {
  return `You are reading a shipping line's "Dangerous Goods prohibited / restricted list" (PDF attached).
The PDF has ${pages} page(s). Extract ONLY the rules whose row STARTS on page ${page}. Use the other pages only for context
(for example a Class cell that is merged across rows or continued from the previous page).

Return JSON only, in this exact shape:
{"doc":{"title":"","version_no":"","effective_date":""},"rows":[{"c":"","u":"","p":"","s":"","rc":"","r":""}]}

doc (fill from the whole document, same answer on every page):
- title: the document title as printed.
- version_no: the edition as printed (e.g. "2026.11.19", "VER.12", "Rev.29"). Empty string if none.
- effective_date: effective/issue date as YYYY-MM-DD. Empty string if none.

rows — one object per rule row printed on page ${page}:
- c: IMDG class as printed, digits only ("1", "2.1", "4.3", "9"). For a merged or blank Class cell use the class the row belongs to.
- u: UN number as exactly 4 digits. Use "ALL" when the row bans/restricts a whole class or division (no UN number).
     Use "COMMON" for general rules that have no UN number and no single class (container types, name-based bans,
     special provisions, document requirements); for those set c to "COMMON".
- p: proper shipping name / description exactly as printed (join wrapped lines with one space).
- s: "PROHIBITED" only when the cargo is refused outright with no condition. Use "RESTRICTED" when acceptance depends on
     any condition: a specific port, country or route, container type, packing, quantity, documents/LOI, prior approval,
     own-booking only, or "acceptable except...". If the status cell says PROHIBITED but the remark limits it to certain
     ports or conditions, use "RESTRICTED".
- rc: short code when the row is a special provision or ETC group ("SP900", "SP386", "ETC"); otherwise "".
- r: the remark / condition text exactly as printed, in the original language. "" if none.

Rules:
- Do not invent, merge, skip or summarise rows. Copy every UN number exactly; never guess a digit.
- One UN number per row. If a single printed row lists several UN numbers, output one row per UN number with the same text.
- Ignore page headers, footers, column headings, legends and revision notes that are not rules.
- If page ${page} has no rule rows, return "rows": [].`;
}

async function callGemini(prompt, pdfBase64) {
  const apiKey = process.env.GEMINI_API_KEY;
  const spare = process.env.GEMINI_NEWS_API_KEY;
  if (!apiKey) throw new HttpError(500, 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.');
  const keys = (spare && spare !== apiKey) ? [apiKey, spare] : [apiKey];
  const models = [...new Set([process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3-flash'])];
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } }] }],
    generationConfig: { temperature: 0, responseMimeType: 'application/json', maxOutputTokens: 32768 }
  });
  let last = '';
  for (const key of keys) {
    let keyErr = false;
    for (const mdl of models) {
      const ep = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(mdl)}:generateContent?key=${encodeURIComponent(key)}`;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt) await sleep(800);
        const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        const t = await r.text();
        if (r.ok) {
          const j = JSON.parse(t);
          const cand = j && j.candidates && j.candidates[0];
          const out = ((cand && cand.content && cand.content.parts) || []).map(p => p.text || '').join('').trim();
          return { text: out, model: mdl, truncated: !!cand && cand.finishReason === 'MAX_TOKENS' };
        }
        last = r.status + ' ' + t.slice(0, 200);
        console.error('[api/carrier-update] Gemini error', mdl, r.status, t.slice(0, 150));
        if (r.status === 503) continue;
        if (r.status === 401 || r.status === 403) keyErr = true;
        break;
      }
      if (keyErr) break;
    }
  }
  const e = new HttpError(502, 'AI 판독 호출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  e.detail = last;
  throw e;
}

function pdfBuffer(b64) {
  const s = typeof b64 === 'string' ? b64.replace(/^data:[^,]*,/, '') : '';
  if (!s) throw new HttpError(400, 'PDF 파일이 없습니다.');
  const buf = Buffer.from(s, 'base64');
  if (buf.length > MAX_PDF) throw new HttpError(413, 'PDF 는 3MB 이하만 올릴 수 있습니다.');
  if (buf.slice(0, 5).toString('latin1') !== '%PDF-') throw new HttpError(400, 'PDF 파일만 올릴 수 있습니다.');
  return { buf, b64: s };
}

function docDate(v) {
  const m = str(v).match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (!m) return null;
  const d = m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  return isNaN(new Date(d + 'T00:00:00Z').getTime()) ? null : d;
}

// ── 규정 교체 (새 행을 꺼 둔 채 넣고 → 켠 뒤 → 예전 행 삭제. 중간에 실패해도 예전 규정이 남는다) ──
async function replaceRules(group, rows) {
  const old = await selectAll(() => supabaseAdmin.from(RULES).select('id').eq('carrier_group', group).order('id', { ascending: true }));
  const oldIds = old.map(r => r.id);
  const newIds = [];
  try {
    for (let i = 0; i < rows.length; i += 200) {
      const part = rows.slice(i, i + 200).map(r => {
        const o = Object.assign({}, r);          // 백업에서 되돌릴 때는 선사별 추가 칸(condition_* 등)도 그대로 살린다
        delete o.id;
        o.is_active = false;
        return o;
      });
      const { data, error } = await supabaseAdmin.from(RULES).insert(part).select('id');
      if (error) throw error;
      newIds.push(...(data || []).map(d => d.id));
    }
    if (newIds.length !== rows.length) throw new Error('inserted ' + newIds.length + ' of ' + rows.length);
    for (let i = 0; i < newIds.length; i += 200) {
      const { error } = await supabaseAdmin.from(RULES).update({ is_active: true }).in('id', newIds.slice(i, i + 200));
      if (error) throw error;
    }
  } catch (err) {
    for (let i = 0; i < newIds.length; i += 200) {
      await supabaseAdmin.from(RULES).delete().in('id', newIds.slice(i, i + 200));   // 넣다 만 새 행만 치움
    }
    throw err;
  }
  for (let i = 0; i < oldIds.length; i += 200) {
    const { error } = await supabaseAdmin.from(RULES).delete().in('id', oldIds.slice(i, i + 200));
    if (error) throw error;
  }
  return { removed: oldIds.length, inserted: newIds.length };
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');   // 20261119T071500Z
}

async function saveBackup(group, rows, docEntry, by, note) {
  const name = stamp() + '.json';
  await writeJson(`${ROOT}/backup/${group}/${name}`, {
    carrier_group: group, saved_at: new Date().toISOString(), saved_by: by, note: note || '',
    version_no: rows[0] ? rows[0].version_no : null, effective_date: rows[0] ? rows[0].effective_date : null,
    count: rows.length, doc: docEntry || null,
    rows: rows.map(r => { const o = Object.assign({}, r); delete o.id; return o; })
  });
  return name;
}

// ── 액션 ─────────────────────────────────────────────────────────
const actions = {

  // 선사 목록 + 현재 판(版) 정보
  async carriers(req) {
    await requireAdmin(req);
    const rows = await selectAll(() => supabaseAdmin.from(RULES)
      .select('id, carrier_group, carrier_name, version_no, effective_date, source_file').order('id', { ascending: true }));
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.carrier_group)) {
        map.set(r.carrier_group, { carrier_group: r.carrier_group, carrier_name: r.carrier_name, version_no: r.version_no,
          effective_date: r.effective_date, source_file: r.source_file, count: 0, locked: LOCKED_GROUPS.includes(r.carrier_group) });
      }
      map.get(r.carrier_group).count++;
    });
    return { carriers: [...map.values()].sort((a, b) => String(a.carrier_name).localeCompare(String(b.carrier_name))), max_pdf: MAX_PDF };
  },

  // PDF 한 쪽 판독 (화면이 쪽마다 호출)
  async parse(req) {
    await requireAdmin(req);
    const b = req.body || {};
    checkGroup(b.carrier_group);
    const { b64 } = pdfBuffer(b.file_base64);
    const pages = Math.min(Math.max(parseInt(b.pages, 10) || 1, 1), 60);
    const page = Math.min(Math.max(parseInt(b.page, 10) || 1, 1), pages);
    const g = await callGemini(buildPrompt(page, pages), b64);
    const parsed = extractJson(g.text);
    if (!parsed || !Array.isArray(parsed.rows)) {
      throw new HttpError(502, g.truncated ? page + '쪽의 내용이 너무 길어 판독이 잘렸습니다.' : page + '쪽 판독 결과를 읽을 수 없습니다. 다시 시도해 주세요.');
    }
    const rows = parsed.rows.filter(r => r && typeof r === 'object').map(r => ({
      class_no: normClass(r.c), unno: normUnno(r.u), psn: str(r.p), status: str(r.s).toUpperCase(),
      remark_code: str(r.rc) || null, remark_text: str(r.r) || null, page
    }));
    const d = parsed.doc || {};
    return { page, pages, rows, truncated: g.truncated, model: g.model,
      doc: { title: str(d.title).slice(0, 200), version_no: str(d.version_no).slice(0, 40), effective_date: docDate(d.effective_date) || '' } };
  },

  // 적용 전 검증 + 현재 규정과 비교
  async preview(req) {
    await requireAdmin(req);
    const b = req.body || {};
    const group = checkGroup(b.carrier_group);
    const { rows, errors } = cleanRows(b.rows);
    const current = await groupRows(group);
    const diff = diffRows(current.filter(r => r.is_active !== false), rows);
    const warnings = [];
    const known = await knownUnnos(rows.map(r => r.unno).concat((Array.isArray(b.pdf_unnos) ? b.pdf_unnos : []).map(normUnno)));
    const unknown = [...new Set(rows.filter(r => /^\d{4}$/.test(r.unno) && !known.has(r.unno)).map(r => r.unno))];
    if (unknown.length) warnings.push({ type: 'unknown_un', message: 'IMDG 표에 없는 UN번호입니다. 숫자를 잘못 읽었을 수 있습니다.', items: unknown });
    // PDF 글자에는 있는데 판독 결과에 없는 UN번호 (누락 의심)
    if (Array.isArray(b.pdf_unnos)) {
      const got = new Set(rows.map(r => r.unno));
      const missing = [...new Set(b.pdf_unnos.map(normUnno))].filter(u => /^\d{4}$/.test(u) && known.has(u) && !got.has(u)).slice(0, 80);
      if (missing.length) warnings.push({ type: 'missing_un', message: 'PDF 본문에는 보이는데 판독 결과에 없는 번호입니다. 누락인지 확인해 주세요 (연도·수량 등 다른 숫자일 수도 있습니다).', items: missing });
    }
    const cur = diff.same + diff.removed.length + diff.changed.reduce((n, c) => n + c.before.length, 0);
    const shrink = cur >= 20 && rows.length < cur * 0.6;
    if (shrink) warnings.push({ type: 'shrink', message: '행 수가 현재(' + cur + '행)보다 크게 줄었습니다(' + rows.length + '행). 판독 누락이 아닌지 확인해 주세요.', items: [] });
    return {
      rows, errors, warnings, diff, shrink,
      counts: { total: rows.length, prohibited: rows.filter(r => r.status === 'PROHIBITED').length,
        restricted: rows.filter(r => r.status === 'RESTRICTED').length, current: cur },
      current: current[0] ? { carrier_name: current[0].carrier_name, version_no: current[0].version_no, effective_date: current[0].effective_date } : null
    };
  },

  // 적용: 백업 → 원본 PDF 보관 → 규정 교체 → 링크 정보 갱신
  async apply(req) {
    const me = await requireAdmin(req);
    const b = req.body || {};
    const group = checkGroup(b.carrier_group);
    const { rows, errors } = cleanRows(b.rows);
    if (errors.length) throw new HttpError(400, '고쳐야 할 줄이 있습니다: ' + errors[0]);
    if (!rows.length) throw new HttpError(400, '적용할 규정 행이 없습니다.');
    const version = str(b.version_no).slice(0, 40);
    if (!version) throw new HttpError(400, '판(버전)을 입력해 주세요.');
    const eff = docDate(b.effective_date);
    if (!eff) throw new HttpError(400, '시행일을 YYYY-MM-DD 로 입력해 주세요.');
    const label = str(b.label).slice(0, 200);
    if (!label) throw new HttpError(400, '문서 이름을 입력해 주세요.');
    const { buf } = pdfBuffer(b.file_base64);

    const current = await groupRows(group);
    if (!current.length) throw new HttpError(400, '등록된 선사가 아닙니다.');
    if (current.length >= 20 && rows.length < current.length * 0.6 && b.confirm_shrink !== true) {
      throw new HttpError(400, '행 수가 크게 줄었습니다. 미리보기의 확인란을 체크한 뒤 다시 적용해 주세요.');
    }
    const carrierName = current[0].carrier_name;
    const docs = (await readJson(DOCS_PATH)) || {};
    const backup = await saveBackup(group, current, docs[group] || null, me.id, '적용 전 자동 백업 (' + version + ')');

    const ts = stamp();
    const pdfPath = `${ROOT}/pdf/${group}_${ts}.pdf`;
    const up = await supabaseAdmin.storage.from(BUCKET).upload(pdfPath, buf, { contentType: 'application/pdf', upsert: false });
    if (up.error) throw up.error;

    const sourceFile = (str(b.file_name).replace(/[^\w.\-() ㄱ-힝]/g, '_').slice(0, 120)) || (group.toLowerCase() + '.pdf');
    const full = rows.map((r, i) => Object.assign({}, r, {
      carrier_group: group, carrier_name: carrierName, source_file: sourceFile, version_no: version,
      effective_date: eff, sort_order: (i + 1) * 10, is_active: true
    }));
    const done = await replaceRules(group, full);

    docs[group] = { url: `/api/carrier-update?action=pdf&g=${encodeURIComponent(group)}&v=${ts}&f=doc.pdf`, label,
      path: pdfPath, version_no: version, effective_date: eff, updated_at: new Date().toISOString(), updated_by: me.id };
    await writeJson(DOCS_PATH, docs);
    return { carrier_group: group, inserted: done.inserted, removed: done.removed, backup, doc: { url: docs[group].url, label } };
  },

  // 되돌릴 수 있는 백업 목록
  async history(req) {
    await requireAdmin(req);
    const group = checkGroup((req.body || {}).carrier_group);
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(`${ROOT}/backup/${group}`,
      { limit: 100, sortBy: { column: 'name', order: 'desc' } });
    if (error) throw error;
    const items = [];
    for (const f of (data || []).filter(x => /^\d{8}T\d{6}Z\.json$/.test(x.name)).slice(0, 10)) {
      const j = await readJson(`${ROOT}/backup/${group}/${f.name}`);
      if (j) items.push({ name: f.name, saved_at: j.saved_at, saved_by: j.saved_by, note: j.note, version_no: j.version_no,
        effective_date: j.effective_date, count: j.count });
    }
    return { carrier_group: group, backups: items };
  },

  // 백업 시점으로 되돌리기 (지금 규정도 먼저 백업해 둔다)
  async rollback(req) {
    const me = await requireAdmin(req);
    const b = req.body || {};
    const group = checkGroup(b.carrier_group);
    const name = str(b.backup);
    if (!/^\d{8}T\d{6}Z\.json$/.test(name)) throw new HttpError(400, '되돌릴 시점을 선택해 주세요.');
    const j = await readJson(`${ROOT}/backup/${group}/${name}`);
    if (!j || j.carrier_group !== group || !Array.isArray(j.rows) || !j.rows.length) throw new HttpError(404, '백업을 찾을 수 없습니다.');
    const current = await groupRows(group);
    const docs = (await readJson(DOCS_PATH)) || {};
    const saved = await saveBackup(group, current, docs[group] || null, me.id, '되돌리기 전 자동 백업');
    const rows = j.rows.map(r => { const o = Object.assign({}, r, { carrier_group: group, is_active: true }); delete o.id; return o; });
    const done = await replaceRules(group, rows);
    if (j.doc) docs[group] = j.doc; else delete docs[group];
    await writeJson(DOCS_PATH, docs);
    return { carrier_group: group, inserted: done.inserted, removed: done.removed, backup: saved, version_no: j.version_no };
  }
};

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const action = String(req.query.action || '');
      if (action === 'docs') {                                  // 화면의 '원본 규정 보기' 링크 정보 (공개)
        const docs = (await readJson(DOCS_PATH)) || {};
        const out = {};
        Object.keys(docs).forEach(k => { out[k] = { url: docs[k].url, label: docs[k].label }; });
        return res.status(200).json({ ok: true, docs: out });
      }
      if (action === 'pdf') {                                   // 업로드된 원본 PDF
        const group = str(req.query.g).toUpperCase();
        const docs = (await readJson(DOCS_PATH)) || {};
        const d = GROUP_RE.test(group) ? docs[group] : null;
        if (!d || !d.path) return res.status(404).json({ ok: false, message: '문서를 찾을 수 없습니다.' });
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(d.path);
        if (error || !data) return res.status(404).json({ ok: false, message: '문서를 찾을 수 없습니다.' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + group.toLowerCase() + '_' + str(d.version_no).replace(/[^\w.-]/g, '_') + '.pdf"');
        return res.status(200).send(Buffer.from(await data.arrayBuffer()));
      }
      throw new HttpError(400, 'invalid action');
    }
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
    const origin = req.headers.origin;                          // CSRF 방어(보조) — auth.js 와 동일
    if (origin) {
      let host = '';
      try { host = new URL(origin).host; } catch (e) { /* 아래에서 거부 */ }
      if (host !== req.headers.host) throw new HttpError(403, 'forbidden origin');
    }
    const action = String((req.body || {}).action || '');
    if (!Object.prototype.hasOwnProperty.call(actions, action)) throw new HttpError(400, 'invalid action');
    const result = await actions[action](req, res);
    return res.status(200).json(Object.assign({ ok: true }, result));
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (err instanceof HttpError) return res.status(err.status).json({ ok: false, message: err.message });
    console.error('[api/carrier-update] error:', err);
    return res.status(500).json({ ok: false, message: '서버 오류가 발생했습니다.' });
  }
}

module.exports = handler;
// 테스트용 (서버리스 런타임은 위 handler 만 사용)
module.exports._internal = { cleanRows, diffRows, normClass, normUnno, docDate, extractJson, buildPrompt };
