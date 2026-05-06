// ═══════════════════════════════════════════════════════════════
//  IMDG DG ASSISTANT — app.js
//  Supabase 컬럼: UNNO, Name, Class, SUB, Segregation
// ═══════════════════════════════════════════════════════════════

// ── 1. Supabase 초기화 ──────────────────────────────────────────
const SUPABASE_URL = 'https://atqcxiipzhghwoprqljp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cWN4aWlwemhnaHdvcHJxbGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MzgzNDIsImV4cCI6MjA5MzAxNDM0Mn0.F4nACbzg_91_vpHnJMUy42a-uv9og4iOw3buxKPbONU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── 2. 참조 데이터 (CLAUDE3.xlsx — SGG / SGCODE / SEG.TABLE) ───
const REF = {

  // SGG 그룹명
  sgg: {
    SGG1:  "acids",
    SGG2:  "ammonium compounds",
    SGG3:  "bromates",
    SGG4:  "chlorates",
    SGG5:  "chlorites",
    SGG6:  "cyanides",
    SGG7:  "heavy metals and their salts",
    SGG8:  "hypochlorites",
    SGG9:  "lead and its compounds",
    SGG10: "liquid halogenated hydrocarbons",
    SGG11: "mercury and mercury compounds",
    SGG12: "nitrites and their mixtures",
    SGG13: "perchlorates",
    SGG14: "permanganates",
    SGG15: "powdered metals",
    SGG16: "peroxides",
    SGG17: "azides",
    SGG18: "alkalis"
  },

  // SG Code 정의 (엑셀 SGCODE 시트 전체 — reqSeg 있는 항목만 격리 엔진에 사용)
  // type: 'CLASS' | 'SGG' | 'UNNO' | ''
  // SGG type의 target은 'SGGn' 형식으로 정규화
  sgcode: {
    SG1:  { type:'',      target:'',      reqSeg:null, desc:'For packages carrying a subsidiary hazard label of class 1, segregation as for class 1, division 1.3.' },
    SG2:  { type:'CLASS', target:'1.2G',  reqSeg:null, desc:'Segregation as for class 1.2G.' },
    SG3:  { type:'CLASS', target:'1.3G',  reqSeg:null, desc:'Segregation as for class 1.3G.' },
    SG4:  { type:'CLASS', target:'2.1',   reqSeg:null, desc:'Segregation as for class 2.1.' },
    SG5:  { type:'CLASS', target:'3',     reqSeg:null, desc:'Segregation as for class 3.' },
    SG6:  { type:'CLASS', target:'5.1',   reqSeg:null, desc:'Segregation as for class 5.1.' },
    SG7:  { type:'CLASS', target:'3',     reqSeg:1,    desc:'Stow "away from" class 3.' },
    SG8:  { type:'CLASS', target:'4.1',   reqSeg:1,    desc:'Stow "away from" class 4.1.' },
    SG9:  { type:'CLASS', target:'4.3',   reqSeg:1,    desc:'Stow "away from" class 4.3.' },
    SG10: { type:'CLASS', target:'5.1',   reqSeg:1,    desc:'Stow "away from" class 5.1.' },
    SG11: { type:'CLASS', target:'6.2',   reqSeg:1,    desc:'Stow "away from" class 6.2.' },
    SG12: { type:'CLASS', target:'7',     reqSeg:1,    desc:'Stow "away from" class 7.' },
    SG13: { type:'CLASS', target:'8',     reqSeg:1,    desc:'Stow "away from" class 8.' },
    SG14: { type:'CLASS', target:'1',     reqSeg:2,    desc:'Stow "separated from" class 1 except for division 1.4S.' },
    SG15: { type:'CLASS', target:'3',     reqSeg:2,    desc:'Stow "separated from" class 3.' },
    SG16: { type:'CLASS', target:'4.1',   reqSeg:2,    desc:'Stow "separated from" class 4.1.' },
    SG17: { type:'CLASS', target:'5.1',   reqSeg:2,    desc:'Stow "separated from" class 5.1.' },
    SG18: { type:'CLASS', target:'6.2',   reqSeg:2,    desc:'Stow "separated from" class 6.2.' },
    SG19: { type:'CLASS', target:'7',     reqSeg:2,    desc:'Stow "separated from" class 7.' },
    SG20: { type:'SGG',   target:'SGG1',  reqSeg:1,    desc:'Stow "away from" SGG1 – acids.' },
    SG21: { type:'SGG',   target:'SGG18', reqSeg:1,    desc:'Stow "away from" SGG18 – alkalis.' },
    SG24: { type:'SGG',   target:'SGG17', reqSeg:1,    desc:'Stow "away from" SGG17 – azides.' },
    SG25: { type:'CLASS', target:'2, 3',  reqSeg:2,    desc:'Stow "separated from" goods of classes 2.1 and 3.' },
    SG28: { type:'SGG',   target:'SGG2',  reqSeg:2,    desc:'Stow "separated from" SGG2 – ammonium compounds.' },
    SG30: { type:'SGG',   target:'SGG7',  reqSeg:1,    desc:'Stow "away from" SGG7 – heavy metals and their salts.' },
    SG31: { type:'SGG',   target:'SGG9',  reqSeg:1,    desc:'Stow "away from" SGG9 – lead and its compounds.' },
    SG32: { type:'SGG',   target:'SGG10', reqSeg:1,    desc:'Stow "away from" SGG10 – liquid halogenated hydrocarbons.' },
    SG33: { type:'SGG',   target:'SGG15', reqSeg:1,    desc:'Stow "away from" SGG15 – powdered metals.' },
    SG34: { type:'SGG',   target:'SGG4',  reqSeg:2,    desc:'When containing ammonium compounds, "separated from" SGG4 – chlorates.' },
    SG35: { type:'SGG',   target:'SGG1',  reqSeg:2,    desc:'Stow "separated from" SGG1 – acids.' },
    SG36: { type:'SGG',   target:'SGG18', reqSeg:2,    desc:'Stow "separated from" SGG18 – alkalis.' },
    SG38: { type:'SGG',   target:'SGG2',  reqSeg:2,    desc:'Stow "separated from" SGG2 – ammonium compounds.' },
    SG39: { type:'SGG',   target:'SGG2',  reqSeg:2,    desc:'Stow "separated from" SGG2 – ammonium compounds (other than ammonium nitrate).' },
    SG40: { type:'SGG',   target:'SGG2',  reqSeg:2,    desc:'Stow "separated from" SGG2 – ammonium compounds (other than mixtures of potassium nitrate and ammonium nitrate).' },
    SG42: { type:'SGG',   target:'SGG3',  reqSeg:2,    desc:'Stow "separated from" SGG3 – bromates.' },
    SG44: { type:'UNNO',  target:'1846',  reqSeg:2,    desc:'Stow "separated from" CARBON TETRACHLORIDE (UN 1846).' },
    SG45: { type:'SGG',   target:'SGG4',  reqSeg:2,    desc:'Stow "separated from" SGG4 – chlorates.' },
    SG47: { type:'SGG',   target:'SGG5',  reqSeg:2,    desc:'Stow "separated from" SGG5 – chlorites.' },
    SG49: { type:'SGG',   target:'SGG6',  reqSeg:2,    desc:'Stow "separated from" SGG6 – cyanides.' },
    SG51: { type:'SGG',   target:'SGG8',  reqSeg:2,    desc:'Stow "separated from" SGG8 – hypochlorites.' },
    SG54: { type:'SGG',   target:'SGG11', reqSeg:2,    desc:'Stow "separated from" SGG11 – mercury and mercury compounds.' },
    SG56: { type:'SGG',   target:'SGG12', reqSeg:2,    desc:'Stow "separated from" SGG12 – nitrites.' },
    SG58: { type:'SGG',   target:'SGG13', reqSeg:2,    desc:'Stow "separated from" SGG13 – perchlorates.' },
    SG59: { type:'SGG',   target:'SGG14', reqSeg:2,    desc:'Stow "separated from" SGG14 – permanganates.' },
    SG60: { type:'SGG',   target:'SGG16', reqSeg:2,    desc:'Stow "separated from" SGG16 – peroxides.' },
    SG61: { type:'SGG',   target:'SGG15', reqSeg:2,    desc:'Stow "separated from" SGG15 – powdered metals.' },
    SG70: { type:'SGG',   target:'SGG1',  reqSeg:2,    desc:'For arsenic sulphides, "separated from" SGG1 – acids.' },
  },

  // SEG.TABLE (IMDG Code 7.2 기본 클래스 격리표)
  segTable: {
    "1.1 1.2 1.5": {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":4,"2.2":2,"2.3":2,"3":4,"4.1":4,"4.2":4,"4.3":4,"5.1":4,"5.2":4,"6.1":2,"6.2":4,"7":2,"8":4,"9":"X"},
    "1.3 1.6":     {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":4,"2.2":2,"2.3":2,"3":4,"4.1":3,"4.2":3,"4.3":4,"5.1":4,"5.2":4,"6.1":2,"6.2":4,"7":2,"8":2,"9":"X"},
    "1.4":         {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":2,"2.2":1,"2.3":1,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":4,"7":2,"8":2,"9":"X"},
    "2.1":         {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":"X","2.2":"X","2.3":"X","3":2,"4.1":1,"4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":4,"7":2,"8":1,"9":"X"},
    "2.2":         {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":1,"2.1":"X","2.2":"X","2.3":"X","3":1,"4.1":"X","4.2":1,"4.3":"X","5.1":"X","5.2":1,"6.1":"X","6.2":2,"7":1,"8":"X","9":"X"},
    "2.3":         {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":1,"2.1":"X","2.2":"X","2.3":"X","3":2,"4.1":"X","4.2":2,"4.3":"X","5.1":"X","5.2":2,"6.1":"X","6.2":2,"7":1,"8":"X","9":"X"},
    "3":           {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":"X","4.1":"X","4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":"X","9":"X"},
    "4.1":         {"1.1 1.2 1.5":4,"1.3 1.6":3,"1.4":2,"2.1":1,"2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":1,"4.3":"X","5.1":1,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":1,"9":"X"},
    "4.2":         {"1.1 1.2 1.5":4,"1.3 1.6":3,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":2,"4.1":1,"4.2":"X","4.3":1,"5.1":2,"5.2":2,"6.1":1,"6.2":3,"7":2,"8":1,"9":"X"},
    "4.3":         {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":"X","2.3":"X","3":2,"4.1":"X","4.2":1,"4.3":"X","5.1":2,"5.2":2,"6.1":"X","6.2":2,"7":2,"8":1,"9":"X"},
    "5.1":         {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":"X","2.3":"X","3":2,"4.1":1,"4.2":2,"4.3":2,"5.1":"X","5.2":2,"6.1":1,"6.2":3,"7":1,"8":2,"9":"X"},
    "5.2":         {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":2,"5.2":"X","6.1":1,"6.2":3,"7":2,"8":2,"9":"X"},
    "6.1":         {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":"X","2.1":"X","2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":1,"4.3":"X","5.1":1,"5.2":1,"6.1":"X","6.2":1,"7":"X","8":"X","9":"X"},
    "6.2":         {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":4,"2.1":4,"2.2":2,"2.3":2,"3":3,"4.1":3,"4.2":3,"4.3":2,"5.1":3,"5.2":3,"6.1":1,"6.2":"X","7":3,"8":3,"9":"X"},
    "7":           {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":2,"2.1":2,"2.2":1,"2.3":1,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":1,"5.2":2,"6.1":"X","6.2":3,"7":"X","8":2,"9":"X"},
    "8":           {"1.1 1.2 1.5":4,"1.3 1.6":2,"1.4":2,"2.1":1,"2.2":"X","2.3":"X","3":"X","4.1":1,"4.2":1,"4.3":1,"5.1":2,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":"X","9":"X"},
    "9":           {"1.1 1.2 1.5":"X","1.3 1.6":"X","1.4":"X","2.1":"X","2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":"X","4.3":"X","5.1":"X","5.2":"X","6.1":"X","6.2":"X","7":"X","8":"X","9":"X"}
  }
};

// ── 3. SGG / SG 분리 유틸 ──────────────────────────────────────
// Supabase의 Segregation 컬럼값에서 SGG와 SG를 분리
// 예) "SGG18\xa0SG35" → { sgg: "SGG18", sgCodes: "SG35" }
function normalizeText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUNNO(value) {
  const raw = String(value ?? '').trim().replace(/^UN\s*/i, '');
  if (/^\d+$/.test(raw)) return String(Number(raw)).padStart(4, '0');
  return raw.toUpperCase();
}

function normalizeSubRisk(value) {
  const txt = normalizeText(value);
  if (!txt || txt === '?' || txt === '？' || txt === '–' || txt === '-') return '-';
  return txt;
}

function parseSeg(raw) {
  const clean = normalizeText(raw);
  if (!clean || clean === '–' || clean === '-') {
    return { sgg: '', sgCodes: '', sgGroups: [], sgCodeList: [] };
  }
  const sgGroups = [...clean.matchAll(/\bSGG\s*0*(\d+)\b/gi)].map(m => `SGG${Number(m[1])}`);
  const sgCodeList = [...clean.matchAll(/\bSG\s*0*(\d+)\b/gi)].map(m => `SG${Number(m[1])}`);
  const uniqueGroups = [...new Set(sgGroups)];
  const uniqueCodes = [...new Set(sgCodeList)];
  return { sgg: uniqueGroups[0] || '', sgCodes: uniqueCodes.join(' '), sgGroups: uniqueGroups, sgCodeList: uniqueCodes };
}

function getSGGroups(e) {
  if (Array.isArray(e.sgGroups)) return e.sgGroups;
  if (e.sgg) return [e.sgg];
  return [];
}

function getSGCodes(e) {
  if (Array.isArray(e.sgCodeList)) return e.sgCodeList;
  if (e.sgCodes) return String(e.sgCodes).split(/\s+/).filter(Boolean);
  return [];
}

function prepareEntry(item) {
  const parsed = parseSeg(item.Segregation);
  item.SUB = normalizeSubRisk(item.SUB);
  item._sgg = parsed.sgg;
  item._sgCodes = parsed.sgCodes;
  item.sgg = parsed.sgg;
  item.sgCodes = parsed.sgCodes;
  item.sgGroups = parsed.sgGroups;
  item.sgCodeList = parsed.sgCodeList;
  return item;
}

// ── 4. 클래스 정규화 (SEG.TABLE 키 매칭) ─────────────────────
function normalizeClass(cls) {
  if (!cls) return null;
  const s = String(cls).trim();
  const keys = Object.keys(REF.segTable);
  // 직접 일치
  if (keys.includes(s)) return s;
  // 복합 키 내부에 포함 여부 (예: "1.1" → "1.1 1.2 1.5")
  for (const k of keys) {
    if (k.split(' ').includes(s)) return k;
  }
  return s; // 매칭 안 되면 원문 반환
}

// ── 5. SG5/SG6처럼 "as for class X" 리다이렉션 해소 ──────────
// reqSeg가 null인 CLASS 타입 SG 코드는 해당 클래스의 SEG.TABLE 값을 그대로 적용
function resolveAsForClass(sgTarget, clsA, clsB) {
  // sgTarget: '3', '5.1' 등 CLASS 문자열
  const targets = sgTarget.split(',').map(s => s.trim());
  let maxLv = 0;
  for (const t of targets) {
    const normT = normalizeClass(t);
    const normB = normalizeClass(clsB);
    const row = REF.segTable[normT];
    if (row && row[normB] !== undefined) {
      const v = row[normB];
      if (v === 'X') return { level: 'X', via: t };
      if (typeof v === 'number' && v > maxLv) maxLv = v;
    }
  }
  return maxLv > 0 ? { level: maxLv, via: sgTarget } : null;
}

// ── 6. 격리 엔진 ───────────────────────────────────────────────
// 인자: a, b = Supabase 레코드 + 파생된 { sgg, sgCodes } 필드 포함 객체
function calcPairSeg(a, b) {
  let maxLevel = 0;
  let hasStar = false;
  const ruleHits = [];

  function severity(level) {
    if (level === '*') return 99;
    if (typeof level === 'number') return level;
    return 0;
  }

  function addReason(level, text) {
    if (level === '*') hasStar = true;
    if (typeof level === 'number' && level > maxLevel) maxLevel = level;
    ruleHits.push({ level, text, severity: severity(level) });
  }

  const getSubClasses = (e) => {
    const sub = normalizeSubRisk(e.SUB);
    if (!sub || sub === '-' || sub === '–' || sub === '?') return [];
    return sub.split(/[\/,]+/).map(s => s.trim()).filter(Boolean);
  };

  const getAllHazardClasses = (e) => {
    const result = [];
    if (e.Class) result.push(String(e.Class).trim());
    result.push(...getSubClasses(e));
    return [...new Set(result.filter(Boolean))];
  };

  const clsA = normalizeClass(a.Class);
  const clsB = normalizeClass(b.Class);

  if (clsA && clsB) {
    const rowA = REF.segTable[clsA];
    if (rowA && rowA[clsB] !== undefined) {
      const val = rowA[clsB];
      if (val === 'X') addReason(0, `Class ${a.Class} ↔ Class ${b.Class}: 격리적용없음 (DG 리스트 참조)`);
      else if (val === '*') addReason('*', `Class ${a.Class} ↔ Class ${b.Class}: Class 1 특수규정 (*)`);
      else if (typeof val === 'number') addReason(val, `Class ${a.Class} ↔ Class ${b.Class}: Seg ${val}`);
    }
  }

  for (const sc of getSubClasses(a)) {
    const row = REF.segTable[normalizeClass(sc)];
    if (row && row[clsB] !== undefined) {
      const v = row[clsB];
      if (v === 'X') addReason(0, `UN${a.UNNO} SubRisk ${sc} ↔ Class ${b.Class}: 격리적용없음 (DG 리스트 참조)`);
      else if (v === '*') addReason('*', `UN${a.UNNO} SubRisk ${sc} ↔ Class ${b.Class}: Class 1 특수규정 (*)`);
      else if (typeof v === 'number') addReason(v, `UN${a.UNNO} SubRisk ${sc} ↔ Class ${b.Class}: Seg ${v}`);
    }
  }

  for (const sc of getSubClasses(b)) {
    const row = REF.segTable[normalizeClass(sc)];
    if (row && row[clsA] !== undefined) {
      const v = row[clsA];
      if (v === 'X') addReason(0, `UN${b.UNNO} SubRisk ${sc} ↔ Class ${a.Class}: 격리적용없음 (DG 리스트 참조)`);
      else if (v === '*') addReason('*', `UN${b.UNNO} SubRisk ${sc} ↔ Class ${a.Class}: Class 1 특수규정 (*)`);
      else if (typeof v === 'number') addReason(v, `UN${b.UNNO} SubRisk ${sc} ↔ Class ${a.Class}: Seg ${v}`);
    }
  }

  function applySGCodes(holder, other) {
    const codes = getSGCodes(holder);
    if (!codes.length) return;

    const otherHazardClasses = getAllHazardClasses(other).map(normalizeClass);
    const otherSGGroups = getSGGroups(other);
    const otherUNNO = normalizeUNNO(other.UNNO);

    for (const code of codes) {
      const sg = REF.sgcode[code];
      if (!sg) continue;

      if (sg.type === 'CLASS') {
        const targets = sg.target.split(',').map(s => normalizeClass(s.trim()));
        if (sg.reqSeg === null) {
          for (const otherClass of otherHazardClasses) {
            for (const target of targets) {
              const row = REF.segTable[target];
              if (!row || row[otherClass] === undefined) continue;
              const resolved = row[otherClass];
              if (resolved === 'X') addReason(0, `${code} (UN${holder.UNNO}): as for class ${sg.target} ↔ ${otherClass}: 격리적용없음`);
              else if (resolved === '*') addReason('*', `${code} (UN${holder.UNNO}): as for class ${sg.target} ↔ ${otherClass}: Class 1 특수규정 (*)`);
              else if (typeof resolved === 'number') addReason(resolved, `${code} (UN${holder.UNNO}): as for class ${sg.target} ↔ ${otherClass}: Seg ${resolved}`);
            }
          }
          continue;
        }
        if (otherHazardClasses.some(c => targets.includes(c))) {
          addReason(sg.reqSeg, `${code} (UN${holder.UNNO}→UN${other.UNNO}): ${sg.desc}`);
        }
      } else if (sg.type === 'SGG') {
        if (otherSGGroups.includes(sg.target)) {
          const targetName = REF.sgg[sg.target] ? `${sg.target} ${REF.sgg[sg.target]}` : sg.target;
          addReason(sg.reqSeg, `${code} (UN${holder.UNNO}→UN${other.UNNO}): ${targetName} 대상 — ${sg.desc}`);
        }
      } else if (sg.type === 'UNNO') {
        if (otherUNNO === normalizeUNNO(sg.target)) {
          addReason(sg.reqSeg, `${code} (UN${holder.UNNO}→UN${other.UNNO}): ${sg.desc}`);
        }
      }
    }
  }

  applySGCodes(a, b);
  applySGCodes(b, a);

  const reasons = ruleHits.sort((x, y) => y.severity - x.severity).map(r => r.text);
  if (hasStar) return { level: '*', reasons: reasons.length ? reasons : ['Class 1 특수규정 (*)'] };
  return { level: maxLevel, reasons: reasons.length ? reasons : ['별도 격리 규정 없음'] };
}

// ── 7. 상태 ───────────────────────────────────────────────────
let entries = [];

// ── 8. Supabase 조회 ──────────────────────────────────────────
async function addEntries() {
  const input = document.getElementById('searchInput');
  const errEl = document.getElementById('errorMsg');
  errEl.innerHTML = '';

  const rawValues = input.value
    .split(/[\s,]+/)
    .map(v => v.trim())
    .filter(v => v !== '');
  if (!rawValues.length) return;

  const formatted = rawValues.map(v => normalizeUNNO(v));
  const uniqueFormatted = Array.from(new Set(formatted));
  if (!uniqueFormatted.length) return;

  const existingUNs = new Set(entries.map(e => normalizeUNNO(e.UNNO)));
  const skipped = uniqueFormatted.filter(v => existingUNs.has(v));
  const toLookup = uniqueFormatted.filter(v => !existingUNs.has(v));
  const msgs = [];

  if (toLookup.length) {
    const { data, error } = await _supabase
      .from('DG_TABLE')
      .select('*')
      .in('UNNO', toLookup);

    if (error) {
      errEl.innerHTML = `<div class="error-msg">⚠ DB 오류: ${error.message}</div>`;
      return;
    }

    const uniqueDataMap = new Map();
    (data || []).forEach(item => {
      const key = normalizeUNNO(item.UNNO);
      if (!uniqueDataMap.has(key)) uniqueDataMap.set(key, item);
    });

    const notFound = toLookup.filter(v => !uniqueDataMap.has(v));
    if (notFound.length) msgs.push(`⚠ DB에 없는 번호: ${notFound.join(', ')}`);
    uniqueDataMap.forEach(item => entries.push(prepareEntry(item)));
  }

  if (skipped.length) msgs.push(`⚠ 이미 추가됨: ${skipped.join(', ')}`);
  if (msgs.length) errEl.innerHTML = `<div class="error-msg">${msgs.join('<br>')}</div>`;

  render();
  input.value = '';
  input.focus();
}

function removeEntry(unno) {
  entries = entries.filter(e => String(e.UNNO) !== String(unno));
  render();
}

function clearAll() {
  entries = [];
  document.getElementById('errorMsg').innerHTML = '';
  render();
}

// ── 9. 렌더링 ─────────────────────────────────────────────────
function segBadgeClass(level) {
  if (level === 'X') return 's0';
  if (level === '*') return 's4';
  if (level === 0) return 's0';
  return `s${level}`;
}

function segLabel(level) {
  if (level === 'X') return 'X';
  if (level === '*') return '*';
  if (level === 0) return 'OK';
  return String(level);
}

function render() {
  const list  = document.getElementById('cardList');
  const panel = document.getElementById('segPanel');

  if (!entries.length) {
    list.innerHTML = '';
    panel.innerHTML = '';
    return;
  }

  // 카드 렌더링
  list.innerHTML = entries.map(e => {
    const subLabel  = normalizeSubRisk(e.SUB);
    const sggTags   = getSGGroups(e).length
      ? getSGGroups(e).map(g => `<span class="field-value tag" title="${REF.sgg[g] || ''}">${g}</span>`).join(' ')
      : `<span class="field-value" style="color:var(--muted)">—</span>`;
    const sgTags    = getSGCodes(e).length
      ? getSGCodes(e).map(c => `<span class="field-value tag sg">${c}</span>`).join(' ')
      : `<span class="field-value" style="color:var(--muted)">—</span>`;

    return `
    <div class="result-card">
      <div class="UNNO-badge">${e.UNNO}</div>
      <div class="card-fields">
        <div class="field">
          <span class="field-label">CLASS</span>
          <span class="field-value">${e.Class || '—'}</span>
        </div>
        <div class="field">
          <span class="field-label">SUB RISK</span>
          <span class="field-value sub">${subLabel}</span>
        </div>
        <div class="field">
          <span class="field-label">SGG GROUP</span>
          ${sggTags}
        </div>
        <div class="field">
          <span class="field-label">SG CODE</span>
          ${sgTags}
        </div>
        <div class="field" style="flex:1;min-width:160px">
          <span class="field-label">NAME</span>
          <span class="field-value name">${e.Name || '—'}</span>
        </div>
      </div>
      <button class="remove-btn" onclick="removeEntry('${e.UNNO}')" title="삭제">×</button>
    </div>`;
  }).join('');

  // 2개 이상이면 격리 분석
  if (entries.length < 2) { panel.innerHTML = ''; return; }

  let maxOverall = 0;
  let hasStar = false;
  const pairs = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const res = calcPairSeg(entries[i], entries[j]);
      pairs.push({ a: entries[i].UNNO, b: entries[j].UNNO, ...res });
      if (res.level === '*') hasStar = true;
      else if (typeof res.level === 'number') maxOverall = Math.max(maxOverall, res.level);
    }
  }

  let statusText, statusColor, statusIcon;
  if (maxOverall >= 3) {
    statusText = `Segregation ${maxOverall} — 엄격한 격리 필요`;
    statusColor = 'var(--red)'; statusIcon = '⚠️';
  } else if (maxOverall >= 1) {
    statusText = `Segregation ${maxOverall} — 격리 조건 준수 필요`;
    statusColor = 'var(--yellow)'; statusIcon = '⚠️';
  } else if (hasStar) {
    statusText = 'Class 1 특수규정 적용 — 별도 확인 필요 (*)';
    statusColor = 'var(--yellow)'; statusIcon = '⭐';
  } else {
    statusText = '혼적 가능 — 별도 격리 규정 없음';
    statusColor = 'var(--green)'; statusIcon = '✅';
  }

  panel.innerHTML = `
    <div class="seg-panel">
      <div class="seg-panel-header">
        <span style="font-family:'Space Mono',monospace;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:var(--muted)">
          SEGREGATION ANALYSIS
        </span>
        <span style="font-size:12px;color:var(--muted);float:right">${entries.length}개 화물 · ${pairs.length}쌍</span>
      </div>
      <div class="seg-result-big">
        <div class="seg-icon">${statusIcon}</div>
        <div>
          <div class="seg-main-text" style="color:${statusColor}">${statusText}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">IMDG Code 7.2 기준</div>
        </div>
      </div>
      <div class="pair-grid">
        <div style="font-family:'Space Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:12px">PAIR DETAIL</div>
        ${pairs.map(p => `
          <div class="pair-row">
            <span style="font-weight:700;font-family:'Space Mono';min-width:150px">UN${p.a} ↔ UN${p.b}</span>
            <span class="seg-badge ${segBadgeClass(p.level)}">${segLabel(p.level)}</span>
            <span style="font-size:12px;color:var(--muted);flex:1">${p.reasons.slice(0,3).join('<br>')}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;padding:12px 24px;border-top:1px solid var(--border)">
        ${['OK — 격리 불필요','1 — Away from','2 — Separated from','3 — Sep. by compartment','4 — Sep. longitudinally','X — 격리 적용 없음'].map((t,i) => {
          const cls = ['s0','s1','s2','s3','s0','s0'][i];
          const lbl = ['OK','1','2','3','4','X'][i];
          return `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)"><span class="seg-badge ${cls}" style="min-width:28px;padding:2px 6px">${lbl}</span>${t}</div>`;
        }).join('')}
      </div>
    </div>`;
}

// ── 10. 이벤트 리스너 ─────────────────────────────────────────
document.getElementById('addBtn').addEventListener('click', addEntries);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addEntries();
});


// ==========================================================================
//   신규 기능: 탭 전환(SPA) 및 DG 정보 상세 조회 로직
// ==========================================================================

// ── 1. 탭 전환 기능 (Tab Switching Logic) ──
// DOM 조작: 요소를 선택하고 클릭 이벤트를 연결합니다.
const menuItems = document.querySelectorAll('.menu-item');
const tabs = document.querySelectorAll('.tab-content');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // 1-1. 모든 메뉴와 탭의 'active' 상태를 해제합니다.
        menuItems.forEach(mi => mi.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));

        // 1-2. 클릭한 메뉴에 'active' 추가
        item.classList.add('active');
        
        // 1-3. 메뉴의 data-target 값을 읽어와서 해당 id를 가진 섹션을 활성화합니다.
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});





// ── 2. DG 정보 상세 조회 기능 (Supabase Data Fetching) ──


function mzClean(val) {
    if (!val || val === null || val === undefined) return '-';
    let str = String(val).trim();
    if (str === '?') return '-'; // 단독 물음표는 대시로
    return str.replace(/\?/g, ' '); // 데이터 사이 물음표는 공백으로
}


async function lookupDGInfo() {
    const input = document.getElementById('lookupInput');
    const view = document.getElementById('infoDetailView');
    const errorMsg = document.getElementById('lookupErrorMsg');
    
    // 번호 정규화 (예: 30 -> 0030)
    const unno = normalizeUNNO(input.value);

    if (!unno) {
        errorMsg.innerHTML = `<div class="error-msg">UN 번호를 입력해 주세요.</div>`;
        return;
    }

    // 로딩 상태 표시
    view.innerHTML = `
    <div style="padding:60px; text-align:center; color:var(--accent); font-family:var(--font-mono); letter-spacing:2px;">
        <div class="loading-spinner" style="margin-bottom:20px;">⚡ SYSTEM_ACCESSING_DATABASE...</div>
        <div style="font-size:12px; color:var(--text-muted); opacity:0.6;">NEO-PRECISION ENGINE v3.1</div>
    </div>
`;
    errorMsg.innerHTML = '';

    try {
        // 🚨 수정 포인트: .single()을 제거하고 결과를 리스트로 받습니다.
        const { data, error } = await _supabase
            .from('DG_TABLE')
            .select('*')
            .eq('UNNO', unno); // 정확히 일치하는 모든 데이터 조회

        if (error) throw error;

        // 결과가 없을 때 처리
        if (!data || data.length === 0) {
            view.innerHTML = '';
            errorMsg.innerHTML = `<div class="error-msg">⚠ UN ${unno} 를 찾을 수 없습니다. (입력값: ${unno})</div>`;
            console.log(`[Lookup] No data found for UNNO: ${unno}`);
            return;
        }

        // 결과가 여러 개일 경우 가장 첫 번째 항목을 사용 (또는 추후 리스트 선택 기능 추가 가능)
        const item = data[0];
        console.log(`[Lookup] Success:`, item);

        // 데이터 정제 및 매핑
        const res = {
            name: mzClean(item.Name),
            unno: mzClean(item.UNNO),
            class: mzClean(item.Class),
            sub: mzClean(item.SUB),
            pg: mzClean(item.PG),
            sp: mzClean(item['Special Provisions']),
            lq: mzClean(item['Limited Quantities']),
            eq: mzClean(item['Excepted Quantities']),
            flash: mzClean(item.Flashpoint),
            ems: mzClean(item.EmS),
            p_inst: mzClean(item['Packing Instructions']),
            p_prov: mzClean(item['Packing Provisions']),
            ibc_inst: mzClean(item['IBC Instructions']),
            ibc_prov: mzClean(item['IBC Provisions']),
            tank_inst: mzClean(item['Portable tanks and bulk containers Instructions']),
            tank_prov: mzClean(item['Portable tanks and bulk containers Provisions']),
            stowage: mzClean(item['Stowage and Handling']),
            segregation: mzClean(item.Segregation),
            properties: mzClean(item['Properties and Observations'])
        };

        // ── HTML 렌더링 ──
        // [복원] 원본 데이터 배치 구조 + 시인성 강화 레이아웃
view.innerHTML = `
    <div class="dg-detail-grid">
        <div class="grid-cell col-6 header-main">SUBSTANCE: ${res.name}</div>

        <div class="grid-cell col-2"><div class="cell-label">(1) UN No</div><div class="cell-value text-accent">${res.unno}</div></div>
        <div class="grid-cell col-4"><div class="cell-label">(2) Proper Shipping Name</div><div class="cell-value">${res.name}</div></div>

        <div class="grid-cell col-2"><div class="cell-label">(3) Class</div><div class="cell-value text-accent">${res.class}</div></div>
        <div class="grid-cell col-2"><div class="cell-label">(4) Sub Hazards</div><div class="cell-value text-orange">${res.sub}</div></div>
        <div class="grid-cell col-2"><div class="cell-label">(5) Packing Group</div><div class="cell-value">${res.pg}</div></div>

        <div class="grid-cell col-2"><div class="cell-label">(6) Special Provisions</div><div class="cell-value">${res.sp}</div></div>
        <div class="grid-cell col-2"><div class="cell-label">(7a) Limited Qty</div><div class="cell-value">${res.lq}</div></div>
        <div class="grid-cell col-2"><div class="cell-label">(7b) Excepted Qty</div><div class="cell-value">${res.eq}</div></div>

        <div class="grid-cell flashpoint-cell">
            <div class="cell-label">Flashpoint</div>
            <div class="cell-value">${res.flash}</div>
        </div>
        <div class="grid-cell col-2">
            <div class="cell-label">(15) EmS</div>
            <div class="cell-value text-orange">${res.ems}</div>
        </div>

        <div class="grid-cell col-2 header-sub">Category</div>
        <div class="grid-cell col-2 header-sub">Instructions</div>
        <div class="grid-cell col-2 header-sub">Provisions</div>

        <div class="grid-cell col-2 header-sub" style="background:transparent !important; color:var(--accent) !important; text-align:left; padding-left:15px !important;">Packing</div>
        <div class="grid-cell col-2"><div class="cell-value">${res.p_inst}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${res.p_prov}</div></div>

        <div class="grid-cell col-2 header-sub" style="background:transparent !important; color:var(--accent) !important; text-align:left; padding-left:15px !important;">IBCs</div>
        <div class="grid-cell col-2"><div class="cell-value">${res.ibc_inst}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${res.ibc_prov}</div></div>

        <div class="grid-cell col-2 header-sub" style="background:transparent !important; color:var(--accent) !important; text-align:left; padding-left:15px !important;">Tanks</div>
        <div class="grid-cell col-2"><div class="cell-value">${res.tank_inst}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${res.tank_prov}</div></div>

        <div class="grid-cell col-4 header-sub">(16a) Stowage and Handling</div>
        <div class="grid-cell col-2 header-sub">(16b) Segregation</div>
        <div class="grid-cell col-4"><div class="cell-value" style="font-size:13px;">${res.stowage}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${res.segregation}</div></div>

        <div class="grid-cell col-6 header-sub">(17) Properties and Observations</div>
        <div class="grid-cell col-6">
            <div class="cell-value properties-text">${res.properties}</div>
        </div>

        <div class="grid-cell col-2">
            <div class="cell-label">Hazard Marks</div>
            <div class="cell-value" style="font-size:11px; color:var(--text-muted);">CLASS_${res.class}</div>
        </div>
        <div class="grid-cell col-4 hazard-label-area">
            <div class="diamond-label">
                 <span class="diamond-text">${res.class}</span>
            </div>
        </div>
    </div>
`;
        
        input.value = '';
    } catch (err) {
        console.error("Critical Error:", err);
        errorMsg.innerHTML = `<div class="error-msg">SYSTEM ERROR: 데이터 조회 중 서버 오류가 발생했습니다.</div>`;
    }
}




// ── 3. 이벤트 리스너 연결 ──
document.getElementById('infoLookupBtn').addEventListener('click', lookupDGInfo);
document.getElementById('lookupInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') lookupDGInfo();
});


// ── 4. 실무 지식 노트 로직 ──────────────────────────────────────

let isEditMode = false;
let currentFileUrl = null;  // 현재 게시글의 파일 URL 보관용
let currentFileName = null; // 현재 게시글의 파일명 보관용
let currentFileRemoved = false; // 수정 시 기존 첨부파일 삭제 여부

// 날짜 포맷 함수 (YYYY-MM-DD HH:mm)
function formatDate(isoString) {
    if(!isoString) return "-";
    const d = new Date(isoString);
    if(isNaN(d.getTime())) return "-";
    return d.getFullYear() + "." + 
           String(d.getMonth() + 1).padStart(2, '0') + "." + 
           String(d.getDate()).padStart(2, '0') + " " +
           String(d.getHours()).padStart(2, '0') + ":" + 
           String(d.getMinutes()).padStart(2, '0');
}

// HTML 표시용 이스케이프 처리
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function readJsonResponse(response) {
    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (err) {
        throw new Error(`API가 JSON이 아닌 응답을 반환했습니다. 상태코드: ${response.status}, 응답: ${text.slice(0, 120)}`);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = String(reader.result || '');
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
        };

        reader.onerror = () => {
            reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
        };

        reader.readAsDataURL(file);
    });
}

// 데이터 안전 전송용 인코딩 / 디코딩
function encodeSafeNote(note) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(note))));
}

function decodeSafeNote(safeNote) {
    return JSON.parse(decodeURIComponent(escape(atob(safeNote))));
}

// 노트 목록 불러오기
async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.message || '노트 목록 조회 실패');
        }

        const data = result.data || [];
        const noteList = document.getElementById('noteList');
        if (!noteList) return;

        if (!data || data.length === 0) {
            noteList.innerHTML = `<div style="color:var(--muted); font-size:14px;">저장된 노트가 없습니다.</div>`;
            return;
        }

        noteList.innerHTML = data.map(note => {
            const created = formatDate(note.created_at);
            const updated = note.updated_at ? `<div style="color:var(--accent2); font-size:10px; margin-top:3px;">(Edit) ${formatDate(note.updated_at)}</div>` : "";
            const safeNote = encodeSafeNote(note);
            const fileMark = note.file_url ? `<div class="note-card-attachment">📎 ${escapeHtml(note.file_name || '첨부파일')}</div>` : "";

            return `
                <div class="note-card" onclick="openModalSafe('${safeNote}')">
                    <div class="note-card-header">
                        <div class="note-card-title">${escapeHtml(note.title)}</div>
                        <div class="note-card-date">
                            <div>${created}</div>
                            ${updated}
                        </div>
                    </div>
                    <div class="note-card-meta">${escapeHtml(note.author)}</div>
                    <div class="note-card-body">${escapeHtml(note.content)}</div>
                    ${fileMark}
                    <div class="note-card-btns" onclick="event.stopPropagation()">
                        <button class="btn-sm" onclick="prepareEditSafe('${safeNote}')">수정</button>
                        <button class="btn-sm" onclick="deleteNoteSafe('${safeNote}')">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('노트 목록 조회 오류:', err);
        const noteList = document.getElementById('noteList');
        if (noteList) {
            noteList.innerHTML = `<div class="error-msg">노트 목록 조회 실패: ${escapeHtml(err.message || err)}</div>`;
        }
    }
}

// 노트 저장 / 수정
async function saveNote() {
    const titleEl = document.getElementById('noteTitle');
    const authorEl = document.getElementById('noteAuthor');
    const pwEl = document.getElementById('notePw');
    const contentEl = document.getElementById('noteContent');
    const fileEl = document.getElementById('noteFile');
    const editIdEl = document.getElementById('editNoteId');
    const editStatus = document.getElementById('editStatus');
    const saveBtn = document.getElementById('saveNoteBtn');

    const title = titleEl.value.trim();
    const author = authorEl.value.trim();
    const password = pwEl.value.trim();
    const content = contentEl.value.trim();
    const editId = editIdEl.value.trim();

    if (!title || !author || !password || !content) {
        alert('제목, 작성자, 비밀번호, 내용을 모두 입력해 주세요.');
        return;
    }

    saveBtn.disabled = true;
    const originalBtnText = saveBtn.innerText;
    saveBtn.innerText = '저장 중...';

    try {
        let fileUrl = currentFileRemoved ? null : currentFileUrl;
        let fileName = currentFileRemoved ? null : currentFileName;
        const selectedFile = fileEl.files && fileEl.files[0] ? fileEl.files[0] : null;

        // 첨부파일이 선택된 경우에만 Storage 업로드
        // 첨부파일이 선택된 경우 Vercel API를 통해 Storage 업로드
if (selectedFile) {
    const maxSize = 4 * 1024 * 1024; // 약 4MB 제한

    if (selectedFile.size > maxSize) {
        throw new Error('첨부파일은 4MB 이하만 업로드할 수 있습니다.');
    }

    const fileBase64 = await fileToBase64(selectedFile);

    const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file_name: selectedFile.name,
            file_type: selectedFile.type,
            file_base64: fileBase64
        })
    });

    const uploadResult = await readJsonResponse(uploadResponse);

    if (!uploadResponse.ok || !uploadResult.ok) {
        throw new Error(uploadResult.message || '첨부파일 업로드 실패');
    }

    fileUrl = uploadResult.file_url;
    fileName = uploadResult.file_name;
}

        const noteData = {
            title,
            author,
            password,
            content,
            file_url: fileUrl,
            file_name: fileName
        };

        const apiUrl = editId ? '/api/notes-update' : '/api/notes-save';

const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id: editId || undefined,
        ...noteData
    })
});

const result = await response.json();

if (!response.ok || !result.ok) {
    throw new Error(result.message || '노트 저장 실패');
}

        resetNoteForm();
        await fetchNotes();
        alert(editId ? '노트가 수정되었습니다.' : '노트가 저장되었습니다.');
    } catch (err) {
        console.error('노트 저장 오류:', err);
        if (editStatus) {
            editStatus.innerHTML = `<span style="color:var(--red); font-size:12px;">저장 실패: ${escapeHtml(err.message || err)}</span>`;
        }
        alert('노트 저장 실패: ' + (err.message || err));
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = originalBtnText;
    }
}

// 입력폼 초기화
function resetNoteForm() {
    document.getElementById('editNoteId').value = '';
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteAuthor').value = '';
    document.getElementById('notePw').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteFile').value = '';
    document.getElementById('editStatus').innerHTML = '';

    isEditMode = false;
    currentFileUrl = null;
    currentFileName = null;
    currentFileRemoved = false;
    updateSelectedFileUI();

    document.getElementById('saveNoteBtn').innerText = '노트 저장하기';
}

// 모달 열기
function openModalSafe(safeNote) {
    const note = decodeSafeNote(safeNote);

    document.getElementById('modalTitle').innerText = note.title || '-';
    document.getElementById('modalAuthor').innerText = note.author || '-';
    document.getElementById('modalDate').innerHTML = `
        <div>${formatDate(note.created_at)}</div>
        ${note.updated_at ? `<div style="color:var(--accent2); margin-top:3px;">(Edit) ${formatDate(note.updated_at)}</div>` : ''}
    `;
    document.getElementById('modalContent').innerText = note.content || '-';

    const attachment = document.getElementById('modalAttachment');
    if (note.file_url) {
        attachment.innerHTML = `
            <a href="${note.file_url}" target="_blank" style="color:var(--accent);">
                📎 ${escapeHtml(note.file_name || '첨부파일 열기')}
            </a>
        `;
    } else {
        attachment.innerHTML = '';
    }

    document.getElementById('noteModal').style.display = 'flex';
}

// 모달 닫기
function closeModal() {
    document.getElementById('noteModal').style.display = 'none';
}

// 수정 준비
function prepareEditSafe(safeNote) {
    const note = decodeSafeNote(safeNote);

    isEditMode = true;
    currentFileUrl = note.file_url || null;
    currentFileName = note.file_name || null;
    currentFileRemoved = false;

    document.getElementById('editNoteId').value = note.id;
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteAuthor').value = note.author || '';
    document.getElementById('notePw').value = '';
    document.getElementById('noteContent').value = note.content || '';
    document.getElementById('noteFile').value = '';

    document.getElementById('saveNoteBtn').innerText = '노트 수정하기';
    document.getElementById('editStatus').innerHTML = `
        <span style="color:var(--accent2); font-size:12px;">
            수정 모드: ${escapeHtml(note.title || '')} / 저장 시 기존 비밀번호를 입력하세요.
        </span>
    `;
    updateSelectedFileUI();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// 파일 선택/기존 첨부파일 표시 및 X 버튼으로 선택 취소
function ensureFileSelectionBox() {
    const fileEl = document.getElementById('noteFile');
    if (!fileEl) return null;

    let box = document.getElementById('fileSelectionStatus');
    if (!box) {
        box = document.createElement('div');
        box.id = 'fileSelectionStatus';
        box.style.cssText = 'font-size:12px; color:var(--muted); margin-left:8px; display:flex; align-items:center; gap:6px; max-width:320px;';
        fileEl.insertAdjacentElement('afterend', box);
    }
    return box;
}

function updateSelectedFileUI() {
    const fileEl = document.getElementById('noteFile');
    const box = ensureFileSelectionBox();
    if (!fileEl || !box) return;

    const selectedFile = fileEl.files && fileEl.files[0] ? fileEl.files[0] : null;

    if (selectedFile) {
        box.innerHTML = `
            <span style="color:var(--accent); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(selectedFile.name)}</span>
            <button type="button" onclick="clearSelectedNoteFile()" title="선택 파일 삭제" style="background:transparent; border:0; color:var(--red); cursor:pointer; font-weight:900; font-size:16px; line-height:1;">×</button>
        `;
        return;
    }

    if (currentFileName && !currentFileRemoved) {
        box.innerHTML = `
            <span style="color:var(--accent); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">현재 첨부파일: ${escapeHtml(currentFileName)}</span>
            <button type="button" onclick="removeCurrentNoteFile()" title="기존 첨부파일 삭제" style="background:transparent; border:0; color:var(--red); cursor:pointer; font-weight:900; font-size:16px; line-height:1;">×</button>
        `;
        return;
    }

    box.innerHTML = '';
}

function clearSelectedNoteFile() {
    const fileEl = document.getElementById('noteFile');
    if (fileEl) fileEl.value = '';
    updateSelectedFileUI();
}

function removeCurrentNoteFile() {
    currentFileUrl = null;
    currentFileName = null;
    currentFileRemoved = true;
    const fileEl = document.getElementById('noteFile');
    if (fileEl) fileEl.value = '';
    updateSelectedFileUI();
}

// 노트 삭제 (비밀번호 확인)
async function deleteNoteSafe(safeNote) {
    const note = decodeSafeNote(safeNote);
    const inputPw = prompt('비밀번호를 입력하세요:');

    if (inputPw === null) return;

    try {
        const response = await fetch('/api/notes-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: note.id,
                password: inputPw
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.message || '삭제 실패');
        }

        await fetchNotes();
        alert('삭제되었습니다.');
    } catch (err) {
        console.error('노트 삭제 오류:', err);
        alert(err.message || '삭제 실패');
    }
}

// 기존 호출 호환용
async function deleteNote(id, correctPw) {
    const inputPw = prompt('비밀번호를 입력하세요:');
    if (inputPw === correctPw) {
        const { error } = await _supabase.from('DG_NOTES').delete().eq('id', id).eq('password', inputPw);
        if (error) alert('삭제 실패: ' + error.message);
        else fetchNotes();
    } else if (inputPw !== null) {
        alert('비밀번호가 일치하지 않습니다.');
    }
}

// 이벤트 리스너
const saveNoteBtn = document.getElementById('saveNoteBtn');
if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', saveNote);
}

const noteFileInput = document.getElementById('noteFile');
if (noteFileInput) {
    ensureFileSelectionBox();
    noteFileInput.addEventListener('change', updateSelectedFileUI);
}

// 탭 클릭 시 노트 데이터 로딩
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        if(item.getAttribute('data-target') === 'tab-notes') {
            fetchNotes();
        }
    });
});
