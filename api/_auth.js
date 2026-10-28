const crypto = require('crypto');

// ── 비밀번호 해시 ──────────────────────────────────────────────
// 신규: scrypt (솔트 포함)  'scrypt$N$r$p$salt(b64)$hash(b64)'
// 구형: 소문자 hex 64자리 SHA-256 (기존 회원) — 로그인 성공 시 scrypt로 자동 업그레이드
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

function scryptAsync(password, salt, N, r, p, keylen) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => {
      if (err) reject(err); else resolve(key);
    });
  });
}

function isLegacyHash(h) {
  return typeof h === 'string' && /^[0-9a-f]{64}$/.test(h);
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p, SCRYPT.keylen);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

// 반환: { ok, legacy }  — legacy=true 이면 호출자가 scrypt로 재저장해야 함
async function verifyPassword(password, stored) {
  if (isLegacyHash(stored)) {
    return { ok: safeEqual(sha256Hex(password), stored), legacy: true };
  }
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return { ok: false, legacy: false };
  const [, N, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const key = await scryptAsync(password, Buffer.from(saltB64, 'base64'), +N, +r, +p, expected.length);
  return { ok: key.length === expected.length && crypto.timingSafeEqual(key, expected), legacy: false };
}

// 존재하지 않는 ID로 로그인할 때도 비슷한 시간이 걸리도록 더미 검증
const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
async function dummyVerify(password) {
  try { await verifyPassword(password, DUMMY_HASH); } catch (e) { /* 무시 */ }
}

// ── 세션 토큰 (HMAC 서명, httpOnly 쿠키) ─────────────────────────
const COOKIE_NAME = 'dg_session';
const SESSION_DAYS = 30;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error('AUTH_SECRET 환경변수가 설정되지 않았습니다 (16자 이상).');
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signSession(userId) {
  const payload = b64url(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + SESSION_DAYS * 86400000 }));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
  return payload + '.' + sig;
}

// 유효하면 { sub, iat, exp }, 아니면 null
function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!data || !data.sub || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch (e) { return null; }
}

function readCookie(req, name) {
  const raw = (req.headers && req.headers.cookie) || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function isHttps(req) {
  return String((req.headers && req.headers['x-forwarded-proto']) || '').split(',')[0].trim() === 'https';
}

function setSessionCookie(req, res, userId) {
  const attrs = ['HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=' + SESSION_DAYS * 86400];
  if (isHttps(req)) attrs.push('Secure');
  res.setHeader('Set-Cookie', COOKIE_NAME + '=' + encodeURIComponent(signSession(userId)) + '; ' + attrs.join('; '));
}

function clearSessionCookie(req, res) {
  const attrs = ['HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isHttps(req)) attrs.push('Secure');
  res.setHeader('Set-Cookie', COOKIE_NAME + '=; ' + attrs.join('; '));
}

// ── 비밀번호 재설정 토큰 ────────────────────────────────────────
function newResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: sha256Hex(token) };
}

module.exports = {
  hashPassword, verifyPassword, dummyVerify, isLegacyHash, sha256Hex,
  COOKIE_NAME, readCookie, verifySession, setSessionCookie, clearSessionCookie,
  newResetToken
};
