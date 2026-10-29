const { supabaseAdmin } = require('./_supabase');
const A = require('./_auth');
const { mailConfigured, sendMail } = require('./_mail');

// 회원 인증 API — 가입 / 로그인 / 로그아웃 / 비밀번호 찾기(이메일) / 계정 수정 / 관리자 회원관리
//   저장: public.dg_members (sql/dg_members.sql) — 서비스 롤로만 접근
//   세션: httpOnly 쿠키(dg_session, HMAC 서명). 권한(role)은 매 요청마다 DB에서 확인.

const TABLE = 'dg_members';
const MIN_PW = 8;
const MAX_PW = 100;
const MAX_FAILS = 5;
const LOCK_MIN = 10;
const RESET_TTL_MIN = 30;
const RESET_COOLDOWN_SEC = 60;
// 회원 삭제 가능 ID — 관리자여도 이 계정 외에는 삭제 불가(오삭제 방지). 환경변수 MEMBER_DELETE_IDS(쉼표 구분)로 변경 가능
const DELETE_IDS = (process.env.MEMBER_DELETE_IDS || 'wtlee').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
const ID_RE = /^[^\s<>"'&\\]{2,40}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const iso = () => new Date().toISOString();
const str = v => (typeof v === 'string' ? v.trim() : '');

async function findById(id) {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id_lower', String(id).toLowerCase()).maybeSingle();
  if (error) throw error;
  return data;
}

async function update(id, patch) {
  const { error } = await supabaseAdmin.from(TABLE).update(patch).eq('id', id);
  if (error) throw error;
}

// ID 찾기 결과용 마스킹: 앞 2글자(짧으면 1글자)만 보이고 나머지는 * (이메일 형태 ID는 @도메인 유지)
function maskId(id) {
  const mask = t => {
    const n = t.length;
    const head = n <= 3 ? 1 : 2;
    const tail = n >= 6 ? 1 : 0;
    return t.slice(0, head) + '*'.repeat(Math.max(1, n - head - tail)) + (tail ? t.slice(-1) : '');
  };
  const at = id.indexOf('@');
  return at > 0 ? mask(id.slice(0, at)) + id.slice(at) : mask(id);
}

// 브라우저에 내려주는 본인 정보
function sessionUser(m) {
  return { id: m.id, company: m.company, name: m.name, role: m.role === 'admin' ? 'admin' : 'general', email: m.email || '' };
}

// 관리자 회원관리 화면용 (해시·토큰 제외, 기존 클라이언트 필드명 유지)
function adminView(m) {
  return {
    id: m.id, company: m.company, name: m.name, email: m.email || '',
    role: m.role === 'admin' ? 'admin' : 'general', status: m.status,
    createdAt: m.created_at, approvedAt: m.approved_at, lastLoginAt: m.last_login_at,
    loginTotal: m.login_total, statsSince: m.stats_since,
    aiToday: m.ai_today, aiTodayDate: m.ai_today_date, aiTotal: m.ai_total
  };
}

// 쿠키 세션 → 승인된 회원 (없으면 null)
async function currentMember(req) {
  const s = A.verifySession(A.readCookie(req, A.COOKIE_NAME));
  if (!s) return null;
  const m = await findById(s.sub);
  if (!m || m.status !== 'approved') return null;
  if (m.pw_changed_at && s.iat < new Date(m.pw_changed_at).getTime()) return null;   // 비밀번호 변경 전 세션 무효
  return m;
}

async function requireMember(req) {
  const m = await currentMember(req);
  if (!m) throw new HttpError(401, '로그인이 필요합니다.');
  return m;
}

async function requireAdmin(req) {
  const m = await requireMember(req);
  if (m.role !== 'admin') throw new HttpError(403, '관리자만 사용할 수 있습니다.');
  return m;
}

function checkNewPassword(pw, id) {
  if (typeof pw !== 'string' || pw.length < MIN_PW) throw new HttpError(400, '비밀번호는 ' + MIN_PW + '자 이상이어야 합니다.');
  if (pw.length > MAX_PW) throw new HttpError(400, '비밀번호가 너무 깁니다.');
  if (id && pw.toLowerCase() === String(id).toLowerCase()) throw new HttpError(400, '비밀번호는 ID와 달라야 합니다.');
}

function appBase(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  return 'https://' + req.headers.host;
}

// ── actions ─────────────────────────────────────────────────────
const actions = {
  async me(req) {
    const m = await currentMember(req);
    return { user: m ? sessionUser(m) : null };
  },

  async signup(req) {
    const b = req.body || {};
    const company = str(b.company), name = str(b.name), id = str(b.id), email = str(b.email).toLowerCase();
    const password = typeof b.password === 'string' ? b.password : '';
    if (!company || !name || !id || !email || !password) throw new HttpError(400, '모든 항목을 입력하세요.');
    if (!ID_RE.test(id)) throw new HttpError(400, 'ID는 공백 없이 2~40자로 입력하세요.');
    if (!EMAIL_RE.test(email) || email.length > 120) throw new HttpError(400, '올바른 이메일 주소를 입력하세요.');
    if (company.length > 100 || name.length > 60) throw new HttpError(400, '입력값이 너무 깁니다.');
    checkNewPassword(password, id);
    if (await findById(id)) throw new HttpError(409, '이미 사용 중인 ID입니다.');
    const { error } = await supabaseAdmin.from(TABLE).insert({
      id, company, name, email, pwd_hash: await A.hashPassword(password),
      role: 'general', status: 'pending', stats_since: iso()
    });
    if (error) {
      if (error.code === '23505') throw new HttpError(409, '이미 사용 중인 ID입니다.');
      throw error;
    }
    return { message: '가입 요청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.' };
  },

  async login(req, res) {
    const b = req.body || {};
    const id = str(b.id);
    const password = typeof b.password === 'string' ? b.password : '';
    if (!id || !password) throw new HttpError(400, 'ID와 비밀번호를 입력하세요.');
    const bad = new HttpError(401, 'ID 또는 비밀번호가 올바르지 않습니다.');

    const m = await findById(id);
    if (!m) { await A.dummyVerify(password); throw bad; }
    if (m.locked_until && new Date(m.locked_until) > new Date()) {
      throw new HttpError(429, '로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.');
    }

    const v = await A.verifyPassword(password, m.pwd_hash);
    if (!v.ok) {
      const fails = (m.fail_count || 0) + 1;
      const patch = { fail_count: fails };
      if (fails >= MAX_FAILS) { patch.locked_until = new Date(Date.now() + LOCK_MIN * 60000).toISOString(); patch.fail_count = 0; }
      await update(m.id, patch);
      throw bad;
    }
    if (m.status !== 'approved') throw new HttpError(403, '아직 승인되지 않은 계정입니다 (관리자 승인 대기 중).');

    const patch = {
      fail_count: 0, locked_until: null,
      last_login_at: iso(), login_total: (m.login_total || 0) + 1,
      stats_since: m.stats_since || m.created_at || iso()
    };
    if (v.legacy) patch.pwd_hash = await A.hashPassword(password);   // 구 SHA-256 → scrypt 자동 업그레이드
    await update(m.id, patch);

    A.setSessionCookie(req, res, m.id);
    return {
      user: sessionUser(m),
      needs: { email: !m.email, password: password.length < MIN_PW }   // 로그인 후 계정 정보 보완 안내용
    };
  },

  async logout(req, res) {
    A.clearSessionCookie(req, res);
    return {};
  },

  // 비밀번호 찾기 1단계: ID + 가입 이메일이 일치하면 재설정 링크 발송. 응답은 항상 동일(계정 존재 여부 비노출)
  async forgot(req) {
    if (!mailConfigured()) throw new HttpError(503, '메일 발송이 설정되지 않았습니다. 관리자에게 문의하세요.');
    const b = req.body || {};
    const id = str(b.id), email = str(b.email).toLowerCase();
    if (!id || !email) throw new HttpError(400, 'ID와 이메일을 입력하세요.');
    const generic = { message: '입력한 정보가 일치하면 재설정 링크를 이메일로 보내드립니다. (유효시간 ' + RESET_TTL_MIN + '분)' };

    const m = await findById(id);
    if (!m || !m.email || m.email.toLowerCase() !== email) {
      console.log('[auth/forgot] not sent: ' + (!m ? 'unknown id' : !m.email ? 'no email registered' : 'email mismatch'));   // 응답은 항상 동일, 사유는 서버 로그에만 기록
      return generic;
    }
    if (m.reset_requested_at && Date.now() - new Date(m.reset_requested_at).getTime() < RESET_COOLDOWN_SEC * 1000) {
      console.log('[auth/forgot] not sent: cooldown');
      return generic;
    }

    const t = A.newResetToken();
    await update(m.id, {
      reset_token_hash: t.hash,
      reset_expires_at: new Date(Date.now() + RESET_TTL_MIN * 60000).toISOString(),
      reset_requested_at: iso()
    });
    const link = appBase(req) + '/?reset=' + t.token;
    await sendMail({
      to: m.email,
      subject: '[DG ASSISTANT] 비밀번호 재설정 안내',
      text: m.name + '님, 비밀번호 재설정을 요청하셨습니다.\n\n아래 링크에서 새 비밀번호를 설정하세요 (' + RESET_TTL_MIN + '분 이내, 1회 사용).\n' + link +
            '\n\n본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.',
      html: '<p>' + m.name.replace(/[<>&]/g, '') + '님, 비밀번호 재설정을 요청하셨습니다.</p>' +
            '<p>아래 버튼을 눌러 새 비밀번호를 설정하세요 (' + RESET_TTL_MIN + '분 이내, 1회 사용).</p>' +
            '<p><a href="' + link + '" style="display:inline-block;padding:10px 18px;background:#008c9c;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">비밀번호 재설정</a></p>' +
            '<p style="color:#888;font-size:12px">버튼이 안 열리면 주소를 복사해 브라우저에 붙여넣으세요:<br>' + link + '</p>' +
            '<p style="color:#888;font-size:12px">본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.</p>'
    });
    console.log('[auth/forgot] sent');
    return generic;
  },

  // 비밀번호 찾기 2단계: 토큰 + 새 비밀번호
  async reset(req) {
    const b = req.body || {};
    const token = str(b.token);
    const password = typeof b.password === 'string' ? b.password : '';
    if (!/^[0-9a-f]{64}$/.test(token)) throw new HttpError(400, '유효하지 않은 링크입니다.');
    const { data: m, error } = await supabaseAdmin.from(TABLE).select('*').eq('reset_token_hash', A.sha256Hex(token)).maybeSingle();
    if (error) throw error;
    if (!m || !m.reset_expires_at || new Date(m.reset_expires_at) < new Date()) {
      throw new HttpError(400, '링크가 만료되었거나 이미 사용되었습니다. 비밀번호 찾기를 다시 진행하세요.');
    }
    checkNewPassword(password, m.id);
    await update(m.id, {
      pwd_hash: await A.hashPassword(password), pw_changed_at: iso(),
      reset_token_hash: null, reset_expires_at: null, fail_count: 0, locked_until: null
    });
    return { message: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.' };
  },

  // 내 계정: 이메일 등록·변경 / 비밀번호 변경 (현재 비밀번호 필요)
  async 'update-account'(req, res) {
    const m = await requireMember(req);
    const b = req.body || {};
    const current = typeof b.currentPassword === 'string' ? b.currentPassword : '';
    const email = str(b.email).toLowerCase();
    const newPw = typeof b.newPassword === 'string' ? b.newPassword : '';
    if (!current) throw new HttpError(400, '현재 비밀번호를 입력하세요.');
    if (!(await A.verifyPassword(current, m.pwd_hash)).ok) throw new HttpError(403, '현재 비밀번호가 올바르지 않습니다.');

    const patch = {};
    if (email && email !== (m.email || '').toLowerCase()) {
      if (!EMAIL_RE.test(email) || email.length > 120) throw new HttpError(400, '올바른 이메일 주소를 입력하세요.');
      patch.email = email;
    }
    if (newPw) {
      checkNewPassword(newPw, m.id);
      patch.pwd_hash = await A.hashPassword(newPw);
      patch.pw_changed_at = iso();
    }
    if (!Object.keys(patch).length) throw new HttpError(400, '변경할 내용이 없습니다.');
    await update(m.id, patch);
    if (patch.pw_changed_at) A.setSessionCookie(req, res, m.id);   // 현재 기기는 새 세션으로 유지, 다른 기기 세션은 무효
    return { user: sessionUser(Object.assign({}, m, patch)), message: '저장되었습니다.' };
  },

  // 내 계정: 소속·이름 수정 (로그인 세션만 필요)
  async 'update-profile'(req) {
    const m = await requireMember(req);
    const b = req.body || {};
    const patch = {};
    if (b.company !== undefined) {
      const v = str(b.company);
      if (!v || v.length > 100) throw new HttpError(400, '소속을 1~100자로 입력하세요.');
      patch.company = v;
    }
    if (b.name !== undefined) {
      const v = str(b.name);
      if (!v || v.length > 60) throw new HttpError(400, '이름을 1~60자로 입력하세요.');
      patch.name = v;
    }
    if (!Object.keys(patch).length) throw new HttpError(400, '변경할 내용이 없습니다.');
    await update(m.id, patch);
    return { user: sessionUser(Object.assign({}, m, patch)), message: '저장 완료' };
  },

  // ID 찾기: 이름이 같은 회원의 ID를 마스킹해서 알려줌 (전체 ID는 노출하지 않음)
  async 'find-id'(req) {
    const name = str((req.body || {}).name);
    if (name.length < 2 || name.length > 60) throw new HttpError(400, '이름을 2자 이상 입력하세요.');
    const { data, error } = await supabaseAdmin.from(TABLE).select('id').ilike('name', name.replace(/[\\%_]/g, '\\$&')).limit(6);
    if (error) throw error;
    const rows = data || [];
    if (rows.length > 5) return { ids: [], tooMany: true };
    return { ids: rows.map(r => maskId(r.id)) };
  },

  // 문의(AI) 사용 횟수 기록 — 회원관리 리포트용
  async 'record-ai'(req) {
    const m = await requireMember(req);
    const today = /^\d{4}-\d{2}-\d{2}$/.test(String((req.body || {}).today)) ? req.body.today : new Date().toISOString().slice(0, 10);
    const sameDay = m.ai_today_date === today;
    await update(m.id, {
      ai_today_date: today, ai_today: (sameDay ? m.ai_today : 0) + 1, ai_total: (m.ai_total || 0) + 1,
      stats_since: m.stats_since || m.created_at || iso()
    });
    return {};
  },

  // 재방문(세션 복원) 접속 기록 — 클라이언트가 하루 1회 호출, 서버도 1시간 내 중복은 무시
  async 'record-visit'(req) {
    const m = await requireMember(req);
    if (m.last_login_at && Date.now() - new Date(m.last_login_at).getTime() < 3600000) return {};
    await update(m.id, { last_login_at: iso(), login_total: (m.login_total || 0) + 1, stats_since: m.stats_since || m.created_at || iso() });
    return {};
  },

  async 'admin-list'(req) {
    await requireAdmin(req);
    const { data, error } = await supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return { members: (data || []).map(adminView) };
  },

  async 'admin-approve'(req) {
    await requireAdmin(req);
    const m = await findById(str((req.body || {}).id));
    if (!m) throw new HttpError(404, '대상을 찾을 수 없습니다.');
    await update(m.id, { status: 'approved', approved_at: iso() });
    return {};
  },

  async 'admin-delete'(req) {
    const me = await requireAdmin(req);
    if (!DELETE_IDS.includes(me.id.toLowerCase())) throw new HttpError(403, '회원 삭제 권한이 없습니다 (' + DELETE_IDS.join(', ') + ' 계정만 가능)');
    const m = await findById(str((req.body || {}).id));
    if (!m) throw new HttpError(404, '대상을 찾을 수 없습니다.');
    if (m.id === me.id) throw new HttpError(400, '본인 계정은 삭제할 수 없습니다.');
    const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', m.id);
    if (error) throw error;
    return {};
  },

  async 'admin-set-role'(req) {
    const me = await requireAdmin(req);
    const b = req.body || {};
    const role = b.role === 'admin' ? 'admin' : 'general';
    const m = await findById(str(b.id));
    if (!m) throw new HttpError(404, '대상을 찾을 수 없습니다.');
    if (m.id === me.id && role !== 'admin') throw new HttpError(400, '본인의 관리자 권한은 해제할 수 없습니다.');
    if (m.status !== 'approved') throw new HttpError(400, '승인된 회원만 권한을 변경할 수 있습니다.');
    await update(m.id, { role });
    return {};
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    let action;
    if (req.method === 'GET') {
      action = String(req.query.action || '');
      if (action !== 'me') throw new HttpError(400, 'invalid action');
    } else if (req.method === 'POST') {
      // CSRF 방어(보조): 브라우저가 보낸 Origin이 이 사이트와 다르면 거부
      const origin = req.headers.origin;
      if (origin) {
        let host = '';
        try { host = new URL(origin).host; } catch (e) { /* 아래에서 거부 */ }
        if (host !== req.headers.host) throw new HttpError(403, 'forbidden origin');
      }
      action = String((req.body || {}).action || '');
    } else {
      throw new HttpError(405, 'Method not allowed');
    }

    if (!Object.prototype.hasOwnProperty.call(actions, action)) throw new HttpError(400, 'invalid action');
    const result = await actions[action](req, res);
    return res.status(200).json(Object.assign({ ok: true }, result));
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json({ ok: false, message: err.message });
    console.error('[api/auth] error:', err);
    return res.status(500).json({ ok: false, message: '서버 오류가 발생했습니다.' });
  }
};
