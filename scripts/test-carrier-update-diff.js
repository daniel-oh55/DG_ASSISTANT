// 재현 시험 — AI 가 Class 칸만 다르게 읽었을 때 같은 품목이 '삭제 + 추가'로 잡히던 문제
//   실행: node scripts/test-carrier-update-diff.js
const path = require('path');
const crypto = require('crypto');
const repo = process.argv[2] || path.join(__dirname, '..');
process.env.AUTH_SECRET = 'test-secret-0123456789abcdef';
process.env.GEMINI_API_KEY = 'test';

const db = { dg_carrier_rules: [], dg_members: [], DG_TABLE: [] };
let nextId = 1;
function query(table) {
  const q = { filters: [], rng: null, single: false };
  const api = {
    select() { return api; },
    eq(c, v) { q.filters.push(r => r[c] === v); return api; },
    in(c, vs) { q.filters.push(r => vs.map(String).includes(String(r[c]))); return api; },
    order() { return api; },
    range(a, b) { q.rng = [a, b]; return api; },
    maybeSingle() { q.single = true; return api; },
    then(res, rej) {
      let out = db[table].filter(r => q.filters.every(f => f(r)));
      if (q.rng) out = out.slice(q.rng[0], q.rng[1] + 1);
      return Promise.resolve(q.single ? { data: out[0] || null, error: null } : { data: out.map(r => Object.assign({}, r)), error: null }).then(res, rej);
    }
  };
  return api;
}
require.cache[path.join(repo, 'api', '_supabase.js')] = { id: 'x', filename: 'x', loaded: true, exports: { supabaseAdmin: { from: query, storage: { from() { return {}; } } } } };
const handler = require(path.join(repo, 'api', 'carrier-update.js'));
const A = require(path.join(repo, 'api', '_auth.js'));

function cookieFor(id) {
  const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = b64(JSON.stringify({ sub: id, iat: Date.now(), exp: Date.now() + 86400000 }));
  const sig = b64(crypto.createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest());
  return A.COOKIE_NAME + '=' + encodeURIComponent(payload + '.' + sig);
}
async function preview(rows) {
  const req = { method: 'POST', body: { action: 'preview', carrier_group: 'CKL_PARTNER', rows }, query: {}, headers: { host: 'x', cookie: cookieFor('boss') } };
  let out = null;
  const res = { setHeader() {}, status() { return res; }, json(j) { out = j; return res; } };
  await handler(req, res);
  return out;
}
let fails = 0;
const ok = (name, cond, extra) => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '\n       ' + JSON.stringify(extra))); };

