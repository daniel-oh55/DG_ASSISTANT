/**
 * DG_TABLE Class 세부분류 정비 스크립트
 *
 * 사용법:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/fix-dg-class.js
 *   (실제 적용) node scripts/fix-dg-class.js --apply
 *   (CSV 출력) node scripts/fix-dg-class.js --csv
 *
 * 이 스크립트는 DG_TABLE에서 Class 값이 세부분류 없이 메인 클래스('1','2','4','5','6')만
 * 저장된 레코드를 찾아 IMDG DGL 기준으로 세부분류를 보완합니다.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[ERROR] 환경변수 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const APPLY = process.argv.includes('--apply');
const CSV   = process.argv.includes('--csv');

// ── PSN 기반 세부분류 추론 ─────────────────────────────────────────
// 반환: 확정 세부분류 문자열 | null (모호하여 수동 확인 필요)
function inferSubdivision(unno, name, cls) {
  const n = (name || '').toUpperCase();

  switch (String(cls).trim()) {

    case '1': {
      // 1류 화약: PSN 안에 Division이 표기되는 경우가 많음 (예: "EXPLOSIVE 1.4S")
      const m = n.match(/\b1\.(1|2|3|4|5|6)\b/);
      if (m) return `1.${m[1]}`;
      return null;   // Division을 PSN에서 확인 불가 → 수동 확인
    }

    case '2': {
      // 2류 가스: 2.1 인화성 / 2.2 비인화성·비독성 / 2.3 독성
      if (/\bFLAMMABLE\b/.test(n))              return '2.1';
      if (/\bTOXIC\b|\bPOISON(OUS)?\b/.test(n)) return '2.3';
      // AEROSOL은 내용물에 따라 2.1/2.2 혼재 → 모호
      if (/\bAEROSOL\b/.test(n))                return null;
      // 그 외 가스 계열 단어가 없으면 모호
      return null;
    }

    case '4': {
      // 4류: 4.1 인화성 고체 / 4.2 자연발화성 / 4.3 물반응성
      if (/DANGEROUS\s+WHEN\s+WET|WATER.REACTIVE/.test(n)) return '4.3';
      if (/SPONTANEOUS|PYROPHORIC|SELF.HEAT/.test(n))      return '4.2';
      if (/FLAMMABLE\s+SOLID/.test(n))                     return '4.1';
      return null;
    }

    case '5': {
      // 5류: 5.1 산화성 / 5.2 유기과산화물
      if (/ORGANIC\s+PEROXIDE|PEROXIDE/.test(n)) return '5.2';
      if (/OXIDIZ|OXIDIS/.test(n))               return '5.1';
      return null;
    }

    case '6': {
      // 6류: 6.1 독성 / 6.2 감염성
      if (/INFECTIOUS|BIOLOGICAL\s+SUBSTANCE|MEDICAL\s+WASTE/.test(n)) return '6.2';
      return '6.1';   // 6류 대부분은 6.1 독성물질
    }

    default:
      return null;
  }
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log('=== DG_TABLE Class 세부분류 정비 ===');
  console.log(`모드: ${APPLY ? '실제 적용 (--apply)' : '조회만 (dry-run)'}\n`);

  // 세부분류 없는 메인 클래스만 조회
  const { data, error } = await supabase
    .from('DG_TABLE')
    .select('UNNO, Name, Class, SUB')
    .in('Class', ['1', '2', '4', '5', '6'])
    .order('Class')
    .order('UNNO');

  if (error) {
    console.error('[QUERY ERROR]', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('세부분류 미상 항목 없음. DB가 이미 정비되어 있습니다.');
    return;
  }

  console.log(`세부분류 미상 항목 총 ${data.length}건\n`);

  const canFix   = [];   // 세부분류 추론 성공 → 자동 수정 대상
  const manual   = [];   // 추론 불가 → 수동 확인 필요

  for (const row of data) {
    const suggested = inferSubdivision(row.UNNO, row.Name, row.Class);
    const entry = {
      unno      : row.UNNO,
      name      : row.Name || '',
      classCur  : row.Class,
      classSug  : suggested,
      sub       : row.SUB || ''
    };
    if (suggested) canFix.push(entry);
    else           manual.push(entry);
  }

  // ── 자동 수정 가능 항목 출력 ────────────────────────────────
  if (canFix.length) {
    console.log(`▶ 자동 수정 가능 (${canFix.length}건)`);
    console.log('  ' + [
      'UNNO'.padEnd(6), 'Class'.padEnd(6), '→'.padEnd(4), 'Suggested'.padEnd(6), 'Name'
    ].join(' '));
    console.log('  ' + '-'.repeat(70));
    for (const e of canFix) {
      console.log('  ' + [
        e.unno.padEnd(6),
        e.classCur.padEnd(6),
        '→'.padEnd(4),
        (e.classSug || '').padEnd(6),
        e.name.substring(0, 50)
      ].join(' '));
    }
    console.log();
  }

  // ── 수동 확인 필요 항목 출력 ─────────────────────────────────
  if (manual.length) {
    console.log(`▶ 수동 확인 필요 (추론 불가 ${manual.length}건)`);
    console.log('  ' + ['UNNO'.padEnd(6), 'Class'.padEnd(6), 'Name'].join(' '));
    console.log('  ' + '-'.repeat(70));
    for (const e of manual) {
      console.log('  ' + [
        e.unno.padEnd(6),
        e.classCur.padEnd(6),
        e.name.substring(0, 55)
      ].join(' '));
    }
    console.log();
  }

  // ── CSV 출력 ─────────────────────────────────────────────────
  if (CSV) {
    const fs = require('fs');
    const rows = [...canFix, ...manual].map(e =>
      [e.unno, `"${e.name.replace(/"/g,'""')}"`, e.classCur, e.classSug || '', e.sub].join(',')
    );
    const csv = ['UNNO,Name,Class_Current,Class_Suggested,SUB', ...rows].join('\r\n');
    const outPath = 'scripts/dg_class_fix_report.csv';
    fs.writeFileSync(outPath, '﻿' + csv, 'utf8');   // BOM for Excel
    console.log(`CSV 저장 완료: ${outPath}`);
  }

  // ── 실제 적용 ────────────────────────────────────────────────
  if (APPLY && canFix.length) {
    console.log('=== 업데이트 적용 중 ===');
    let ok = 0, fail = 0;
    for (const e of canFix) {
      const { error: upErr } = await supabase
        .from('DG_TABLE')
        .update({ Class: e.classSug })
        .eq('UNNO', e.unno)
        .eq('Class', e.classCur);   // 같은 UNNO에 다른 Class 행이 있을 경우를 위한 조건

      if (upErr) {
        console.log(`  ✗ UN${e.unno} (${e.classCur} → ${e.classSug}): ${upErr.message}`);
        fail++;
      } else {
        console.log(`  ✓ UN${e.unno}: ${e.classCur} → ${e.classSug}`);
        ok++;
      }
    }
    console.log(`\n완료: 성공 ${ok}건 / 실패 ${fail}건`);
  } else if (!APPLY && canFix.length) {
    console.log('실제 적용하려면: node scripts/fix-dg-class.js --apply');
    console.log('CSV 내보내기:   node scripts/fix-dg-class.js --csv');
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
