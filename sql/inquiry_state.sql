-- ═══════════════════════════════════════════════════════════════
--  DG ASSISTANT — FAQ + 상세문의 게시판 전체 공유 (Supabase)
--  실행 위치: Supabase Dashboard → SQL Editor → New Query → Run
--  접근은 Vercel 서버리스(/api/inquiry, 서비스 롤)로만 이뤄지므로
--  RLS는 켜두되 anon 정책은 부여하지 않습니다(외부 직접 접근 차단).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.inquiry_state (
  id         text primary key,            -- 'faq' | 'board'
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.inquiry_state enable row level security;
-- (anon/public 정책 없음 — 서비스 롤만 접근)

-- 초기 행
insert into public.inquiry_state (id, data) values
  ('faq',   '{"items":[]}'::jsonb),
  ('board', '{"posts":[]}'::jsonb)
on conflict (id) do nothing;

-- 확인용
-- select id, jsonb_pretty(data), updated_at from public.inquiry_state;
