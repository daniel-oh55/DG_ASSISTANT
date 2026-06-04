// ═══════════════════════════════════════════════════════════════
//  IMDG DG ASSISTANT — app.js
//  Supabase 컬럼: UNNO, Name, Class, SUB, Segregation
// ═══════════════════════════════════════════════════════════════

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

  // SW / H Code 설명
  // 필요한 코드는 여기에서 계속 추가 관리하면 됩니다.
  // 현재는 팝업 구조를 먼저 만들고, 데이터는 확인되는 코드부터 채우는 방식입니다.
  swcode: {
    SW1: { desc: 'Protected from sources of heat.' },
    SW2: { desc: 'Clear of living quarters.' },
    SW3: { desc: 'Shall be transported under temperature control.' },
    SW4: { desc: 'Category A only.' },
    SW5: { desc: 'Category B only.' },
    SW6: { desc: 'Category C only.' },
    SW7: { desc: 'Category D only.' },
    SW8: { desc: 'Category E only.' },
    SW9: { desc: 'Category A, away from sources of heat.' },
    SW10: { desc: 'Category B, away from sources of heat.' },
    SW11: { desc: 'Category C, away from sources of heat.' },
    SW12: { desc: 'Category D, away from sources of heat.' },
    SW13: { desc: 'Category E, away from sources of heat.' },
    SW14: { desc: 'Category A, clear of living quarters.' },
    SW15: { desc: 'Category B, clear of living quarters.' },
    SW16: { desc: 'Category C, clear of living quarters.' },
    SW17: { desc: 'Category D, clear of living quarters.' },
    SW18: { desc: 'Category E, clear of living quarters.' },
    SW19: { desc: 'Category A, protected from sources of heat.' },
    SW20: { desc: 'Category B, protected from sources of heat.' },
    SW21: { desc: 'Category C, protected from sources of heat.' },
    SW22: { desc: 'Category D, protected from sources of heat.' },
    SW23: { desc: 'Category E, protected from sources of heat.' },
    SW24: { desc: 'Protected from sources of heat and clear of living quarters.' },
    SW25: { desc: 'Stowage code SW25. Please verify exact wording against the current IMDG Code.' },
    SW26: { desc: 'Stowage code SW26. Please verify exact wording against the current IMDG Code.' },
    SW27: { desc: 'Stowage code SW27. Please verify exact wording against the current IMDG Code.' },
    SW28: { desc: 'Stowage code SW28. Please verify exact wording against the current IMDG Code.' },
    SW29: { desc: 'Stowage code SW29. Please verify exact wording against the current IMDG Code.' },
    SW30: { desc: 'Stowage code SW30. Please verify exact wording against the current IMDG Code.' }
  },

  stowageCategory: {
    A: {
      desc: 'Cargo ships or passenger ships carrying a number of passengers limited to not more than 25 or to 1 passenger per 3 m of overall length, whichever is greater: ON DECK or UNDER DECK. Other passenger ships: ON DECK or UNDER DECK.'
    },
    B: {
      desc: 'Cargo ships or passenger ships carrying a number of passengers limited to not more than 25 or to 1 passenger per 3 m of overall length, whichever is greater: ON DECK or UNDER DECK. Other passenger ships: ON DECK only.'
    },
    C: {
      desc: 'Cargo ships or passenger ships carrying a number of passengers limited to not more than 25 or to 1 passenger per 3 m of overall length, whichever is greater: ON DECK only. Other passenger ships: ON DECK only.'
    },
    D: {
      desc: 'Cargo ships or passenger ships carrying a number of passengers limited to not more than 25 or to 1 passenger per 3 m of overall length, whichever is greater: ON DECK only. Other passenger ships: PROHIBITED.'
    },
    E: {
      desc: 'Cargo ships or passenger ships carrying a number of passengers limited to not more than 25 or to 1 passenger per 3 m of overall length, whichever is greater: ON DECK or UNDER DECK. Other passenger ships: PROHIBITED.'
    }
  },

  hcode: {
    H1: { desc: 'Keep as dry as reasonably practicable.' },
    H2: { desc: 'Keep as cool as reasonably practicable.' },
    H3: { desc: 'Handling code H3. Please verify exact wording against the current IMDG Code.' },
    H4: { desc: 'Handling code H4. Please verify exact wording against the current IMDG Code.' },
    H5: { desc: 'Handling code H5. Please verify exact wording against the current IMDG Code.' }
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
const response = await fetch('/api/dg-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    unnos: toLookup
  })
});

const result = await readJsonResponse(response);

if (!response.ok || !result.ok) {
  errEl.innerHTML = `<div class="error-msg">⚠ DB 오류: ${escapeHtml(result.message || 'DG_TABLE 조회 실패')}</div>`;
  return;
}

const data = result.data || [];

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
const homeCards = document.querySelectorAll('.home-bento-card');

function renderLoadingState(title, message, meta = '') {
    return `
        <div class="loading-state" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true"></div>
            <div class="loading-copy">
                <div class="loading-title">${escapeHtml(title)}</div>
                ${message ? `<div class="loading-message">${escapeHtml(message)}</div>` : ''}
                ${meta ? `<div class="loading-meta">${escapeHtml(meta)}</div>` : ''}
            </div>
        </div>
    `;
}

function activateTab(targetId) {
    if (!targetId) return;

    menuItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === targetId);
    });

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === targetId);
    });

    if (targetId === 'tab-notes') {
        fetchNotes();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        activateTab(item.getAttribute('data-target'));
    });
});

homeCards.forEach(card => {
    card.addEventListener('click', event => {
        if (event.target.closest('.home-quick-search')) return;

        const targetId = card.getAttribute('data-target');
        activateTab(targetId);
    });
});

const sidebarHomeLogo = document.getElementById('sidebarHomeLogo');

if (sidebarHomeLogo) {
    sidebarHomeLogo.addEventListener('click', () => {
        activateTab('tab-home');
    });

    sidebarHomeLogo.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateTab('tab-home');
        }
    });
}



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
    view.innerHTML = renderLoadingState(
        'DG 데이터를 조회하는 중입니다',
        `UN ${unno} 기준 IMDG 상세 정보를 불러오고 있습니다.`,
        'NEO-PRECISION ENGINE v3.1'
    );
    errorMsg.innerHTML = '';

    try {
        // 🚨 수정 포인트: .single()을 제거하고 결과를 리스트로 받습니다.
        const response = await fetch(`/api/dg-lookup?unno=${encodeURIComponent(unno)}`);
const result = await readJsonResponse(response);

if (!response.ok || !result.ok) {
    throw new Error(result.message || 'DG 상세조회 실패');
}

const data = result.data || [];

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

        <div class="grid-cell col-2"><div class="cell-label">(6) Special Provisions</div><div class="cell-value">${renderSpecialProvisionLinks(res.sp)}</div></div>
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
        <div class="grid-cell col-4"><div class="cell-value" style="font-size:13px;">${renderImdgCodeLinks(res.stowage)}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${renderImdgCodeLinks(res.segregation)}</div></div>

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
let currentFileUrl = null;
let currentFileName = null;
let currentFileRemoved = false;
let currentNoteSearchKeyword = '';

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

function renderSpecialProvisionLinks(spText) {
    const clean = String(spText || '').trim();

    if (!clean || clean === '-' || clean === '—') {
        return '-';
    }

    const matches = clean.match(/\d{1,4}/g);

    if (!matches || matches.length === 0) {
        return escapeHtml(clean);
    }

    const uniqueSpNos = [...new Set(matches)];

    return uniqueSpNos.map(spNo => `
    <button type="button" class="sp-link-btn" onclick="openSpecialProvisionModal('${escapeHtml(spNo)}')">
        ${escapeHtml(spNo)}
    </button>
`).join(' ');
}

function renderImdgCodeLinks(text) {
    const clean = String(text || '')
    .trim()
    // CategoryASW1 → Category A SW1
    .replace(/\bCategory\s*([A-E])(?=(SW|H|SG|SGG)\s*\d)/gi, 'Category $1 ')
    // CategoryA → Category A
    .replace(/\bCategory\s*([A-E])\b/gi, 'Category $1')
    // 코드끼리 붙은 경우 SW1H2 → SW1 H2
    .replace(/\b(SW|H|SG|SGG)\s*0*(\d{1,3})(?=(SW|H|SG|SGG)\s*\d)/gi, (m, p1, p2) => `${p1.toUpperCase()}${Number(p2)} `);

    if (!clean || clean === '-' || clean === '—') {
        return '-';
    }

    const pattern = /\bCategory\s*([A-E])\b|\b(SGG|SG|SW|H)\s*0*(\d{1,3})\b/gi;
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(clean)) !== null) {
    // Category A/B/C/D/E
    if (match[1]) {
        const category = match[1].toUpperCase();
        const code = `Category ${category}`;

        result += escapeHtml(clean.slice(lastIndex, match.index));
        result += `
            <button type="button"
                    class="imdg-code-link-btn imdg-code-category"
                    onclick="openImdgCodeModal('CATEGORY', '${category}')">
                ${escapeHtml(code)}
            </button>
        `;

        lastIndex = pattern.lastIndex;
        continue;
    }

    // SG / SGG / SW / H
    const prefix = match[2].toUpperCase();
    const number = String(Number(match[3]));
    const code = `${prefix}${number}`;

    result += escapeHtml(clean.slice(lastIndex, match.index));
    result += `
        <button type="button"
                class="imdg-code-link-btn imdg-code-${prefix.toLowerCase()}"
                onclick="openImdgCodeModal('${prefix}', '${code}')">
            ${escapeHtml(code)}
        </button>
    `;

    lastIndex = pattern.lastIndex;
}

    result += escapeHtml(clean.slice(lastIndex));

    return result || escapeHtml(clean);
}

function getImdgCodeInfo(prefix, code) {
    const normalizedPrefix = String(prefix || '').toUpperCase();
    const normalizedCode = String(code || '').toUpperCase();

    if (normalizedPrefix === 'CATEGORY') {
    const category = normalizedCode.replace(/^CATEGORY\s*/i, '').toUpperCase();
    const item = REF.stowageCategory?.[category];

    return {
        title: `Category ${category}`,
        group: 'Stowage Category',
        subtitle: 'IMDG Code Stowage Category',
        content: item?.desc || `Category ${category} 설명이 아직 등록되어 있지 않습니다.`
    };
   }

    
    if (normalizedPrefix === 'SGG') {
        const desc = REF.sgg[normalizedCode];

        return {
            title: normalizedCode,
            group: 'SGG Group',
            subtitle: 'Segregation Group',
            content: desc
                ? `${normalizedCode}: ${desc}`
                : `${normalizedCode} 설명이 아직 등록되어 있지 않습니다.`
        };
    }

    if (normalizedPrefix === 'SG') {
    const sg = REF.sgcode[normalizedCode];

    return {
        title: normalizedCode,
        group: 'SG Code',
        subtitle: 'Segregation Code',
        content: sg?.desc || `${normalizedCode} 설명이 아직 등록되어 있지 않습니다.`
    };
}

    if (normalizedPrefix === 'SW') {
        const sw = REF.swcode?.[normalizedCode];

        return {
            title: normalizedCode,
            group: 'SW Code',
            subtitle: 'Stowage Code',
            content: sw?.desc || `${normalizedCode} 설명이 아직 등록되어 있지 않습니다.`
        };
    }

    if (normalizedPrefix === 'H') {
        const h = REF.hcode?.[normalizedCode];

        return {
            title: normalizedCode,
            group: 'H Code',
            subtitle: 'Handling Code',
            content: h?.desc || `${normalizedCode} 설명이 아직 등록되어 있지 않습니다.`
        };
    }

    return {
        title: normalizedCode || '-',
        group: 'IMDG Code',
        subtitle: 'Code Information',
        content: '설명이 등록되어 있지 않습니다.'
    };
}

function openImdgCodeModal(prefix, code) {
    const info = getImdgCodeInfo(prefix, code);
    let modal = document.getElementById('imdgCodeModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imdgCodeModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-window sp-modal-window">
                <div class="modal-header">
                    <h2 id="imdgCodeModalTitle">IMDG Code</h2>
                    <button class="modal-close" onclick="closeImdgCodeModal()">×</button>
                </div>
                <div class="modal-meta" id="imdgCodeModalMeta"></div>
                <hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">
                <div id="imdgCodeModalContent" class="modal-body sp-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', e => {
            if (e.target.id === 'imdgCodeModal') {
                closeImdgCodeModal();
            }
        });
    }

    document.getElementById('imdgCodeModalTitle').innerText = info.title;
    document.getElementById('imdgCodeModalMeta').innerHTML = `
        <span class="sp-marker">${escapeHtml(info.group)}</span>
        <span>${escapeHtml(info.subtitle)}</span>
    `;
    document.getElementById('imdgCodeModalContent').innerHTML = `
        <div class="sp-content-text">
            ${formatSpecialProvisionContent(info.content)}
        </div>
    `;

    modal.style.display = 'flex';
}

function closeImdgCodeModal() {
    const modal = document.getElementById('imdgCodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function formatSpecialProvisionContent(content) {
    const raw = String(content || '').trim();

    if (!raw) return '<p>-</p>';

    // 1) 줄바꿈이 있으면 줄바꿈 기준으로 문단 분리
    // 2) 줄바꿈이 거의 없는 긴 문장은 세미콜론+공백, 마침표+공백 기준으로 보기 좋게 분리
    let normalized = raw
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!normalized.includes('\n')) {
        normalized = normalized
            .replace(/;\s+/g, ';\n')
            .replace(/\.\s+(?=[A-Z0-9(])/g, '.\n');
    }

    const paragraphs = normalized
        .split(/\n+/)
        .map(p => p.trim())
        .filter(Boolean);

    return paragraphs.map(p => {
        // (a), (b), 1., 2. 같은 항목은 살짝 들여쓰기
        const isListLike = /^(\([a-z0-9]+\)|[0-9]+\.)\s+/i.test(p);
        const cls = isListLike ? 'sp-content-paragraph sp-content-listlike' : 'sp-content-paragraph';

        return `<p class="${cls}">${escapeHtml(p)}</p>`;
    }).join('');
}

async function openSpecialProvisionModal(spNo) {
    let modal = document.getElementById('specialProvisionModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'specialProvisionModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-window sp-modal-window">
                <div class="modal-header">
                    <h2 id="spModalTitle">Special Provision</h2>
                    <button class="modal-close" onclick="closeSpecialProvisionModal()">×</button>
                </div>
                <div class="modal-meta" id="spModalMeta"></div>
                <hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">
                <div id="spModalContent" class="modal-body sp-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', e => {
            if (e.target.id === 'specialProvisionModal') {
                closeSpecialProvisionModal();
            }
        });
    }

    document.getElementById('spModalTitle').innerText = `SP ${spNo}`;
    document.getElementById('spModalMeta').innerText = 'IMDG Code Special Provision';
    document.getElementById('spModalContent').innerHTML = `
        <div style="color:var(--accent); font-family:var(--font-mono);">
            SPECIAL PROVISION LOADING...
        </div>
    `;

    modal.style.display = 'flex';

    try {
        const response = await fetch(`/api/sp-lookup?sp=${encodeURIComponent(spNo)}`);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.ok) {
            throw new Error(result.message || 'SP 정보 조회 실패');
        }

        const item = result.data;

        document.getElementById('spModalTitle').innerText = `SP ${escapeHtml(item.sp_no)}`;
        document.getElementById('spModalMeta').innerHTML = `
            ${item.marker ? `<span class="sp-marker">${escapeHtml(item.marker)}</span>` : ''}
            <span>Source: ${escapeHtml(item.source_name || 'SPECIAL PROVISIONS LIST')}</span>
        `;

        document.getElementById('spModalContent').innerHTML = `
    <div class="sp-content-text">
        ${formatSpecialProvisionContent(item.content)}
    </div>
`;
    } catch (err) {
        console.error('SP 조회 오류:', err);
        document.getElementById('spModalContent').innerHTML = `
            <div class="error-msg">SP 조회 실패: ${escapeHtml(err.message || err)}</div>
        `;
    }
}