(async () => {
  db.dg_members.push({ id: 'boss', id_lower: 'boss', role: 'admin', status: 'approved' });
  [['3224', '4.1'], ['3225', '4.1'], ['1361', '4.2'], ['2956', '4.1'], ['2071', '9'], ['1057', '2.1'], ['3558', '9'], ['0004', '1.1D'], ['1950', '2']]
    .forEach(([u, c]) => db.DG_TABLE.push({ UNNO: u, Class: c }));
  const cur = (cls, un, st, psn, rm) => ({ id: nextId++, carrier_group: 'CKL_PARTNER', carrier_name: 'CK Line', class_no: cls, unno: un, psn, status: st,
    remark_code: null, remark_text: rm || null, version_no: '2026.11.19', effective_date: '2026-11-19', sort_order: nextId * 10, is_active: true });
  // 지금 등록된 규정 (어제 AI 판독분: 2956 과 2071 은 Class 가 틀린 채로 들어가 있음)
  db.dg_carrier_rules.push(
    cur('4.1', '3224', 'PROHIBITED', 'SELF-REACTIVE SOLID TYPE C'), cur('4.1', '3225', 'PROHIBITED', 'SELF-REACTIVE LIQUID TYPE D'),
    cur('4.2', '1361', 'PROHIBITED', 'CARBON animal or vegetable origin', 'All DG & Non-DG prohibited'),
    cur('3', '2956', 'PROHIBITED', 'MUSK XYLENE'), cur('8', '2071', 'PROHIBITED', 'AMMONIUM NITRATE BASED FERTILIZER'),
    cur('2.1', '1057', 'PROHIBITED', 'LIGHTERS'), cur('5.2', 'ALL', 'PROHIBITED', '5.2 class all DG'),
    cur('COMMON', 'COMMON', 'PROHIBITED', 'Heated Tank Container'), cur('COMMON', 'COMMON', 'PROHIBITED', 'All kind of substance "Waste"'),
    cur('9', '9999', 'PROHIBITED', 'really removed item'));

  // ① 같은 문서를 다시 읽었는데 AI 가 Class 칸만 다르게 읽은 경우 (오늘 화면과 같은 상황)
  const reread = [
    { class_no: '3', unno: '3224', psn: 'SELF-REACTIVE SOLID TYPE C', status: 'PROHIBITED' },        // 4.1 을 3 으로 읽음
    { class_no: '3', unno: '3225', psn: 'SELF-REACTIVE LIQUID TYPE D', status: 'PROHIBITED' },
    { class_no: '4.1', unno: '1361', psn: 'CARBON animal or vegetable origin', status: 'PROHIBITED', remark_text: 'All DG & Non-DG prohibited' },  // 4.2 를 4.1 로 읽음
    { class_no: '3', unno: '2956', psn: 'MUSK XYLENE', status: 'PROHIBITED' },
    { class_no: '8', unno: '2071', psn: 'AMMONIUM NITRATE BASED FERTILIZER', status: 'PROHIBITED' },
    { class_no: '2.1', unno: '1057', psn: 'LIGHTERS', status: 'PROHIBITED' },
    { class_no: '5.2', unno: 'ALL', psn: '5.2 class all DG', status: 'PROHIBITED' },
    { class_no: 'COMMON', unno: 'COMMON', psn: 'Heated Tank Container', status: 'PROHIBITED' },
    { class_no: 'COMMON', unno: 'COMMON', psn: 'All kind of substance  "Waste".', status: 'PROHIBITED' },   // 띄어쓰기·마침표만 다름
    { class_no: '9', unno: '9999', psn: 'really removed item', status: 'PROHIBITED' }
  ];
  let p = await preview(reread);
  const un = list => list.map(x => x.unno).sort().join();
  ok('① Class 만 다르게 읽은 품목이 삭제로 잡히지 않는다', p.diff.removed.length === 0, p.diff.removed);
  ok('① Class 만 다르게 읽은 품목이 추가로 잡히지 않는다', p.diff.added.length === 0, p.diff.added);
  ok('① Class 가 IMDG 표대로 고쳐진다 (3224·3225 → 4.1, 1361 → 4.2, 2956 → 4.1, 2071 → 9)',
    p.rows.map(r => r.unno + ':' + r.class_no).slice(0, 5).join() === '3224:4.1,3225:4.1,1361:4.2,2956:4.1,2071:9', p.rows.map(r => r.unno + ':' + r.class_no));
  ok('① 실제로 달라지는 것(등록분의 Class 가 틀렸던 2956·2071)만 변경으로 나온다', un(p.diff.changed.map(c => c.after[0])) === '2071,2956', p.diff.changed);
  ok('① 변경 내역에 이전/이후 Class 가 담긴다', p.diff.changed.every(c => c.before[0].class_no !== c.after[0].class_no), p.diff.changed);
  ok('① 나머지는 그대로 (8행)', p.diff.same === 8, p.diff.same);

  // ② 진짜 변동은 그대로 잡는다
  const real = reread.filter(r => r.unno !== '9999').map(r => Object.assign({}, r));
  real.find(r => r.unno === '1057').status = 'RESTRICTED';
  real.find(r => r.unno === '1057').remark_text = 'Hong Kong only';
  real.push({ class_no: '9', unno: '3558', psn: 'VEHICLE, SODIUM ION BATTERY POWERED', status: 'PROHIBITED' });
  real.find(r => r.psn === 'Heated Tank Container').psn = 'Heated Tank Container and Reefer';
  p = await preview(real);
  ok('② 진짜 삭제(9999)는 삭제로', un(p.diff.removed) === '9999', p.diff.removed);
  ok('② 진짜 추가(3558)는 추가로', un(p.diff.added) === '3558', p.diff.added);
  ok('② 금지→제한 변경(1057)과 공통 규칙 문구 변경이 변경으로', un(p.diff.changed.map(c => c.after[0])) === '1057,2071,2956,COMMON', p.diff.changed.map(c => c.after[0].unno));

  // ③ 대분류만 적힌 경우는 건드리지 않는다
  p = await preview([{ class_no: '1', unno: '0004', psn: 'x', status: 'PROHIBITED' }, { class_no: '2.1', unno: '1950', psn: 'AEROSOLS', status: 'PROHIBITED' }, { class_no: '2', unno: '1057', psn: 'x', status: 'PROHIBITED' }]);
  ok('③ 1 ↔ 1.1D, 2.1 ↔ 2, 2 ↔ 2.1 은 그대로 둔다', p.rows.map(r => r.class_no).join() === '1,2.1,2' && !p.warnings.some(w => w.type === 'class_fixed'), [p.rows, p.warnings]);

  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
