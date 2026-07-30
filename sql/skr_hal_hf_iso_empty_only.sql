-- SKR/HAL DG Prohibited List — VER.12 UPDATE (Hydrogen Fluoride 규정 변경)
-- Source: carriers/skr_hal.pdf (Sinokor & Heung A DG prohibit list VER.12 - SKR HAL ONLY UPDATE)
-- 변경일: 2026-07-30
-- 내용: UN1052 / UN1790 (불화수소 계열)을 '전면 금지' → 'ISO 공(空)탱크(빈 ISO 탱크)만 선적 가능, 그 외 금지'로 변경
--   - Class 8 / UN1052 — HYDROGEN FLUORIDE, ANHYDROUS      → Only ISO Empty Tank Permitted
--   - Class 8 / UN1790 — HYDROFLUORIC ACID                → Only ISO Empty Tank Permitted
-- 판정: status='RESTRICTED' (carrier-check.decideStatus 상 PROHIBITED가 아니면 '조건부 가능/제한'으로 표시).
--       조건 상세(ISO 공탱크만)는 remark_text + container_condition 에 넣어 화면(renderRuleRemarkCondition)에 노출.
-- ⚠️ Supabase SQL Editor에서 실행. 직전 전면금지본(sql/skr_hal_ver12_hf_ban.sql)의 1052/1790 PROHIBITED 행을 대체함.
-- carrier_name 은 기존 SKR_HAL 행에서 그대로 승계.

-- 재실행 안전(idempotent): 기존 동일 UNNO 룰 제거 후 재삽입
delete from public.dg_carrier_rules
 where carrier_group = 'SKR_HAL' and unno in ('1052','1790');

insert into public.dg_carrier_rules
  (carrier_group, carrier_name, class_no, unno, psn, status,
   remark_text, container_condition, source_file, version_no, effective_date, sort_order, is_active)
select 'SKR_HAL',
       coalesce((select carrier_name from public.dg_carrier_rules where carrier_group = 'SKR_HAL' and carrier_name is not null limit 1), 'SKR/HAL'),
       '8', '1052', 'HYDROGEN FLUORIDE, ANHYDROUS', 'RESTRICTED',
       'Only ISO Empty Tank Permitted — ISO 공(空)탱크(빈 ISO 탱크)만 선적 가능, 그 외(적재 탱크·일반 포장·드럼 등) 전면 금지. 농도 무관 적용. (VER.12 UPDATE 2026-07-30)',
       'ISO Tank, EMPTY/UNCLEANED only',
       'skr_hal.pdf', 'VER.12', '2026-07-30', 99010, true
union all
select 'SKR_HAL',
       coalesce((select carrier_name from public.dg_carrier_rules where carrier_group = 'SKR_HAL' and carrier_name is not null limit 1), 'SKR/HAL'),
       '8', '1790', 'HYDROFLUORIC ACID', 'RESTRICTED',
       'Only ISO Empty Tank Permitted — ISO 공(空)탱크(빈 ISO 탱크)만 선적 가능, 그 외(적재 탱크·일반 포장·드럼 등) 전면 금지. 농도(60% 초과/이하) 무관 적용. (VER.12 UPDATE 2026-07-30)',
       'ISO Tank, EMPTY/UNCLEANED only',
       'skr_hal.pdf', 'VER.12', '2026-07-30', 99020, true;

-- 확인용
-- select carrier_group, class_no, unno, psn, status, container_condition, version_no, effective_date
--   from public.dg_carrier_rules where carrier_group='SKR_HAL' and unno in ('1052','1790');