function closeSpecialProvisionModal() {
    const modal = document.getElementById('specialProvisionModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
async function fetchNotes(keyword = currentNoteSearchKeyword) {
    try {
        currentNoteSearchKeyword = String(keyword || '').trim();

        const url = currentNoteSearchKeyword
            ? `/api/notes?q=${encodeURIComponent(currentNoteSearchKeyword)}`
            : '/api/notes';

        const response = await fetch(url);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.ok) {
            throw new Error(result.message || '노트 목록 조회 실패');
        }

        const data = result.data || [];
        const noteList = document.getElementById('noteList');
        const statusEl = document.getElementById('noteSearchStatus');

        if (!noteList) return;

        if (statusEl) {
            if (currentNoteSearchKeyword) {
                statusEl.innerHTML = `
                    <span class="note-search-keyword">"${escapeHtml(currentNoteSearchKeyword)}"</span>
                    검색 결과 ${data.length}건
                `;
            } else {
                statusEl.innerHTML = `전체 노트 ${data.length}건`;
            }
        }

        if (!data || data.length === 0) {
            noteList.innerHTML = currentNoteSearchKeyword
                ? `<div style="color:var(--muted); font-size:14px;">검색 결과가 없습니다.</div>`
                : `<div style="color:var(--muted); font-size:14px;">저장된 노트가 없습니다.</div>`;
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

function searchNotes() {
    const input = document.getElementById('noteSearchInput');
    const keyword = input ? input.value.trim() : '';
    fetchNotes(keyword);
}

function clearNoteSearch() {
    const input = document.getElementById('noteSearchInput');
    if (input) input.value = '';
    currentNoteSearchKeyword = '';
    fetchNotes('');
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



// ==========================================================================
// 신규 기능: 선사별 선적가부 조회
// ==========================================================================

let carrierCommonRulesStore = {};

function carrierStatusLabel(status) {
    if (status === 'ALLOWED') return '선적 가능';
    if (status === 'RESTRICTED') return '조건부 가능 / 제한';
    if (status === 'PROHIBITED') return '선적 금지';
    return '-';
}

function carrierStatusClass(status) {
    if (status === 'ALLOWED') return 'carrier-allowed';
    if (status === 'RESTRICTED') return 'carrier-restricted';
    if (status === 'PROHIBITED') return 'carrier-prohibited';
    return '';
}

function normalizeForCompare(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:()[\]'"-]/g, '')
        .trim();
}

function renderRuleRemarkCondition(rule) {
    const remarkCode = rule.remark_code || '';
    const remarkText = rule.remark_text || '';

    let html = '';

    if (remarkCode || remarkText) {
        const remarkDisplay = remarkCode
            ? `${escapeHtml(remarkCode)}${remarkText ? ' - ' + escapeHtml(remarkText) : ''}`
            : escapeHtml(remarkText);

        html += `<div><b>Remark:</b> ${remarkDisplay}</div>`;
    } else {
        html += `<div><b>Remark:</b> 없음</div>`;
    }

    if (rule.container_condition) {
        html += `<div><b>Container:</b> ${escapeHtml(rule.container_condition)}</div>`;
    }

    if (rule.stowage_condition) {
        html += `<div><b>Stowage:</b> ${escapeHtml(rule.stowage_condition)}</div>`;
    }

    return html;
}

function renderCarrierResultFromApi(dgItem, results) {
    const resultBox = document.getElementById('carrierCheckResult');
    const showOnlyAllowed = document.getElementById('showOnlyAllowedCarrier')?.checked;

    carrierCommonRulesStore = {};


    const filteredResults = showOnlyAllowed
        ? results.filter(r => r.status === 'ALLOWED')
        : results;

    const unno = escapeHtml(dgItem.UNNO || '');
    const name = escapeHtml(dgItem.Name || '-');
    const classNo = escapeHtml(dgItem.Class || '-');
    const sub = escapeHtml(normalizeSubRisk(dgItem.SUB));

    resultBox.innerHTML = `
        <div class="carrier-summary-card">
            <div>
                <div class="carrier-summary-title">UN ${unno}</div>
                <div class="carrier-summary-name">${name}</div>
            </div>
            <div class="carrier-summary-meta">
                <span>CLASS ${classNo}</span>
                <span>SUB ${sub}</span>
            </div>
        </div>

        <div class="carrier-result-grid">
            ${filteredResults.map(result => {
                const ruleHtml = result.matched_rules && result.matched_rules.length
    ? result.matched_rules.map(rule => `
        <div class="carrier-rule-line">
            <div><b>Rule:</b> ${escapeHtml(rule.class_no || '-')} / ${escapeHtml(rule.unno || '-')}</div>
            <div><b>Status:</b> ${escapeHtml(rule.status || '-')}</div>
            ${renderRuleRemarkCondition(rule)}
            ${rule.document_required ? `<div><b>Required Docs:</b> ${escapeHtml(rule.document_required)}</div>` : ''}
        </div>
    `).join('')
    : `<div class="carrier-rule-line muted">금지/제한 리스트에 해당 없음</div>`;

const commonRules = result.common_rules || [];
const commonKey = result.carrier_group || result.carrier_name || '';
carrierCommonRulesStore[commonKey] = {
    carrierName: result.carrier_name || result.carrier_group || '-',
    rules: commonRules
};

const commonButtonHtml = commonRules.length
    ? `
        <div class="carrier-common-action">
            <button type="button" class="btn-sm carrier-common-btn" onclick="openCarrierCommonModal('${escapeHtml(commonKey)}')">
                공통 주의사항 조회
            </button>
        </div>
    `
    : '';

                return `
                    <div class="carrier-result-card ${carrierStatusClass(result.status)}">
                        <div class="carrier-result-header">
                            <div class="carrier-name">${escapeHtml(result.carrier_name || result.carrier_group)}</div>
                            <div class="carrier-status">${escapeHtml(result.status_label || carrierStatusLabel(result.status))}</div>
                        </div>
                        <div class="carrier-rule-box">
                          ${ruleHtml}
                          ${commonButtonHtml}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div style="margin-top:18px; color:var(--text-muted); font-size:12px; line-height:1.6;">
            ※ 본 결과는 선사별 DG 금지/제한 리스트 기준입니다. 실제 선적 전에는 IMDG Code, 터미널 규정, POL/POD 국가 규정, 선박 운항 조건을 함께 확인해야 합니다.
        </div>
    `;
}

function openCarrierCommonModal(carrierKey) {
    const data = carrierCommonRulesStore[carrierKey];

    if (!data || !data.rules || data.rules.length === 0) {
        alert('표시할 공통 주의사항이 없습니다.');
        return;
    }

    let modal = document.getElementById('carrierCommonModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'carrierCommonModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-window carrier-common-modal-window">
                <div class="modal-header">
                    <h2 id="carrierCommonModalTitle">공통 주의사항</h2>
                    <button class="modal-close" onclick="closeCarrierCommonModal()">×</button>
                </div>
                <div class="modal-meta" id="carrierCommonModalMeta"></div>
                <hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">
                <div id="carrierCommonModalBody" class="carrier-common-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', e => {
            if (e.target.id === 'carrierCommonModal') {
                closeCarrierCommonModal();
            }
        });
    }

    document.getElementById('carrierCommonModalTitle').innerText = `${data.carrierName} 공통 주의사항`;
    document.getElementById('carrierCommonModalMeta').innerText = '해당 선사의 전체 DG 공통 조건입니다. UNNO별 판정과 별도로 확인하세요.';

    document.getElementById('carrierCommonModalBody').innerHTML = data.rules.map(rule => `
        <div class="carrier-common-modal-item">
            <div class="carrier-common-modal-item-head">
                ${rule.remark_code ? `<span class="carrier-common-code">${escapeHtml(rule.remark_code)}</span>` : ''}
                <span class="carrier-common-modal-status ${carrierStatusClass(rule.status)}">${escapeHtml(carrierStatusLabel(rule.status))}</span>
            </div>
            <div class="carrier-common-modal-text">
                ${escapeHtml(rule.condition_text || rule.remark_text || '-')}
            </div>
            ${rule.psn ? `<div class="carrier-common-modal-psn">${escapeHtml(rule.psn)}</div>` : ''}
        </div>
    `).join('');

    modal.style.display = 'flex';
}

function closeCarrierCommonModal() {
    const modal = document.getElementById('carrierCommonModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function checkCarrierLoadingPossibility() {
    const input = document.getElementById('carrierCheckInput');
    const errorMsg = document.getElementById('carrierCheckErrorMsg');
    const resultBox = document.getElementById('carrierCheckResult');

    if (!input || !resultBox) return;

    const unno = normalizeUNNO(input.value);

    errorMsg.innerHTML = '';
    resultBox.innerHTML = '';

    if (!unno) {
        errorMsg.innerHTML = `<div class="error-msg">UNNO를 입력해 주세요.</div>`;
        return;
    }

    resultBox.innerHTML = renderLoadingState(
        '선사별 조건을 확인하는 중입니다',
        `UN ${unno} 기준 제한 및 금지 조건을 대조하고 있습니다.`,
        'CARRIER RULE CHECK'
    );

    try {
        const response = await fetch(`/api/carrier-check?unno=${encodeURIComponent(unno)}`);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.ok) {
            throw new Error(result.message || '선사별 선적가부 조회 실패');
        }

        renderCarrierResultFromApi(result.dg, result.results || []);
    } catch (err) {
        console.error('선사별 선적가부 조회 오류:', err);
        resultBox.innerHTML = '';
        errorMsg.innerHTML = `<div class="error-msg">조회 중 오류가 발생했습니다: ${escapeHtml(err.message || err)}</div>`;
    }
}

const carrierCheckBtn = document.getElementById('carrierCheckBtn');
if (carrierCheckBtn) {
    carrierCheckBtn.addEventListener('click', checkCarrierLoadingPossibility);
}

const carrierCheckInput = document.getElementById('carrierCheckInput');
if (carrierCheckInput) {
    carrierCheckInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkCarrierLoadingPossibility();
    });
}

const showOnlyAllowedCarrier = document.getElementById('showOnlyAllowedCarrier');
if (showOnlyAllowedCarrier) {
    showOnlyAllowedCarrier.addEventListener('change', () => {
        const input = document.getElementById('carrierCheckInput');
        if (input && input.value.trim()) {
            checkCarrierLoadingPossibility();
        }
    });
}

const noteSearchBtn = document.getElementById('noteSearchBtn');
if (noteSearchBtn) {
    noteSearchBtn.addEventListener('click', searchNotes);
}

const noteSearchInput = document.getElementById('noteSearchInput');
if (noteSearchInput) {
    noteSearchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') searchNotes();
    });
}

const noteSearchClearBtn = document.getElementById('noteSearchClearBtn');
if (noteSearchClearBtn) {
    noteSearchClearBtn.addEventListener('click', clearNoteSearch);
}

// ==========================================================================
// Home Quick Search
// ==========================================================================

function runHomeLookupQuickSearch() {
    const homeInput = document.getElementById('homeLookupQuickInput');
    const targetInput = document.getElementById('lookupInput');

    if (!homeInput || !targetInput) return;

    const value = homeInput.value.trim();

    if (!value) {
        alert('UNNO를 입력해 주세요.');
        homeInput.focus();
        return;
    }

    activateTab('tab-lookup');

    targetInput.value = value;
    lookupDGInfo();
}

function runHomeCarrierQuickSearch() {
    const homeInput = document.getElementById('homeCarrierQuickInput');
    const targetInput = document.getElementById('carrierCheckInput');

    if (!homeInput || !targetInput) return;

    const value = homeInput.value.trim();

    if (!value) {
        alert('UNNO를 입력해 주세요.');
        homeInput.focus();
        return;
    }

    activateTab('tab-carrier-check');

    targetInput.value = value;
    checkCarrierLoadingPossibility();
}

function runHomeSegQuickSearch() {
    const homeInput = document.getElementById('homeSegQuickInput');
    const targetInput = document.getElementById('searchInput');

    if (!homeInput || !targetInput) return;

    const value = homeInput.value.trim();

    if (!value) {
        alert('UNNO를 입력해 주세요.');
        homeInput.focus();
        return;
    }

    activateTab('tab-segregation');

    targetInput.value = value;
    addEntries();
}

const homeLookupQuickBtn = document.getElementById('homeLookupQuickBtn');
if (homeLookupQuickBtn) {
    homeLookupQuickBtn.addEventListener('click', runHomeLookupQuickSearch);
}

const homeLookupQuickInput = document.getElementById('homeLookupQuickInput');
if (homeLookupQuickInput) {
    homeLookupQuickInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') runHomeLookupQuickSearch();
    });
}

const homeCarrierQuickBtn = document.getElementById('homeCarrierQuickBtn');
if (homeCarrierQuickBtn) {
    homeCarrierQuickBtn.addEventListener('click', runHomeCarrierQuickSearch);
}

const homeCarrierQuickInput = document.getElementById('homeCarrierQuickInput');
if (homeCarrierQuickInput) {
    homeCarrierQuickInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') runHomeCarrierQuickSearch();
    });
}

const homeSegQuickBtn = document.getElementById('homeSegQuickBtn');
if (homeSegQuickBtn) {
    homeSegQuickBtn.addEventListener('click', runHomeSegQuickSearch);
}

const homeSegQuickInput = document.getElementById('homeSegQuickInput');
if (homeSegQuickInput) {
    homeSegQuickInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') runHomeSegQuickSearch();
    });
}

// ==========================================================================
// SDS / MSDS DG Analyzer with Gemini API
// ==========================================================================

function getSdsStatusClass(status) {
    const s = String(status || '').toUpperCase();

    if (s === 'DG') return 'sds-status-dg';
    if (s === 'NON_DG' || s === 'NON-DG') return 'sds-status-nondg';
    return 'sds-status-unclear';
}

function getSdsStatusLabel(status) {
    const s = String(status || '').toUpperCase();

    if (s === 'DG') return 'DG';
    if (s === 'NON_DG' || s === 'NON-DG') return 'NON-DG';
    return 'UNCLEAR';
}

function renderSdsField(label, value) {
    return `
        <div class="sds-result-field">
            <div class="sds-result-label">${escapeHtml(label)}</div>
            <div class="sds-result-value">${escapeHtml(value || '-')}</div>
        </div>
    `;
}

function renderSdsList(title, items) {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];

    if (!list.length) {
        return '';
    }

    return `
        <div class="sds-result-list-box">
            <div class="sds-result-list-title">${escapeHtml(title)}</div>
            <ul>
                ${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </div>
    `;
}

function renderDgTableMatch(match) {
    if (!match) {
        return `
            <div class="sds-dgtable-box muted">
                기존 DG_TABLE과 매칭되는 UNNO를 찾지 못했습니다.
            </div>
        `;
    }

    return `
        <div class="sds-dgtable-box">
            <div class="sds-dgtable-title">DG_TABLE 대조 결과</div>
            <div class="sds-dgtable-grid">
                ${renderSdsField('UNNO', match.UNNO)}
                ${renderSdsField('Name', match.Name)}
                ${renderSdsField('Class', match.Class)}
                ${renderSdsField('SUB', match.SUB)}
                ${renderSdsField('PG', match.PG)}
                ${renderSdsField('Segregation', match.Segregation)}
            </div>
        </div>
    `;
}

function renderSdsAnalysisResult(payload) {
    const box = document.getElementById('sdsAnalysisResult');
    if (!box) return;

    const result = payload.result || {};
    const statusClass = getSdsStatusClass(result.dg_status);
    const statusLabel = getSdsStatusLabel(result.dg_status);

    box.className = 'sds-result-output';
    box.innerHTML = `
        <div class="sds-result-summary ${statusClass}">
            <div>
                <div class="sds-result-kicker">AI 1차 판독 결과</div>
                <div class="sds-result-status">${statusLabel}</div>
            </div>
            <div class="sds-confidence-badge">
                CONFIDENCE ${escapeHtml(result.confidence || 'LOW')}
            </div>
        </div>

        <div class="sds-result-grid">
            ${renderSdsField('Document Type', result.document_type)}
            ${renderSdsField('Product Name', result.product_name)}
            ${renderSdsField('Substance Name', result.substance_name)}
            ${renderSdsField('UNNO', result.unno)}
            ${renderSdsField('Proper Shipping Name', result.proper_shipping_name)}
            ${renderSdsField('Class', result.class)}
            ${renderSdsField('Subsidiary Risk', result.subsidiary_risk)}
            ${renderSdsField('Packing Group', result.packing_group)}
            ${renderSdsField('Marine Pollutant', result.marine_pollutant)}
            ${renderSdsField('Mode Basis', result.transport_mode_basis)}
            ${renderSdsField('Section 14 Found', result.section_14_found ? 'YES' : 'NO')}
            ${renderSdsField('Not Regulated Text', result.not_regulated_text_found ? 'YES' : 'NO')}
        </div>

        <div class="sds-basis-box">
            <div class="sds-result-list-title">판정 근거</div>
            <div>${escapeHtml(result.basis || '-')}</div>
        </div>

        ${renderSdsList('문서 내 근거 문구', result.evidence_quotes)}
        ${renderSdsList('주의사항', result.warnings)}
        ${renderDgTableMatch(payload.dg_table_match)}

        <div class="sds-disclaimer">
            ${escapeHtml(payload.disclaimer || 'AI 1차 판독 결과이며 최종 확인은 담당자가 수행해야 합니다.')}
        </div>
    `;
}

async function analyzeSdsDocument() {
    const fileInput = document.getElementById('sdsFileInput');
    const resultBox = document.getElementById('sdsAnalysisResult');
    const analyzeBtn = document.getElementById('sdsAnalyzeBtn');

    if (!fileInput || !resultBox || !analyzeBtn) return;

    const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    if (!file) {
        alert('분석할 PDF 파일을 선택해 주세요.');
        return;
    }

    if (file.type !== 'application/pdf') {
        alert('PDF 파일만 분석할 수 있습니다.');
        return;
    }

    const maxSize = 3 * 1024 * 1024;

if (file.size > maxSize) {
    alert('PDF 파일은 3MB 이하만 분석할 수 있습니다. 현재 Vercel 요청 용량 제한으로 인해 큰 PDF는 분석할 수 없습니다.');
    return;
}

    analyzeBtn.disabled = true;
    const originalText = analyzeBtn.innerText;
    analyzeBtn.innerText = 'AI 판독 중...';

    resultBox.className = 'sds-result-loading';
    resultBox.innerHTML = renderLoadingState(
        'SDS/MSDS 문서를 판독하는 중입니다',
        'Section 14 및 IMDG 기준 정보를 분석하고 있습니다.',
        'GEMINI DOCUMENT ANALYSIS'
    );

    try {
        const fileBase64 = await fileToBase64(file);

        const response = await fetch('/api/analyze-sds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_name: file.name,
                file_type: file.type,
                file_base64: fileBase64
            })
        });

        const payload = await readJsonResponse(response);

        if (!response.ok || !payload.ok) {
            throw new Error(payload.message || 'SDS/MSDS 분석 실패');
        }

        renderSdsAnalysisResult(payload);
    } catch (err) {
        console.error('SDS/MSDS 분석 오류:', err);
        resultBox.className = 'sds-result-output';
        resultBox.innerHTML = `
            <div class="error-msg">
                SDS/MSDS 분석 실패: ${escapeHtml(err.message || err)}
            </div>
        `;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = originalText;
    }
}

function updateSdsFileStatus() {
    const fileInput = document.getElementById('sdsFileInput');
    const status = document.getElementById('sdsFileStatus');

    if (!fileInput || !status) return;

    const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    if (!file) {
        status.innerHTML = '';
        return;
    }

    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    status.innerHTML = `
        <span>${escapeHtml(file.name)}</span>
        <span>${sizeMb} MB</span>
    `;
}

const sdsAnalyzeBtn = document.getElementById('sdsAnalyzeBtn');
if (sdsAnalyzeBtn) {
    sdsAnalyzeBtn.addEventListener('click', analyzeSdsDocument);
}

const sdsFileInput = document.getElementById('sdsFileInput');
if (sdsFileInput) {
    sdsFileInput.addEventListener('change', updateSdsFileStatus);
}

// ==========================================================================
// Theme Manager
// ==========================================================================

const DG_THEME_STORAGE_KEY = 'dg-assistant-theme';
const DG_ALLOWED_THEMES = ['bright', 'dark'];
const DG_DEFAULT_THEME = 'bright';

function getStoredTheme() {
    try {
        const storedTheme = localStorage.getItem(DG_THEME_STORAGE_KEY);
        return DG_ALLOWED_THEMES.includes(storedTheme) ? storedTheme : DG_DEFAULT_THEME;
    } catch (error) {
        return DG_DEFAULT_THEME;
    }
}

function updateThemeToggleLabel(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) return;

    themeToggleBtn.classList.toggle('is-bright', theme === 'bright');
    themeToggleBtn.classList.toggle('is-dark', theme === 'dark');

    if (!themeToggleBtn.querySelector('.theme-toggle-option')) {
        themeToggleBtn.innerHTML = `
            <span class="theme-toggle-option theme-toggle-bright">BRIGHT MODE</span>
            <span class="theme-toggle-option theme-toggle-dark">DARK MODE</span>
        `;
    }

    if (theme === 'dark') {
        themeToggleBtn.setAttribute('aria-label', 'Switch to Bright Mode');
        return;
    }

    themeToggleBtn.setAttribute('aria-label', 'Switch to Classic Dark Mode');
}

function applyTheme(theme) {
    const safeTheme = DG_ALLOWED_THEMES.includes(theme) ? theme : DG_DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', safeTheme);

    try {
        localStorage.setItem(DG_THEME_STORAGE_KEY, safeTheme);
    } catch (error) {
        // localStorage may be blocked in restricted browser contexts.
    }

    updateThemeToggleLabel(safeTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || getStoredTheme();
    applyTheme(currentTheme === 'bright' ? 'dark' : 'bright');
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    applyTheme(getStoredTheme());
    themeToggleBtn.addEventListener('click', toggleTheme);
} else {
    document.documentElement.setAttribute('data-theme', getStoredTheme());
}

/* ═══════════════════════════════════════════════════════════════
   FAQ + 문의 게시판 모듈 v1.0 — DG_ASSISTANT 통합 (2026-06-02)
   ═══════════════════════════════════════════════════════════════ */
const FQ_CONFIG = {
  FAQ_KEY:    'dg_assistant_faq_v3',
  BOARD_KEY:  'dg_assistant_board_v1',
  ADMIN_SESSION_KEY: 'dg_assistant_admin_v1',
  // 비밀번호 'admin1234' SHA-256 해시
  ADMIN_PWD_HASH: 'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270',
  EXPORT_FILENAME: 'dg_assistant_inquiry_export',
  REPLY_PWD: '1234'   // 담당자 답글 비밀번호
};

// 게시판 답변·이메일 업로드가 자동 등록되는 FAQ 카테고리
const FQ_BOARD_FAQ_CAT = '💬 게시판 문의';
const FQ_EMAIL_FAQ_CAT = '📧 이메일 문의';

// ───── DG 관련 시드 FAQ (사이트 분석 기반) ─────
let FQ_FAQ_DATA = {
  "categories": [
    "🧭 위험물 판정 기준",
    "🚫 전면 금지 화물",
    "🔋 리튬 배터리",
    "🚗 차량 / EV",
    "🔥 인화성 (Cl.3)",
    "⚗️ 부식성 (Cl.8)",
    "💥 산화/자연발화",
    "🌊 해양 오염 물질",
    "💨 에어로졸 / 가스",
    "🧴 Flexitank / IBC",
    "❄️ RFDG (Reefer DG)",
    "📐 OOG / Heavy / Coil",
    "📋 절차 / PRE-CHECK",
    "📄 서류 (MSDS/DGD)",
    "📦 적재 / 격리",
    "🏗️ 항만별 제한",
    "🚢 선사별 비교",
    "⚠️ 특별 규정 / LQ",
    "📘 IMDG 전문지식",
    "🧪 Class별 세부 규정",
    "🚨 사고 / 손상 대응"
  ],
  "items": [
    {
      "id": "gen-msds-decide",
      "cat": "🧭 위험물 판정 기준",
      "q": "위험물인지 아닌지 어떻게 판단하나요? (MSDS 어디를 봐야 하나요?)",
      "a": "안녕하세요. 위험물 여부는 화주께서 받으신 **MSDS의 14번 운송정보** 섹션을 먼저 확인해 주시면 가장 정확하게 판단할 수 있습니다.\n\n**1. CLASS / UN No. 기재 여부 확인**\n- MSDS 14번에 IMDG / Class / UN번호가 적혀 있다면 위험물에 해당합니다.\n- 운송방식(해상·육상·항공) 구분이 없더라도 CLASS·UN번호가 표기되어 있으면 위험물로 분류하고 있습니다.\n\n**2. 인화점도 함께 확인 부탁드립니다 (MSDS 9번)**\n- Flash Point가 **60°C 이하**라면 인화성 위험물(Class 3)일 가능성이 매우 높습니다.\n- 60°C를 초과하더라도 독성·부식성 등 다른 위험성으로 인해 위험물에 해당할 수 있으니, 전체 MSDS를 함께 검토해 주시기 바랍니다.\n\n**3. 독성·환경유해성 확인 (MSDS 12번)**\n- LC50 / EC50 / NOEC 수치를 확인해 주시기 바랍니다 (48~96h 노출 기준).\n- 어느 하나라도 **1 mg/L 이하** 반응이 있다면 환경유해성 물질에 해당하며, 액체는 **UN3082**, 고체는 **UN3077**로 운송하게 됩니다.\n- 예: 어류 LC50 0.12 mg/L(96h) 등급은 UN3082/3077에 해당합니다.\n\n**4. 배터리 화물의 경우**\n- MSDS에 SPxx (예: SP188, SP230) 기재 시 추가 확인이 필요합니다.\n- UN 38.3 시험 통과 + 100Wh / 2g 이하 조건을 충족하시면 비위험물 취급도 가능합니다.\n\n판단이 어려우신 경우에는 MSDS 전체 PDF를 첨부해 DG Center로 문의 주시면 신속하게 확인 도와드리겠습니다.",
      "tags": [
        "MSDS",
        "판정",
        "인화점",
        "환경유해성",
        "기본"
      ]
    },
    {
      "id": "gen-flashpoint",
      "cat": "🧭 위험물 판정 기준",
      "q": "인화점(Flash Point)이 몇 도 이하면 위험물인가요?",
      "a": "MSDS 9번 섹션의 Flash Point가 **60°C 이하**이면 인화성 위험물(Class 3)로 분류하고 있습니다.\n\n**Packing Group 세분류**\n- **PG I** : 인화점 < 23°C **이면서** 초기 끓는점 ≤ 35°C\n- **PG II** : 인화점 < 23°C, 끓는점 > 35°C\n- **PG III** : 인화점 23~60°C\n\n**자주 문의주시는 경계 사례**\n- 인화점이 60.5°C 등 60°C 근접한 경우, IMDG 기준상 60°C를 초과하면 비위험에 해당합니다. 다만 측정 오차 가능성이 있어 화주께 정확한 인화점 재확인을 권장드립니다.\n- 100% 농도와 희석 농도에서 인화점이 다르게 나타날 수 있으니, 실제 출하 상태 기준의 값을 확인해 주시기 바랍니다.\n- 알코올류(에탄올·메탄올 등)는 대부분 PG II에 해당합니다.\n\n자세한 분류 기준은 IMDG Code 2.3장(Class 3)을 참조해 주시기 바랍니다.",
      "tags": [
        "인화점",
        "Class 3",
        "PG",
        "MSDS"
      ]
    },
    {
      "id": "pro-charcoal",
      "cat": "🚫 전면 금지 화물",
      "q": "숯(Charcoal, UN1361)은 선적 가능한가요?",
      "a": "죄송합니다만, 숯(UN1361)은 장금상선 및 흥아라인에서 **전면 선적 금지**로 운영하고 있습니다. 위험물뿐 아니라 SP925·SP978 비위험물 취급 건도 모두 포함됩니다.\n\n**금지 사유 (자사 화재 사고)**\n저희도 안전상의 사유로 부득이 금지 결정을 유지하고 있으며, 다음과 같은 사고 사례가 있었습니다.\n\n1. **2018 CHARLIE호** — 싱가폴 양적하 작업 중 치타공발 숯 컨테이너에서 화재가 발생하였고, 처리 지연으로 거액의 컨테이너 장치료가 발생한 사례가 있습니다.\n2. **2022.05 MANILA VOYAGER호** — 호치민→광양 항해 중 자카르타발 숯(비위험물 취급 건)에서 발화가 발생하였습니다. 5/7 1차 진압 후 5/9 잔불이 재발화되어 5/10 광양 도착 후 최종 진압되었으며, 진압 과정에서 선원 1명이 연기 흡입으로 병원 이송된 안타까운 사고였습니다.\n\n**규정 변경 사항 (2026.01.01 이후)**\n- IMDG 개정으로 4G BOX 골판지 용기(낙하·겹침선적 시험 통과품) 사용이 의무화되었습니다.\n- 기존 진공포장 방식은 불가능하게 되었습니다.\n- KMTC도 2025년 12월부터 숯 선적을 금지하고 있으며, 머스크 등 타 선사도 선적 제한을 검토 중입니다.\n\n**대체 정보 안내**\n- 활성탄(Activated Carbon, UN1362) 역시 동일한 사유로 금지되고 있습니다.\n- 카본 블랙(Carbon Black, 일반 산업용 INK/RUBBER/TIRE/PAINT/PLASTIC 원료)은 비위험물 건에 한해 선적이 가능하니, 별도 카본블랙 FAQ를 참고해 주시면 감사하겠습니다.\n\n양해 부탁드리며, 추가 문의 사항 있으시면 운항팀으로 연락 주시기 바랍니다.",
      "tags": [
        "숯",
        "Charcoal",
        "활성탄",
        "전면 금지",
        "화재 사고"
      ]
    },
    {
      "id": "pro-carbon-black",
      "cat": "🚫 전면 금지 화물",
      "q": "Carbon Black(카본블랙)은 선적 가능한가요?",
      "a": "Carbon Black은 원료와 용도에 따라 선적 가부가 달라집니다. 아래 내용 참고해 주시면 도움이 되실 듯합니다.\n\n**선적 가능 (비위험물)**\n다음 용도의 카본블랙은 정상 선적이 가능합니다.\n- INK · RUBBER · TIRE · PAINT · PLASTIC 원료용 카본블랙\n- Mineral Origin(석유·타르)으로부터 화학적 공정으로 생산된 인공 카본블랙\n- 국내 대표 제조사: OCI, 비를라(Birla), Carbon Tech 등\n\n**선적 금지**\n다음 케이스는 안전상의 사유로 선적이 어려운 점 양해 부탁드립니다.\n- CHARCOAL을 잘게 쪼갠 형태 (인도네시아·베트남산 숯 부산물)\n- **4.2 / 1361 CARBON animal or vegetable origin** 표기 건\n→ 위 두 가지는 위험물·비위험물 모두 금지 대상이며, 숯 규정이 동일하게 적용됩니다.\n\n**판단을 도와드리는 절차**\n1. 생산자(제조사) 정보를 먼저 확인 부탁드립니다.\n2. MSDS 상의 원재료와 생산 공정 내용을 살펴봐 주시기 바랍니다.\n3. 형태가 POWDER/PELLET이라 하더라도 4.2/1361 표기가 있으면 금지에 해당합니다.\n4. 모호한 경우 화주께 원재료를 한 번 더 확인 요청 부탁드립니다.\n\n**2026.01.01 이후 유의 사항**\n- 4.2/1361 비위험물 취급 규정이 삭제되었습니다.\n- MSDS상 비위험물로 표기되어 있더라도 4.2/1361 표기가 있으면 선적이 어려우니, 화주께 다시 한 번 확인을 요청 부탁드립니다.",
      "tags": [
        "Carbon Black",
        "카본블랙",
        "조건부",
        "원재료 확인"
      ]
    },
    {
      "id": "pro-3378",
      "cat": "🚫 전면 금지 화물",
      "q": "과탄산나트륨(UN3378) 선적 가능한가요?",
      "a": "과탄산나트륨(UN3378)은 현재 장금/흥아에서 **선적 금지** 화물로 운영하고 있습니다(DRY DG 기준). 안전상의 사유로 운영 중인 점 양해 부탁드립니다.\n\n**제품 특성 안내**\n- Class 5.1 (산화성 물질) / UN 3378\n- 별칭: 과탄산소다, Sodium Percarbonate\n- 발열분해온도 **+60°C** — 물·산류 접촉 시 열분해 + 발화 위험이 있습니다.\n\n**사고 사례**\n- **2017.08.13 의왕시 오봉역 화재** — 노후 컨테이너에 빗물이 침투된 상태에서 하절기 고온으로 열분해 반응이 일어나 내부 포장재가 발화한 사례가 있습니다.\n\n**참고: 선사별 정책 비교**\n| 선사 | 정책 |\n|---|---|\n| 장금/흥아 / 남성·동영 / 고려 | 금지 |\n| 팬오션 / 동진 | 일본구간 허용 |\n| HMM / 천경 | 일본구간 허용 |\n| 완하이 / TSL | 금지 |\n| SM / ONE / 머스크 / 양밍 | 허용 |\n\n**RFDG 검토 진행 중**\n현재 일본구간(TYO/HKT/NGO/MOJ/OSA/UKB) 출하 OCI 측 요청에 따라, RFDG(냉동) 컨테이너로 온도 통제 시 안정성 확보가 가능한지 검토하고 있습니다. 월 60대 / 운임 $1,000 수준으로 예상하고 있으며, 진행 시 별도 안내드리겠습니다.",
      "tags": [
        "과탄산나트륨",
        "Sodium Percarbonate",
        "Class 5.1",
        "금지",
        "RFDG 검토"
      ]
    },
    {
      "id": "li-3480",
      "cat": "🔋 리튬 배터리",
      "q": "UN3480 (Lithium Ion Battery, 단독) 선적 가능한가요?",
      "a": "UN3480 리튬이온 배터리는 제조사·SOC·서류 조건을 모두 충족하시면 선적이 가능합니다. 다만 안전상 RFDG 진행 등 몇 가지 필수 조건이 있어 사전 확인 부탁드립니다.\n\n**1. 위험물 취급 (RFDG 진행)**\n- ✅ **삼성 SDI / LG에너지솔루션 / SK On** — 3사 제조 건에 한해 RFDG 진행이 가능합니다.\n- ❌ 그 외 제조사(중국 BYD·CATL 등)는 진행이 어려운 점 양해 부탁드립니다.\n- **모든 위험물 건은 RFDG가 필수**이며, DRY DG로는 진행이 불가합니다.\n\n**2. 비위험물 취급 (SP188 적용)**\n- 셀 **20Wh 이하** 또는 배터리 **100Wh 이하**이신 경우 NON-DG DRY 컨테이너로 진행 가능합니다.\n- MSDS 1.5 항목의 Wh rating을 확인 부탁드립니다.\n\n**3. 공통적으로 확인 부탁드리는 사항**\n- UN 38.3 시험성적서(제조사 발급) 첨부 부탁드립니다.\n- MSDS 14번에 UN3480이 명시되어 있어야 합니다.\n- 손상·리콜·리퍼브 배터리는 선적이 어려운 점 양해 바랍니다.\n- 위험물 건은 DGD에 SOC ≤ 30%를 명시해 주시기 바랍니다.\n- 외부 포장의 단락 방지(양극 단자 절연)를 확인해 주시면 감사하겠습니다.\n\n**적용 Remark 코드**\n- SP188 (소형 배터리 비위험물 취급)\n- SP230 (운송 일반 조건)\n- SP310 (시제품 / 소량 생산 추가 조건)",
      "tags": [
        "리튬배터리",
        "Lithium Ion",
        "Class 9",
        "RFDG",
        "삼성 LG SK"
      ]
    },
    {
      "id": "li-3090-3091",
      "cat": "🔋 리튬 배터리",
      "q": "UN3090 / UN3091 (리튬 금속 배터리) 선적 가능한가요?",
      "a": "리튬 금속 배터리(UN3090·UN3091)는 현재 장금/흥아에서 **전면 선적 금지**로 운영하고 있습니다. SP188 비위험물 취급 건도 포함되며, 안전상의 사유로 부득이 운영 중인 점 양해 부탁드립니다.\n\n**제품 특성 (위험성)**\n- 1차 전지(충전 불가) — 100% 완충 상태로 출고됩니다.\n- 음극재가 리튬 금속이라 수분 접촉 시 폭발 위험이 있습니다.\n- 2차 전지(리튬이온) 대비 **열폭주 위험성이 훨씬 높습니다.**\n\n**1차 / 2차 전지 구분**\n| 항목 | 1차 전지 (3090/3091) | 2차 전지 (3480/3481) |\n|---|---|---|\n| 충전 | 불가 | 가능 |\n| 음극재 | 리튬 금속 | 흑연 |\n| 출하 충전율 | 100% | 30% 미만 |\n\n**SP387 (메탈+이온 혼합 전지)**\n리튬메탈 셀과 리튬이온 셀을 함께 포함한 배터리는 SP387에 따라 **UN3090/3091**(메탈 기준)으로 분류됩니다. (SP388은 차량 UN3166/3171용)\n\n**금지 결정의 배경 (사고 사례)**\n- **2024.06.24 아리셀 화성공장 화재** — 비의 영향으로 불량 배터리가 수분과 반응하여 열폭주가 발생하였고, 대형 화재로 번지며 인명 피해까지 이어진 사고가 있었습니다. 배터리 화재는 소화가 불가능하고 유독가스가 발생하여 매우 위험합니다.\n\n**참고: 선사별 정책**\n| 선사 | 9/3090 위험물 | 9/3091 SP188 비위험물 |\n|---|---|---|\n| 장금/흥아 / HMM / 고려 / 남성·동영 / 천경 | 금지 | 금지 |\n| 동진 | 금지 | 허용 |\n| 완하이 (해외) | 9/3090, 3480, 3481 모두 금지 | - |\n| 그 외 해외선사 | 허용 | 허용 |\n\n파나소닉 코인 배터리 등 일상용 1차 전지도 동일하게 적용되니 참고 부탁드립니다.",
      "tags": [
        "리튬금속",
        "Class 9",
        "전면 금지",
        "1차전지",
        "아리셀"
      ]
    },
    {
      "id": "li-ev-cell",
      "cat": "🔋 리튬 배터리",
      "q": "EV 배터리 셀(전기차용) 선적 시 승인 제조사는?",
      "a": "EV 배터리 셀 중 위험물 취급 건은 안전 검증을 거친 승인 제조사 제품에 한해 선적이 가능합니다.\n\n**✅ 승인 제조사 (MSDS 'Manufacture' 정보 기준)**\n- 삼성 SDI\n- LG 에너지솔루션 (LG Chem 포함)\n- SK On\n\n**❌ 거절 안내**\n- 중국·기타 해외 제조사(BYD, CATL, EVE, Gotion 등)는 현재 선적이 어려운 점 양해 부탁드립니다.\n- 신규 거래 시 제조사 정보를 사전에 확인해 주시면 신속한 검토가 가능합니다.\n\n**제조사 확인 방법**\n1. MSDS 1번(제품 식별) — 제조사명, 주소 확인\n2. 배터리 본체 라벨 사진 첨부 부탁드립니다.\n3. UN 38.3 시험성적서 발행처도 함께 확인 부탁드립니다.\n\n**모든 위험물 건 RFDG 필수**\n- DRY DG로는 진행이 어려운 점 양해 바랍니다 (예외 없음).\n- 닝보 입항 시 6시간 간격 온도 모니터링이 요구되니 사전 안내 드립니다.\n\n신규 제조사 추가는 별도 협의가 필요합니다 (사고 발생 시 책임 및 제품 신뢰성 검증 후 진행).",
      "tags": [
        "EV 배터리",
        "삼성 LG SK",
        "승인 제조사",
        "RFDG"
      ]
    },
    {
      "id": "li-3481",
      "cat": "🔋 리튬 배터리",
      "q": "UN3481 (장비에 포함/패킹된 리튬이온 배터리) 절차는?",
      "a": "UN3481은 UN3480 대비 완화된 조건으로 선적이 가능한 화물입니다. 다만 위험물 취급 시에는 동일하게 승인 제조사 조건이 적용되니 참고 부탁드립니다.\n\n**1. 비위험물 (SP188)**\n- 100Wh 이하 / 셀 20Wh 이하의 경우 NON-DG DRY 진행이 가능합니다.\n- 4개 셀 이하 / 배터리 2개 이하가 동봉된 장비(장비 내장형)는 SP188 적용 검토가 가능합니다.\n\n**2. 위험물 (RFDG)**\n- 100Wh 초과 시 위험물로 분류됩니다.\n- ✅ **삼성/LG/SK 3사 제조 건에 한해 RFDG 진행 가능**\n- 위험물 건은 예외 없이 RFDG가 필수인 점 양해 부탁드립니다.\n\n**3. 9/3481 + 9/3480 동시 (장비 + 별도 동봉 배터리)**\n- SP188 조건 미충족 시에는 더 위험한 쪽 기준으로 분류됩니다.\n- 9/3091 (1차 전지 동봉) 시: 1차 전지가 주 위험물이 되어 **9/3091**로 처리됩니다.\n\n**4. 공통 확인 사항**\n- UN 38.3 시험성적서는 필수입니다.\n- 장비 구동 시험 및 단락 방지 확인 부탁드립니다.\n- 손상·리콜 배터리는 선적이 어려운 점 양해 바랍니다.",
      "tags": [
        "리튬배터리",
        "장비 내장",
        "SP188",
        "RFDG"
      ]
    },
    {
      "id": "veh-3166",
      "cat": "🚗 차량 / EV",
      "q": "UN3166 (가스/액체 연료 차량) 선적 절차는?",
      "a": "UN3166 차량은 연료 잔량 및 안전 조치를 충족하시면 선적이 가능합니다. 아래 사항 확인 후 진행 부탁드립니다.\n\n**가솔린·디젤 차량**\n- 연료탱크는 **1/4 미만** 충전 부탁드립니다.\n- 연료 캡과 밸브의 누유 방지를 확인해 주시기 바랍니다.\n- 배터리 단자는 절연 처리해 주시면 감사하겠습니다.\n\n**LPG / CNG 차량**\n- 가스 잔량은 **1/4 미만**이어야 합니다.\n- 밸브 폐쇄 상태를 꼭 확인 부탁드립니다.\n- 압력 시험 기록도 함께 준비해 주시면 좋습니다.\n\n**필요 서류**\n- MSDS\n- 차량등록증 (또는 동등 서류)\n- 차량 사진 (외관·연료 상태가 확인되는 사진)\n- 보험증명\n\n**선적이 어려운 경우**\n다음 케이스는 안전상 사유로 선적이 어려운 점 양해 부탁드립니다.\n- 누유 흔적이 있는 경우\n- 사고 이력 / 외관 손상이 확인되는 경우\n- 일부 항만의 차량 사전 승인을 받지 못한 경우\n\n**적용 Remark**\n- SP240 (차량 일반 조건)\n- SP312 (가스 연료 차량)\n- 전기차(배터리 구동)는 별도 **UN3556**(SP389)로 분류",
      "tags": [
        "차량",
        "Vehicle",
        "Class 9"
      ]
    },
    {
      "id": "veh-3556",
      "cat": "🚗 차량 / EV",
      "q": "UN3556 (배터리 구동 차량 / EV) 선적 가능한가요?",
      "a": "현재 UN3556(리튬 배터리 구동 차량)은 장금/흥아에서 **\"Prohibited DG\"로 분류 추진 중**입니다(Ver.12 반영 예정). 선적을 검토하시는 경우 사전에 운항팀으로 문의 부탁드립니다.\n\n**현재 상황 안내**\n- 전기차, 전동 휠체어, 전기 자전거 등 리튬 배터리 구동 차량이 해당됩니다.\n- 시미즈항(일본 야마하 모터) 등 일부 출하 사례에서 사전 등록이 요구되고 있습니다.\n- 안전성 검토 결과 Prohibited DG로 전환 추진 중입니다.\n\n**전환 전 가능 조건 (참고)**\n- 장착 배터리의 UN 38.3 시험성적서가 필요합니다.\n- SOC ≤ 30%를 유지해 주시기 바랍니다.\n- 외부 충전기는 분리 후 별도 포장해 주시면 감사하겠습니다.\n- 단락 방지 및 차량 간 최소 거리 확보를 부탁드립니다.\n\n**해외 일부 노선**\n- Shimizu 항: 사전 위험화물 등록(Hazardous Cargo Registration)이 필요합니다.\n- 그 외 항만은 출하지·도착지별로 별도 확인 부탁드립니다.",
      "tags": [
        "전기차",
        "EV",
        "Prohibited 예정"
      ]
    },
    {
      "id": "fl-1263",
      "cat": "🔥 인화성 (Cl.3)",
      "q": "UN1263 (페인트 / 래커) 선적 가능한가요?",
      "a": "UN1263 페인트류는 Class 3에 해당하며, 포장등급(PG)에 따라 조건을 충족하시면 선적이 가능합니다.\n\n**PG별 안내**\n- **PG I** (인화점 < 23°C, 끓는점 ≤ 35°C) — 일부 노선 제한이 있으며 갑판 적재로 진행됩니다.\n- **PG II / III** — 정상 선적 가능, UN 인증 포장재가 필요합니다.\n\n**Limited Quantity (LQ) 적용 시**\n- 5L 이하 내포장의 경우\n- 외부 박스에 LQ 마크를 부착해 주시기 바랍니다.\n- 일부 규정 완화가 가능합니다.\n\n**필요 서류**\n- MSDS (인화점·끓는점·SP163/SP223 확인)\n- DGD\n- UN 인증 포장재 마킹 사진\n\n**Marine Pollutant 동반 시 추가 조치**\n- DGD에 MP를 명시해 주시기 바랍니다.\n- 외부에 Marine Pollutant Mark 부착이 필요합니다.\n- SP335가 적용됩니다.",
      "tags": [
        "페인트",
        "Class 3",
        "Paint"
      ]
    },
    {
      "id": "co-1790",
      "cat": "⚗️ 부식성 (Cl.8)",
      "q": "UN1790 (불산 / Hydrofluoric Acid) 운송 절차는?",
      "a": "불산은 고위험 부식성 물질이라 **사전 PRE-CHECK가 필수**입니다. 선적 검토 시 미리 운항팀으로 연락 부탁드립니다.\n\n**분류 / 포장 안내**\n- 농도에 따라 **PG I 또는 PG II**로 분류됩니다.\n- **PTFE 라이닝** 내산 용기 또는 UN 인증 IBC를 사용해 주셔야 합니다.\n- 50% 이상 농도의 경우 PG I (특별 관리 대상)으로 처리됩니다.\n\n**필요 서류 / 라벨**\n- MSDS (영문 + 한글) 모두 준비 부탁드립니다.\n- DGD\n- 외부 라벨 + 응급 처치 카드 부착이 필요합니다.\n- 비상연락처를 함께 명시해 주시면 감사하겠습니다.\n\n**적재 및 격리 안내**\n- Segregation Group **1 (Acids)** — 식품·유기물과는 \"Separated from\" 격리가 필요합니다.\n- 알칼리·시안화물과도 격리해 주셔야 합니다 (반응성).\n- 갑판 적재를 권장드립니다.\n\n**항만 제한 안내**\n- 부산 신항: 특정 부두에서만 가능합니다.\n- 일부 중국 항만은 사전 승인이 필요합니다.\n\n응급 대응 SOP를 사전에 합의해 주셔야 하며, 누출 시 즉시 통제가 가능한 체계가 갖춰져야 합니다.",
      "tags": [
        "부식성",
        "불산",
        "Hydrofluoric",
        "PRE-CHECK 필수"
      ]
    },
    {
      "id": "co-1789",
      "cat": "⚗️ 부식성 (Cl.8)",
      "q": "UN1789 (염산 / Hydrochloric Acid) 선적 요건?",
      "a": "염산은 일반 부식성 물질에 해당하며, 표준 절차로 선적이 가능합니다.\n\n**기본 요건**\n- PG II/III, 농도별로 분류됩니다.\n- UN 인증 IBC 또는 드럼(HDPE 권장)을 사용해 주시기 바랍니다.\n- MSDS와 DGD를 함께 제출 부탁드립니다.\n- **Segregation Group 1 (Acids)** — 알칼리·시안화물과 격리가 필요합니다.\n- 일부 노선의 환적 시에는 추가 승인이 필요할 수 있습니다.\n\n**자주 문의주시는 사항**\n- 농도 37% 이상의 경우 발연 시 추가 안전 조치를 권장드립니다.\n- IBC 사용 시 1년 이내 재인증 여부를 확인 부탁드립니다.\n- 식품 컨테이너와는 \"Separated from\" 격리가 적용됩니다.",
      "tags": [
        "부식성",
        "염산",
        "Class 8"
      ]
    },
    {
      "id": "oxi-3378-detail",
      "cat": "💥 산화/자연발화",
      "q": "산화성 물질(Class 5) 일반 절차는?",
      "a": "산화성 물질은 분해온도와 격리 조건을 잘 관리해 주시면 정상 진행이 가능한 화물군입니다.\n\n**Class 분류**\n- **Class 5.1** — 산화성 물질\n- **Class 5.2** — 유기 과산화물\n\n**핵심 위험성**\n- 다른 가연물과 접촉 시 발화 / 폭발 위험이 있습니다.\n- 열·물·산류 접촉 시 분해되어 발화 가능성이 있습니다.\n\n**적재 안내**\n- Class 3 (인화성)과는 \"Separated from\" 격리가 필요합니다.\n- Class 4.x (가연성 고체)와는 \"Away from\" 격리가 필요합니다.\n- 5.2 (유기 과산화물)는 온도 통제가 필요합니다 (특정 SADT 기준 적용).\n\n**필요 서류**\n- MSDS (분해 온도 / SADT 명시)\n- DGD (UN No, Class, PG, 분해온도 부기)\n- 일부 항만은 사전 승인이 필요합니다.\n\n**자사 사례 안내 — UN3378 과탄산나트륨**\n- 발열분해온도 +60°C로 하절기 위험이 증가합니다.\n- 의왕 오봉역 사고(2017.08) 이후 장금/흥아는 금지로 운영하고 있습니다.\n- RFDG(냉동 컨테이너) 진행 시 온도 통제 안정성 확보가 가능한지 일본구간에서 검토 중입니다.\n\n**자사 사례 — UN3377 / UN1942 등**\n- 정책은 별도로 확인이 필요합니다 (대부분 PRE-CHECK 후 결정).",
      "tags": [
        "산화성",
        "Class 5",
        "분해온도",
        "SADT"
      ]
    },
    {
      "id": "gen-marine-decide",
      "cat": "🌊 해양 오염 물질",
      "q": "Marine Pollutant(해양오염) 판정 기준은?",
      "a": "Marine Pollutant 여부는 MSDS 12번 환경 유해성 섹션에서 다음 수치를 확인하시면 판단 가능합니다.\n\n**확인해 주실 수치**\n- **LC50** (Lethal Concentration 50%) — 어류 96h 시험 기준\n- **EC50** (Effect Concentration 50%) — 갑각류 48h, 조류 72h 시험\n- **NOEC** (No Observed Effect Concentration) — 만성 노출 시험\n\n**판정 기준 (IMDG 2.10)**\n- 위 수치 중 **어느 하나라도 1 mg/L 이하**일 경우 Marine Pollutant에 해당합니다.\n- 액체 → **UN3082** (Environmentally Hazardous Substance, Liquid, N.O.S.) Class 9\n- 고체 → **UN3077** (Environmentally Hazardous Substance, Solid, N.O.S.) Class 9\n\n**의무 사항 안내**\n- Marine Pollutant Mark를 외부에 부착해 주셔야 합니다.\n- DGD에 \"Marine Pollutant\"를 명시해 주시기 바랍니다.\n- SP274 / SP335가 적용되며, 정확한 성분명을 부기해 주셔야 합니다.\n- 적재는 갑판(데크)을 권장드리며, 누출 시 환경 영향 최소화 및 점검 용이성을 고려한 조치입니다.\n\n* 일부 항만(상해·닝보)은 CAS No. 기반으로 추가 확인이 필요한 점 참고 부탁드립니다.",
      "tags": [
        "Marine Pollutant",
        "환경유해성",
        "LC50",
        "Class 9"
      ]
    },
    {
      "id": "ma-3082",
      "cat": "🌊 해양 오염 물질",
      "q": "UN3082 (해양 오염 물질, 액체) 선적 절차는?",
      "a": "UN3082는 적절한 표기와 서류를 충족하시면 선적이 가능합니다. 아래 사항 참고 부탁드립니다.\n\n**표준 답신 (해외 파트너 대응 시)**\n> \"We would accept your DG application subject to your slot allocation and provided that the DG cargo is properly packed, labeled and documented in accordance with IMO regulations and the laws or regulations in force at the port of shipment, the port of discharge and any scheduled port of call.\"\n\n**필수 확인 사항**\n1. **Marine Pollutant Mark**를 외부에 부착해 주시고 DGD에도 명시 부탁드립니다.\n2. MSDS 상의 정확한 성분이 기재되어 있는지 확인 부탁드립니다.\n3. 일반 화학물질에 Marine Pollutant 표기가 추가되는 경우, Class 9 신고가 필수입니다.\n4. IMDG 2.10 / SP274 (정확한 성분명 부기)에 따라 처리됩니다.\n5. **SHA / NGB 항만의 local restriction을 추가로 확인해 주시기 바랍니다** (CAS No. 기준).\n6. 본 금지 리스트에 없는 application은 자동 취소되니, 사전 확인 부탁드립니다.\n\n**적재 안내**\n- 갑판 적재를 권장드립니다 (누출 시 환경 보호 + 점검 용이성 확보).\n- Stowage Category A/B에 해당합니다.",
      "tags": [
        "해양오염",
        "Marine Pollutant",
        "UN3082"
      ]
    },
    {
      "id": "ma-3077",
      "cat": "🌊 해양 오염 물질",
      "q": "UN3077 (해양 오염 물질, 고체) 절차는?",
      "a": "UN3077은 UN3082(액체)와 동일한 원칙으로 처리하며, Marine Pollutant 표기와 서류만 충족하시면 선적 가능합니다.\n\n**주요 확인 사항**\n- 포장의 견고성을 확인해 주시기 바랍니다 (포장재 내수성 포함).\n- DGD에 정확한 PSN과 MP를 함께 부기 부탁드립니다.\n- 환경 영향 평가 보고 시에는 갑판 위치를 우선해 적재합니다.\n\n**자주 문의주시는 사례**\n- CLASS 9 / UN3077 / PG III 일반 acceptance는 슬롯 확보 + 표준 IMO 표기를 충족하시면 가능합니다.\n- 일부 노선(특히 러시아 VVO·SHA·NGB)은 local restriction을 추가로 확인 부탁드립니다.\n- Reefer 컨테이너 사용도 가능합니다 (RFDG 진행 시 비용은 별도입니다).",
      "tags": [
        "해양오염",
        "Marine Pollutant",
        "Solid",
        "UN3077"
      ]
    },
    {
      "id": "fl-1950",
      "cat": "💨 에어로졸 / 가스",
      "q": "UN1950 (에어로졸) 선적 시 주의사항은?",
      "a": "에어로졸은 인화성 여부에 따라 분류가 달라지며, 포장·적재 조건만 충족하시면 정상 선적이 가능합니다.\n\n**분류 구분**\n- **인화성 에어로졸 (Class 2.1)** — 화염 분사 시험 양성\n- **비인화성 에어로졸 (Class 2.2)** — 음성\n\n**포장 권장 사항**\n- 캔당 1L 이하 + 박스당 30kg 이하를 권장드립니다.\n- UN 인증 포장재를 사용하시고 누설 시험을 완료해 주시기 바랍니다.\n- 안전 밸브 작동 여부도 함께 확인 부탁드립니다.\n\n**적재 시 유의 사항**\n- **온도 50°C 이상 노출은 피해 주시기 바랍니다** → 데크 적재 시 위치 제한이 있을 수 있습니다.\n- 직사광선과 충격을 피해 주시기 바랍니다.\n\n**필요 서류**\n- MSDS + DGD\n- 누설 시험 인증서 (요청 시)\n\n**LQ 적용**\n- 캔당 1L 이하이신 경우 LQ 적용이 가능합니다 (외부 마크 부착 필요).\n\n**관련 Remark**\n- SP63, SP190 (소형 에어로졸 일반 조건)\n- SP277 (특정 가스 함유 시)",
      "tags": [
        "에어로졸",
        "Aerosol",
        "Class 2"
      ]
    },
    {
      "id": "fx-flexitank",
      "cat": "🧴 Flexitank / IBC",
      "q": "Flexitank (플렉시 탱크) 선적 시 규정은?",
      "a": "Flexitank 화물은 COA 권장 절차와 자사 적재 규정을 준수하시면 선적이 가능합니다.\n\n**표준 답신 (영문 파트너 대응)**\n> \"The shipment is acceptable provided that all documents reflect actual condition of container/cargo/flexi tank, and the shipper shall comply with the COA Recommended Code of Practice for the Manufacture of Flexi tanks and Operation of Flexi tank/Container Combinations.\"\n\n**필수 요건 안내**\n1. **20' Dry Van 컨테이너에 Flexitank 1개**로 진행해 주시기 바랍니다 (다중 적입은 불가합니다).\n2. **갑판 적재만 가능합니다** (Underdeck stowage는 금지입니다).\n3. **Booking List / CBF에 \"flexi-tank\"를 표기**해 주시기 바랍니다.\n4. 선박 Stowage 제한으로 Restow가 발생할 경우, 비용은 box operator 측 부담입니다.\n\n**Flexitank 자체 요건**\n- COA Test Criteria를 충족하는 설계여야 합니다.\n- 제조사 권장 적입 절차를 준수해 주시기 바랍니다.\n- 적입 후 누설 시험을 완료해 주시면 감사하겠습니다.\n\n**선적이 어려운 사례 (참고)**\n다음 케이스는 안전·운영상의 사유로 선적이 어려우니 양해 부탁드립니다.\n- 40ft 등 23ft 이상 컨테이너 사용 (20ft만 가능)\n- Underdeck 적재 요청\n- 다중 flexitank (2개 이상)\n- 식품·의약품 등 청결도 요구 화물과 동일 위치 적재",
      "tags": [
        "Flexitank",
        "플렉시탱크",
        "Underdeck 금지",
        "20ft 1개"
      ]
    },
    {
      "id": "rf-rfdg",
      "cat": "❄️ RFDG (Reefer DG)",
      "q": "RFDG (Reefer DG) 진행 시 요건은?",
      "a": "RFDG는 Reefer 컨테이너에 위험물을 적재하여 온도 통제로 안정성을 확보하는 방식입니다.\n\n**진행 대상 화물**\n- 위험물 취급 배터리(UN3480/3481 위험물 건)는 **RFDG가 필수**입니다.\n- 일부 산화성 물질(UN3378 검토 중)\n- 온도 통제로 안정성 확보가 필요한 화물\n\n**닝보(NGB) MSA 규정 안내**\n> Ningbo MSA requires temperature monitoring records at **4-6 hour intervals** for RFDG on board (including through cargo).\n\n- 본선 적재 후 **최소 6시간 간격**으로 온도 기록을 남겨주셔야 합니다.\n- 선장 책임 하에 모니터링 + 기록이 유지됩니다.\n- 닝보 출입항 시 기록 제출을 요구할 수 있습니다.\n\n**기타 RFDG 진행 사항**\n- 설정 온도를 사전 확정하여 MSDS / DGD에 기재 부탁드립니다.\n- 전원은 24시간 유지해 주셔야 하며, 양적하 시에도 가능한 한 연결 상태를 유지해 주시기 바랍니다.\n- 알람 발생 시 선장과 본사 운항팀 간 대응 절차를 사전 합의해 주시면 좋습니다.\n\n**RFDG 요금**\n- Reefer 추가 비용이 별도로 발생합니다 (운임 + 모니터링 비용).\n- 환적 시 전원 재연결 비용이 추가될 수 있습니다.",
      "tags": [
        "RFDG",
        "Reefer DG",
        "닝보",
        "온도 모니터링"
      ]
    },
    {
      "id": "container-spec",
      "cat": "📐 OOG / Heavy / Coil",
      "q": "장금상선 컨테이너 종류별 규격(스펙)은?",
      "a": "Sinokor 공식 컨테이너 규격을 한눈에 확인하실 수 있도록 정리해 드렸습니다. (출처: sinokor.co.kr/kr/Container.html)\n\n| Type | 종류 | 외부 L×W×H (mm) | 내부 L×W×H (mm) | MGW (kg) | Tare (kg) | Payload (kg) | 용적 (m³) |\n|---|---|---|---|---|---|---|---|\n| **20DC** | Dry | 6058×2438×2591 | 5898×2352×2393 | 30,480 | 2,180 | 28,300 | 33.2 |\n| **40DC** | Dry | 12192×2438×2591 | 12032×2352×2393 | 32,500 | 3,550 | 28,950 | 67.8 |\n| **40HC** | Dry HighCube | 12192×2438×2896 | 12032×2352×2698 | 32,500 | 3,700 | 28,800 | 76.4 |\n| **20RF** | Reefer | 6058×2438×2591 | 5454×2290×2266 | 30,480 | 2,800 | 27,680 | 28.3 |\n| **40HRF** | Reefer HighCube | 12192×2438×2896 | 11590×2290×2547.5 | 35,000 | 4,460 | 30,540 | 67.6 |\n| **20OT** | Open Top | 6058×2438×2591 | 5898×2352×2348 | 30,480 | 2,350 | 28,130 | 32.5 |\n| **40OT** | Open Top | 12192×2438×2591 | 12032×2352×2393 | 30,480 | 3,740 | 26,740 | 65.9 |\n| **20FR** | Flat Rack | 6058×2438×2591 | 5644×2198×2231 | 34,000 | 2,800 | 31,200 | - |\n| **40FR** | Flat Rack | 12192×2438×2591 | 11658×2224×1953 | 45,000 | 4,950 | 40,050 | - |\n| **SUPER RACK** | 확장 FR | 12202×2438×2896~4115* | 12172×2374×2264~3483* | 55,800 | 5,800 | 50,000 | - |\n| **SUPERCON** | 확장 FR | 12192×2438×2896~4115* | 12172×2374×2264~3483* | 59,980 | 5,980 | 54,000 | - |\n\n**도어 개구부 안내 (Door Opening, W×H mm)**\n- 20DC / 40DC / 20OT / 40OT: 2340×2280\n- 40HC: 2340×2585\n- 20RF: 2294×2224\n- 40HRF: 2294×2505.5\n- FR / Super Rack / Supercon: 도어 없음 (개방형)\n\n**활용 시 참고 사항**\n- 위험물 적재 시 **Payload 한도를 엄수해 주시고 VGM 신고를 정확히** 부탁드립니다.\n- **40HC** : 부피 화물 최대 (76.4m³)이므로 부피가 큰 화물에 권장드립니다.\n- **20RF** : RFDG 진행 시 사용하며, 용적이 28.3m³로 적은 편입니다.\n- **40HRF** : Payload 30,540kg — DC 대비 약 1.7톤 적습니다 (단열재·기계실 차지).\n- **40FR** : 도어 없는 화물 / 길이 11.66m 이내 화물에 적합합니다.\n- **SUPERCON** : 최대 중량(54톤) — Heavy Cargo / Coil / 강재 운송에 활용하실 수 있습니다.\n- **확장형 FR** : 높이 4.1m까지 가능해 Crane·발전기 등 대형 화물에 적합합니다.\n\n* 표기: 확장형은 확장 전/후 범위이며, 일반 운송 시 확장 전 기준이고 화물 특성에 따라 확장 운영합니다.\n\n📊 엑셀 다운로드: [container-spec.xlsx](./container-spec.xlsx)",
      "tags": [
        "컨테이너 스펙",
        "규격",
        "20GP",
        "40GP",
        "40HC",
        "Reefer",
        "FR",
        "OT",
        "Supercon",
        "Sinokor"
      ]
    },
    {
      "id": "oog-fr-ot",
      "cat": "📐 OOG / Heavy / Coil",
      "q": "OOG 화물 (FR/OT 컨테이너) 진행 시 확인사항은?",
      "a": "OOG(Out of Gauge) 화물은 컨테이너 규격을 초과하는 화물로, 사전 도면·중량 검토가 필요합니다. 진행 절차 아래와 같이 안내드립니다.\n\n**컨테이너 종류 (장금상선 공식 스펙)**\n- **20FR** (Flat Rack) — 내부 5644×2198×2231mm / MGW 34,000kg / Payload 31,200kg\n- **40FR** (Flat Rack) — 내부 11658×2224×1953mm / MGW 45,000kg / Payload 40,050kg\n- **20OT** (Open Top) — 내부 5898×2352×2348mm / MGW 30,480kg / Payload 28,130kg\n- **40OT** (Open Top) — 내부 12032×2352×2393mm / MGW 30,480kg / Payload 26,740kg\n- **SUPER RACK** (확장형) — Payload 50,000kg, 높이 2896~4115mm 확장 가능\n- **SUPERCON** (확장형) — Payload **54,000kg** (최대 중량 화물용)\n\n**허용 적재 한계 참고 자료**\n- 별첨 PDF: allowable load-flat rack - 22FR / allow load-40FR\n- 초과 시 LOI(Letter of Indemnity) 또는 특수 승인이 필요합니다.\n\n**터미널별 임계중량 확인 부탁드립니다**\n- BPT / 신선대 / 감만 / HBCT 등 터미널별 임계중량과 와이어 작업 가능 여부를 사전에 확인해 주시기 바랍니다.\n- 별첨 안내문을 참고하시면 도움이 되실 듯합니다.\n\n**필요 서류**\n- 화물 도면 (정면·측면·평면, 치수 기재)\n- 무게 / 무게 중심 (Center of Gravity)\n- 래싱 / 쇼링 계획 (Lashing Plan)\n- LOI (필요 시)\n\n**진행 절차 안내**\n1. OOG Check List (장금상선 양식) 작성 부탁드립니다.\n2. 운항팀 사전 승인을 받아 주시기 바랍니다.\n3. 부킹 확정\n4. 출고 24h 전 최종 도면 확정 부탁드립니다.\n\n📊 전체 스펙은 별첨 [container-spec.xlsx](./container-spec.xlsx)를 참고해 주시기 바랍니다.",
      "tags": [
        "OOG",
        "FR",
        "OT",
        "Flat Rack",
        "Open Top",
        "Heavy Cargo",
        "Super Rack",
        "Supercon"
      ]
    },
    {
      "id": "oog-coil",
      "cat": "📐 OOG / Heavy / Coil",
      "q": "Coil(코일) / Heavy Cargo / Steel Pipe 선적 가이드라인?",
      "a": "Coil 등 강재 화물은 별도 가이드라인이 적용됩니다. 적재 무게·중심·래싱 계획을 사전에 검토해 주시기 바랍니다.\n\n**참조 문서 (사내 자료)**\n- COIL Shipping Guideline (ENG)\n- COIL 선적 Guideline (한국어)\n- General Guide on Coil Shipment\n- Guide for Heavy & risky cargo\n- Guideline for Steel product shipment (HMM 기준 참고)\n- Heavy cargo 및 데미지 고위험 내품 진행 시 가이드\n- LOI - HEAVY CARGOES (SKR) 양식\n- Quick Handling Lashing Guide\n\n**핵심 확인 사항**\n1. 컨테이너 1대 적재 무게 한도를 확인 부탁드립니다 (20GP: 28톤 / 40GP: 30톤 권장).\n2. 무게 중심은 컨테이너 중심선에 맞춰 주시기 바랍니다.\n3. **Cradle (코일 받침대)** 사용 — 적정 강도가 확보되어야 합니다.\n4. Lashing — 코일의 양옆 + 전후 고정을 부탁드립니다.\n5. 데미지 고위험 화물은 LOI 징구가 필요합니다.\n\n**Steel Pipe 진행 시 안내**\n- 길이 / 직경 / 다발 단위를 사전 확인 부탁드립니다.\n- 끝단 손상 방지를 위한 패딩 처리를 부탁드립니다.\n- 별첨 \"장금 PIPE.xls\", \"흥아 PIPE.xls\" 양식을 참고해 주시면 좋습니다.\n\n코일·파이프·강재류는 OOG가 아니더라도 운항팀의 사전 검토가 필요한 점 양해 부탁드립니다.",
      "tags": [
        "Coil",
        "코일",
        "Heavy Cargo",
        "Steel Pipe",
        "LOI"
      ]
    },
    {
      "id": "proc-precheck",
      "cat": "📋 절차 / PRE-CHECK",
      "q": "DG PRE-CHECK 절차는 어떻게 되나요?",
      "a": "DG PRE-CHECK는 부킹 확정 전 위험물 적재 가능 여부를 사전 검토하는 절차입니다. 선적 14일 전까지 요청 부탁드립니다 (긴급 건은 별도 협의).\n\n**1단계: 사전 준비 서류**\n- MSDS (영문 + 한글)\n- 위험물 신고서(DGD) 또는 임시 정보 (UN No, Class, PG, 수량)\n- UN 38.3 시험성적서 (배터리류)\n- 포장재 UN 마킹 사진\n\n**2단계: 정보 입력**\n- 운항팀에서 직접 대응하고 있습니다 (고지팀을 거치지 않습니다).\n- 웹 양식 또는 메일로 PRE-CHECK를 요청해 주시기 바랍니다.\n- 항만/노선별로 각각 확인이 필요합니다 (출발지·도착지·환적지).\n\n**3단계: 운항팀 검토**\n- 통상 **1~3 영업일** 내로 회신드리고 있습니다.\n- 동일 화주의 반복 화물은 일괄 승인이 가능합니다.\n- 거절 사유는 명시하여 회신드리오니 참고해 주시기 바랍니다.\n\n**4단계: 부킹 확정**\n- PRE-CHECK 승인 후 부킹을 진행 부탁드립니다.\n- **승인 없는 적입은 거절될 수 있으며**, 현장 발견 시 비용은 화주께서 부담하시게 되니 사전 절차를 꼭 지켜주시기 바랍니다.\n\n**개선 진행 사항 (2025.08 기준)**\n- 스페셜 전담파트 운영을 검토 중입니다.\n- 부킹 전 PRE-CHECK와 어플리케이션 최종 승인 사이의 업무 간소화를 추진하고 있습니다.\n- 화주께 실시간 승인 상태를 안내드리는 TAG 시스템 도입도 검토 중입니다.",
      "tags": [
        "PRE-CHECK",
        "절차",
        "승인",
        "운항팀"
      ]
    },
    {
      "id": "gen-msds-sections",
      "cat": "📄 서류 (MSDS/DGD)",
      "q": "MSDS의 각 섹션은 무엇을 의미하나요?",
      "a": "MSDS는 16개 섹션으로 구성되어 있으며, 위험물 판정에는 아래 섹션들을 주로 참조하고 있습니다.\n\n**자주 참조하는 섹션 안내**\n- **1번** — 제품 식별 (제품명·제조사·CAS No.)\n- **2번** — 유해성 분류 (GHS, 신호어)\n- **3번** — 성분/조성 (구성성분 · CAS No.)\n- **9번** — 물리·화학적 성질 (**Flash Point**, 끓는점, 증기압)\n- **12번** — 환경 유해성 (**LC50, EC50, NOEC** — Marine Pollutant 판정)\n- **14번** — **운송 정보** ⭐ (UN No., Proper Shipping Name, Class, PG, EmS, Marine Pollutant)\n\n**확인 부탁드리는 사항**\n- 14번에 운송방식별(IMDG/IATA/ADR) UN번호가 다르게 기재되어 있는 경우, 해상 운송은 **IMDG 기준**으로 판단합니다.\n- 14번이 \"Not regulated\"로 표기되어 있더라도 9번 인화점과 12번 독성을 한 번 더 살펴봐 주시기 바랍니다.\n- 한글·영문 MSDS 모두 확보해 두시면 출하지 세관 요청 시 유연하게 대응하실 수 있습니다.\n\n**유효성**\n- MSDS는 **3년 이내 최신본**이 필요하며, 16개 섹션이 모두 작성된 정상 문서여야 합니다.",
      "tags": [
        "MSDS",
        "GHS",
        "섹션 가이드"
      ]
    },
    {
      "id": "doc-dgd",
      "cat": "📄 서류 (MSDS/DGD)",
      "q": "DGD (위험물 신고서) 작성 시 필수 항목은?",
      "a": "DGD 작성 시 아래 항목을 빠짐없이 기재해 주시면 신속한 검토가 가능합니다.\n\n**필수 기재 항목**\n1. **UN No.** (4자리)\n2. **PSN** (Proper Shipping Name) — IMDG Dangerous Goods List 기준 정확히\n3. **Class / Sub-class** (예: 3 / 8 / 5.1 / 9)\n4. **Packing Group** (I / II / III 또는 N/A)\n5. **Marine Pollutant 여부** (Y/N + 표기)\n6. **EmS** (Emergency Schedule, F-x / S-x)\n7. **Net / Gross 중량 (kg)**\n8. **포장 형태 + 수량** (예: 200L Drum × 4)\n9. **송하인 / 수하인 정보**\n10. **선적 컨테이너 정보** (Container No., Seal No.)\n11. **서명 / 날인** (송하인 책임자)\n\n**자주 발생하는 작성 오류**\n- PSN 약자 사용 (예: \"Lithium Battery\" → 정확히 \"LITHIUM ION BATTERIES\")\n- PG 누락 (N/A인 경우도 명시 부탁드립니다)\n- Marine Pollutant Y/N 미기재\n- 송하인 서명 누락\n\n**제출 시점 안내**\n- 부킹 확정 후 **출고 48h 전**까지 사전 송부 부탁드립니다.\n- VGM 신고와는 별도로 진행됩니다.\n\nDGD는 1건당 1 UN 번호가 원칙이며, 복수 UN인 경우 별도 line을 추가해 주시면 됩니다.",
      "tags": [
        "DGD",
        "위험물 신고서",
        "서류",
        "작성 가이드"
      ]
    },
    {
      "id": "doc-acceptance",
      "cat": "📄 서류 (MSDS/DGD)",
      "q": "위험물 application 표준 회신 문구는?",
      "a": "해외 거래선·파트너 응대 시 사용하는 표준 답신 문구를 참고용으로 안내드립니다. 상황에 맞춰 활용해 주시면 도움이 되실 듯합니다.\n\n**Acceptance (수락 답신)**\n> \"Dear Partner,\n> \n> We would accept your DG application subject to your slot allocation and provided that the DG cargo is properly packed, labeled and documented in accordance with IMO regulations and the laws or regulations in force at the port of shipment, the port of discharge and any scheduled port of call.\n> \n> Please note that it is the box operator's responsibility to check and ensure whether the DG cargo obtains all the necessary approvals required by IMO regulations and the above-mentioned laws or regulations prior the DG cargo being loaded on board our vessel, in failing which the box operator shall indemnify and hold the vessel operator harmless in respect of any liability, loss, damage and expenses of whatsoever nature which the vessel operator may sustain by reason of such failure.\n> \n> * Any extra cost may occur when it re-handles at any port because of lack of base cargo or restricted space for DG cargo, it should be under the box operator's account.\n> * You also have to check SHA/NGB port local restriction especially CAS NO.\n> * All applications not followed by our prohibited item list will be cancelled even we accept as below.\"\n\n**Flexitank 표준 답신**\n> \"The shipment is acceptable and provided that all the documents reflect actual condition of container/cargo/flexi tank and confirmation that the shipper warrants and agrees that he shall comply in all respects with the COA Recommended Code of Practice for the Manufacture of Flexi tanks and Operation of Flexi tank/Container Combinations and Flexitank manufacturer recommendations for stowage, handling and care of the Flexi tank(s), that the Flexitank design shall comply with the Flexitank Test Criteria and a maximum of one Flexi tank shall be stuffed in a 20' dry-van container.\n> \n> Reminder:\n> - Underdeck stowage is prohibited\n> - Please put either 'flexi-tank' as remarks on the booking list/CBF\n> - Restow, if applicable due to vessel's stowage restriction, shall be under box operator's account\"\n\n**Reject (거절 답신)**\n> \"We are sorry to inform you that the subject cargo cannot be accepted on our vessels due to [reason: e.g., not approved manufacturer / on prohibited list / SP188 not applicable].\"",
      "tags": [
        "응대 문구",
        "Acceptance",
        "Reject",
        "표준 답신",
        "영문"
      ]
    },
    {
      "id": "bl-manifest-dg",
      "cat": "📄 서류 (MSDS/DGD)",
      "q": "B/L과 Manifest에 위험물 정보 기재 방법은?",
      "a": "B/L과 Manifest 위험물 기재는 IMDG 5.4.1을 기준으로 작성됩니다.\n\n**B/L (Bill of Lading) 필수 항목 (해상 운송)**\n1. UN No.\n2. PSN (Proper Shipping Name)\n3. Class / Sub-class\n4. Packing Group\n5. Net / Gross 중량\n6. 포장 수량 (예: 200L Drum × 4)\n7. Marine Pollutant 여부\n8. EmS 코드\n9. Flash Point (인화성 액체)\n10. \"Limited Quantity\" 표기 (LQ 적용 시)\n\n**기재 형식 예시**\n> UN1170 ETHANOL SOLUTION, 3, II, 800L (4 × 200L Steel Drum), Flash Point 13°C, EmS F-E S-D\n\n**Manifest (적하목록) 안내**\n- 항만 당국 / 세관 / 본선 적재 계획용입니다.\n- B/L 정보 + Stowage 위치 + 컨테이너 번호가 포함됩니다.\n- 위험물은 별도의 DG Manifest(선장용)도 작성됩니다.\n\n**복수 UN번호 (한 컨테이너 내)**\n- 각 UN별로 별도 line을 작성해 주시기 바랍니다.\n- 격리 호환성을 확인 후 적입해 주시기 바랍니다.\n- 컨테이너 전체 위험물 총 수량을 표기해 주시면 좋습니다.\n\n**자주 발생하는 오류**\n- PSN 약어 사용 → IMDG 정확 명칭 필요\n- PG 누락 (N/A인 경우도 \"N/A\" 명시 부탁드립니다)\n- Marine Pollutant Y/N 미기재\n- EmS 코드 미기재 → 본선 응급 대응이 곤란해질 수 있습니다",
      "tags": [
        "B/L",
        "Bill of Lading",
        "Manifest",
        "IMDG 5.4.1"
      ]
    },
    {
      "id": "vgm-dg",
      "cat": "📄 서류 (MSDS/DGD)",
      "q": "VGM(검증 중량 신고)과 위험물 신고는 어떻게 다른가요?",
      "a": "VGM(Verified Gross Mass)은 컨테이너 + 화물 + 포장의 총 중량을 의미하며, 위험물 신고(DGD)와는 별도로 진행됩니다.\n\n**SOLAS 협약 (2016년 이후)**\n- 출항 24시간 전 송하인이 캐리어에 신고하실 의무가 있습니다.\n- 미신고 시 적재가 거부될 수 있는 점 참고 부탁드립니다.\n\n**DGD vs VGM 비교**\n| 구분 | DGD | VGM |\n|---|---|---|\n| 목적 | 위험물 정보 | 컨테이너 중량 확인 |\n| 기준 | IMDG Code | SOLAS Ch.VI Reg.2 |\n| 작성 | 송하인 + 포워더 | 송하인 |\n| 시점 | 부킹 + 출고 전 | 출항 24h 전 |\n| 정보 | UN, Class, PG, 수량, 격리 | Net+Tare+포장 중량 |\n\n**위험물 컨테이너 VGM 특이사항 안내**\n- 무게 정확성이 더욱 중요합니다 (Stowage 계획 / 격리 위치 결정).\n- RFDG 컨테이너 Tare(자체 중량)는 일반보다 무거운 편입니다 (3톤 내외).\n- LOI 화물(Coil 등)은 정확한 무게가 특히 중요합니다.\n\n**측정 방식**\n- **Method 1**: 적입 후 컨테이너 전체를 계량합니다.\n- **Method 2**: 화물·포장을 각각 계량 후 컨테이너 Tare를 합산합니다.\n\n**누락·부정확 시 영향**\n- 적재가 거부될 수 있습니다.\n- 추후 적발 시 모든 비용이 송하인 부담으로 처리됩니다.\n- 사고 발생 시 책임이 가중될 수 있으니 정확한 신고를 부탁드립니다.",
      "tags": [
        "VGM",
        "Verified Gross Mass",
        "SOLAS",
        "중량 신고"
      ]
    },
    {
      "id": "stow-seg",
      "cat": "📦 적재 / 격리",
      "q": "적재 / 격리 규정(Stowage & Segregation)은?",
      "a": "위험물의 적재 및 격리는 IMDG Code 7장 기준을 따르고 있습니다. 아래 내용을 참고해 주시면 도움이 되실 듯합니다.\n\n**Stowage Category 분류**\n- **A** — 데크 / 언더데크 모두 가능\n- **B / C** — 일반 적재\n- **D** — 갑판 적재만 가능\n- **E** — 갑판 적재 (관계자만 접근)\n\n**Segregation (격리) — IMDG 7.2.4**\n| 코드 | 의미 |\n|---|---|\n| 1 | \"Away from\" — 같은 컨테이너 적재 불가, 최소 3m |\n| 2 | \"Separated from\" — 1 컨테이너 거리 |\n| 3 | \"Separated by complete compartment\" — 격벽 분리 |\n| 4 | \"Separated longitudinally by intervening complete compartment\" — 종방향 격벽 + 거리 |\n| X | 같은 컨테이너 가능 |\n\n**Segregation Group**\n- SGG1: Acids (산 — 염산·불산 등)\n- SGG18: Alkalis (염기 — 가성소다 등)\n- SGG6: Cyanides / SGG16: Peroxides\n- 전체 18개 그룹은 IMDG 3.1.4.4 참조\n- 식품·식수와의 격리는 별도 규정이 있습니다 (IMDG 7.3.4).\n\n**자주 문의주시는 사례**\n- CLASS 9 + CLASS 4.1 혼적은 격리 문제가 없어 같은 컨테이너에 적재 가능합니다.\n- CLASS 8 산 + CLASS 8 염기는 Segregation Group 1 vs 11로 \"Separated from\" 격리가 적용됩니다.\n- 인화성 + 산화성 (Class 3 + 5.1)도 \"Separated from\" 격리가 필요합니다.",
      "tags": [
        "적재",
        "격리",
        "Stowage",
        "Segregation",
        "IMDG 7장"
      ]
    },
    {
      "id": "port-shanghai",
      "cat": "🏗️ 항만별 제한",
      "q": "상해(SHA) / 닝보(NGB) 항만 위험물 추가 제한은?",
      "a": "상해(SHA)와 닝보(NGB) 항만은 CAS No. 기준으로 별도 제한 리스트를 운영하고 있습니다. 사전 조회를 부탁드립니다.\n\n**확인 절차**\n1. MSDS에서 주 성분 CAS No.를 확인 부탁드립니다.\n2. 상해항·닝보항 금지·제한 리스트를 조회해 주시기 바랍니다.\n3. 매월 업데이트되어 변동이 잦으니 최신본 확인을 권장드립니다.\n\n**참조 사내 자료**\n- SHA DG prohibit Y2021 (CAS NO.) 조회\n- NGB DG prohibit Y2021 (CAS NO.) 조회\n- BANNED AND RESTRICTED UNNO, CAS NUMBER LIST (NINGBO / SHANGHAI)\n- 상해 The maximum acceptable units of DGs at shanghai terminals\n- 상해 외고교 위험물 장치가능수량\n\n**NGB 특이사항**\n- **RFDG 6시간 간격 온도 모니터링 의무** (NGB MSA 규정)\n- 통과 화물(through cargo)도 동일하게 적용됩니다.\n\n**SHA 특이사항**\n- 외고교 / 양산항별로 장치 가능 수량 제한이 있습니다.\n- Marine Pollutant 추가 신고가 필요합니다.\n\n화주께 정확한 CAS No.를 요청하신 후 조회하시면 가장 정확한 검토가 가능합니다.",
      "tags": [
        "상해",
        "닝보",
        "CAS No",
        "항만 제한",
        "SHA",
        "NGB"
      ]
    },
    {
      "id": "port-others",
      "cat": "🏗️ 항만별 제한",
      "q": "기타 중국 항만 / 일본 / 동남아 위험물 제한은?",
      "a": "지역별 항만 제한 자료는 사내 \"포트별 제한규정\" 폴더에 보관되어 있습니다. 아래 자료를 참고해 주시면 도움이 되실 듯합니다.\n\n**중국**\n- **칭다오(TAO)**: PROHIBIT & PICK UP FROM VSL DIRECTLY 리스트\n- **천진(TSN)**: 금지 위험물 리스트 + 취급 가능 위험물(Class 2-6)\n- **샤먼(XMN)**: DG Limitation Table 危险品作业表 (2024.01)\n- **장가항(ZJG)**: 위험물 하역 가능 리스트\n- **남경/난강(NKG)**: 위험물 하역 불가 리스트 (2019)\n- **셔코우(SHK)**: 招商局港口深圳西部港区危险货物集装箱操作分类表\n- **대련(DLC)**: 剧毒及易制爆化学品名录\n- **연태 / 영구**: 별도 확인 부탁드립니다.\n\n**일본**\n- JP-DG RESTRICTION CHECK (2024.02)를 참조해 주시기 바랍니다.\n- 도쿄·요코하마·고베·오사카·나고야 별도 항만 규정을 확인해 주시면 좋습니다.\n\n**동남아 / 기타**\n- 말레이시아: Prohibited DG Cargo List\n- 홍콩(HK): 위험물 하역 제한 PROHIBITED DG IN HK (2024.01)\n- 인천(BDCGP) restricted DG list\n- UTCT (DG Regulations 2023)\n\n**조회 우선순위 안내**\n1. 출항지 + 환적지 + 도착지를 모두 확인 부탁드립니다.\n2. CAS No. 기반 조회를 권장드립니다 (특히 중국).\n3. 변동이 잦으므로 분기별 갱신본을 확인해 주시면 좋습니다.",
      "tags": [
        "항만",
        "중국",
        "일본",
        "동남아",
        "CAS No"
      ]
    },
    {
      "id": "car-compare",
      "cat": "🚢 선사별 비교",
      "q": "타 선사의 위험물 정책은 어디서 확인하나요?",
      "a": "타 선사 정책은 본 사이트 \"다른 선사 규정\" 탭에서 PDF/XLS로 통합 조회하실 수 있습니다.\n\n**선사별 금지 리스트 (사내 보유)**\n| 선사 | 자료 |\n|---|---|\n| HMM | HMM2023, HMM2024 Prohibited and Restricted List |\n| KMTC | DG in-house policy (2026.01) + Restricted Item & Special Stowage List |\n| 동진 | (DONGJIN) Updated Prohibited DG List 2024.06.28 |\n| CK Line | DG Prohibited / Restricted list (2024.06.28) + DG Prohibition List XLSX |\n| 양밍 | DG Prohibited list R20 |\n| TSL | Restricted-Prohibited DG 2026 Rev.29 |\n| 에버그린 | DG 제한 리스트 |\n| 팬오션 | PanOcean DG prohibition list (2023.03) |\n| 남성 / 동영 (NSS&DYS) | DG prohibition list 2024.06.28 |\n| SML | DG Prohibited/Restricted Cargo List 검토 |\n| MEXAMXSMX | contact info OPR code DG list (2025.07) |\n\n**핵심 비교 사례 안내**\n- **숯 (UN1361)** : 장금/흥아/KMTC/머스크 금지 / 일부 해외선사 허용\n- **리튬메탈 (3090/3091)** : 국적선사 대부분 금지 / 해외선사 일부 허용\n- **과탄산나트륨 (3378)** : 장금/흥아/완하이/TSL 금지 / HMM·머스크 허용\n\n정책 변경이 잦으므로 \"다른 선사 규정\" 탭의 PDF 최신본을 직접 확인하시는 것을 권장드립니다.",
      "tags": [
        "선사 비교",
        "타사",
        "HMM",
        "KMTC"
      ]
    },
    {
      "id": "sp-lq",
      "cat": "⚠️ 특별 규정 / LQ",
      "q": "Limited Quantity (LQ) / Excepted Quantity (EQ) 적용은?",
      "a": "소량 포장 위험물은 LQ 또는 EQ 적용을 통해 일부 규정 완화가 가능합니다.\n\n**LQ (Limited Quantity)**\n- 소량 포장 기준입니다 (예: 5L 이하 액체, 5kg 이하 고체).\n- 외부 박스에 **LQ 마크**를 부착해 주시면 일부 규정이 완화됩니다.\n- DGD 작성 의무는 유지되며, 간소화는 가능합니다.\n- 적용 한도는 IMDG Code Column 7a에서 확인 부탁드립니다.\n\n**EQ (Excepted Quantity)**\n- LQ보다 더 소량 기준입니다 (보통 30mL 이하).\n- **EQ 마크** 부착 시 거의 일반 화물로 취급됩니다.\n- MSDS는 보유를 권장드립니다.\n- 적용은 IMDG Code Column 7b를 참조해 주시기 바랍니다.\n\n**SP188 (소형 배터리)**\n- 리튬이온: 100Wh 이하 / 셀 20Wh 이하\n- 리튬메탈: 2g 이하 / 셀 1g 이하\n- UN 38.3 시험 통과 시 비위험물 취급이 가능합니다.\n- ⚠️ 장금/흥아는 3090/3091은 SP188 적용 건도 금지하고 있는 점 양해 부탁드립니다 (사고 사례 기반).\n\n**자주 문의주시는 사례**\n- 모바일 배터리 36.96 Wh → SP188 적용 → NON-DG DRY 가능합니다.\n- 노트북 배터리 100Wh 초과 → 위험물로 처리됩니다.\n- 카메라 배터리 일반: SP188이 적용됩니다.",
      "tags": [
        "LQ",
        "EQ",
        "SP188",
        "소형 배터리",
        "Limited Quantity"
      ]
    },
    {
      "id": "ma-1044",
      "cat": "⚠️ 특별 규정 / LQ",
      "q": "UN1044 (소화기) 선적 가능한가요?",
      "a": "소화기는 비교적 간단한 절차로 선적이 가능합니다.\n\n**주요 조건**\n- Class 2.2 (비인화성 압축가스)에 해당합니다.\n- 작동 압력 확인과 안전핀 고정을 부탁드립니다.\n- SP225 적용이 가능합니다 (LQ 완화).\n- 일반 적재가 가능하나 충격·낙하 방지에 유의해 주시기 바랍니다.\n- 외부 손상이나 누설이 있는 경우 선적이 어려우니 양해 바랍니다.",
      "tags": [
        "소화기",
        "Class 2.2"
      ]
    },
    {
      "id": "un38-3",
      "cat": "📘 IMDG 전문지식",
      "q": "UN 38.3 시험은 무엇이고 어떤 항목으로 구성되나요?",
      "a": "UN 38.3은 리튬 배터리의 운송 안전성을 검증하는 시험 기준입니다 (UN Manual of Tests and Criteria, Part III).\n\n**8가지 시험 (T.1 ~ T.8)**\n| 시험 | 내용 | 목적 |\n|---|---|---|\n| **T.1** | 고도 시뮬레이션 (Altitude) | 항공 환경 (저기압) |\n| **T.2** | 열 사이클 (Thermal) | -40°C ↔ +75°C 반복 |\n| **T.3** | 진동 (Vibration) | 7Hz~200Hz |\n| **T.4** | 충격 (Shock) | 150g × 6ms |\n| **T.5** | 외부 단락 (External Short Circuit) | 표면 55°C 노출 |\n| **T.6** | 충돌 (Impact) | 9.1kg 추 낙하 (단일 셀만) |\n| **T.7** | 과충전 (Overcharge) | 정격 2배 전류 |\n| **T.8** | 강제 방전 (Forced Discharge) | 0V까지 강제 |\n\n**합격 기준**\n- 분해 / 파열 / 누액 / 발화 / 폭발이 없어야 합니다.\n- 전압 강하 10% 이내여야 합니다.\n- 외부 표면 온도가 170°C 이하여야 합니다.\n\n**시험성적서 (UN 38.3 Test Summary) 포함 사항**\n시험성적서는 제조사 또는 공인 시험기관에서 발행되며, 다음 정보가 포함되어야 합니다.\n1. 제조사 / 모델 / 셀 화학 조성\n2. 정격 용량 (Wh)\n3. 시험 일자 / 기관\n4. 시험 결과 요약\n5. 책임자 서명\n\n**부킹 단계 확인 사항**\n- UN 38.3 시험성적서 PDF 첨부 부탁드립니다 (필수).\n- 시험 일자가 너무 오래된 경우(>3년) 재발행을 요청 부탁드립니다.\n- 제조사 변경 시(포장·셀·화학 조성 변경 포함)에는 시험성적서를 재발행해 주셔야 합니다.",
      "tags": [
        "UN 38.3",
        "리튬배터리 시험",
        "Test Summary"
      ]
    },
    {
      "id": "packing-instr",
      "cat": "📘 IMDG 전문지식",
      "q": "Packing Instruction (P001 등) 코드는 어떻게 읽나요?",
      "a": "IMDG Column 8의 Packing Instructions는 포장 지침 코드를 의미합니다. 자주 사용되는 코드를 정리해 드렸습니다.\n\n**P 코드 (Single Packagings + Combination)**\n| 코드 | 의미 |\n|---|---|\n| **P001** | 액체 위험물 일반 포장 (드럼·캐니스터·박스+내포장) |\n| **P002** | 고체 위험물 일반 포장 |\n| **P003** | 일반 다용도 (큰 단위 포장) |\n| **P200** | 압축 가스 (실린더 표) |\n| **P520** | 자기반응성 물질 / 유기과산화물 |\n| **P400** | 자연 발화성 액체 (4.2 PG I) |\n| **P404** | 자연 발화성 고체 (4.2 PG I) |\n| **P403** | 기타 4.2 / 4.3 물질 |\n| **P410** | Class 4.1 고체 |\n| **P504** | 산화성 액체 (5.1) |\n| **P902** | 위험물 함유 물품 (소화기 등) |\n| **P903** | 리튬 이온 배터리 |\n| **P903a/b** | 리튬 배터리 장비 / 동봉 |\n| **P906** | PCBs 함유 폐기물 |\n| **P911** | 손상/결함 리튬 배터리 |\n\n**IBC 코드**\n- **IBC01~IBC08** — 다양한 IBC(중간 벌크 컨테이너) 사용 조건\n\n**LP 코드 (Large Packagings)**\n- LP01, LP02 등 대형 포장 사용\n\n**활용 절차 안내**\n1. IMDG DGL Column 8에서 해당 UN의 Packing Instruction을 확인 부탁드립니다.\n2. IMDG 본문 4.1.4장에서 코드별 상세 절차를 확인하실 수 있습니다.\n3. UN 인증 포장재(UN 마킹 확인)를 사용해 주시기 바랍니다.\n4. PG(Packing Group)에 따라 시험 강도가 다르니 참고 부탁드립니다.\n\n**자주 문의주시는 사례**\n- P001 + PG II → 액체 200L 드럼, UN 1A1 또는 1H1 인증\n- P903 + 배터리 → 박스 내부 절연 + 외부 충격 보호\n- P911 (손상 배터리) → 별도 Salvage Packaging 필요 (대부분 운송이 어려운 점 양해 부탁드립니다)",
      "tags": [
        "Packing Instruction",
        "P001",
        "P903",
        "IBC",
        "포장 지침"
      ]
    },
    {
      "id": "nos-entry",
      "cat": "📘 IMDG 전문지식",
      "q": "N.O.S. (Not Otherwise Specified) 엔트리는 어떻게 처리하나요?",
      "a": "N.O.S.는 \"Not Otherwise Specified\"의 약자로, IMDG DGL에 정확한 명칭이 없는 일반 분류 항목을 말합니다.\n\n**대표 N.O.S. UN번호**\n- UN1992 — FLAMMABLE LIQUID, TOXIC, N.O.S.\n- UN1993 — FLAMMABLE LIQUID, N.O.S.\n- UN3077 — ENV. HAZARDOUS SUBSTANCE, SOLID, N.O.S.\n- UN3082 — ENV. HAZARDOUS SUBSTANCE, LIQUID, N.O.S.\n- UN3175 — SOLIDS CONTAINING FLAMMABLE LIQUID, N.O.S.\n\n**SP274 (Technical Name 부기 의무)**\nN.O.S. entry는 PSN 뒤에 **괄호로 정확한 화학명/기술명을 부기**해 주셔야 합니다.\n- 예: \"UN1993, FLAMMABLE LIQUID, N.O.S. (Acetone solution)\"\n\n**SP318**\n- 식별이 까다로운 미생물·바이오 제품 등은 추가 표기가 필요합니다.\n\n**기재 예시 안내**\n* 잘못된 기재: UN1993 FLAMMABLE LIQUID\n* 올바른 기재: UN1993 FLAMMABLE LIQUID, N.O.S. (Toluene, Methanol mixture), 3, II\n\n**B/L / Manifest에도 동일 적용**\n- 송하인께서 부킹 시 정확한 기술명을 제공해 주셔야 합니다.\n- 미기재 시 출항이 거절될 수 있으니 양해 부탁드립니다 (PSC 검사 적발 사유).\n\n**자주 발생하는 거절 사유**\n- N.O.S. entry에 기술명 누락\n- MSDS와 기재 기술명 불일치\n- Marine Pollutant 표기 누락 (3077/3082)",
      "tags": [
        "N.O.S.",
        "Technical Name",
        "SP274",
        "기술명 부기"
      ]
    },
    {
      "id": "tank-container",
      "cat": "📘 IMDG 전문지식",
      "q": "Tank Container (탱크 컨테이너) 사용 규정은?",
      "a": "Portable Tank는 IMDG 6.7 / Column 10-11(T-code, TP-code)에서 기준이 안내됩니다.\n\n**T-code (T1~T75) — Portable Tank Instruction**\n화물에 맞는 탱크 설계·시험 기준이 정의되어 있습니다.\n- **T1**: 일반 액체 (PG III)\n- **T11**: 인화성 액체 PG II\n- **T14**: 부식성 (8) PG II\n- **T22**: 일부 산화성 액체\n- **T50**: 액화 가스 (Class 2)\n\n**TP-code (TP1~TP41) — Tank Special Provisions**\n- TP1: 충전율은 IMDG 4.2.1.9 공식에 따라 산정(온도 보정)\n- TP2: 충전율 화물별 상이\n- TP9: 가열 / 냉각 시스템\n- TP33: 단일 격실만 사용\n\n**Tank Container 종류**\n- ISO Tank: 20ft 표준 탱크 컨테이너 (24,000~26,000L)\n- Cryogenic Tank: 액화가스 (LNG / 액화질소)\n- Coiled Tank: 가열·냉각 코일 부착\n- Lined Tank: 화학물질 내화학성 (PTFE 등)\n\n**필수 확인 부탁드리는 사항**\n1. 탱크 검사 인증서 (CSC) + 정기점검(2.5년·5년 주기)\n2. 시험 압력 (Test Pressure)\n3. 자재 적합성 (화물 ↔ 탱크 재질)\n4. **충전율 (Filling Degree)** — TP-code 준수 부탁드립니다.\n5. 잔류 가스 / 청결 확인 (이전 화물 잔류 시 거절될 수 있습니다).\n\n**Flexitank와 비교**\n| 항목 | Tank Container | Flexitank |\n|---|---|---|\n| 형태 | 강철 탱크 | 일회용 가방형 |\n| 용량 | ~26,000L | ~24,000L |\n| 사용 횟수 | 반복 사용 | 1회용 |\n| 위험물 | 가능 (UN 인증) | 제한적 (비위험물 위주) |\n| 적재 | 갑판·언더데크 | **갑판만 (Underdeck 금지)** |\n\n**자사 정책**\n- ISO Tank 위험물 진행이 가능합니다 (PRE-CHECK 필요).\n- 인증서 / 청결 / 충전율을 사전에 확인 부탁드립니다.",
      "tags": [
        "Tank Container",
        "Portable Tank",
        "ISO Tank",
        "T-code"
      ]
    },
    {
      "id": "ctu-cpc",
      "cat": "📘 IMDG 전문지식",
      "q": "CTU Packing Certificate(컨테이너 적입 증명서)는 무엇인가요?",
      "a": "CTU(Cargo Transport Unit)는 컨테이너·트레일러 등을 의미하며, 위험물 적입 시 안전 기준이 적용됩니다.\n\n**CTU Code (IMO/ILO/UN ECE)**\n- 위험물 컨테이너 적입 시 안전 기준 가이드입니다.\n- 적입 절차 / 단단히 고정 / 라벨 / 표기 등을 다룹니다.\n\n**Container Packing Certificate (CPC) — IMDG 5.4.2**\n\n**필수 기재 사항**\n1. 컨테이너 번호 / Seal No.\n2. 적입 위험물 정보 (UN, PSN, Class, PG, 수량)\n3. 적입 검사 항목 (모두 \"확인됨\"이 되어야 합니다):\n   - 외부 손상 없음\n   - 청결 / 건조 상태\n   - 모든 위험물 양호 상태\n   - 충돌 방지 적입\n   - 라벨 부착\n   - 적입자 정보 (성명·서명·날인)\n4. 검사일\n5. 적입 책임자 서명\n\n**누락 시 영향**\n- 본선 적재가 거부될 수 있습니다.\n- PSC 검사 적발 시 출항 거절이 가능하니 양해 부탁드립니다.\n- 손해배상 책임이 발생할 수 있습니다.\n\n**송하인 / 포워더 책임 안내**\n- CPC 작성은 송하인·포워더 측 책임입니다.\n- 캐리어는 검토만 수행하며, 책임 회피 조항(Indemnity)이 적용됩니다.\n\n**RFDG 추가 확인 사항**\n- 전원 연결 상태 확인\n- 설정 온도 기록\n- 알람 기능 정상 작동 확인",
      "tags": [
        "CTU",
        "CPC",
        "Container Packing Certificate",
        "IMDG 5.4.2"
      ]
    },
    {
      "id": "sadt-5-2",
      "cat": "📘 IMDG 전문지식",
      "q": "SADT(자기가속분해온도)는 무엇이고 왜 중요한가요?",
      "a": "SADT는 Self-Accelerating Decomposition Temperature의 약자로, 화학물질이 외부 에너지 없이 자체적으로 분해를 가속화하는 최저 온도를 말합니다.\n\n**중요성**\n- 주로 **Class 5.2 (유기 과산화물)** 및 일부 자기반응성 물질(Class 4.1)에 적용됩니다.\n- SADT 미달 = 안전 / SADT 초과 = 폭주 분해 → 화재·폭발 위험으로 이어질 수 있습니다.\n- 따라서 운송 중 화물 온도는 SADT 이하로 반드시 유지되어야 합니다.\n\n**Control Temperature / Emergency Temperature**\n| 항목 | 정의 |\n|---|---|\n| **TC (Control Temp)** | 정상 운송 시 유지해야 하는 최대 온도 |\n| **TE (Emergency Temp)** | 이 온도 초과 시 비상 절차 발동 |\n\n* SADT 구간별로 차등 적용됩니다 (SADT>35°C → TC=SADT−10·TE=SADT−5 / 20~35°C → TC=SADT−15·TE=SADT−10 / ≤20°C → TC=SADT−20·TE=SADT−10). IMDG 7.3.7 참조.\n\n**예시**\n- UN3110 Organic Peroxide Type F, Solid, Temp Control: SADT 60°C → TC 50°C / TE 55°C\n- 운송 컨테이너는 RFDG (Reefer)를 사용하시고 50°C 이하 유지가 필요합니다.\n\n**자사 사례 안내**\n- UN3378 과탄산나트륨: 발열분해온도 60°C → RFDG로 온도 통제 시 안전 확보가 가능한지 검토 중입니다.\n- 일본구간 OCI 측 요청으로 RFDG 진행 가능성을 평가하고 있습니다.\n\n**DGD 기재 안내**\n- 14번 컬럼에 \"Temperature Controlled\"를 표기 부탁드립니다.\n- TC / TE를 명시해 주시기 바랍니다.\n- RFDG 컨테이너 사용이 필수입니다.",
      "tags": [
        "SADT",
        "자기가속분해",
        "Class 5.2",
        "Temperature Control",
        "RFDG"
      ]
    },
    {
      "id": "overpack",
      "cat": "📘 IMDG 전문지식",
      "q": "Overpack(오버팩) 사용 규정은?",
      "a": "Overpack은 IMDG 1.2.1 및 5.1.2에 정의되어 있는 포장 방식입니다.\n\n**정의**\n- 한 송하인이 한 컨테이너 내에서 운반을 쉽게 하기 위해 **여러 포장재를 하나의 외부 포장으로 묶은 것**을 말합니다.\n- 컨테이너 자체는 Overpack에 해당하지 않습니다 (그것은 CTU).\n\n**예시**\n- 4개의 25L 드럼 → 팔레트 + 슈링크 랩으로 묶은 1개 Overpack\n- 박스 12개 → 큰 박스 1개로 묶은 형태\n\n**필수 표기 (외부)**\n1. **\"OVERPACK\" 단어 명시** 부탁드립니다.\n2. 내부의 모든 UN No / PSN / Class를 표기해 주셔야 합니다.\n3. UN 라벨 (가장 강한 위험성 기준)\n4. Orientation Arrows (위 방향 표시, 액체 시)\n5. Marine Pollutant (해당 시)\n\n**제한 사항**\n- 내부 포장재가 모두 UN 인증품이어야 합니다.\n- 호환성 그룹(격리)을 사전에 검토해 주시기 바랍니다.\n- 위험물 + 비위험물 혼합 시 표기를 명확히 해 주셔야 합니다.\n\n**장점**\n- 핸들링이 용이합니다 (적입·하역).\n- 동일 송하인의 다양한 위험물 통합 관리가 가능합니다.\n- 라벨 가시성이 향상됩니다.\n\n**단점**\n- 사고 시 내부 화물 식별이 어려울 수 있습니다.\n- 검사 시 분해가 필요합니다.\n- 일부 항만에서 거절될 가능성이 있어 사전 확인을 권장드립니다.",
      "tags": [
        "Overpack",
        "오버팩",
        "포장",
        "IMDG 5.1.2"
      ]
    },
    {
      "id": "imdg-list-cols",
      "cat": "📘 IMDG 전문지식",
      "q": "IMDG Code Dangerous Goods List(제2권) 컬럼별 의미는?",
      "a": "IMDG DGL(Volume 2)은 컬럼 1~18(7a·7b·16a·16b 분할 포함)로 구성됩니다. 주요 컬럼은 아래와 같습니다.\n\n| 컬럼 | 항목 | 설명 |\n|---|---|---|\n| **1** | UN No | 4자리 식별 번호 |\n| **2** | PSN | Proper Shipping Name (정확 명칭) |\n| **3** | Class / Sub-class | 1차 위험성 |\n| **4** | Subsidiary Risk | 2차 위험성 (예: 6.1+8) |\n| **5** | Packing Group | I / II / III |\n| **6** | Special Provisions | SP-xxx (개별 예외/조건) |\n| **7a** | Limited Quantity | LQ 한도 |\n| **7b** | Excepted Quantity | EQ 코드 (E0~E5) |\n| **8** | Packing Instructions | P001, P002, IBC02 등 |\n| **9** | Packing Provisions | 포장 특별규정 (PP-) |\n| **10** | IBC Instructions | IBC 지침 |\n| **11** | IBC Provisions | IBC 특별규정 |\n| **13** | Tank Instructions | T-code (T1~T75) |\n| **14** | Tank Special Provisions | TP-code |\n| **15** | EmS | F-x / S-x 응급 대응 |\n| **16a** | Stowage & Handling | 적재·취급 (SW-) |\n| **16b** | Segregation | 격리 (SG-) |\n| **17** | Properties / Observations | 추가 특성 |\n\n*컬럼 12(구 IMO 탱크지침)는 삭제되었습니다.*\n\n**자주 활용하시는 컬럼**\n- 6번 SP → 비위험물 취급 가능 여부 (예: SP188)\n- 7a/7b → LQ/EQ 적용\n- 15번 EmS → 사고 시 응급 절차\n- 16a/16b번 → 적재·격리 결정\n\nIMDG 본문(38-16)은 사내에 보유 중이며, 모호한 경우 직접 조회를 권장드립니다.",
      "tags": [
        "IMDG",
        "DGL",
        "Dangerous Goods List",
        "Volume 2"
      ]
    },
    {
      "id": "ems-codes",
      "cat": "📘 IMDG 전문지식",
      "q": "EmS 코드(F-x / S-x)는 무엇인가요?",
      "a": "EmS는 Emergency Schedule의 약자로, 사고 발생 시 본선 대응 절차를 정리한 코드입니다.\n\n**중요 — EmS는 클래스로 일괄 결정되지 않습니다.**\nEmS 코드는 IMDG DGL(컬럼 15)에서 **UN별로 개별 지정**되며, 화재(F-)용 1종 + 유출(S-)용 1종이 함께 부여됩니다.\n\n- **Fire 스케줄**: F-A ~ F-J (화재 대응 절차 종류)\n- **Spillage 스케줄**: S-A ~ S-Z (유출 대응 절차 종류)\n\n같은 클래스라도 물질에 따라 다른 EmS가 부여될 수 있으므로, 반드시 해당 UN의 DGL 및 EmS Guide(IMDG 보충판)를 확인하세요.\n\n**활용 예시**\n- UN1170 (에탄올) → F-E + S-D\n- UN3480 (리튬이온) → F-A + S-I\n- UN1790 (불산) → F-A + S-B\n\n**DGD 작성 시**\n- IMDG 14번 컬럼에서 EmS 코드를 확인 후 DGD에 기재해 주시기 바랍니다.\n- 본선 안전관리책임자(STO)에게도 사전 공유해 주시면 좋습니다.\n- IMDG 보충판(Supplement) — EmS Guide에 상세 절차가 안내되어 있습니다.\n\n사고 발생 시 즉시 EmS 코드를 확인하시고, 절차서를 펼쳐 대응해 주시기 바랍니다.",
      "tags": [
        "EmS",
        "응급 대응",
        "Fire",
        "Spillage",
        "본선 안전"
      ]
    },
    {
      "id": "class4-sub",
      "cat": "🧪 Class별 세부 규정",
      "q": "Class 4 세분류 (4.1 / 4.2 / 4.3) 차이는?",
      "a": "Class 4는 가연성 고체류로 3개 sub-class로 세분됩니다.\n\n**Class 4.1 — 가연성 고체 (Flammable Solid)**\n- 외부 화염원 접촉 시 쉽게 발화됩니다.\n- 마찰 / 충격에도 발화가 가능합니다.\n- 자기반응성 물질(Self-Reactive)이 포함됩니다.\n- 예: 황(Sulphur, UN1350), 나프탈렌(UN1334)\n- **자기반응성 + 온도 통제** 필요 시 RFDG로 진행합니다.\n\n**Class 4.2 — 자연 발화성 (Spontaneously Combustible)**\n- 공기 접촉만으로 가열·발화될 수 있습니다 (Pyrophoric).\n- 화학물질 자체의 산화 반응입니다.\n- 예: 백린(White Phosphorus, UN1381), 활성탄(UN1362), **숯(UN1361)**\n- ⚠️ **자사 정책: UN1361/1362 전면 금지**입니다.\n- 운송 시 산소 차단(질소 충전 등) 조치가 필요합니다.\n\n**Class 4.3 — 물 반응성 (Dangerous When Wet)**\n- 물 접촉 시 가연성 가스가 발생하며 발화 위험이 있습니다.\n- 예: 알루미늄 분말(UN1396), 칼슘(UN1401), 나트륨(UN1428)\n- 외부 라벨에 \"X\" (물 사용 금지)가 표기됩니다.\n- 화재 시 **물 사용 절대 금지** → EmS F-G (특수 소화제)\n- 적재 시 습기 차단(방수 포장)이 필수입니다.\n\n**자주 문의주시는 사례**\n- 황(UN1350) PG III: 정상 선적 가능\n- 활성탄(UN1362): 비위험물 취급(SP223)이지만 자사는 금지\n- 마그네슘 분말: 화재 시 물 사용 절대 금지\n\n**격리 안내**\n- 4.1 + 5.1 (산화성) → \"Separated from\"\n- 4.2 + Class 3 → \"Separated from\"\n- 4.3 + 물반응성 → 같은 격벽 적재 가능",
      "tags": [
        "Class 4",
        "가연성 고체",
        "Pyrophoric",
        "Water-Reactive"
      ]
    },
    {
      "id": "class6-toxic",
      "cat": "🧪 Class별 세부 규정",
      "q": "Class 6.1 독성 / 6.2 감염성 물질 운송 가능한가요?",
      "a": "Class 6은 독성 / 감염성 물질로 구분되며, 자사 정책에 따라 진행 여부가 다릅니다.\n\n**Class 6.1 — 독성 물질 (Toxic Substances)**\n\nPacking Group은 경구 독성 LD50을 기준으로 분류됩니다.\n- PG I: LD50 ≤ 5 mg/kg (매우 독성)\n- PG II: 5 < LD50 ≤ 50 mg/kg\n- PG III: 50 < LD50 ≤ 300 mg/kg\n\n**예시**\n- UN1654, NICOTINE (PG II)\n- UN1888, CHLOROFORM (PG III)\n- UN2588, PESTICIDES, SOLID, TOXIC, N.O.S. (PG I/II/III)\n\n**Toxic Inhalation Hazard (TIH) / Poison Inhalation Hazard (PIH)**\n- 증기 흡입 시 매우 독성이 강합니다.\n- 격리가 강화됩니다 (식품·식수와 \"Separated by complete compartment\").\n- 일부 항만은 추가 사전 승인이 필요합니다.\n\n**Class 6.2 — 감염성 물질 (Infectious Substances)**\n- Category A: UN2814 (인체 영향), UN2900 (동물만)\n- Category B: UN3373 (Biological Substance Category B)\n\n**Category A (생명 위협 가능)**\n- 예: 에볼라, 결핵균, 광견병 등\n- 매우 제한적으로 운송됩니다 (대부분 항공·군용·의료기관).\n- 자사 해상 운송은 거의 없습니다.\n\n**Category B (의료 검체)**\n- 의료기관 간 검체 운송에 해당합니다.\n- P650 포장이 필요합니다 (3중 포장: 1차 용기 + 2차 용기 + 외부).\n- 대부분 항공·특수 차량으로 운송됩니다.\n\n**자사 정책**\n- Class 6.1: PRE-CHECK 후 진행 (PG I은 별도 협의 부탁드립니다).\n- Class 6.2: 원칙적으로 해상 운송 미진행 (사례가 거의 없습니다).\n\n**자주 문의주시는 사례**\n- 살충제(PESTICIDES): MSDS 확인 후 정상 선적 가능 (PG에 따라).\n- 의약품 원료: Class 6.1 해당 시 PG별 검토가 필요합니다.",
      "tags": [
        "Class 6.1",
        "Class 6.2",
        "독성",
        "감염성",
        "TIH",
        "P650"
      ]
    },
    {
      "id": "class1-explosive",
      "cat": "🧪 Class별 세부 규정",
      "q": "Class 1 폭발물 — Compatibility Group이란?",
      "a": "Class 1 폭발물은 6개 Sub-class와 Compatibility Group(호환성 그룹)으로 세분류됩니다.\n\n**Sub-class (1.1 ~ 1.6)**\n| 분류 | 위험성 |\n|---|---|\n| **1.1** | 대량 폭발 위험 (Mass Explosion) |\n| **1.2** | 비산 위험 (분열 / 파편) |\n| **1.3** | 화재 / 미약 폭풍 / 비산 |\n| **1.4** | 미약한 폭발 위험 (포장 한정) |\n| **1.5** | 매우 둔감하나 대량 폭발 가능 (Insensitive) |\n| **1.6** | 극도로 둔감 |\n\n**Compatibility Group (A~S) — IMDG 2.1.2.1.4**\n| 그룹 | 의미 |\n|---|---|\n| A | Primary Explosive Substance |\n| B | 폭약 함유 물품 (Detonator) |\n| C | Propellant Explosive (추진제) |\n| D | Secondary Detonating Explosive (TNT 등) |\n| E | 폭약 함유 + 추진제 |\n| F | 폭약 함유 + 자체 폭발 수단 |\n| G | 신호용 / 폭죽 / 조명탄 |\n| H | 폭약 + 백린 |\n| J | 폭약 + 인화성 액체/가스 |\n| K | 폭약 + 독성 |\n| L | 다른 위험 동반 |\n| N | 극도로 둔감한 폭약 |\n| S | 우발 작동 시 영향 최소 (소형 폭죽 등) |\n\n**기재 예시**\n- UN0027, BLACK POWDER, **1.1D**\n- UN0335, FIREWORKS, **1.3G**\n- UN0432, ARTICLES, PYROTECHNIC, **1.4S**\n\n**격리 규칙**\n- Sub-class + Compatibility Group 조합으로 격리가 결정됩니다.\n- 같은 Compatibility Group이라도 Sub-class가 다르면 별도 격리가 필요합니다.\n\n**자사 정책 안내**\n- Class 1 폭발물은 **사전 PRE-CHECK가 필수**입니다.\n- 일부 항만 / 노선별로 추가 승인이 필요합니다.\n- 군용 / 산업용 구분이 있으며, 자사는 산업용 위주(불꽃놀이 / 산업폭발물)로 진행하고 있습니다.",
      "tags": [
        "Class 1",
        "폭발물",
        "Compatibility Group"
      ]
    },
    {
      "id": "damaged-salvage",
      "cat": "🚨 사고 / 손상 대응",
      "q": "손상된 위험물 / Salvage Packaging은 어떻게 처리하나요?",
      "a": "손상·결함 위험물은 안전상 사유로 **원칙적 선적 거절**로 운영하고 있습니다. 양해 부탁드립니다.\n\n**손상 사례 안내**\n- 누설 / 외부 손상 / 부풀어 오름 / 발열\n- 손상·결함 리튬 배터리 → UN3480/3481/3090/3091 **그대로 유지**, 포장은 **P908/P911** 적용\n- UN3171은 *배터리 구동 차량/장비*이며 손상전지 자체의 UN번호가 아닙니다\n\n**Salvage Packaging (회수 포장)**\n- 리튬전지: **P908**(손상·결함) / **P911**(위험 상태 critical)\n- 대형 전지: **LP904 / LP906**\n- 외부 견고한 포장 + 흡수재가 필요합니다.\n- 명시 라벨: \"SALVAGE\" 또는 \"DAMAGED\"\n- 사용 가능 운송 수단이 제한적입니다 (대부분 도로/철도, 해상 거절).\n\n**자사 정책 안내**\n- **손상 위험물은 원칙적으로 선적이 어려운 점 양해 부탁드립니다.**\n- 사고 차량 / 손상 배터리는 거절됩니다.\n- 회수 처리가 필요하신 경우 별도 협의 부탁드립니다 (전용 컨테이너 + 특수 보험 검토).\n\n**선상 발생 손상 시 대응 안내**\n1. 선장이 즉시 운항팀으로 보고합니다.\n2. 위험성 평가 (EmS 코드 활용)\n3. 격리 / 환기 / 응급 조치 수행\n4. 도착항에 사전 통보 → 별도 처리 부두 또는 폐기 절차 진행\n5. 사고 보고서 작성 (Casualty Report)\n\n**예방을 위한 권장 사항**\n- 적입 전 외관 검사를 철저히 부탁드립니다.\n- CPC (Container Packing Certificate)의 검사 항목을 꼼꼼히 확인해 주시기 바랍니다.\n- 운송 중 정기 점검 부탁드립니다 (RFDG 온도, 일반 컨테이너 외관).",
      "tags": [
        "손상",
        "Salvage Packaging",
        "P911",
        "사고",
        "거절 사유"
      ]
    }
  ]
};

// ───── 상태 ─────
let fqAdminMode = sessionStorage.getItem(FQ_CONFIG.ADMIN_SESSION_KEY) === '1';
let fqPosts = [];
let fqCurrentCat = '전체';
let fqOpenPostId = null;


// ═══════════════════════════════════════════════════════════════
// 초기화
// ═══════════════════════════════════════════════════════════════
function fqInit(scope) {
  scope = scope || document;
  fqLoadFaq();
  fqLoadPosts();
  fqBindTabs(scope);
  fqBindFaq(scope);
  fqBindBoard(scope);
  fqRenderFaq();
  fqRenderPosts();
  fqUpdateAdminUI();
}

// ═══════════════════════════════════════════════════════════════
// 탭 전환
// ═══════════════════════════════════════════════════════════════
function fqBindTabs(scope) {
  scope.querySelectorAll('[data-fq-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.fqTab;
      scope.querySelectorAll('[data-fq-tab]').forEach(b => b.classList.toggle('active', b.dataset.fqTab === tab));
      scope.querySelectorAll('[data-fq-panel]').forEach(p => p.classList.toggle('active', p.dataset.fqPanel === tab));
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════
function fqLoadFaq() {
  try {
    const saved = localStorage.getItem(FQ_CONFIG.FAQ_KEY);
    if (saved) { FQ_FAQ_DATA = JSON.parse(saved); }
  } catch (e) { console.warn('FAQ load 실패:', e); }
}

function fqSaveFaq() {
  try { localStorage.setItem(FQ_CONFIG.FAQ_KEY, JSON.stringify(FQ_FAQ_DATA)); }
  catch (e) { console.error('FAQ save 실패:', e); }
}

function fqBindFaq(scope) {
  scope.querySelector('#fqSearch').addEventListener('input', fqRenderFaq);
  scope.querySelector('#fqExpandAll').addEventListener('click', () => {
    scope.querySelectorAll('.fq-item').forEach(i => i.classList.add('open'));
  });
  scope.querySelector('#fqCollapseAll').addEventListener('click', () => {
    scope.querySelectorAll('.fq-item').forEach(i => i.classList.remove('open'));
  });
  scope.querySelector('#fqAdminBtn').addEventListener('click', fqToggleAdmin);
  scope.querySelector('#fqAdminSave').addEventListener('click', () => {
    try {
      const txt = scope.querySelector('#fqAdminEditor').value;
      const parsed = JSON.parse(txt);
      if (!parsed.items || !Array.isArray(parsed.items)) throw new Error('items 배열 필요');
      FQ_FAQ_DATA = parsed;
      fqSaveFaq();
      fqRenderFaq();
      fqToast('✓ FAQ 저장 완료', 'success');
    } catch (e) { alert('JSON 파싱 오류: ' + e.message); }
  });
  scope.querySelector('#fqAdminReset').addEventListener('click', () => {
    if (!confirm('FAQ를 초기 상태로 되돌리시겠습니까?')) return;
    localStorage.removeItem(FQ_CONFIG.FAQ_KEY);
    location.reload();
  });
  // 이메일 업로드 → FAQ
  const emBtn = scope.querySelector('#fqEmailUploadBtn');
  if (emBtn) emBtn.addEventListener('click', fqToggleEmailForm);
  const emCancel = scope.querySelector('#fqEmCancelBtn');
  if (emCancel) emCancel.addEventListener('click', () => { document.getElementById('fqEmailForm').hidden = true; });
  const emSubmit = scope.querySelector('#fqEmSubmitBtn');
  if (emSubmit) emSubmit.addEventListener('click', fqSubmitEmail);
  const emFile = scope.querySelector('#fqEmFile');
  if (emFile) emFile.addEventListener('change', fqReadEmailFile);
}

// ── 이메일 업로드 → FAQ 등록 ──
function fqToggleEmailForm() {
  const f = document.getElementById('fqEmailForm');
  if (!f) return;
  f.hidden = !f.hidden;
  if (!f.hidden) fqPopulateEmailCats();
}
function fqPopulateEmailCats() {
  const sel = document.getElementById('fqEmCat');
  if (!sel) return;
  const cats = (FQ_FAQ_DATA.categories || []).filter(c => c !== '전체');
  if (!cats.includes(FQ_EMAIL_FAQ_CAT)) cats.unshift(FQ_EMAIL_FAQ_CAT);
  sel.innerHTML = cats.map(c => `<option value="${fqEsc(c)}"${c === FQ_EMAIL_FAQ_CAT ? ' selected' : ''}>${fqEsc(c)}</option>`).join('');
}
function fqReadEmailFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const text = String(ev.target.result || '');
    const subjMatch = text.match(/^subject:\s*(.+)$/im);
    const subjEl = document.getElementById('fqEmSubject');
    if (subjMatch && subjEl && !subjEl.value) subjEl.value = subjMatch[1].trim();
    const inq = document.getElementById('fqEmInquiry');
    if (inq && !inq.value) inq.value = text.length > 8000 ? text.slice(0, 8000) + '\n...(생략)' : text;
    fqToast('📎 이메일을 불러왔습니다. 내용을 다듬어 등록하세요', 'success');
  };
  reader.readAsText(file);
}
async function fqSubmitEmail() {
  const subject = document.getElementById('fqEmSubject').value.trim();
  const inquiry = document.getElementById('fqEmInquiry').value.trim();
  const reply = document.getElementById('fqEmReply').value.trim();
  const by = document.getElementById('fqEmBy').value.trim();
  const cat = document.getElementById('fqEmCat').value || FQ_EMAIL_FAQ_CAT;
  if (!subject || !reply) { fqToast('제목과 회신(답변)은 필수입니다', 'warn'); return; }
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');
  }
  fqEnsureCategory(cat);
  const bodyPart = inquiry ? ('**문의 내용**\n' + inquiry + '\n\n**답변**\n') : '';
  const tags = ['이메일', by].filter(Boolean);
  FQ_FAQ_DATA.items = FQ_FAQ_DATA.items || [];
  FQ_FAQ_DATA.items.unshift({
    id: 'faq_eml_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    cat: cat, q: subject, a: bodyPart + reply, tags: tags, source: 'email'
  });
  fqSaveFaq();
  ['fqEmSubject', 'fqEmInquiry', 'fqEmReply', 'fqEmBy'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const fileEl = document.getElementById('fqEmFile'); if (fileEl) fileEl.value = '';
  document.getElementById('fqEmailForm').hidden = true;
  document.querySelectorAll('#fqModule [data-fq-tab]').forEach(b => b.classList.toggle('active', b.dataset.fqTab === 'faq'));
  document.querySelectorAll('#fqModule [data-fq-panel]').forEach(p => p.classList.toggle('active', p.dataset.fqPanel === 'faq'));
  fqCurrentCat = cat;
  fqRenderFaq();
  fqToast('✓ 이메일 문의가 FAQ에 등록되었습니다', 'success');
}

function fqRenderFaq() {
  const search = (document.getElementById('fqSearch').value || '').toLowerCase().trim();
  const cats = ['전체', ...(FQ_FAQ_DATA.categories || []).filter(c => c !== '전체')];

  // 카테고리 칩
  document.getElementById('fqCats').innerHTML = cats.map(c =>
    `<button class="fq-cat-chip ${c === fqCurrentCat ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  document.querySelectorAll('.fq-cat-chip').forEach(chip => chip.addEventListener('click', () => {
    fqCurrentCat = chip.dataset.cat;
    fqRenderFaq();
  }));

  // 목록
  let items = FQ_FAQ_DATA.items || [];
  if (fqCurrentCat !== '전체') items = items.filter(i => i.cat === fqCurrentCat);
  if (search) {
    items = items.filter(i => {
      const hay = (i.q + ' ' + (i.a || '') + ' ' + ((i.tags || []).join(' '))).toLowerCase();
      return hay.includes(search);
    });
  }
  document.getElementById('fqList').innerHTML = items.length === 0
    ? '<div class="fq-empty">해당 조건의 FAQ가 없습니다.</div>'
    : items.map(i => `
      <div class="fq-item" data-id="${i.id}">
        <div class="fq-q" onclick="fqToggleFaqItem('${i.id}')">
          <div style="flex:1;">
            <div class="fq-q-text">${fqEsc(i.q)}</div>
          </div>
          <span class="fq-q-tag">${fqEsc(i.cat || '')}</span>
          <span class="fq-q-arrow">▼</span>
        </div>
        <div class="fq-a">${fqRenderText(i.a || '')}</div>
      </div>`).join('');

  // 관리자 도구 JSON 동기화
  const editor = document.getElementById('fqAdminEditor');
  if (editor) editor.value = JSON.stringify(FQ_FAQ_DATA, null, 2);
}

function fqToggleFaqItem(id) {
  const el = document.querySelector(`.fq-item[data-id="${id}"]`);
  if (el) el.classList.toggle('open');
}

// ═══════════════════════════════════════════════════════════════
// 관리자
// ═══════════════════════════════════════════════════════════════
async function fqHash(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fqToggleAdmin() {
  if (fqAdminMode) {
    sessionStorage.removeItem(FQ_CONFIG.ADMIN_SESSION_KEY);
    fqAdminMode = false;
    fqToast('🚪 관리자 모드 종료', 'warn');
  } else {
    const pwd = prompt('관리자 비밀번호:');
    if (!pwd) return;
    const hash = await fqHash(pwd);
    if (hash === FQ_CONFIG.ADMIN_PWD_HASH) {
      sessionStorage.setItem(FQ_CONFIG.ADMIN_SESSION_KEY, '1');
      fqAdminMode = true;
      fqToast('✓ 관리자 로그인 성공', 'success');
    } else {
      fqToast('✗ 비밀번호 불일치', 'warn');
      return;
    }
  }
  fqUpdateAdminUI();
}

function fqUpdateAdminUI() {
  document.getElementById('fqAdminBadge').hidden = !fqAdminMode;
  document.getElementById('fqAdminTools').classList.toggle('show', fqAdminMode);
  fqRenderPosts();
}

// ═══════════════════════════════════════════════════════════════
// 게시판
// ═══════════════════════════════════════════════════════════════
function fqLoadPosts() {
  try {
    const saved = localStorage.getItem(FQ_CONFIG.BOARD_KEY);
    fqPosts = saved ? JSON.parse(saved) : [];
  } catch (e) { fqPosts = []; }
}

function fqSavePosts() {
  try { localStorage.setItem(FQ_CONFIG.BOARD_KEY, JSON.stringify(fqPosts)); }
  catch (e) { console.error('게시판 save 실패:', e); }
}

function fqBindBoard(scope) {
  scope.querySelector('#fqNewPostBtn').addEventListener('click', () => {
    const form = scope.querySelector('#fqNewPostForm');
    form.hidden = !form.hidden;
  });
  scope.querySelector('#fqCancelPostBtn').addEventListener('click', () => {
    scope.querySelector('#fqNewPostForm').hidden = true;
    fqResetNewForm();
  });
  scope.querySelector('#fqNpPrivate').addEventListener('change', (e) => {
    scope.querySelector('#fqNpPwdWrap').style.display = e.target.checked ? 'block' : 'none';
  });
  scope.querySelector('#fqSubmitPostBtn').addEventListener('click', fqSubmitPost);
}

function fqResetNewForm() {
  ['fqNpAuthor','fqNpCompany','fqNpRef','fqNpSubject','fqNpBody','fqNpPwd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fqNpPrivate').checked = false;
  document.getElementById('fqNpPwdWrap').style.display = 'none';
  document.getElementById('fqNpCategory').value = '일반';
}

async function fqSubmitPost() {
  const author = document.getElementById('fqNpAuthor').value.trim();
  const subject = document.getElementById('fqNpSubject').value.trim();
  const body = document.getElementById('fqNpBody').value.trim();
  if (!author || !subject || !body) {
    fqToast('이름·제목·내용 필수', 'warn'); return;
  }
  const isPrivate = document.getElementById('fqNpPrivate').checked;
  const pwd = document.getElementById('fqNpPwd').value;
  if (isPrivate && (!pwd || pwd.length < 4)) {
    fqToast('비밀글: 비밀번호 4자 이상', 'warn'); return;
  }
  const post = {
    id: 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    author,
    company: document.getElementById('fqNpCompany').value.trim(),
    ref: document.getElementById('fqNpRef').value.trim(),
    category: document.getElementById('fqNpCategory').value,
    subject, body,
    isPrivate,
    pwdHash: isPrivate ? await fqHash(pwd) : null,
    status: 'unanswered',
    createdAt: new Date().toISOString(),
    answer: null,
    answeredAt: null,
    answerBy: null
  };
  fqPosts.unshift(post);
  fqSavePosts();
  fqResetNewForm();
  document.getElementById('fqNewPostForm').hidden = true;
  fqRenderPosts();
  fqToast('✓ 문의 등록됨', 'success');
}

function fqRenderPosts() {
  const total = fqPosts.length;
  const answered = fqPosts.filter(p => p.status === 'answered').length;
  document.getElementById('fqBoardStats').textContent = total > 0 ? `${total}개 문의 · ${answered}개 답변 완료` : '';

  document.getElementById('fqPostsList').innerHTML = total === 0
    ? '<div class="fq-empty">등록된 문의가 없습니다. 새 문의를 작성해보세요.</div>'
    : fqPosts.map(p => {
      const isOpen = fqOpenPostId === p.id;
      const canSeeBody = !p.isPrivate || fqAdminMode || (sessionStorage.getItem('fq_unlocked_' + p.id) === '1');
      return `
        <div class="fq-post ${isOpen ? 'open' : ''}" data-id="${p.id}">
          <div class="fq-post-head" onclick="fqTogglePost('${p.id}')">
            <div class="fq-post-info">
              <div class="fq-post-meta">
                <span class="fq-post-author">${fqEsc(p.author)}</span>
                ${p.company ? `<span>· ${fqEsc(p.company)}</span>` : ''}
                <span>·</span>
                <span class="fq-post-date">${new Date(p.createdAt).toLocaleString('ko')}</span>
                ${p.category ? `<span>· ${fqEsc(p.category)}</span>` : ''}
                ${p.isPrivate ? '<span class="fq-post-private-icon">🔒</span>' : ''}
              </div>
              <div class="fq-post-subject">${fqEsc(p.subject)}</div>
            </div>
            <span class="fq-post-status ${p.status}">${p.status === 'answered' ? '✓ 답변완료' : '대기'}</span>
          </div>
          <div class="fq-post-body">${canSeeBody ? fqRenderText(p.body) : '🔒 비밀글입니다. <button class="fq-btn" onclick="fqUnlockPost(event,\'' + p.id + '\')">비밀번호 입력</button>'}</div>
          ${p.answer ? `
            <div class="fq-post-answer">
              <div class="fq-post-answer-head">✓ 답변 — ${p.answerBy || '관리자'} · ${new Date(p.answeredAt).toLocaleString('ko')}</div>
              ${fqRenderText(p.answer)}
            </div>` : ''}
          <div class="fq-post-actions">
            <button class="fq-btn accent" onclick="fqRequestReply('${p.id}')">${p.answer ? '✏️ 답변 수정' : '✏️ 답글 작성 (담당자)'}</button>
            ${fqAdminMode ? `<button class="fq-btn danger" onclick="fqDeletePost('${p.id}')">🗑 삭제</button>` : ''}
          </div>
          <div class="fq-answer-form" id="fqAnsForm-${p.id}">
            <textarea id="fqAnsText-${p.id}" placeholder="답변 내용 입력... (저장하면 FAQ에도 자동 등록됩니다)">${fqEsc(p.answer || '')}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button class="fq-btn ghost" onclick="fqCloseAnswerForm('${p.id}')">취소</button>
              <button class="fq-btn primary" onclick="fqSaveAnswer('${p.id}')">저장</button>
            </div>
          </div>
        </div>`;
    }).join('');
}

function fqTogglePost(id) {
  fqOpenPostId = (fqOpenPostId === id) ? null : id;
  fqRenderPosts();
}

async function fqUnlockPost(evt, id) {
  evt.stopPropagation();
  const post = fqPosts.find(p => p.id === id);
  if (!post) return;
  const pwd = prompt('이 글의 비밀번호:');
  if (!pwd) return;
  const hash = await fqHash(pwd);
  if (hash === post.pwdHash) {
    sessionStorage.setItem('fq_unlocked_' + id, '1');
    fqRenderPosts();
    fqToast('✓ 잠금 해제됨', 'success');
  } else {
    fqToast('✗ 비밀번호 불일치', 'warn');
  }
}

// 답글 작성 요청 — 관리자는 바로, 그 외는 담당자 비밀번호(1234) 확인 후 작성 폼 오픈
function fqRequestReply(id) {
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd === null) return;
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');   // 세션 동안 재입력 생략
  }
  fqOpenAnswerForm(id);
}
function fqOpenAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.add('open');
}
function fqCloseAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.remove('open');
}
function fqSaveAnswer(id) {
  const text = document.getElementById('fqAnsText-' + id).value.trim();
  if (!text) { fqToast('답변 내용 필요', 'warn'); return; }
  // 작성 권한 재확인 (폼이 직접 열렸을 경우 대비)
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');
  }
  const post = fqPosts.find(p => p.id === id);
  if (!post) return;
  post.answer = text;
  post.answeredAt = new Date().toISOString();
  post.answerBy = prompt('답변자 (예: 운항팀, 이원태 차장):', post.answerBy || '담당자') || '담당자';
  post.status = 'answered';
  fqSavePosts();
  // 문의 + 답변을 FAQ 데이터베이스로 자동 등록
  fqAddBoardAnswerToFaq(post);
  fqCloseAnswerForm(id);
  fqRenderPosts();
  fqToast('✓ 답변 등록 + FAQ 자동 반영 완료', 'success');
}

