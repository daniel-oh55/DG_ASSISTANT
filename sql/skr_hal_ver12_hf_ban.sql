-- SKR/HAL DG Prohibited List — VER.12 update
-- Source: carriers/skr_hal.pdf (Sinokor & Heung A DG prohibit list VER.12 - SKR HAL ONLY)
-- Effective: 2026-07-21
-- 변경: Hydrogen fluoride 계열 2건 신규 선적 금지 (앤트워프항 HF 누출사고 계기)
--   - Class 8 (Sub 6.1) / UN 1052 — HYDROGEN FLUORIDE, ANHYDROUS
--   - Class 8 (Sub 6.1) / UN 1790 — HYDROFLUORIC ACID, with more than 60% hydrogen fluoride
-- ⚠️ Supabase SQL Editor에서 실행. carrier_name은 기존 SKR_HAL 행에서 그대로 승계.

-- 재실행 안전(idempotent): 기존 동일 UNNO 룰 제거 후 재삽입
delete from public.dg_carrier_rules
 where carrier_group = 'SKR_HAL' and unno in ('1052','1790');

insert into public.dg_carrier_rules
  (carrier_group, carrier_name, class_no, unno, psn, status, remark_text, source_file, version_no, effective_date, sort_order, is_active)
select 'SKR_HAL',
       coalesce((select carrier_name from public.dg_carrier_rules where carrier_group = 'SKR_HAL' and carrier_name is not null limit 1), 'SKR/HAL'),
       '8', '1052', 'HYDROGEN FLUORIDE, ANHYDROUS', 'PROHIBITED',
       'Prohibited effective 2026-07-21. Hydrogen fluoride banned following the Port of Antwerp HF leak incident (MSC Mia Summer II). Applies to all bookings incl. already confirmed.',
       'skr_hal.pdf', 'VER.12', '2026-07-21', 99010, true
union all
select 'SKR_HAL',
       coalesce((select carrier_name from public.dg_carrier_rules where carrier_group = 'SKR_HAL' and carrier_name is not null limit 1), 'SKR/HAL'),
       '8', '1790', 'HYDROFLUORIC ACID, with more than 60% hydrogen fluoride', 'PROHIBITED',
       'Prohibited effective 2026-07-21. Hydrogen fluoride banned following the Port of Antwerp HF leak incident (MSC Mia Summer II). Applies to all bookings incl. already confirmed.',
       'skr_hal.pdf', 'VER.12', '2026-07-21', 99020, true;

-- 확인용
-- select carrier_group, class_no, unno, psn, status, version_no, effective_date
--   from public.dg_carrier_rules where carrier_group='SKR_HAL' and unno in ('1052','1790');
