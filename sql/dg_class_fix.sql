-- ============================================================
-- DG_TABLE Class 세부분류 정비
-- Supabase SQL Editor 에서 단계별로 실행하세요.
-- ============================================================

-- ── STEP 1: 세부분류 미상 항목 조회 ──────────────────────────────
-- 아래 결과를 먼저 확인 후 STEP 2~3 진행
SELECT
    "UNNO",
    "Name",
    "Class",
    "SUB"
FROM "DG_TABLE"
WHERE TRIM("Class") IN ('1', '2', '4', '5', '6')
ORDER BY "Class", "UNNO";


-- ── STEP 2: PSN 패턴 기반 세부분류 추론 결과 미리보기 ──────────────
-- 실제 UPDATE 전 이 쿼리로 변경 내용을 확인하세요.
SELECT
    "UNNO",
    "Name",
    "Class"                                         AS class_current,
    CASE
        -- Class 2
        WHEN TRIM("Class") = '2' AND "Name" ILIKE '%FLAMMABLE%'                        THEN '2.1'
        WHEN TRIM("Class") = '2' AND ("Name" ILIKE '%TOXIC%' OR "Name" ILIKE '%POISON%') THEN '2.3'
        -- Class 4
        WHEN TRIM("Class") = '4' AND ("Name" ILIKE '%DANGEROUS WHEN WET%'
                                   OR "Name" ILIKE '%WATER-REACTIVE%')                 THEN '4.3'
        WHEN TRIM("Class") = '4' AND ("Name" ILIKE '%SPONTANEOUS%'
                                   OR "Name" ILIKE '%PYROPHORIC%'
                                   OR "Name" ILIKE '%SELF-HEAT%')                      THEN '4.2'
        WHEN TRIM("Class") = '4' AND "Name" ILIKE '%FLAMMABLE SOLID%'                 THEN '4.1'
        -- Class 5
        WHEN TRIM("Class") = '5' AND "Name" ILIKE '%PEROXIDE%'                        THEN '5.2'
        WHEN TRIM("Class") = '5' AND ("Name" ILIKE '%OXIDIZ%' OR "Name" ILIKE '%OXIDIS%') THEN '5.1'
        -- Class 6
        WHEN TRIM("Class") = '6' AND ("Name" ILIKE '%INFECTIOUS%'
                                   OR "Name" ILIKE '%BIOLOGICAL SUBSTANCE%'
                                   OR "Name" ILIKE '%MEDICAL WASTE%')                  THEN '6.2'
        WHEN TRIM("Class") = '6'                                                       THEN '6.1'
        -- Class 1: Division이 PSN에 있는 경우
        WHEN TRIM("Class") = '1' AND "Name" ~* '1\.(1|2|3|4|5|6)'
            THEN REGEXP_REPLACE("Name", '.*\b(1\.[1-6])\b.*', '\1', 'i')
        ELSE NULL   -- 추론 불가 (수동 확인)
    END                                             AS class_suggested
FROM "DG_TABLE"
WHERE TRIM("Class") IN ('1', '2', '4', '5', '6')
ORDER BY "Class", "UNNO";


-- ── STEP 3: 추론 가능 항목만 UPDATE (수동 확인 필요 항목은 제외) ───
-- !! 반드시 STEP 2 결과 검토 후 실행 !!

-- Class 2 → 2.1 (FLAMMABLE GAS)
UPDATE "DG_TABLE"
SET "Class" = '2.1'
WHERE TRIM("Class") = '2'
  AND "Name" ILIKE '%FLAMMABLE%';

-- Class 2 → 2.3 (TOXIC GAS)
UPDATE "DG_TABLE"
SET "Class" = '2.3'
WHERE TRIM("Class") = '2'
  AND ("Name" ILIKE '%TOXIC%' OR "Name" ILIKE '%POISON%');

-- Class 4 → 4.3 (DANGEROUS WHEN WET)
UPDATE "DG_TABLE"
SET "Class" = '4.3'
WHERE TRIM("Class") = '4'
  AND ("Name" ILIKE '%DANGEROUS WHEN WET%' OR "Name" ILIKE '%WATER-REACTIVE%');

-- Class 4 → 4.2 (SPONTANEOUSLY COMBUSTIBLE)
UPDATE "DG_TABLE"
SET "Class" = '4.2'
WHERE TRIM("Class") = '4'
  AND ("Name" ILIKE '%SPONTANEOUS%' OR "Name" ILIKE '%PYROPHORIC%' OR "Name" ILIKE '%SELF-HEAT%');

-- Class 4 → 4.1 (FLAMMABLE SOLID)
UPDATE "DG_TABLE"
SET "Class" = '4.1'
WHERE TRIM("Class") = '4'
  AND "Name" ILIKE '%FLAMMABLE SOLID%';

-- Class 5 → 5.2 (ORGANIC PEROXIDE)
UPDATE "DG_TABLE"
SET "Class" = '5.2'
WHERE TRIM("Class") = '5'
  AND "Name" ILIKE '%PEROXIDE%';

-- Class 5 → 5.1 (OXIDIZER)
UPDATE "DG_TABLE"
SET "Class" = '5.1'
WHERE TRIM("Class") = '5'
  AND ("Name" ILIKE '%OXIDIZ%' OR "Name" ILIKE '%OXIDIS%');

-- Class 6 → 6.2 (INFECTIOUS)
UPDATE "DG_TABLE"
SET "Class" = '6.2'
WHERE TRIM("Class") = '6'
  AND ("Name" ILIKE '%INFECTIOUS%' OR "Name" ILIKE '%BIOLOGICAL SUBSTANCE%' OR "Name" ILIKE '%MEDICAL WASTE%');

-- Class 6 → 6.1 (TOXIC SUBSTANCE — 나머지 6류 대부분)
UPDATE "DG_TABLE"
SET "Class" = '6.1'
WHERE TRIM("Class") = '6';

-- ── STEP 4: 수정 후 잔여 확인 ──────────────────────────────────────
-- 여기에 남은 항목은 수동 확인 필요 (AEROSOL 등 복합분류 포함)
SELECT "UNNO", "Name", "Class", "SUB"
FROM "DG_TABLE"
WHERE TRIM("Class") IN ('1', '2', '4', '5', '6')
ORDER BY "Class", "UNNO";