// FAQ 카테고리 보장 (없으면 추가)
function fqEnsureCategory(cat) {
  FQ_FAQ_DATA.categories = FQ_FAQ_DATA.categories || [];
  if (!FQ_FAQ_DATA.categories.includes(cat)) FQ_FAQ_DATA.categories.push(cat);
}

// 게시판 답변 → FAQ 자동 등록 (동일 글은 갱신)
function fqAddBoardAnswerToFaq(post) {
  fqEnsureCategory(FQ_BOARD_FAQ_CAT);
  const faqId = 'faq_brd_' + post.id;
  // 비밀글은 본문(문의 내용)을 공개하지 않고 제목+답변만 등록
  const bodyPart = (!post.isPrivate && post.body) ? ('**문의 내용**\n' + post.body + '\n\n**답변**\n') : '';
  const answerText = bodyPart + post.answer;
  const tags = ['게시판', post.category, post.answerBy].filter(Boolean);
  FQ_FAQ_DATA.items = FQ_FAQ_DATA.items || [];
  const existing = FQ_FAQ_DATA.items.find(x => x.id === faqId);
  if (existing) {
    existing.q = post.subject; existing.a = answerText; existing.cat = FQ_BOARD_FAQ_CAT; existing.tags = tags;
  } else {
    FQ_FAQ_DATA.items.unshift({ id: faqId, cat: FQ_BOARD_FAQ_CAT, q: post.subject, a: answerText, tags: tags, source: 'board' });
  }
  fqSaveFaq();
  if (typeof fqRenderFaq === 'function') fqRenderFaq();
}

