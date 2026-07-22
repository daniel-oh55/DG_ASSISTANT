-- KMTC — UN1052 / UN1790 (불화수소) 선적금지 → LOI 조건부 선적가능으로 정정
-- 근거: KMTC는 무수불화수소(UN1052)·불화수소산(UN1790)에 대해 LOI(Letter of Indemnity)
--       제출 시 선적 가능. 기존 PROHIBITED(전면금지) 표기가 오류.
-- 적용: PROHIBITED → RESTRICTED + LOI 조건 remark
-- ⚠️ Supabase SQL Editor에서 실행. 재실행 안전(idempotent).

update public.dg_carrier_rules
   set status = 'RESTRICTED',
       remark_text = 'Acceptable with LOI (Letter of Indemnity) submission. / LOI 제출 시 선적 가능.'
 where carrier_group = 'KMTC'
   and unno in ('1052','1790');

-- 확인용
-- select carrier_group, class_no, unno, psn, status, remark_text
--   from public.dg_carrier_rules where carrier_group='KMTC' and unno in ('1052','1790');
