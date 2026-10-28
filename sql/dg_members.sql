-- ═══════════════════════════════════════════════════════════════
--  DG ASSISTANT — 회원(로그인/가입/비밀번호 찾기) 전용 테이블
--  실행 위치: Supabase Dashboard → SQL Editor → New Query → Run
--  접근은 Vercel 서버리스(/api/auth, 서비스 롤)로만 이뤄집니다.
--  RLS는 켜두고 정책을 만들지 않으므로 브라우저(anon 키) 직접 접근은 차단됩니다.
--
--  ▶ 실행 순서
--    [1단계] 이 파일의 1~3번 실행 (테이블 생성 + 기존 회원 이전)  → 그 다음 새 코드 배포
--    [2단계] 배포 후 동작 확인이 끝나면 4번 실행 (구 members 행 anon 접근 차단)
-- ═══════════════════════════════════════════════════════════════

-- 1) 테이블 ------------------------------------------------------
create table if not exists public.dg_members (
  id                 text primary key,                       -- 가입 시 입력한 ID(원본 표기)
  id_lower           text generated always as (lower(id)) stored unique,
  company            text not null default '',
  name               text not null default '',
  email              text,                                   -- 기존 회원은 NULL(로그인 후 등록 유도)
  pwd_hash           text not null,                          -- 64자리 hex = 구 SHA-256 / 'scrypt$...' = 신규
  role               text not null default 'general',        -- 'admin' | 'general'
  status             text not null default 'pending',        -- 'pending' | 'approved'
  created_at         timestamptz not null default now(),
  approved_at        timestamptz,
  pw_changed_at      timestamptz,                            -- 이 시각 이전에 발급된 세션은 무효
  last_login_at      timestamptz,
  login_total        integer not null default 0,
  stats_since        timestamptz,
  ai_today           integer not null default 0,
  ai_today_date      text,
  ai_total           integer not null default 0,
  fail_count         integer not null default 0,             -- 연속 로그인 실패 횟수
  locked_until       timestamptz,                            -- 실패 누적 시 잠금 해제 시각
  reset_token_hash   text,                                   -- 비밀번호 재설정 토큰(SHA-256)
  reset_expires_at   timestamptz,
  reset_requested_at timestamptz
);

create index if not exists dg_members_email_idx on public.dg_members (lower(email));
create index if not exists dg_members_reset_idx on public.dg_members (reset_token_hash) where reset_token_hash is not null;

alter table public.dg_members enable row level security;
-- (정책 없음 — 서비스 롤만 접근)

-- 2) 기존 회원 이전 (inquiry_state.id='members' → dg_members) -------
--    ID·비밀번호 해시(pwdHash)를 그대로 가져오므로 기존 회원은 같은 ID/비밀번호로 로그인됩니다.
--    ID가 대소문자만 다른 중복이면 먼저 가입한 쪽만 남습니다.
insert into public.dg_members
  (id, company, name, pwd_hash, role, status, created_at, approved_at,
   last_login_at, login_total, stats_since, ai_today, ai_today_date, ai_total)
select distinct on (lower(m->>'id'))
  m->>'id',
  coalesce(m->>'company', ''),
  coalesce(m->>'name', ''),
  m->>'pwdHash',
  case when m->>'role' = 'admin' then 'admin' else 'general' end,
  case when m->>'status' = 'approved' then 'approved' else 'pending' end,
  coalesce(nullif(m->>'createdAt', '')::timestamptz, now()),
  nullif(m->>'approvedAt', '')::timestamptz,
  nullif(m->>'lastLoginAt', '')::timestamptz,
  coalesce(nullif(m->>'loginTotal', '')::int, 0),
  nullif(m->>'statsSince', '')::timestamptz,
  coalesce(nullif(m->>'aiToday', '')::int, 0),
  m->>'aiTodayDate',
  coalesce(nullif(m->>'aiTotal', '')::int, 0)
from public.inquiry_state s,
     jsonb_array_elements(coalesce(s.data->'members', '[]'::jsonb)) m
where s.id = 'members'
  and coalesce(m->>'id', '') <> ''
  and coalesce(m->>'pwdHash', '') <> ''
order by lower(m->>'id'), coalesce(nullif(m->>'createdAt', '')::timestamptz, now())
on conflict do nothing;

-- 3) 기존 코드가 'wtlee'를 항상 관리자로 취급했으므로 역할을 DB에 반영 ----
update public.dg_members
   set role = 'admin', status = 'approved', approved_at = coalesce(approved_at, now())
 where id_lower = 'wtlee';

-- 확인용
-- select id, role, status, email is not null as has_email, length(pwd_hash) from public.dg_members order by created_at;

-- 4) [배포 후 실행] 구 members 행을 브라우저(anon)에서 못 읽고 쓰게 차단 ---
--    RESTRICTIVE 정책은 기존에 열려 있는 anon 정책과 AND로 적용되므로,
--    faq / board 등 다른 행의 동작은 그대로 두고 'members' 행만 막습니다.
-- drop policy if exists inquiry_state_block_members on public.inquiry_state;
-- create policy inquiry_state_block_members on public.inquiry_state
--   as restrictive for all to anon, authenticated
--   using (id <> 'members') with check (id <> 'members');
--
--    (선택) 이전이 끝나 구 행이 필요 없다면 삭제:
-- delete from public.inquiry_state where id = 'members';