function fqDeletePost(id) {
  if (!confirm('이 문의를 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
  fqPosts = fqPosts.filter(p => p.id !== id);
  fqSavePosts();
  fqRenderPosts();
  fqToast('🗑 삭제됨', 'warn');
}

// ═══════════════════════════════════════════════════════════════
// 유틸
// ═══════════════════════════════════════════════════════════════
function fqEsc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fqInline(s) {
  // 인라인 마크다운: **bold**, `code`, [text](url)
  return fqEsc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function fqRenderText(str) {
  // 블록 마크다운: 표(|...|), 목록(- / 1.), 인용(>), 굵게, 코드, 문단
  const lines = String(str || '').split('\n');
  let html = '';
  let i = 0;
  let listType = null; // 'ul' | 'ol'
  const closeList = () => { if (listType) { html += listType === 'ul' ? '</ul>' : '</ol>'; listType = null; } };
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    // 표: 현재 줄이 |...| 이고 다음 줄이 구분선(|---|)
    if (t.startsWith('|') && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      closeList();
      const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const header = cells(t);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(cells(lines[i])); i++; }
      html += '<table class="fq-table"><thead><tr>' +
        header.map(h => `<th>${fqInline(h)}</th>`).join('') +
        '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${fqInline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>';
      continue;
    }
    // 인용문 (연속 > 병합)
    if (t.startsWith('>')) {
      closeList();
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(fqInline(lines[i].trim().replace(/^>\s?/, '')));
        i++;
      }
      html += `<blockquote class="fq-quote">${quote.join('<br>')}</blockquote>`;
      continue;
    }
    // 순서 없는 목록
    if (/^[-*]\s+/.test(t)) {
      if (listType !== 'ul') { closeList(); html += '<ul class="fq-ul">'; listType = 'ul'; }
      html += `<li>${fqInline(t.replace(/^[-*]\s+/, ''))}</li>`;
      i++; continue;
    }
    // 순서 있는 목록
    if (/^\d+\.\s+/.test(t)) {
      if (listType !== 'ol') { closeList(); html += '<ol class="fq-ol">'; listType = 'ol'; }
      html += `<li>${fqInline(t.replace(/^\d+\.\s+/, ''))}</li>`;
      i++; continue;
    }
    // 빈 줄 / 일반 문단
    closeList();
    if (t !== '') html += `<p>${fqInline(t)}</p>`;
    i++;
  }
  closeList();
  return html;
}
function fqToast(msg, type) {
  const t = document.getElementById('fqToast');
  t.textContent = msg;
  t.className = 'fq-toast show' + (type ? ' ' + type : '');
  clearTimeout(window._fqToastTimer);
  window._fqToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// 자동 초기화 + 사이드바 메뉴 → 모듈 내부 탭 연동
function fqBootstrap() {
  fqInit();
  // 사이드바 메뉴 (data-fq-init-tab) 클릭 시 module 내부 탭 자동 활성화
  document.querySelectorAll('.menu-item[data-fq-init-tab]').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.fqInitTab; // 'faq' | 'board'
      setTimeout(() => {
        document.querySelectorAll('#fqModule [data-fq-tab]').forEach(b =>
          b.classList.toggle('active', b.dataset.fqTab === target));
        document.querySelectorAll('#fqModule [data-fq-panel]').forEach(p =>
          p.classList.toggle('active', p.dataset.fqPanel === target));
      }, 30);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fqBootstrap);
} else {
  fqBootstrap();
}
