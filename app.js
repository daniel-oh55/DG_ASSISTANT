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
  FAQ_KEY:    'dg_assistant_faq_v1',
  BOARD_KEY:  'dg_assistant_board_v1',
  ADMIN_SESSION_KEY: 'dg_assistant_admin_v1',
  // 비밀번호 'admin1234' SHA-256 해시
  ADMIN_PWD_HASH: 'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270',
  EXPORT_FILENAME: 'dg_assistant_inquiry_export'
};

// ───── DG 관련 시드 FAQ (사이트 분석 기반) ─────
let FQ_FAQ_DATA = {
  categories: ['전체', 'IMDG/UNNO', '선사 규정', '격리/혼적', 'SDS/AI 판독', '시스템 사용'],
  items: [
    { id: 'faq1', cat: 'IMDG/UNNO', q: 'UNNO 번호로 위험물 정보를 어떻게 조회하나요?',
      a: '사이드바의 **IMDG 조회 (UNNO)** 메뉴에서 UNNO 번호를 입력하면 IMDG 기준 상세 정보(Proper Shipping Name, Class, Subsidiary Risk, PG, EmS, 격리 코드 등)를 확인할 수 있습니다.',
      tags: ['UNNO', 'IMDG', '조회'] },
    { id: 'faq2', cat: '선사 규정', q: '선사별 선적 제한 규정은 어디서 확인하나요?',
      a: '**선사별 선적가부 조회** 메뉴에서 SKR, HAL, NSS, DYS 등 선사별 금지·제한 조건을 한 번에 비교 가능합니다. "선적 가능한 선사만 보기" 필터로 조건을 만족하는 선사만 추릴 수도 있습니다.',
      tags: ['선사', '선적', '제한'] },
    { id: 'faq3', cat: '격리/혼적', q: '두 가지 이상의 위험물을 함께 선적할 수 있나요?',
      a: '**격리규정 확인** 메뉴에서 복수 위험물의 혼적 가능 여부와 격리(Segregation) 요구사항(Away from, Separated from, Separated by complete compartment, Separated longitudinally)을 분석할 수 있습니다.',
      tags: ['격리', '혼적', 'Segregation'] },
    { id: 'faq4', cat: 'SDS/AI 판독', q: 'SDS/MSDS 문서에서 위험물 판정은 어떻게 하나요?',
      a: '**SDS/MSDS DG 판독** 메뉴에서 PDF를 업로드(최대 3MB)하면 Gemini AI가 Section 14를 기준으로 DG/NON-DG/UNCLEAR로 1차 판독합니다.',
      tags: ['SDS', 'MSDS', 'AI'] },
    { id: 'faq5', cat: 'SDS/AI 판독', q: 'AI 판독 결과는 그대로 신뢰해도 되나요?',
      a: '**아닙니다.** AI는 1차 보조 도구이며, 최종 선적 가능 여부는 IMDG Code, 선사 제한, 터미널 규정, POL/POD 국가 규정, **원본 SDS 최신본**을 기준으로 담당자가 반드시 재확인해야 합니다.',
      tags: ['AI', '신뢰도', '주의'] },
    { id: 'faq6', cat: '시스템 사용', q: '첨부파일 업로드 용량 제한이 있나요?',
      a: '**DG 정보노트**는 최대 4MB, **SDS/MSDS PDF**는 최대 3MB까지 가능합니다.',
      tags: ['첨부', '용량'] },
    { id: 'faq7', cat: '시스템 사용', q: '기존 선적 노트는 어떻게 찾나요?',
      a: '**DG 추가정보 노트** 메뉴의 라이브러리에서 제목·내용 키워드로 검색할 수 있습니다.',
      tags: ['노트', '검색'] },
    { id: 'faq8', cat: '선사 규정', q: '선사별 추가 규정은 어디에 기록하나요?',
      a: '**DG 추가정보 노트**에 선사별 제한 조건, 터미널 요청사항 등을 자유롭게 기록·관리할 수 있습니다. 팀원과 노트를 공유하면 동일 케이스 반복 처리가 빨라집니다.',
      tags: ['선사', '노트', '규정'] },
    { id: 'faq9', cat: 'IMDG/UNNO', q: '위험물 부킹 전 필수 확인사항은?',
      a: '권장 순서: **① UNNO 조회 → ② 선사별 선적가부 → ③ 격리규정 확인 → ④ SDS 재검증 → ⑤ POL/POD 국가 규정 확인** 입니다.',
      tags: ['부킹', '체크리스트'] },
    { id: 'faq10', cat: '시스템 사용', q: '터미널별 추가 규정은 어떻게 관리하나요?',
      a: 'DG 정보노트에 "터미널 규정, POL/POD 요청사항" 등을 메모로 기록하고 팀원과 공유하세요. 자주 가는 터미널은 별도 노트로 분류해 두면 효율적입니다.',
      tags: ['터미널', '노트'] },
    { id: 'faq11', cat: '시스템 사용', q: 'DARK MODE는 어떻게 켜나요?',
      a: '왼쪽 사이드바 하단의 **DARK MODE / BRIGHT MODE** 버튼으로 전환합니다. 선택값은 브라우저에 자동 저장됩니다.',
      tags: ['UI', '테마'] },
    { id: 'faq12', cat: '선사 규정', q: '여러 선사의 선적 가능 정보를 한 번에 비교할 수 있나요?',
      a: '**선사별 선적가부 조회** 메뉴에서 가능합니다. "선적 가능한 선사만 보기" 필터를 켜면 해당 UNNO 기준으로 OK 선사만 즉시 추려져 표시됩니다.',
      tags: ['선사', '비교'] },
    { id: 'faq13', cat: '시스템 사용', q: '위험물 클레임이 발생했을 때 기록은 어떻게 남기나요?',
      a: 'DG 정보노트에 **클레임 상황, 선사 대응, 터미널 이슈, 후속 조치** 등을 시간순으로 메모로 남기세요. 비슷한 케이스 재발 시 참고 자료가 됩니다.',
      tags: ['클레임', '기록'] },
    { id: 'faq14', cat: 'IMDG/UNNO', q: '신규 IMDG 개정 사항은 어떻게 반영되나요?',
      a: '마스터 데이터는 IMDG Code 정기 개정을 기준으로 관리됩니다. 선사별 추가 규정은 노트로 계속 업데이트해 주세요.',
      tags: ['IMDG', '개정', '업데이트'] },
    { id: 'faq15', cat: '시스템 사용', q: '민감한 정보가 들어간 노트는 보호할 수 있나요?',
      a: '노트 작성 시 **비밀번호**를 설정하면 본인 외에는 열람할 수 없습니다. 분실 시 복구가 불가하므로 별도 보관 필수입니다.',
      tags: ['보안', '비밀번호'] }
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
          ${fqAdminMode ? `
            <div class="fq-post-actions">
              <button class="fq-btn accent" onclick="fqOpenAnswerForm('${p.id}')">${p.answer ? '답변 수정' : '✏️ 답변 작성'}</button>
              <button class="fq-btn danger" onclick="fqDeletePost('${p.id}')">🗑 삭제</button>
            </div>
            <div class="fq-answer-form" id="fqAnsForm-${p.id}">
              <textarea id="fqAnsText-${p.id}" placeholder="답변 내용 입력...">${fqEsc(p.answer || '')}</textarea>
              <div style="display: flex; justify-content: flex-end; gap: 6px;">
                <button class="fq-btn ghost" onclick="fqCloseAnswerForm('${p.id}')">취소</button>
                <button class="fq-btn primary" onclick="fqSaveAnswer('${p.id}')">저장</button>
              </div>
            </div>` : ''}
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

function fqOpenAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.add('open');
}
function fqCloseAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.remove('open');
}
function fqSaveAnswer(id) {
  const text = document.getElementById('fqAnsText-' + id).value.trim();
  if (!text) { fqToast('답변 내용 필요', 'warn'); return; }
  const post = fqPosts.find(p => p.id === id);
  if (!post) return;
  post.answer = text;
  post.answeredAt = new Date().toISOString();
  post.answerBy = prompt('답변자 (예: 관리자, 운항팀장):', post.answerBy || '관리자') || '관리자';
  post.status = 'answered';
  fqSavePosts();
  fqRenderPosts();
  fqToast('✓ 답변 등록됨', 'success');
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
function fqRenderText(str) {
  // 간단 마크다운: **bold**, `code`, 줄바꿈
  return fqEsc(str)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
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
