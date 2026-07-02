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

  // 포장/탱크 코드 (IMDG 4.1 포장지침 P·LP·IBC / 4.2·6.7 이동식탱크 T·TP / 특별규정 PP·B)
  // 자주 나오는 코드 위주. 없는 코드는 접두사 기반 일반 설명으로 자동 안내(getImdgCodeInfo PACK 분기).
  packcode: {
    // ── 포장지침 P (IMDG Code 4.1.4.1) ──
    P001: { desc: '액체 위험물 일반 포장지침.\n[조합포장] 내부용기(유리·도자기 10L / 플라스틱·금속 40L 이하) + 외부용기(강·알루미늄·기타금속·합판·파이버·플라스틱 드럼, 제리캔, 상자). 외부포장 최대 400kg 또는 450L.\n[단일포장] 강/알루미늄/기타금속/플라스틱 드럼(최대 450L), 제리캔(최대 60L), 복합용기, 압력용기.\nPG I 은 단일포장이 제한됨. (IMDG 4.1.4.1 P001)' },
    P002: { desc: '고체 위험물 일반 포장지침.\n[조합포장] 내부용기(유리·플라스틱·금속·종이·파이버) + 외부용기(강·알루미늄·합판·파이버·플라스틱 드럼, 상자, 제리캔).\n[단일포장] 드럼(최대 400kg)·제리캔·복합용기, 필요 시 방습 내부라이너.\nPG I 은 포장 제한. (P002)' },
    P003: { desc: '물품(Articles) 및 특정 물질용. 적절한 강도의 외부포장(상자·드럼)에 물품을 고정·완충하여 운송 중 이동·손상 방지. 다수 특별규정(PP/PB) 연계. (P003)' },
    P004: { desc: 'UN3473 연료전지 카트리지, UN3476/3477 등 관련 물품 — 견고한 외부포장에 고정, 누출·단락 방지.' },
    P010: { desc: '특정 액체(물반응성·고부식성 등)용. 강/기타금속 드럼·제리캔·복합용기만 허용(플라스틱 단독 불가), 최대용량 제한. (P010)' },
    P099: { desc: '주관청(관할당국)이 특별히 승인한 포장만 사용 가능. 승인 서류를 화물과 함께 비치.' },
    P101: { desc: '주관청이 승인한 포장만 사용 가능(승인 조건 명시).' },
    P110a: { desc: '폭발성 물질(Class 1) — 내부포장 없이 지정 외부포장에 직접 포장(습윤/둔감화 조건).' },
    P112a: { desc: '습윤 또는 둔감화된 폭발성 물질(Class 1.1D) — 지정 내부포장(주머니·용기)+외부포장, 습윤상태 유지.' },
    P114a: { desc: '건조 폭발성 물질(내부포장 없이) — 지정 외부포장, 정전기·마찰 방지.' },
    P114b: { desc: '건조 폭발성 물질(내부포장 있음) — 내부포장(주머니·용기)+외부포장.' },
    P116: { desc: '폭발성 물질 — 지정 내·외부포장, 완충·방습·정전기 방지 요건.' },
    P130: { desc: '폭발성 물품(폭죽·신호탄 등) — 지정 상자에 완충 고정.' },
    P137: { desc: '폭발성 물품(탄약 등) — 격벽·완충으로 개별 고정, 이동 방지.' },
    P144: { desc: '폭발성 물품(로켓모터 등) — 개별 완충·고정 포장으로 충격 전파 방지.' },
    P200: { desc: '압축·액화·용해 가스(Class 2)용. 실린더·튜브·압력드럼·다발(bundle) 등 압력용기 사용.\n가스별로 최소 시험압력·최대 충전비(filling ratio/degree of filling)·정기 재검사 주기(대개 5년 또는 10년) 규정. 밸브 보호캡·다기관 요건 포함. (P200)' },
    P203: { desc: '냉동액화가스(Class 2)용. 폐쇄형 단열 압력용기 또는 개방형 냉동용기, 감압장치·충전율·보온유지시간(holding time) 규정. (P203)' },
    P206: { desc: '살충제 가스·냉매 등 지정 가스(Class 2.1/2.2)용 실린더·압력용기, 안정제/밸브 요건.' },
    P207: { desc: 'UN1950 에어로졸 — 금속 내압용기, 외부포장(상자·드럼 또는 트레이+수축포장). 온도·압력·낙하 요건.' },
    P208: { desc: '흡착가스(Adsorbed gas, UN3510~3518 등)용 실린더/압력용기.' },
    P302: { desc: 'UN3269/3527 폴리에스터 수지 키트 — 기제(수지)+경화제(과산화물)를 한 외부포장에 조합, 각 성분 내부포장 한도.' },
    P400: { desc: '자연발화성/물반응성 액체(Class 4.2·4.3) — 강/기타금속 단일포장 또는 조합포장, 기밀 밀폐·불활성 가스 봉입 등. (P400)' },
    P401: { desc: '물반응성 액체(Class 4.3) — 지정 단일/조합포장, 방수 밀폐.' },
    P402: { desc: '물반응성 액체(Class 4.3) — 지정 금속/복합 포장, 방습.' },
    P403: { desc: '자연발화성/물반응성 고체(Class 4.2·4.3) — 기밀 금속포장 또는 방습 조합포장.' },
    P404: { desc: '자연발화성 고체(Class 4.2, 피로포릭) — 기밀 금속용기, 불활성 분위기 유지.' },
    P406: { desc: '습윤 인화성 고체(Class 4.1, 둔감화 폭발물 등) — 물/알코올 습윤상태 유지 포장.' },
    P410: { desc: '인화성 고체/자기가열성/물반응 고체(Class 4.1·4.2·4.3) 다목적 — 조합포장 및 단일포장(드럼·제리캔·복합) 광범위 허용, PG별 한도.' },
    P411: { desc: 'UN3242 등 지정 자기반응 물질 — 온도관리·지정 포장.' },
    P500: { desc: 'UN3356 화학 산소발생기 — 발화방지 장치·고정 포장, 우발 작동 방지.' },
    P501: { desc: 'UN2014/2015 과산화수소 수용액(고농도) — 통기(vent) 포장, 압력상승 방지.' },
    P502: { desc: '산화성 가스·지정 산화성 물질용 지정 포장.' },
    P503: { desc: '산화성 고체/액체(Class 5.1) — 지정 조합/단일포장.' },
    P504: { desc: '산화성 액체(Class 5.1, 과산화수소 등) — 통기 가능 포장.' },
    P520: { desc: '유기과산화물(Class 5.2) 및 자기반응성 물질(Class 4.1) — 유형(Type B~F)별 지정 조합/단일포장. 온도관리 대상은 운송 중 관리온도(TDG)·비상온도 유지. (P520)' },
    P601: { desc: '독성 액체(Class 6.1, 흡입독성 포함) — 이중 밀폐(견고한 단일포장 또는 조합포장), 누출방지·기밀 엄격, 다수 성능시험. (P601)' },
    P602: { desc: '독성물질(Class 6.1) — 지정 조합/단일포장, 누출방지.' },
    P620: { desc: '감염성 물질 Category A(UN2814 사람감염성 / UN2900 동물감염성) — 3중 포장: ①방수 1차용기(+흡수재) ②방수 2차용기 ③견고한 외부포장. UN2814/2900 성능시험(6.3.5) 통과 및 마름모 표시 필수. (P620)' },
    P621: { desc: '임상·의료 폐기물(UN3291) — 누출방지·천공저항 견고한 포장, 액상은 흡수재 포함.' },
    P650: { desc: 'UN3373 Category B 생물학적 물질 — 3중 포장: ①1차 방수용기(+흡수재) ②2차 방수용기 ③견고한 외부포장(최소 한 면 100×100mm). 조립 상태 1.2m 낙하시험 통과, "BIOLOGICAL SUBSTANCE, CATEGORY B" 및 UN3373 마름모 표시. (4.1.4.1 P650)' },
    P800: { desc: '수은(UN2809) 등 — 강/기타금속 또는 견고한 밀폐 포장, 누출방지.' },
    P801: { desc: '신품·중고 축전지(UN2794 산성/2795 알칼리성/2800/3028) — 누출·단락 방지, 단자 보호·절연, 적재 시 이동·전도 방지. (P801)' },
    P802: { desc: '부식성 물질(Class 8) 특정 — 지정 내산/내알칼리 포장.' },
    P901: { desc: '화학물질 키트/구급함(UN3316) — 내부포장 소량 한도 내 위험물 조합, 완충 고정.' },
    P902: { desc: '위험물 함유 물품(UN3268 안전장치 등) — 견고한 외부포장에 고정, 우발 작동 방지.' },
    P903: { desc: '리튬전지/셀 및 장비 포함·장착(UN3480·3481·3090·3091·3536) — 튼튼한 외부포장, 단락방지·절연, 손상/불량 전지 제외. (P903)' },
    P908: { desc: '손상·불량 리튬전지/셀 — 개별 절연·비전도 완충재로 감싸 누출/열폭주 대비, 견고한 포장.' },
    P909: { desc: '폐기·재활용 목적 리튬전지/셀 — 지정 조건의 견고한 포장.' },
    P910: { desc: '소량생산 또는 시제품 리튬전지/셀 — 강화 외부포장·단락방지, 개당 용량 한도.' },
    P911: { desc: '운송 중 위험발생 우려 손상 리튬전지 — 최고강도 포장·열폭주(연쇄발화) 억제 설계.' },
    // ── 대형포장 LP ──
    LP01: { desc: '대형포장(Large Packaging) - 액체용.' },
    LP02: { desc: '대형포장(Large Packaging) - 고체용.' },
    IBC01: { desc: '액체용 금속 IBC.' }, IBC02: { desc: '액체용 IBC(금속·경질플라스틱·복합).' }, IBC03: { desc: '액체용 IBC.' },
    IBC04: { desc: '고체(중력식 충전·배출)용 금속 IBC.' }, IBC05: { desc: '고체용 IBC.' }, IBC06: { desc: '고체용 IBC.' },
    IBC07: { desc: '고체용 IBC.' }, IBC08: { desc: '고체용 IBC.' }, IBC99: { desc: '주관청 승인 IBC만 사용 가능.' },
    IBC100: { desc: '특정 폭발성 물질용 IBC.' }, IBC520: { desc: '지정 유기과산화물/자기반응성 물질용 IBC(농도·용량 조건).' },
    T11: { desc: '이동식 탱크 지침 T11: 최소 시험압력 6 bar, 하부 개구 허용, 감압장치 등 규정(액체 위험물).' },
    T23: { desc: '자기반응성 물질·유기과산화물용 이동식 탱크 지침.' },
    T50: { desc: '이동식 탱크 지침 T50: 비냉동 액화가스용.' },
    T75: { desc: '이동식 탱크 지침 T75: 냉동액화가스용.' },
    TP1: { desc: '충전율(Degree of filling) 규정: 충전율이 97 / (1 + α(t_r − t_f)) % 를 초과하지 않아야 함.' },
    TP2: { desc: '충전율 규정: 95 / (1 + α(t_r − t_f)) % 초과 금지.' },
    TP8: { desc: '인화점이 0℃를 초과하는 물질은 시험압력을 1.5 bar로 낮춰 사용 가능.' },
    TP28: { desc: '해당 물질의 증기압을 반영해 산정한 시험압력 이상의 이동식 탱크 사용.' },
    B20: { desc: 'IBC 특별규정 B20: 지정 조건(재질·구조) 하에서만 IBC 사용 허용.' }
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
// 세부분류 없는 메인 클래스 → 격리표 하위 키 (예: "2" → 2.1/2.2/2.3)
const MAIN_SUBDIVISIONS = {
  '1': ['1.1 1.2 1.5', '1.3 1.6', '1.4'],
  '2': ['2.1', '2.2', '2.3'],
  '4': ['4.1', '4.2', '4.3'],
  '5': ['5.1', '5.2'],
  '6': ['6.1', '6.2']
};
// 클래스를 격리표 키 배열로 확장 (이미 세부분류/복합키면 그대로, 메인클래스면 하위로 확장)
function expandSegKeys(cls) {
  const n = normalizeClass(cls);
  if (n && REF.segTable[n]) return [n];
  if (MAIN_SUBDIVISIONS[n]) return MAIN_SUBDIVISIONS[n];
  return [];
}
// 격리코드 → 사람이 읽는 라벨
const SEG_CODE_TEXT = { 0: 'X(격리 없음)', 1: '1 Away from(이격)', 2: '2 Separated from(격리)', 3: '3 완전구획 격리', 4: '4 종방향 구획 격리' };
function segCodeText(code) {
  if (code === 'X') return 'X(격리 없음)';
  if (code === '*') return 'Class 1 특수규정';
  return SEG_CODE_TEXT[code] || String(code);
}
function segCodeRank(code) {
  if (code === '*') return 99;
  if (code === 'X') return 0;
  return typeof code === 'number' ? code : 0;
}
// 두 클래스 간 기본 격리코드. 세부분류가 명확하면 단일 값, 미상이라 결과가 갈리면 분류별 breakdown 반환.
// 반환: {val:number|'X'|'*'} | {ambiguous:true, groups:[{code,keys}], maxNum} | {unresolved:true}
function segBaseLookup(rawA, rawB) {
  const A = expandSegKeys(rawA), B = expandSegKeys(rawB);
  if (!A.length || !B.length) return { unresolved: true };
  const byCode = new Map();   // code → 해당 코드를 만드는 (모호한 쪽) 세부분류 라벨 집합
  let maxNum = null;
  for (const a of A) {
    const row = REF.segTable[a]; if (!row) continue;
    for (const b of B) {
      const v = row[b];
      if (v === undefined) continue;
      let label;
      if (A.length > 1 && B.length > 1) label = `${a}↔${b}`;
      else if (A.length > 1) label = a;
      else if (B.length > 1) label = b;
      else label = `${a}↔${b}`;
      if (!byCode.has(v)) byCode.set(v, new Set());
      byCode.get(v).add(label);
      if (typeof v === 'number' && (maxNum === null || v > maxNum)) maxNum = v;
    }
  }
  if (byCode.size === 0) return { unresolved: true };
  if (byCode.size === 1) return { val: [...byCode.keys()][0] };   // 세부분류와 무관하게 동일 → 단일 안내
  const groups = [...byCode.entries()]
    .map(([code, set]) => ({ code, keys: [...set] }))
    .sort((x, y) => segCodeRank(y.code) - segCodeRank(x.code));
  return { ambiguous: true, groups, maxNum };
}

function calcPairSeg(a, b) {
  let maxLevel = 0;
  let hasStar = false;
  let baseAmbiguous = null;   // 세부분류 미상으로 기본 클래스 격리가 갈릴 때의 분류별 안내문
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
    const look = segBaseLookup(a.Class, b.Class);
    if (look.unresolved) {
      addReason(2, `⚠️ Class ${a.Class || '?'} ↔ Class ${b.Class || '?'}: 클래스를 격리표에서 확인 불가 — 수동 확인 필요`);
    } else if (look.ambiguous) {
      const txt = look.groups.map(g => `${g.keys.join('·')}이면 ${segCodeText(g.code)}`).join(' / ');
      baseAmbiguous = `Class ${a.Class} ↔ Class ${b.Class}: 세부분류에 따라 상이 — ${txt} · 실제 분류(예: 에어로졸 SP63) 확인 필요`;
    } else if (look.val === 'X') {
      addReason(0, `Class ${a.Class} ↔ Class ${b.Class}: 격리적용없음 (DG 리스트 참조)`);
    } else if (look.val === '*') {
      addReason('*', `Class ${a.Class} ↔ Class ${b.Class}: Class 1 특수규정 (*)`);
    } else if (typeof look.val === 'number') {
      addReason(look.val, `Class ${a.Class} ↔ Class ${b.Class}: Seg ${look.val}`);
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

  let reasons = ruleHits.sort((x, y) => y.severity - x.severity).map(r => r.text);
  if (baseAmbiguous) reasons = [baseAmbiguous].concat(reasons.filter(r => r !== '별도 격리 규정 없음'));
  const ambiguous = !!baseAmbiguous;
  if (hasStar) return { level: '*', reasons: reasons.length ? reasons : ['Class 1 특수규정 (*)'], ambiguous };
  if (ambiguous && maxLevel === 0) return { level: 'AMB', reasons, ambiguous };   // 모호 + 다른 결정값 없음 → 분류별 배지
  return { level: maxLevel, reasons: reasons.length ? reasons : ['별도 격리 규정 없음'], ambiguous };
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

// UNNO 조회: 기존 결과를 초기화하고, 입력한 UNNO로 새 격리 결과를 본다.
//   (새 UNNO를 넣고 '조회'를 누르면 자동으로 이전 목록이 비워짐)
async function lookupEntries() {
  const input = document.getElementById('searchInput');
  entries = [];
  document.getElementById('errorMsg').innerHTML = '';
  if (!input || !input.value.trim()) { render(); return; }
  await addEntries();   // 빈 목록에 입력값을 추가 → 새 격리 결과
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
  if (level === 'AMB') return 's1';
  if (level === 'X') return 's0';
  if (level === '*') return 's4';
  if (level === 0) return 's0';
  return `s${level}`;
}

function segLabel(level) {
  if (level === 'AMB') return '분류별';
  if (level === 'X') return 'X';
  if (level === '*') return '*';
  if (level === 0) return 'OK';
  return String(level);
}

// 배지(숫자/OK) 아래에 들어갈 직관적 안내 문구
function segNeedLabel(level) {
  if (level === 1) return '<span class="pair-seg-need">분리필요!</span>';   // 1 = Away from(이격)
  if (typeof level === 'number' && level >= 2) return '<span class="pair-seg-need">격리필요!</span>';   // 2~4 = 격리
  if (level === 0) return '<span class="pair-seg-ok">혼적가능</span>';
  return '';
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

  const anyAmbiguous = pairs.some(p => p.ambiguous);
  const ambSuffix = anyAmbiguous ? ' · 일부 쌍은 세부분류에 따라 상이(아래 확인)' : '';

  let statusText, statusColor, statusIcon;
  if (maxOverall >= 3) {
    statusText = `Segregation ${maxOverall} — 엄격한 격리 필요${ambSuffix}`;
    statusColor = 'var(--red)'; statusIcon = '⚠️';
  } else if (maxOverall >= 1) {
    statusText = `Segregation ${maxOverall} — 격리 조건 준수 필요${ambSuffix}`;
    statusColor = 'var(--yellow)'; statusIcon = '⚠️';
  } else if (hasStar) {
    statusText = 'Class 1 특수규정 적용 — 별도 확인 필요 (*)';
    statusColor = 'var(--yellow)'; statusIcon = '⭐';
  } else if (anyAmbiguous) {
    statusText = '세부분류(2.1/2.2 등)에 따라 격리코드 상이 — 아래 분류별 안내 확인';
    statusColor = 'var(--yellow)'; statusIcon = '⚠️';
  } else {
    statusText = '혼적 가능 — 별도 격리 규정 없음';
    statusColor = 'var(--green)'; statusIcon = '✅';
  }

  // 격리코드(Seg n / n Away from / Separated from / X 등)를 굵게·하이라이트로 강조
  const emphSeg = s => String(s)
    .replace(/(Seg\s*[1-4])/g, '<b class="seg-code-hl">$1</b>')
    .replace(/([1-4]\s*Away from\([^)]*\)|[1-4]\s*Separated from\([^)]*\)|[1-4]\s*완전구획 격리|[1-4]\s*종방향 구획 격리|X\(격리 없음\))/g, '<b class="seg-code-hl">$1</b>')
    // "격리적용없음"은 강조하지 않음 — 격리코드로 오해할 수 있어, 얇은 참고 문구로만 표기
    .replace(/격리적용없음/g, '<span class="seg-noseg-note">CLASS별 격리조건없음</span>');

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
        <div class="pair-grid-header">
          <span class="pair-grid-label pair-grid-label--un">PAIR DETAIL</span>
          <span class="pair-grid-label pair-grid-label--seg">격리조건</span>
        </div>
        ${pairs.map(p => `
          <div class="pair-row">
            <span class="pair-un">UN${p.a} ↔ UN${p.b}</span>
            <span class="pair-seg-col">
              <span class="seg-badge ${segBadgeClass(p.level)}">${segLabel(p.level)}</span>
              ${segNeedLabel(p.level)}
            </span>
            <span class="pair-reason">${emphSeg(p.reasons.slice(0,3).join('<br>'))}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;padding:12px 24px;border-top:1px solid var(--border)">
        ${['OK — 혼적가능','1 — Away from','2 — Separated from','3 — Sep. by compartment','4 — Sep. longitudinally','X — 격리 적용 없음'].map((t,i) => {
          const cls = ['s0','s1','s2','s3','s0','s0'][i];
          const lbl = ['OK','1','2','3','4','X'][i];
          return `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)"><span class="seg-badge ${cls}" style="min-width:28px;padding:2px 6px">${lbl}</span>${t}</div>`;
        }).join('')}
      </div>
    </div>`;
}

// ── 10. 이벤트 리스너 ─────────────────────────────────────────
document.getElementById('lookupBtn').addEventListener('click', lookupEntries);   // 새 조회(초기화 후)
document.getElementById('addBtn').addEventListener('click', addEntries);          // 기존 결과에 추가
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') lookupEntries();   // Enter = 새 조회
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

    // 로그인 게이트 — 미로그인 시 HOME 외 메뉴 사용 차단(로그인 필요 안내).
    //   관리자 ID(wtlee 등)는 가입 시 자동 승인+관리자라 첫 로그인 후 회원관리 접근 가능(부트스트랩 OK).
    if (typeof dgIsAuthed === 'function' && !dgIsAuthed() && targetId !== 'tab-home' && targetId !== 'tab-manual') {
        dgShowLoginRequired();
        return;
    }

    menuItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-target') === targetId);
    });

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.id === targetId);
    });

    if (targetId === 'tab-notes') {
        fetchNotes();
    }
    if (targetId === 'tab-fire-cargo' && typeof renderFireCargo === 'function') {
        renderFireCargo();
    }
    if (targetId === 'tab-report' && typeof fqReportRender === 'function') {
        if (typeof fqSyncFaqRemote === 'function') fqSyncFaqRemote();
        if (typeof fqSyncPostsRemote === 'function') fqSyncPostsRemote();
        if (typeof fqAuditAutoCheck === 'function') fqAuditAutoCheck();   // 정오 기준 하루 1회 답변 자동 검토
        else fqReportRender();
        if (typeof dgRefreshMemberBadge === 'function') dgRefreshMemberBadge();   // 승인 대기 회원 알림 최신화
        if (typeof dgApplyReportAccess === 'function') dgApplyReportAccess();     // 권한별 서브탭 표시(관리자만 전체)
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

        // FAQ / 문의 게시판 카드: 모듈 내부 탭도 전환
        const fqTab = card.getAttribute('data-fq-init-tab');
        if (fqTab) {
            setTimeout(() => {
                document.querySelectorAll('#fqModule [data-fq-tab]').forEach(b => b.classList.toggle('active', b.dataset.fqTab === fqTab));
                document.querySelectorAll('#fqModule [data-fq-panel]').forEach(p => p.classList.toggle('active', p.dataset.fqPanel === fqTab));
                if (typeof fqSyncFaqRemote === 'function' && fqTab === 'faq') fqSyncFaqRemote();
                if (typeof fqSyncPostsRemote === 'function' && fqTab === 'board') fqSyncPostsRemote();
            }, 30);
        }
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
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.p_inst)}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.p_prov)}</div></div>

        <div class="grid-cell col-2 header-sub" style="background:transparent !important; color:var(--accent) !important; text-align:left; padding-left:15px !important;">IBCs</div>
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.ibc_inst)}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.ibc_prov)}</div></div>

        <div class="grid-cell col-2 header-sub" style="background:transparent !important; color:var(--accent) !important; text-align:left; padding-left:15px !important;">Tanks</div>
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.tank_inst)}</div></div>
        <div class="grid-cell col-2"><div class="cell-value">${renderPackingCodeLinks(res.tank_prov)}</div></div>

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

// 포장/탱크 코드(P·LP·IBC·T·TP·PP·B)를 클릭 가능한 링크로 렌더 → openImdgCodeModal('PACK', code)
function renderPackingCodeLinks(text) {
    const clean = String(text || '').trim();
    if (!clean || clean === '-' || clean === '—') return '-';
    const pattern = /\b(LP|IBC|TP|PP|BB|P|T|B|R)\s*(\d{1,3}[A-Za-z]?)\b/gi;
    let result = '', last = 0, m;
    while ((m = pattern.exec(clean)) !== null) {
        const code = (m[1] + m[2]).toUpperCase();
        result += escapeHtml(clean.slice(last, m.index));
        result += `<button type="button" class="imdg-code-link-btn imdg-code-pack" onclick="openImdgCodeModal('PACK','${escapeHtml(code)}')">${escapeHtml(code)}</button>`;
        last = pattern.lastIndex;
    }
    result += escapeHtml(clean.slice(last));
    return result || escapeHtml(clean);
}

// 포장지침 상세 표 (IMDG 4.1.4.1). 코드별로 추가 가능. 현재 P001(액체) 수록.
const PACKTABLE = {
  P001: {
    caption: 'P001 포장지침 (액체) — 소형용기(IBC·대형용기 제외)',
    note: '다음 포장용기는 4.1.1절·4.1.3절의 일반규정을 충족하는 경우 허용. 수치=최대용량/순질량(제4.1.3.3항).',
    innerRows: [['유리', '10 L'], ['플라스틱', '30 L'], ['금속', '40 L']],
    outer: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '75 kg', '400 kg', '400 kg'], ['알루미늄 (1B1, 1B2)', '75 kg', '400 kg', '400 kg'], ['기타 금속 (1N1, 1N2)', '75 kg', '400 kg', '400 kg'], ['플라스틱 (1H1, 1H2)', '75 kg', '400 kg', '400 kg'], ['합판 (1D)', '75 kg', '400 kg', '400 kg'], ['파이버 (1G)', '75 kg', '400 kg', '400 kg']] },
      { g: '상자', rows: [['강재 (4A)', '75 kg', '400 kg', '400 kg'], ['알루미늄 (4B)', '75 kg', '400 kg', '400 kg'], ['기타 금속 (4N)', '75 kg', '400 kg', '400 kg'], ['천연목재 (4C1, 4C2)', '75 kg', '400 kg', '400 kg'], ['합판 (4D)', '75 kg', '400 kg', '400 kg'], ['재생목재 (4F)', '75 kg', '400 kg', '400 kg'], ['파이버보드 (4G)', '75 kg', '400 kg', '400 kg'], ['발포 플라스틱 (4H1)', '40 kg', '60 kg', '60 kg'], ['경질 플라스틱 (4H2)', '75 kg', '400 kg', '400 kg']] },
      { g: '제리캔', rows: [['강재 (3A1, 3A2)', '60 kg', '120 kg', '120 kg'], ['알루미늄 (3B1, 3B2)', '60 kg', '120 kg', '120 kg'], ['플라스틱 (3H1, 3H2)', '30 kg', '120 kg', '120 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재, 상판 고정식 (1A1)', '250 L', '450 L', '450 L'], ['강재, 상판 분리식 (1A2)', '사용금지', '250 L', '250 L'], ['알루미늄, 상판 고정식 (1B1)', '250 L', '450 L', '450 L'], ['알루미늄, 상판 분리식 (1B2)', '사용금지', '250 L', '250 L'], ['기타 금속, 상판 고정식 (1N1)', '250 L', '450 L', '450 L'], ['기타 금속, 상판 분리식 (1N2)', '사용금지', '250 L', '250 L'], ['플라스틱, 상판 고정식 (1H1)', '250 L', '450 L', '450 L'], ['플라스틱, 상판 분리식 (1H2)', '사용금지', '250 L', '250 L']] }
    ],
    foot: '※ 제리캔·복합용기 등 단일용기 세부와 특별포장규정(PP)은 IMDG Code 4.1.4.1 P001 원문을 참조하세요.'
  },
  P002: {
    caption: 'P002 포장지침 (고체) — 소형용기(IBC·대형용기 제외)',
    note: '4.1.1절·4.1.3절 일반규정 충족 시 허용. 수치=최대 순질량(제4.1.3.3항). 종이·파이버 내장용기는 분말누출방지형·포장등급 I 제한 등 각주 있음. (IMDG amdt 38-16)',
    innerRows: [['유리', '10 kg'], ['플라스틱', '30 kg'], ['금속', '40 kg'], ['종이', '50 kg'], ['파이버', '50 kg']],
    outer: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '125 kg', '400 kg', '400 kg'], ['알루미늄 (1B1, 1B2)', '125 kg', '400 kg', '400 kg'], ['기타 금속 (1N1, 1N2)', '125 kg', '400 kg', '400 kg'], ['플라스틱 (1H1, 1H2)', '125 kg', '400 kg', '400 kg'], ['합판 (1D)', '125 kg', '400 kg', '400 kg'], ['파이버 (1G)', '125 kg', '400 kg', '400 kg']] },
      { g: '상자', rows: [['강재 (4A)', '125 kg', '400 kg', '400 kg'], ['알루미늄 (4B)', '125 kg', '400 kg', '400 kg'], ['기타 금속 (4N)', '125 kg', '400 kg', '400 kg'], ['천연목재 (4C1)', '125 kg', '400 kg', '400 kg'], ['천연목재 분말누출방지벽형 (4C2)', '250 kg', '400 kg', '400 kg'], ['합판 (4D)', '125 kg', '400 kg', '400 kg'], ['재생목재 (4F)', '125 kg', '400 kg', '400 kg'], ['파이버보드 (4G)', '75 kg', '400 kg', '400 kg'], ['발포 플라스틱 (4H1)', '40 kg', '60 kg', '60 kg'], ['경질 플라스틱 (4H2)', '125 kg', '400 kg', '400 kg']] },
      { g: '제리캔', rows: [['강재 (3A1, 3A2)', '75 kg', '120 kg', '120 kg'], ['알루미늄 (3B1, 3B2)', '75 kg', '120 kg', '120 kg'], ['플라스틱 (3H1, 3H2)', '75 kg', '120 kg', '120 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재 (1A1/1A2)', '400 kg', '400 kg', '400 kg'], ['알루미늄 (1B1/1B2)', '400 kg', '400 kg', '400 kg'], ['기타 금속 (1N1/1N2)', '400 kg', '400 kg', '400 kg'], ['플라스틱 (1H1/1H2)', '400 kg', '400 kg', '400 kg'], ['파이버 (1G)', '400 kg', '400 kg', '400 kg'], ['합판 (1D)', '400 kg', '400 kg', '400 kg']] },
      { g: '제리캔', rows: [['강재 (3A1/3A2)', '120 kg', '120 kg', '120 kg'], ['알루미늄 (3B1/3B2)', '120 kg', '120 kg', '120 kg'], ['플라스틱 (3H1/3H2)', '120 kg', '120 kg', '120 kg']] },
      { g: '상자', rows: [['강재 (4A)', '불허', '400 kg', '400 kg'], ['알루미늄 (4B)', '불허', '400 kg', '400 kg'], ['기타 금속 (4N)', '불허', '400 kg', '400 kg'], ['천연목재 (4C1)', '불허', '400 kg', '400 kg'], ['천연목재 분말누출방지벽형 (4C2)', '불허', '400 kg', '400 kg'], ['합판 (4D)', '불허', '400 kg', '400 kg'], ['재생목재 (4F)', '불허', '400 kg', '400 kg'], ['파이버보드 (4G)', '불허', '400 kg', '400 kg'], ['경질 플라스틱 (4H2)', '불허', '400 kg', '400 kg']] },
      { g: '포대', rows: [['포대 (5H3, 5H4, 5L3, 5M2)', '불허', '50 kg', '50 kg']] },
      { g: '복합용기', rows: [['플라스틱 내용기 드럼 (6HA1·6HB1·6HG1·6HD1·6HH1)', '400 kg', '400 kg', '400 kg'], ['플라스틱 내용기 크레이트/상자 (6HA2·6HB2·6HC·6HD2·6HG2·6HH2)', '75 kg', '75 kg', '75 kg'], ['유리 내용기 드럼/상자 (6PA1·6PB1·6PD1·6PG1·6PA2·6PB2·6PC·6PG2·6PD2·6PH2·6PH1)', '75 kg', '75 kg', '75 kg']] }
    ],
    foot: '압력용기(제4.1.3.6항 충족 시)도 허용. 각주·특별포장규정(PP7·PP8·PP9 등)은 IMDG 4.1.4.1 P002 원문 참조. (IMDG amdt 38-16)'
  },
  P010: {
    caption: 'P010 포장지침 (특정 액체)',
    note: '4.1.1절·4.1.3절 일반규정 충족 시 허용.',
    comboCols: ['최대 순질량'], singleCols: ['최대 용량'],
    innerRows: [['유리', '1 L'], ['강재', '40 L']],
    outer: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '400 kg'], ['플라스틱 (1H1, 1H2)', '400 kg'], ['합판 (1D)', '400 kg'], ['파이버 (1G)', '400 kg']] },
      { g: '상자', rows: [['강재 (4A)', '400 kg'], ['천연목재 (4C1, 4C2)', '400 kg'], ['합판 (4D)', '400 kg'], ['재생목재 (4F)', '400 kg'], ['파이버보드 (4G)', '400 kg'], ['발포 플라스틱 (4H1)', '60 kg'], ['경질 플라스틱 (4H2)', '400 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재, 상판 고정식 (1A1)', '450 L']] },
      { g: '제리캔', rows: [['강재, 상판 고정식 (3A1)', '60 L']] },
      { g: '복합용기', rows: [['플라스틱 내용기 강재 드럼 (6HA1)', '250 L']] }
    ],
    foot: '강재 압력용기(제4.1.3.6항 충족 시)도 허용. (IMDG amdt 38-16 P010)'
  },
  P402: {
    caption: 'P402 포장지침 (물반응성 액체)',
    note: '① 압력용기(강재, 최초시험 0.6MPa(6bar) 이상, 10년 정기시험, 운송 중 액체는 0.2bar 이상 불활성가스 층 아래). ② 결합용기(아래). ③④ 단일/복합용기. 내장용기는 나사식 폐쇄구+불활성 완충재·흡수제로 감쌀 것.',
    comboCols: ['최대 순질량'], singleCols: ['최대 용량'],
    innerRows: [['유리', '10 kg'], ['금속·플라스틱', '15 kg']],
    outer: [
      { g: '외장용기 (외장용기당 최대 125 kg)', rows: [['드럼 (1A1,1A2,1B1,1B2,1N1,1N2,1H1,1H2,1D,1G)', '125 kg'], ['상자 (4A,4B,4N,4C1,4C2,4D,4F,4G,4H1,4H2)', '125 kg'], ['제리캔 (3A1,3A2,3B1,3B2,3H1,3H2)', '125 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재 드럼 (1A1)', '250 L']] },
      { g: '복합용기', rows: [['플라스틱 내용기 강재/알루미늄 드럼 (6HA1, 6HB1)', '250 L']] }
    ],
    foot: '특별포장규정 PP31(지정 UN 기밀밀봉) 등은 IMDG 4.1.4.1 P402 원문 참조. (amdt 38-16)'
  },
  P403: {
    caption: 'P403 포장지침 (물반응성/자연발화성 고체 등)',
    note: '4.1.1절·4.1.3절 일반규정 충족 시 허용. 내장용기는 기밀밀봉(테이프·나사식 폐쇄구).',
    comboCols: ['최대 순질량'], singleCols: ['최대 순질량'],
    innerRows: [['유리', '2 kg'], ['플라스틱', '15 kg'], ['금속', '20 kg']],
    outer: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '400 kg'], ['알루미늄 (1B1, 1B2)', '400 kg'], ['기타 금속 (1N1, 1N2)', '400 kg'], ['플라스틱 (1H1, 1H2)', '400 kg'], ['합판 (1D)', '400 kg'], ['파이버 (1G)', '400 kg']] },
      { g: '상자', rows: [['강재 (4A)', '400 kg'], ['알루미늄 (4B)', '400 kg'], ['기타 금속 (4N)', '400 kg'], ['천연목재 (4C1)', '250 kg'], ['천연목재 분말누출방지벽형 (4C2)', '250 kg'], ['합판 (4D)', '250 kg'], ['재생목재 (4F)', '125 kg'], ['파이버보드 (4G)', '125 kg'], ['발포 플라스틱 (4H1)', '60 kg'], ['경질 플라스틱 (4H2)', '250 kg']] },
      { g: '제리캔', rows: [['강재 (3A1, 3A2)', '120 kg'], ['알루미늄 (3B1, 3B2)', '120 kg'], ['플라스틱 (3H1, 3H2)', '120 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '250 kg'], ['알루미늄 (1B1, 1B2)', '250 kg'], ['기타 금속 (1N1, 1N2)', '250 kg'], ['플라스틱 (1H1, 1H2)', '250 kg']] },
      { g: '제리캔', rows: [['강재 (3A1, 3A2)', '120 kg'], ['알루미늄 (3B1, 3B2)', '120 kg'], ['플라스틱 (3H1, 3H2)', '120 kg']] },
      { g: '복합용기', rows: [['플라스틱 내용기 강재/알루미늄 드럼 (6HA1, 6HB1)', '250 kg'], ['플라스틱 내용기 파이버/플라스틱/합판 드럼 (6HG1, 6HH1, 6HD1)', '75 kg'], ['플라스틱 내용기 상자 (6HA2·6HB2·6HC·6HD2·6HG2·6HH2)', '75 kg']] }
    ],
    foot: '압력용기(제4.1.3.6항 충족 시)도 허용. 특별포장규정 PP31(지정 UN 기밀밀봉)은 원문 참조. (amdt 38-16 P403)'
  },
  P404: {
    caption: 'P404 포장지침 (자연발화성 고체 pyrophoric)',
    note: '적용 UN: 1383·1854·1855·2008·2441·2545·2546·2846·2881·3200·3391·3393. 내장용기: 금속(15kg, 기밀밀봉·나사식) 또는 유리(1kg, 개스킷·완충 후 기밀 금속캔 수납).',
    comboCols: ['최대 순질량'], singleCols: ['최대 총질량'],
    innerRows: [['금속', '15 kg'], ['유리', '1 kg']],
    outer: [
      { g: '외장용기 (외장용기당 최대 125 kg)', rows: [['드럼/상자 (1A1,1A2,1B1,1B2,1N1,1N2,1H1,1H2,1D,1G,4A,4B,4N,4C1,4C2,4D,4F,4G,4H2)', '125 kg']] }
    ],
    single: [
      { g: '금속용기', rows: [['1A1,1A2,1B1,1N1,1N2,3A1,3A2,3B1,3B2', '150 kg']] },
      { g: '복합용기', rows: [['플라스틱 내용기 강재/알루미늄 드럼 (6HA1, 6HB1)', '150 kg']] }
    ],
    foot: '압력용기(제4.1.3.6항 충족 시)도 허용. PP31·PP86(UN3391·3393 질소치환 등)은 원문 참조. (amdt 38-16 P404)'
  },
  P410: {
    caption: 'P410 포장지침 (고체 — Class 4.1/4.2/4.3 등)',
    note: '4.1.1절·4.1.3절 일반규정 충족 시 허용. 포장등급 I 없음(II·III만). 종이·파이버 내장용기는 분말누출방지·액화가능물질 제한 각주 있음.',
    comboCols: ['PG II', 'PG III'], singleCols: ['PG II', 'PG III'],
    innerRows: [['유리', '10 kg'], ['플라스틱', '30 kg'], ['금속', '40 kg'], ['종이', '10 kg'], ['파이버', '10 kg']],
    outer: [
      { g: '드럼', rows: [['강재 (1A1, 1A2)', '400 kg', '400 kg'], ['알루미늄 (1B1, 1B2)', '400 kg', '400 kg'], ['기타 금속 (1N1, 1N2)', '400 kg', '400 kg'], ['플라스틱 (1H1, 1H2)', '400 kg', '400 kg'], ['합판 (1D)', '400 kg', '400 kg'], ['파이버 (1G)', '400 kg', '400 kg']] },
      { g: '상자', rows: [['강재 (4A)', '400 kg', '400 kg'], ['알루미늄 (4B)', '400 kg', '400 kg'], ['기타 금속 (4N)', '400 kg', '400 kg'], ['천연목재 (4C1)', '400 kg', '400 kg'], ['천연목재 분말누출방지벽형 (4C2)', '400 kg', '400 kg'], ['합판 (4D)', '400 kg', '400 kg'], ['재생목재 (4F)', '400 kg', '400 kg'], ['파이버보드 (4G)', '400 kg', '400 kg'], ['발포 플라스틱 (4H1)', '60 kg', '60 kg'], ['경질 플라스틱 (4H2)', '400 kg', '400 kg']] },
      { g: '제리캔', rows: [['강재 (3A1, 3A2)', '120 kg', '120 kg'], ['알루미늄 (3B1, 3B2)', '120 kg', '120 kg'], ['플라스틱 (3H1, 3H2)', '120 kg', '120 kg']] }
    ],
    single: [
      { g: '드럼', rows: [['강재 (1A1/1A2)', '400 kg', '400 kg'], ['알루미늄 (1B1/1B2)', '400 kg', '400 kg'], ['기타 금속 (1N1/1N2)', '400 kg', '400 kg'], ['플라스틱 (1H1/1H2)', '400 kg', '400 kg']] },
      { g: '제리캔', rows: [['강재 (3A1/3A2)', '120 kg', '120 kg'], ['알루미늄 (3B1/3B2)', '120 kg', '120 kg'], ['플라스틱 (3H1/3H2)', '120 kg', '120 kg']] },
      { g: '상자', rows: [['강재 (4A)', '400 kg', '400 kg'], ['알루미늄 (4B)', '400 kg', '400 kg'], ['기타 금속 (4N)', '400 kg', '400 kg'], ['천연목재 (4C1)', '400 kg', '400 kg'], ['천연목재 분말누출방지벽형 (4C2)', '400 kg', '400 kg'], ['합판 (4D)', '400 kg', '400 kg'], ['재생목재 (4F)', '400 kg', '400 kg'], ['파이버보드 (4G)', '400 kg', '400 kg'], ['경질 플라스틱 (4H2)', '400 kg', '400 kg']] },
      { g: '포대', rows: [['포대 (5H3, 5H4, 5L3, 5M2)', '50 kg', '50 kg']] },
      { g: '복합용기', rows: [['플라스틱 내용기 드럼 (6HA1·6HB1·6HG1·6HD1·6HH1)', '400 kg', '400 kg'], ['플라스틱 내용기 상자 (6HA2·6HB2·6HC·6HD2·6HG2·6HH2)', '75 kg', '75 kg'], ['유리 내용기 드럼/상자 (6PA1·6PB1·6PD1·6PG1·6PA2·6PB2·6PC·6PD2·6PG2·6PH1·6PH2)', '75 kg', '75 kg']] }
    ],
    foot: '압력용기(제4.1.3.6항 충족 시)도 허용. PP31·PP39·PP40(포대 불허 UN)·PP100 등은 IMDG 4.1.4.1 P410 원문 참조. (amdt 38-16)'
  },
  P411: {
    caption: 'P411 포장지침 (UN3270 니트로셀룰로오스 멤브레인 필터)',
    note: '내부압력 상승으로 폭발이 일어날 가능성이 없는 구조일 것. 최대 순질량 30kg 초과 금지.',
    singleCols: ['최대 순질량'],
    single: [
      { g: '허용 용기', rows: [['드럼 (1A2, 1B2, 1N2, 1H2, 1D, 1G)', '30 kg'], ['상자 (4A,4B,4N,4C1,4C2,4D,4F,4G,4H1,4H2)', '30 kg'], ['제리캔 (3A2, 3B2, 3H2)', '30 kg']] }
    ],
    foot: '(IMDG amdt 38-16 P411)'
  },
  P504: {
    caption: 'P504 포장지침 (산화성 액체 Class 5.1)',
    note: '4.1.1절·4.1.3절 일반규정 충족 시 허용. 결합용기는 내장용기 종류·외장용기에 따라 최대 순질량이 다름.',
    singleCols: ['최대 용량/순질량'],
    single: [
      { g: '결합용기 (내장용기 기준, 외장 순질량)', rows: [['유리 내장용기 ≤ 5 L', '75 kg'], ['플라스틱 내장용기 ≤ 30 L', '75 kg'], ['금속 내장용기 ≤ 40 L (외장 1G·4F·4G)', '125 kg'], ['금속 내장용기 ≤ 40 L (기타 외장)', '225 kg']] },
      { g: '단일용기 - 드럼(상판 고정식)', rows: [['강재/알루미늄/기타금속/플라스틱 (1A1,1B1,1N1,1H1)', '250 L']] },
      { g: '단일용기 - 제리캔(상판 고정식)', rows: [['강재/알루미늄/플라스틱 (3A1,3B1,3H1)', '60 L']] },
      { g: '복합용기', rows: [['플라스틱 내용기 강재/알루미늄 드럼 (6HA1,6HB1)', '250 L'], ['플라스틱 내용기 파이버/플라스틱/합판 드럼 (6HG1,6HH1,6HD1)', '120 L'], ['플라스틱 내용기 상자 (6HA2·6HC·6HD2·6HG2·6HH2)', '60 L'], ['유리 내용기 드럼/상자 (6PA1·6PB1·6PD1·6PG1·6PA2·6PB2·6PC·6PG2·6PD2·6PH1·6PH2)', '60 L']] }
    ],
    foot: '특별포장규정 PP10(UN2014·3149 통기구)·PP31(UN2626 기밀밀봉)은 IMDG 4.1.4.1 P504 원문 참조. (amdt 38-16)'
  }
};
function renderPackTableHtml(code) {
  const t = PACKTABLE[code]; if (!t) return '';
  const e = escapeHtml;
  const comboCols = t.comboCols || ['PG I', 'PG II', 'PG III'];   // 결합-외장 값 열
  const singleCols = t.singleCols || ['PG I', 'PG II', 'PG III']; // 단일용기 값 열
  const grpTable = (head, groups, cols) => {
    const span = cols.length + 1;
    let h = `<table class="pack-table"><tr><th>${e(head)}</th>${cols.map(c => `<th>${e(c)}</th>`).join('')}</tr>`;
    groups.forEach(gr => {
      h += `<tr class="pack-grp"><td colspan="${span}">${e(gr.g)}</td></tr>`;
      gr.rows.forEach(r => { h += `<tr><td>${e(r[0])}</td>` + cols.map((_, k) => `<td>${e(r[1 + k] == null ? '' : r[1 + k])}</td>`).join('') + `</tr>`; });
    });
    return h + '</table>';
  };
  let h = `<div class="pack-table-wrap"><div class="pack-table-title">📦 ${e(t.caption)}</div>`;
  if (t.note) h += `<div class="pack-note">${e(t.note)}</div>`;
  if (t.innerRows && t.outer) {
    // 그림처럼 내장용기(좌) + 외장용기(우) 병렬 배치 — 내장용기 2열은 전체 행에 rowspan
    const seq = [];
    t.outer.forEach(gr => { seq.push({ grp: gr.g }); gr.rows.forEach(r => seq.push({ row: r })); });
    const N = seq.length, cspan = comboCols.length + 1;
    const inNames = t.innerRows.map(r => e(r[0])).join('<br>');
    const inCaps = t.innerRows.map(r => e(r[1])).join('<br>');
    h += `<div class="pack-sec">결합용기 (Combination packaging)</div>`;
    h += `<table class="pack-table pack-combo"><tr><th colspan="2">내장용기</th><th>외장용기</th>${comboCols.map(c => `<th>${e(c)}</th>`).join('')}</tr>`;
    seq.forEach((it, i) => {
      const left = i === 0 ? `<td class="pack-inner" rowspan="${N}">${inNames}</td><td class="pack-inner" rowspan="${N}">${inCaps}</td>` : '';
      if (it.grp) h += `<tr>${left}<td class="pack-grp" colspan="${cspan}">${e(it.grp)}</td></tr>`;
      else { const r = it.row; h += `<tr>${left}<td>${e(r[0])}</td>` + comboCols.map((_, k) => `<td>${e(r[1 + k] == null ? '' : r[1 + k])}</td>`).join('') + `</tr>`; }
    });
    h += `</table>`;
  }
  if (t.single) { h += `<div class="pack-sec">단일용기 (Single)</div>` + grpTable('단일용기', t.single, singleCols); }
  if (t.foot) h += `<div class="pack-foot">${e(t.foot)}</div>`;
  return h + '</div>';
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

    if (normalizedPrefix === 'PACK') {
        const c = normalizedCode;
        const item = REF.packcode?.[c];
        let content = item?.desc;
        if (!content) {
            if (/^LP/.test(c)) content = '대형포장(Large Packaging) 지침 — IMDG Code 4.1. 용기 종류·수용량 조건은 해당 지침 원문 참조.';
            else if (/^IBC/.test(c)) content = 'IBC(중형산적용기) 포장지침 — IMDG Code 4.1. 허용 IBC 종류·조건 규정.';
            else if (/^TP/.test(c)) content = '이동식 탱크 특별규정(TP) — IMDG Code 4.2.5. 충전율·시험압력 등 추가 조건.';
            else if (/^T/.test(c)) content = '이동식 탱크 지침(T) — IMDG Code 4.2/6.7. 최소 시험압력·판 두께·개구·감압장치 규정(번호가 클수록 엄격).';
            else if (/^PP/.test(c)) content = '포장 특별규정(PP) — IMDG Code 4.1. 특정 물질의 추가 포장 조건.';
            else if (/^B/.test(c)) content = 'IBC 특별규정(B) — IMDG Code 4.1. IBC 사용 시 추가 조건.';
            else if (/^P/.test(c)) content = '포장지침(P) — IMDG Code 4.1. 용기 종류·포장등급(PG)별 허용포장·최대 수용량 규정.';
            else content = `${c} 코드 설명이 아직 등록되어 있지 않습니다.`;
            content += ' ※ 정확한 조건은 IMDG Code 원문 대조가 필요합니다.';
        }
        return { title: c, group: 'Packing / Tank Code', subtitle: 'IMDG 포장·탱크 지침', content, tableHtml: renderPackTableHtml(c) };
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
        ${info.tableHtml || ''}
    `;

    const win = modal.querySelector('.modal-window');
    if (win) win.classList.toggle('has-packtable', !!(info.tableHtml));

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

// 선사 그룹별 원본 규정 파일 (carriers/ 폴더에 호스팅)
const CARRIER_DOCS = {
    SKR_HAL:     { url: '/carriers/skr_hal.pdf',  label: 'Sinokor & Heung-A 금지리스트 (VER.11)' },
    HMM_PARTNER: { url: '/carriers/hmm.pdf',      label: 'HMM Prohibited & Restricted List' },
    TSL:         { url: '/carriers/tsl.pdf',      label: 'TSL Restricted-Prohibited DG (Rev.29)' },
    KMTC:        { url: '/carriers/kmtc.pdf',      label: 'KMTC DG In-house Policy (2026.06.15, Amd 42-24)' },
    NSS_DYS:     { url: '/carriers/nss_dys.xlsx',  label: 'NSS & DYS DG Prohibition List (XLSX)' },
    CKL_PARTNER: { url: '/carriers/ckl.pdf',      label: 'CKL DG Prohibited & Restricted List (2024.06.28)' },
    DONGJIN:     { url: '/carriers/dongjin.xlsx', label: 'Dongjin Shipping DG Prohibited List (2024.06.28)' }
};

// SKR/HAL 리튬이온 배터리(UN3480·3481) RFDG 선적 조건 Remark (선사 규정집 L항)
const SKR_RFDG_REMARK = `<div class="carrier-rfdg-remark">
    <b>📌 LITHIUM ION BATTERIES — RFDG 선적 조건 (SKR/HAL)</b>
    <div>- ALL LITHIUM ION BATTERIES are <b>RFDG</b>. *SP188로 <b>비위험물(NON-DG)로 분류되는 9/3480·3481만</b> 예외적으로 <b>DRY 컨테이너</b>(DRY CNTR) 선적 가능.</div>
    <div>- <b>위험물(DG/RFDG)로 선적</b>되는 리튬이온 배터리는 <b>SKR/HAS 본사 승인 제조사</b>(SAMSUNG SDI / LG ENERGY SOLUTION〔LG Chem·LG 합작 PT. HLI GREEN POWER 포함〕 / SK ON)만 선적 가능. <b>SP188로 비위험물(NON-DG)로 분류되는 경우 제조사 제한 없음.</b></div>
</div>`;

function renderCarrierResultFromApi(dgItem, results) {
    const resultBox = document.getElementById('carrierCheckResult');

    carrierCommonRulesStore = {};

    const filteredResults = results.slice();
    // SKR/HAS(자사)를 항상 결과 최상단에 고정 (나머지는 기존 순서 유지)
    filteredResults.sort((a, b) =>
        (a.carrier_group === 'SKR_HAL' ? 0 : 1) - (b.carrier_group === 'SKR_HAL' ? 0 : 1));

    const unno = escapeHtml(dgItem.UNNO || '');
    const name = escapeHtml(dgItem.Name || '-');
    const classNo = escapeHtml(dgItem.Class || '-');
    const sub = escapeHtml(normalizeSubRisk(dgItem.SUB));

    // 포트별 선적가부 — 입력한 선적지/양하지/경유지 기준 (포트별 제한 데이터 연동 후 자동 판정)
    const pol = (document.getElementById('carrierPol')?.value || '').trim().toUpperCase();
    const pod = (document.getElementById('carrierPod')?.value || '').trim().toUpperCase();
    const via = (document.getElementById('carrierVia')?.value || '').trim().toUpperCase();
    const portEntries = [
        { role: '선적지 POL', val: pol },
        { role: '양하지 POD', val: pod },
        { role: '환적지 T/S', val: via }
    ].filter(p => p.val);
    let baseRoute;
    if (portEntries.length) {
        const cards = portEntries.map((p, i) => {
            const picKey = 'portPic_' + i;
            return `<div class="carrier-port-card">
                <div class="cpc-head">
                    <span class="cpc-role">${escapeHtml(p.role)}</span>
                    <span class="cpc-port">${escapeHtml(p.val)}</span>
                </div>
                <div class="cpc-status" id="portStatus_${i}">⏳ 포트별 선적제한 자동판정 조회 중…</div>
                <div class="cpc-note">📌 자세한 포트 규정에 대해서는 <b>LOCAL 담당자에게 문의주세요.</b></div>
                <button type="button" class="btn cpc-pic-btn" onclick="fqShowPortPic('${escapeHtml(p.val)}','${picKey}')">📇 담당자 연락처</button>
                <div class="cpc-pic" id="${picKey}"></div>
            </div>`;
        }).join('');
        baseRoute = `<div class="carrier-port-grid">${cards}</div>`;
    } else {
        baseRoute = `<div class="carrier-port-pending">선적지(POL)·양하지(POD)·환적지(T/S)를 입력하면 <b>포트별 담당자·제한 확인</b>이 함께 표시됩니다.</div>`;
    }
    // 상하이(CNSHA)는 CAS NUMBER 기준으로 금지/제한을 별도 확인해야 함
    const isCnsha = [pol, pod, via].some(v => /CNSHA|SHANGHAI|SHA\b|상하이|상해/i.test(v));
    const portHtml = baseRoute + (isCnsha ? fqShanghaiCasBox(unno) : '');

    // 카드 1개 HTML 생성 (공통 주의사항 store 채우기 포함). detailed=true면 자사(SKR/HAL) 상세 카드.
    const buildCarrierCard = (result, detailed) => {
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
            ? `<div class="carrier-common-action">
                   <button type="button" class="btn-sm carrier-common-btn" onclick="openCarrierCommonModal('${escapeHtml(commonKey)}')">공통 주의사항 조회</button>
               </div>`
            : '';

        const isOwn = result.carrier_group === 'SKR_HAL';
        const doc = CARRIER_DOCS[result.carrier_group];
        const docHtml = doc ? `
            <div class="carrier-doc-action">
                <a class="carrier-doc-link" href="${doc.url}" target="_blank" rel="noopener" title="${escapeHtml(doc.label)}">📄 원본 규정 보기</a>
            </div>` : '';

        return `
            <div class="carrier-result-card ${carrierStatusClass(result.status)}${isOwn ? ' carrier-own' : ''}${detailed ? ' carrier-own-detailed' : ''}">
                <div class="carrier-result-header">
                    <div class="carrier-name">${isOwn ? '⭐ ' : ''}${escapeHtml(result.carrier_name || result.carrier_group)}</div>
                    <div class="carrier-status">${escapeHtml(result.status_label || carrierStatusLabel(result.status))}</div>
                </div>
                <div class="carrier-rule-box">
                    ${ruleHtml}
                    ${(isOwn && /^0*(3480|3481)$/.test(String(dgItem.UNNO || '').trim())) ? SKR_RFDG_REMARK : ''}
                    ${commonButtonHtml}
                    ${docHtml}
                </div>
            </div>`;
    };

    // 자사(SKR/HAL)는 메인, 나머지는 접어두고 정렬: KMTC 먼저, SITC·TSL 맨 뒤
    const ownResults = filteredResults.filter(r => r.carrier_group === 'SKR_HAL');
    const otherResults = filteredResults.filter(r => r.carrier_group !== 'SKR_HAL');
    const carrierRank = (r) => {
        const g = (r.carrier_group || '').toUpperCase();
        const n = (r.carrier_name || '').toUpperCase();
        const has = (k) => g === k || g.indexOf(k) >= 0 || n.indexOf(k) >= 0;
        if (has('KMTC')) return 0;     // SKR/HAL 다음에 KMTC
        if (has('SITC')) return 98;    // SITC 맨 뒤
        if (has('TSL')) return 99;     // TSL 맨 뒤
        return 50;                     // 나머지는 기존 순서 유지
    };
    otherResults.sort((a, b) => carrierRank(a) - carrierRank(b));

    const ownHtml = ownResults.map(r => buildCarrierCard(r, true)).join('')
        || '<div class="carrier-rule-line muted">자사(SKR/HAL) 결과가 없습니다.</div>';
    const othersHtml = otherResults.map(r => buildCarrierCard(r, false)).join('');

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

        <div class="carrier-section-title">🚢 선사별 선적가부 <span class="carrier-section-note">(자사 SKR/HAL 기준)</span></div>
        <div class="carrier-own-main">
            ${ownHtml}
        </div>
        ${otherResults.length ? `
        <div class="carrier-others-wrap">
            <button type="button" class="carrier-others-toggle" id="carrierOthersToggle" aria-expanded="false" onclick="toggleCarrierOthers()">
                <span class="cot-chevron">▸</span>
                <span class="cot-label">다른 선사 규정도 참고로 확인하기</span>
                <span class="cot-count">${otherResults.length}개 선사</span>
            </button>
            <div class="carrier-others-panel" id="carrierOthersPanel" hidden>
                <div class="carrier-result-grid">
                    ${othersHtml}
                </div>
                <div class="carrier-others-notice">ℹ️ 타사(다른 선사) 규정은 변경될 수 있어 <b>참고용</b>입니다. 자세한·최신 규정은 해당 선사에 문의하시기 바랍니다.</div>
            </div>
        </div>` : ''}

        <div class="carrier-section-title">📍 포트별 선적가부</div>
        <div class="carrier-port-note">ℹ️ 포트별 선적가부는 <b>SKR/HAL 선박에 선적되는 화물 기준</b>입니다. 타사 선박 선적가부는 해당 선사에 문의하시기 바랍니다.</div>
        <div class="carrier-port-result">${portHtml}</div>

        <div style="margin-top:18px; color:var(--text-muted); font-size:12px; line-height:1.6;">
            ※ 선사별 결과는 선사 DG 금지/제한 리스트 기준이며, 포트별 결과는 선적지/양하지/경유지 항구 제한 기준으로 <b>별도 제공</b>됩니다. 실제 선적 전에는 IMDG Code, 터미널 규정, POL/POD 국가 규정, 선박 운항 조건을 함께 확인해야 합니다.
        </div>
    `;

    // 포트별 선적제한 자동판정 — 입력 포트별로 SVMS API 조회 후 카드 상태 갱신
    fqRunPortChecks(portEntries, dgItem.UNNO, classNo);
}

// POSITION 코드 → 한글 설명. A=양하·선적·환적 모두 금지, L=선적(POL) 금지, D=양하(POD) 금지, T·T/S=환적(T/S) 금지
function fqPosDesc(pos) {
  if (pos.has('A') || pos.has('ALL')) return '양하·선적·환적 모두 금지';
  const out = [];
  if (pos.has('L')) out.push('선적(POL) 금지');
  if (pos.has('D')) out.push('양하(POD) 금지');
  if (pos.has('T') || pos.has('T/S') || pos.has('TS')) out.push('환적(T/S) 금지');
  return out.length ? out.join(' · ') : '제한 등재';
}

// 입력 포트(POL/POD/T·S)별로 /api/carrier-check?port= 호출 → POSITION 기준 자동판정 표시
async function fqRunPortChecks(entries, unno, classNo) {
    if (!Array.isArray(entries) || !entries.length) return;
    const u = String(unno || '').replace(/^0+/, '');
    const cls = String(classNo || '').trim();
    const mainCls = cls.split('.')[0];
    for (let i = 0; i < entries.length; i++) {
        const p = entries[i];
        const el = document.getElementById('portStatus_' + i);
        if (!el) continue;
        const role = /POL/.test(p.role) ? 'POL' : /POD/.test(p.role) ? 'POD' : 'TS';
        const roleKr = role === 'POL' ? '선적(POL)' : role === 'POD' ? '양하(POD)' : '환적(T/S)';
        try {
            const r = await fetch(`/api/carrier-check?port=${encodeURIComponent(p.val)}&comp=SNKO`);
            const j = await r.json().catch(() => ({}));
            if (!j || !j.ok) {
                if (j && j.code === 'NO_KEY') { el.className = 'cpc-status cpc-status-warn'; el.innerHTML = '⏳ 포트 자동판정 미설정(키 등록 전) — 아래 담당자로 확인'; }
                else if (j && j.code === 'UNREACHABLE') { el.className = 'cpc-status cpc-status-warn'; el.innerHTML = '⚠️ 서버에서 포트DB 접근 불가 — 아래 담당자로 확인'; }
                else { el.className = 'cpc-status cpc-status-warn'; el.innerHTML = '⚠️ 포트 제한 조회 실패 — 아래 담당자로 확인'; }
                continue;
            }
            const data = Array.isArray(j.data) ? j.data : [];
            const hits = data.filter(row => {
                const ru = String(row.UNNO || '').replace(/^0+/, '').toUpperCase();
                if (ru === u) return true;
                if (String(row.UNNO || '').toUpperCase() === 'ALL') {
                    const rc = String(row.CLASS || '').trim();
                    return rc === cls || rc === mainCls;
                }
                return false;
            });
            if (!hits.length) {
                el.className = 'cpc-status cpc-status-plain';
                el.innerHTML = `<div class="cpc-verdict cpc-verdict-ok">✅ 선적 가능</div>`
                    + `<div class="cpc-verdict-sub"><b>${roleKr}</b> — 이 포트 제한목록에 미등재 (현재 기준 제한 없음)</div>`;
                continue;
            }
            // POSITION × 역할로 확정 판정: A=모두금지, L=선적(POL)금지, D=양하(POD)금지, T·T/S=환적(T/S)금지
            const pos = new Set(hits.map(h => String(h.POSITION || '').toUpperCase().replace(/\s/g, '')));
            const isAll = pos.has('A') || pos.has('ALL');
            const banned = role === 'POL' ? (isAll || pos.has('L'))
                : role === 'POD' ? (isAll || pos.has('D'))
                : (isAll || pos.has('T') || pos.has('T/S') || pos.has('TS'));
            const posLabel = [...pos].filter(Boolean).join(', ') || '-';
            const posDesc = fqPosDesc(pos);
            if (banned) {
                el.className = 'cpc-status cpc-status-plain';
                el.innerHTML = `<div class="cpc-verdict cpc-verdict-ban">🚫 선적 금지</div>`
                    + `<div class="cpc-verdict-sub"><b>${roleKr} 금지</b> — 이 포트 제한목록 등재<br>POSITION <b>${escapeHtml(posLabel)}</b> · ${escapeHtml(posDesc)}</div>`;
            } else {
                // 이 위험물이 제한목록에 있으나, 해당 POSITION이 이 역할(이동)에는 적용되지 않음 → 이 역할 기준 선적 가능
                el.className = 'cpc-status cpc-status-plain';
                el.innerHTML = `<div class="cpc-verdict cpc-verdict-ok">✅ 선적 가능</div>`
                    + `<div class="cpc-verdict-sub"><b>${roleKr}</b> 기준 제한 없음 · 이 위험물은 POSITION <b>${escapeHtml(posLabel)}</b>(${escapeHtml(posDesc)}) 제한 등재 — 해당 이동에만 적용됩니다.</div>`;
            }
        } catch (e) {
            el.className = 'cpc-status cpc-status-warn';
            el.innerHTML = '⚠️ 포트 제한 조회 오류 — 아래 담당자로 확인';
        }
    }
}

function toggleCarrierOthers() {
    const panel = document.getElementById('carrierOthersPanel');
    const btn = document.getElementById('carrierOthersToggle');
    if (!panel || !btn) return;
    const willOpen = panel.hasAttribute('hidden');
    if (willOpen) {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.classList.add('open');
    } else {
        panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('open');
    }
}

/* ── 상하이(CNSHA) CAS NUMBER 확인 ──
   중국 내하(內河) 금지/제한 위험화학품 목록(2019판, banned 228 + restricted 85)을
   CAS번호·UN번호·품명으로 조회. 데이터: window.SH_CAS_DATA (shanghai_cas.js) */
function fqShanghaiSearch(q) {
  const data = window.SH_CAS_DATA || [];
  const raw = String(q || '').trim();
  if (!raw) return [];
  const casNorm = raw.replace(/[^0-9-]/g, '');   // 하이픈 포함 CAS 형태
  const digits = raw.replace(/[^0-9]/g, '');      // 숫자만 (하이픈 제거)
  const low = raw.toLowerCase();
  return data.filter(it => {
    const itCas = it.cas || '';
    const itCasDigits = itCas.replace(/-/g, '');
    // CAS — 하이픈 포함 정확/부분 일치
    if (casNorm && itCas && (itCas === casNorm || (casNorm.length >= 4 && itCas.includes(casNorm)))) return true;
    // CAS — 하이픈 없이 숫자만 입력해도 인식 (CAS는 최소 5자리)
    if (digits.length >= 5 && itCasDigits && (itCasDigits === digits || itCasDigits.includes(digits))) return true;
    // UN — 3~4자리 숫자 (복합 UN 포함)
    if (digits.length >= 3 && it.un && it.un.includes(digits)) return true;
    // 품명/별명
    if (low.length >= 2 && ((it.name && it.name.toLowerCase().includes(low)) || (it.alias && it.alias.toLowerCase().includes(low)))) return true;
    return false;
  });
}
function fqShanghaiRenderRows(rows) {
  if (!rows.length) {
    return `<div class="sh-cas-none">✅ 입력하신 내용은 상하이 내하 금지/제한 목록에서 <b>찾을 수 없습니다.</b> (단, 본 목록 외 항만·터미널 규정이 별도로 있을 수 있으니 최종 확인 필요)</div>`;
  }
  return `<div class="sh-cas-rows">` + rows.slice(0, 20).map(it => {
    const banned = it.type === 'banned';
    return `<div class="sh-cas-row ${banned ? 'banned' : 'restricted'}">
      <span class="sh-cas-badge ${banned ? 'banned' : 'restricted'}">${banned ? '전면금지' : '제한'}</span>
      <div class="sh-cas-info">
        <div class="sh-cas-name">${escapeHtml(it.name || '-')}${it.alias ? ` <span class="sh-cas-alias">(${escapeHtml(it.alias)})</span>` : ''}</div>
        <div class="sh-cas-meta">CAS <b>${escapeHtml(it.cas || '-')}</b> · UN ${escapeHtml(it.un || '-')}</div>
      </div>
    </div>`;
  }).join('') + (rows.length > 20 ? `<div class="sh-cas-more">…외 ${rows.length - 20}건</div>` : '') + `</div>`;
}
function fqShanghaiCasBox(unno) {
  const auto = fqShanghaiSearch(unno);
  const autoHtml = (unno && auto.length)
    ? `<div class="sh-cas-auto">⚠️ 현재 조회한 <b>UN${escapeHtml(unno)}</b> 관련 품목이 상하이 금지/제한 목록에 있습니다:</div>` + fqShanghaiRenderRows(auto)
    : '';
  return `
    <div class="sh-cas-box">
      <div class="sh-cas-title">🇨🇳 상하이(CNSHA) 내하 위험화학품 — CAS NUMBER 확인</div>
      <div class="sh-cas-desc">상하이(상해)는 <b>UN번호만으로 판단할 수 없고 CAS NUMBER 기준</b>으로 금지/제한 여부를 확인해야 합니다. CAS번호(예: 75-86-5)·UN번호·품명을 입력해 조회하세요.</div>
      <div class="sh-cas-inputrow">
        <input type="text" id="shCasInput" placeholder="CAS번호(하이픈 없이도 가능: 75-86-5 또는 75865) / UN번호 / 품명" onkeydown="if(event.key==='Enter')fqShanghaiCasCheck()">
        <button type="button" class="btn accent2" onclick="fqShanghaiCasCheck()">확인</button>
      </div>
      <div id="shCasResult">${autoHtml}</div>
      <div class="sh-cas-note">※ 본 목록은 「내하 운송 금지/제한 위험화학품 목록(2019판)」 기준 참고자료이며, 변경될 수 있으니 최신 규정은 운항팀(DG센터)·현지에 확인하시기 바랍니다.</div>
    </div>`;
}
function fqShanghaiCasCheck() {
  const input = document.getElementById('shCasInput');
  const result = document.getElementById('shCasResult');
  if (!input || !result) return;
  const q = input.value.trim();
  if (!q) { result.innerHTML = `<div class="sh-cas-none">CAS번호·UN번호·품명을 입력하세요.</div>`; return; }
  result.innerHTML = fqShanghaiRenderRows(fqShanghaiSearch(q));
}

/* ── 포트별 LOCAL 담당자(PIC) 조회 ── (데이터: window.PORT_PIC_DATA / port_pic.js) */
function fqFindPortPic(portInput) {
  const data = window.PORT_PIC_DATA || [];
  const inp = String(portInput || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!inp) return null;
  for (const g of data) {
    for (const code of (g.codes || [])) {
      const c = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!c) continue;
      if (inp === c) return g;
      if (c.length >= 3 && (inp.endsWith(c) || inp.includes(c))) return g;
      if (c.length === 2 && (inp === c || inp.endsWith(c))) return g;
    }
  }
  // 국내(한국) 포트는 운항팀(DG센터)가 직접 담당 — 부산(KRPUS) 등 KR 포트는 dgcenter@sinokor.co.kr
  if (/^KR/.test(inp) || /^(PUS|BUSAN)/.test(inp)) {
    return {
      codes: [String(portInput || '').toUpperCase()],
      region: 'KOREA (운항팀 DG센터)',
      contacts: [{ role: 'DG CENTER', name: '장금상선 운항팀 (DG센터)', email: 'dgcenter@sinokor.co.kr' }]
    };
  }
  return null;
}
function fqShowPortPic(portInput, elemId) {
  const el = document.getElementById(elemId);
  if (!el) return;
  if (el.dataset.open === '1') { el.innerHTML = ''; el.dataset.open = '0'; return; }   // 토글
  const g = fqFindPortPic(portInput);
  if (!g || !g.contacts || !g.contacts.length) {
    el.innerHTML = `<div class="cpc-pic-none">해당 포트(<b>${escapeHtml(portInput)}</b>)의 등록된 LOCAL 담당자 정보가 없습니다. 운항팀(DG센터)에 문의해 주세요.</div>`;
    el.dataset.open = '1';
    return;
  }
  const emails = [...new Set(g.contacts.map(c => c.email).filter(Boolean))];
  const rows = g.contacts.map(c => `
    <div class="cpc-pic-row">
      <span class="cpc-pic-role">${escapeHtml(c.role || '담당')}</span>
      <span class="cpc-pic-name">${escapeHtml(c.name || '')}</span>
      <a class="cpc-pic-mail" href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>
    </div>`).join('');
  el.innerHTML = `
    <div class="cpc-pic-box">
      <div class="cpc-pic-title">📇 ${escapeHtml((g.codes || []).join('/'))} LOCAL 담당자 (${escapeHtml(g.region || '')})</div>
      ${rows}
      <a class="btn cpc-pic-all" href="mailto:${emails.join(',')}">✉️ 담당자 전체에게 메일쓰기</a>
    </div>`;
  el.dataset.open = '1';
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

// ── SKR/HAS 규정 변경 이력 (carriers/skr_versions.json) ──
let SKR_VERSIONS = null;
async function fqLoadSkrVersions() {
    if (SKR_VERSIONS) return SKR_VERSIONS;
    const r = await fetch('/carriers/skr_versions.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    SKR_VERSIONS = await r.json();
    return SKR_VERSIONS;
}
function skrLbl(k) { return /:ALL$/.test(String(k)) ? String(k).replace('C', 'Class ').replace(':ALL', ' 전체') : ('UN' + k); }
async function fqOpenSkrHistory() {
    const modal = document.getElementById('skrHistModal');
    const list = document.getElementById('skrHistList');
    const detail = document.getElementById('skrHistDetail');
    if (!modal) return;
    modal.hidden = false;
    detail.innerHTML = '';
    list.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span>이력을 불러오는 중…</div>';
    try {
        const data = await fqLoadSkrVersions();
        const vs = (data.versions || []).slice().reverse();   // 최신 먼저
        list.innerHTML = '<div class="skr-hist-title">버전 목록 (최신순) · 클릭 시 해당 버전 규정 조회</div>' +
            vs.map((v, i) => {
                const realIdx = data.versions.length - 1 - i;
                const cnt = v.count != null ? (v.count + '건') : '보관본';
                return `<div class="skr-ver" data-vi="${realIdx}">
                    <div class="skr-ver-head"><b>${fqEsc(v.version)}</b> <span class="skr-ver-date">${fqEsc(v.date || '')}</span> <span class="skr-ver-cnt">${cnt}</span></div>
                    <div class="skr-ver-remark">${fqEsc(v.remark || '')}</div>
                </div>`;
            }).join('');
        list.querySelectorAll('.skr-ver').forEach(el => el.addEventListener('click', () => fqShowSkrVersion(+el.dataset.vi)));
        if (data.versions.length) fqShowSkrVersion(data.versions.length - 1);   // 최신 버전 상세 기본 표시
    } catch (e) {
        list.innerHTML = '<div class="fq-ai-error">이력을 불러오지 못했습니다: ' + fqEsc(e.message) + '</div>';
    }
}
function fqShowSkrVersion(idx) {
    const data = SKR_VERSIONS; if (!data) return;
    const v = data.versions[idx]; if (!v) return;
    document.querySelectorAll('.skr-ver').forEach(el => el.classList.toggle('active', +el.dataset.vi === idx));
    const detail = document.getElementById('skrHistDetail');
    const cnt = v.count != null ? (v.count + '건 금지' ) : '보관본';
    let html = `<div class="skr-detail-head">${fqEsc(v.version)} <span>${fqEsc(v.date || '')} · ${cnt}</span></div>`;
    const hasChange = (v.added && v.added.length) || (v.removed && v.removed.length);
    if (!hasChange) {
        html += `<div class="skr-change-empty">${fqEsc(v.remark || '이전 버전 대비 변경 없음 / 기준본')}</div>`;
    } else {
        html += '<div class="skr-change-title">이전 버전 대비 변경내용</div>';
        if (v.added && v.added.length) {
            const det = v.addedDetail || [];
            html += '<div class="skr-diff-add"><b>＋ 추가 ' + v.added.length + '건</b><ul>' +
                (det.length ? det.map(d => `<li><b>${fqEsc(d.unno)}</b>${d.psn ? ' — ' + fqEsc(d.psn) : ''}</li>`).join('')
                            : v.added.map(k => `<li>${fqEsc(skrLbl(k))}</li>`).join('')) +
                '</ul></div>';
        }
        if (v.removed && v.removed.length) {
            html += '<div class="skr-diff-del"><b>－ 삭제 ' + v.removed.length + '건</b><ul>' +
                v.removed.map(k => `<li>${fqEsc(skrLbl(k))}</li>`).join('') + '</ul></div>';
        }
    }
    detail.innerHTML = html;
}
const skrHistBtn = document.getElementById('skrHistBtn');
if (skrHistBtn) skrHistBtn.addEventListener('click', fqOpenSkrHistory);
const skrHistCloseBtn = document.getElementById('skrHistClose');
if (skrHistCloseBtn) skrHistCloseBtn.addEventListener('click', () => { const m = document.getElementById('skrHistModal'); if (m) m.hidden = true; });
const skrHistModalEl = document.getElementById('skrHistModal');
if (skrHistModalEl) skrHistModalEl.addEventListener('click', e => { if (e.target === skrHistModalEl) skrHistModalEl.hidden = true; });

const carrierCheckInput = document.getElementById('carrierCheckInput');
if (carrierCheckInput) {
    carrierCheckInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkCarrierLoadingPossibility();
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

async function runHomeSegQuickSearch() {
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
    await lookupEntries();   // 새 조회(초기화 후)

    // 조회 결과(격리 분석 패널)로 바로 이동
    const panel = document.getElementById('segPanel');
    if (panel && entries.length) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    fqLastSdsResult = result;   // 질문(fqSdsAsk)용 최근 판독 결과 저장
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
            ${renderSdsField('특별규정 (SP)', result.special_provisions)}
            ${renderSdsField('Watt-hour', result.watt_hour)}
            ${(result.manufacturer_status && result.manufacturer_status !== 'N/A')
              ? renderSdsField('제조사', result.manufacturer) +
                renderSdsField('제조사 승인', result.manufacturer_status === 'APPROVED' ? '✅ 승인 제조사'
                  : result.manufacturer_status === 'NOT_APPROVED' ? '❌ 승인 아님 — 운항팀 확인'
                  : '⚠️ 확인불가 — 운항팀 확인')
              : ''}
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

let fqLastSdsResult = null;
// SDS 판독 결과 + 사내 FAQ·규정 + SKR/HAL 선적가부를 매칭해 질문에 답변 (AI 문의하기와 동일 로직: /api/faq-ai answer)
async function fqSdsAsk() {
    const inputEl = document.getElementById('sdsAskInput');
    const ansEl = document.getElementById('sdsAskAnswer');
    const q = (inputEl && inputEl.value || '').trim();
    if (!q) { fqToast('질문을 입력하세요', 'warn'); return; }
    if (!fqLastSdsResult) { fqToast('먼저 SDS/MSDS를 판독해 주세요', 'warn'); return; }
    if (ansEl) ansEl.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span>🤖 MSDS 정보와 사내 규정을 매칭해 답변을 만들고 있습니다…</div>';
    try {
        const r = fqLastSdsResult;
        const sdsSummary = '[분석된 MSDS 정보]\n'
            + '- 품명/물질: ' + (r.product_name || '-') + ' / ' + (r.substance_name || '-') + '\n'
            + '- DG여부: ' + (r.dg_status || '?') + ', UN: ' + (r.unno || '-') + ', Class: ' + (r.class || '-') + ', 부위험성: ' + (r.subsidiary_risk || '-') + ', PG: ' + (r.packing_group || '-') + '\n'
            + '- 특별규정: ' + (r.special_provisions || '-') + ', Watt-hour: ' + (r.watt_hour || '-') + ', 해양오염: ' + (r.marine_pollutant || '-') + '\n'
            + '- 제조사: ' + (r.manufacturer || '-') + ' (승인여부=' + (r.manufacturer_status || 'N/A') + '; 승인 제조사=SAMSUNG SDI/LG ENERGY SOLUTION/SK ON)\n'
            + '- 판정 근거: ' + String(r.basis || '').slice(0, 400);
        const fullQ = q + '\n\n' + sdsSummary;
        // 사내 FAQ·규정 컨텍스트 선별 (질문 + MSDS 키워드)
        const items = FQ_FAQ_DATA.items || [];
        const qWords = (q + ' ' + (r.product_name || '') + ' ' + (r.substance_name || '') + ' ' + (r.unno || '') + ' Class' + (r.class || '')).toLowerCase().split(/[\s,./]+/).filter(w => w.length > 1);
        const scored = items.map(it => { const hay = (it.q + ' ' + (it.a || '') + ' ' + ((it.tags || []).join(' '))).toLowerCase(); let s = 0; qWords.forEach(w => { if (hay.includes(w)) s++; }); return { it, s }; }).sort((a, b) => b.s - a.s);
        const top = scored.slice(0, 24).map(x => ({ q: x.it.q, a: (x.it.a || '').slice(0, 1500), cat: x.it.cat }));
        // 분석된 UN으로 DG_TABLE 상세 + SKR/HAL 선적가부 조회
        let dgData = [], skrCarrier = [];
        const um = String(r.unno || '').match(/\d{3,4}/);
        const unnos = um ? [um[0]] : [];
        if (unnos.length) {
            try { const dr = await fetch('/api/dg-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unnos }) }); const dj = await dr.json().catch(() => ({})); if (dr.ok && dj.ok && Array.isArray(dj.data)) dgData = dj.data; } catch (_) {}
            try { skrCarrier = await fqFetchSkrRules(unnos); } catch (_) {}
        }
        const res = await fetch('/api/faq-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: fullQ, context: top, dgData, unnos, skrCarrier }) });
        let j = {}; try { j = await res.json(); } catch (e) {}
        if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
        if (ansEl) ansEl.innerHTML =
            '<div class="fq-ai-result">' + fqRenderText(j.answer || '(빈 응답)') + '</div>' +
            '<div class="fq-ai-disclaimer">⚠️ AI 보조 답변입니다. MSDS 1차 판독 + 사내 규정 매칭 결과이며, 최종 판단은 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다.</div>';
    } catch (e) {
        if (ansEl) ansEl.innerHTML = '<div class="fq-ai-error">답변 생성 실패: ' + fqEsc(e.message) + '<br>잠시 후 다시 시도해 주세요.</div>';
    }
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

    const prevAns = document.getElementById('sdsAskAnswer');
    if (prevAns) prevAns.innerHTML = '';

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

        // 질문이 입력되어 있으면 판독과 동시에 답변
        const askInput = document.getElementById('sdsAskInput');
        if (askInput && askInput.value.trim()) {
            fqSdsAsk();
        }
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

// SDS/MSDS 드래그앤드롭 업로드 — 드롭존(.sds-drop-box)에 PDF를 끌어다 놓으면 파일 입력에 주입(기존 분석 흐름 그대로)
const sdsDropBox = document.querySelector('.sds-drop-box');
if (sdsDropBox && sdsFileInput) {
    ['dragenter', 'dragover'].forEach(ev => sdsDropBox.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation(); sdsDropBox.classList.add('drag');
    }));
    ['dragleave', 'dragend'].forEach(ev => sdsDropBox.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation(); sdsDropBox.classList.remove('drag');
    }));
    sdsDropBox.addEventListener('drop', e => {
        e.preventDefault(); e.stopPropagation();
        sdsDropBox.classList.remove('drag');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { alert('PDF 파일만 분석할 수 있습니다.'); return; }
        try {
            const dt = new DataTransfer();
            dt.items.add(f);
            sdsFileInput.files = dt.files;   // 드롭한 PDF를 파일 입력에 주입 → analyzeSdsDocument가 그대로 사용
        } catch (_) { /* DataTransfer 미지원 시 무시(파일 선택 사용) */ }
        updateSdsFileStatus();
    });
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
  REPLY_PWD: '1234',          // 담당자 답글 비밀번호
  FAQ_CACHE_KEY: 'dg_assistant_faq_dyn_v1',  // 동적 FAQ(DB) 오프라인 캐시
  API: '/api/inquiry'         // Supabase 공용 저장소 엔드포인트
};

// 게시판 답변·이메일 업로드가 자동 등록되는 FAQ 카테고리
const FQ_BOARD_FAQ_CAT = '💬 게시판 문의';
const FQ_EMAIL_FAQ_CAT = '📧 이메일 문의';

// ───── DG 관련 시드 FAQ (사이트 분석 기반) ─────
let FQ_FAQ_DATA = {
  "categories": [
    "🚫 전면 금지 화물",
    "🧭 위험물 판정 기준",
    "🔋 리튬 배터리",
    "🚗 차량 / EV",
    "🔥 인화성 (Cl.3)",
    "🍶 알콜류",
    "⚗️ 부식성 (Cl.8)",
    "💥 산화/자연발화",
    "🌊 해양 오염 물질",
    "💨 에어로졸 / 가스",
    "🧴 Flexitank / IBC",
    "❄️ RFDG (Reefer DG)",
    "📋 절차 / PRE-CHECK",
    "📄 서류 (MSDS/DGD)",
    "📦 적재 / 격리",
    "⚠️ 특별 규정 / LQ",
    "📘 IMDG 전문지식",
    "🧪 Class별 세부 규정",
    "🚨 사고 / 손상 대응"
  ],
  "items": [
    {
      "id": "alc-overview",
      "cat": "🍶 알콜류",
      "q": "알코올류(에탄올·메탄올·IPA 등)는 어떤 위험물로 분류되나요? 주요 UN번호는?",
      "a": "대부분의 알코올은 **인화성 액체(Class 3)** 입니다. 위험등급(PG)은 MSDS 9번의 **인화점(Flash Point)** 으로 결정합니다 — 인화점 **< 23°C → PG II**, **23~60°C → PG III**, **> 60°C → 비인화성(비위험물 가능)**.\n\n**주요 알코올 UN번호**\n- **에탄올(에틸알코올)·에탄올 수용액 → UN1170**, Class 3 (보통 PG II)\n- **메탄올(메틸알코올) → UN1230**, Class 3 + **부위험성 6.1(독성)**, PG II — ⚠️ 독성 동반, 취급 주의\n- **이소프로필알코올(IPA·이소프로판올) → UN1219**, Class 3, PG II\n- **부탄올·프로판올 등 기타 단일 알코올 → 품목별 UN**, 미지정 시 **UN1987 (ALCOHOLS, N.O.S.)**, Class 3\n- **독성 동반 알코올류 → UN1986 (ALCOHOLS, FLAMMABLE, TOXIC, N.O.S.)**, Class 3 + 6.1\n- **주류(술) → UN3065 (ALCOHOLIC BEVERAGES)**, Class 3\n\nMSDS 14번에 UN·Class가 있으면 그대로 신고하고, 없으면 인화점·성분으로 판정합니다. 메탄올처럼 **독성(6.1)** 이 함께 있는 경우가 있으니 성분 확인이 중요합니다.",
      "tags": ["알코올","알콜","에탄올","ethanol","메탄올","methanol","이소프로필","IPA","isopropanol","주류","UN1170","UN1219","UN1230","UN1987","UN1986","UN3065","Class 3","인화성","PG","인화점"]
    },
    {
      "id": "alc-lowconc-nondg",
      "cat": "🍶 알콜류",
      "q": "묽은(저농도) 알코올 수용액이나 술은 비위험물인가요? (SP144, UN3065)",
      "a": "알코올 농도가 낮으면 인화점이 높아져 **비위험물(NON-DG)** 이 될 수 있습니다.\n\n**① 주류·알코올 수용액 — SP144**\n- 특별규정 **SP144** 에 따라 **알코올 24%(부피 기준) 이하** 수용액은 IMDG 적용 대상이 아닙니다(NON-DG).\n- 24% 초과 주류는 **UN3065 (ALCOHOLIC BEVERAGES), Class 3** 로 운송합니다(도수·용기에 따른 포장 완화는 SP247 등 참조).\n\n**② 일반 알코올 제품**\n- 물로 희석되어 **인화점이 60°C를 초과하면 비인화성(비위험물)** 입니다. → 반드시 **실제 출하 농도 기준의 MSDS 인화점**을 확인하세요(100% 원액과 희석품의 인화점이 다릅니다).\n\n⚠️ 24%·SP 기준은 품목과 최신 IMDG 개정에 따라 달라질 수 있으니, **경계 농도(예: 20~30%대)** 제품은 DG Center로 확인 요청해 주세요.",
      "tags": ["알코올","알콜","저농도","수용액","희석","주류","술","alcoholic beverages","UN3065","SP144","SP247","24%","비위험물","NON-DG","인화점","ethanol"]
    },
    {
      "id": "alc-sanitizer",
      "cat": "🍶 알콜류",
      "q": "손소독제·알코올 스왑(에탄올/IPA 함유)은 위험물인가요?",
      "a": "에탄올·IPA 기반 **손소독제·소독티슈·알코올 스왑**은 대부분 **인화성 위험물(Class 3)** 에 해당합니다(겔 타입도 인화성).\n\n**분류**\n- 주로 **UN1170(에탄올)** 또는 **UN1219(IPA)**, 혼합·기타 조성은 **UN1987 (ALCOHOLS, N.O.S.)** 로 운송. 인화점에 따라 **PG II 또는 III**.\n- 시중 손소독제는 대부분 알코올 **60~80% 고농도**라 인화성에 해당합니다.\n- 알코올 함량이 매우 낮아 **인화점이 60°C를 초과**하면 비위험물일 수 있습니다(드묾).\n\n**참고**\n- 소량 소비재 포장은 **소량포장(LQ)** 적용이 가능할 수 있으니 품목별 LQ 한도를 확인하세요.\n- 최종 판단은 **MSDS의 알코올 함량·인화점·UN번호**로 확인합니다.",
      "tags": ["손소독제","소독제","sanitizer","알코올 스왑","소독티슈","에탄올","IPA","UN1170","UN1219","UN1987","Class 3","인화성","LQ","소량포장","겔"]
    },
    {
      "id": "gas-refrig-nondg",
      "cat": "💨 에어로졸 / 가스",
      "q": "냉매가 든 냉장고·에어컨(냉장기기)은 위험물인가요? 비위험물(NON-DG)로 보낼 수 있나요? (UN2857/UN3358, SP119/SP291)",
      "a": "냉장고·냉동기·에어컨 등 **냉장기기(Refrigerating machines)** 는 들어있는 냉매(가스)의 종류와 충전량에 따라 위험물 또는 비위험물(NON-DG)로 구분합니다. 아래 특별규정(SP) 기준량 **미만**이면 IMDG Code 적용 대상이 아니어서 **일반화물(NON-DG)** 로 취급할 수 있습니다.\n\n**① UN2857 (Class 2.2) — 비가연성·비독성 가스 또는 암모니아수를 포함한 냉장기기**\n- 특별규정 **SP119** 적용.\n- 다음 중 하나면 **비위험물(NON-DG)**:\n  - Class 2.2(비가연성·비독성) 가스가 **12kg 미만**, 또는\n  - 암모니아수(UN2672)가 **12L 미만**.\n\n**② UN3358 (Class 2.1) — 가연성·비독성 액화가스를 포함한 냉장기기**\n- 특별규정 **SP291** 적용.\n- 가연성·비독성 액화가스가 **12kg 미만**이면 **비위험물(NON-DG)**.\n\n**공통 조건·주의사항**\n- 기준은 **\"미만\"** 입니다. 12kg(암모니아수 12L) **이상**이면 해당 UN번호(2857/3358 등)의 위험물로 신고·운송해야 합니다.\n- NON-DG로 취급하더라도 냉매가 **정상적으로 밀폐·고정**된 완제품 기기여야 합니다. 특히 SP291은 기기 부품이 **작동압력의 3배 이상으로 설계·시험**되고 파열 위험이 없도록 제작되어야 합니다.\n- 냉매 종류·충전량은 **제품 사양서·네임플레이트 또는 MSDS**로 확인해 주세요(예: R-290·이소부탄 등 가연성 냉매 → UN3358 계열, R-134a 등 비가연성 냉매 → UN2857 계열).\n- 가정용 소형 냉장고·에어컨은 대부분 충전량이 기준 미만이라 NON-DG에 해당하나, 산업용·대용량은 12kg 이상일 수 있어 반드시 충전량 확인이 필요합니다.\n\n**요약**: 냉장기기는 냉매가 비가연성이거나 암모니아수면 **UN2857·SP119**, 가연성 액화가스면 **UN3358·SP291** 을 적용하며, 충전량이 **12kg(암모니아수 12L) 미만이면 비위험물(NON-DG)** 로 취급 가능합니다.",
      "tags": [
        "냉장고", "냉동기", "에어컨", "냉장기기", "냉매", "refrigerating machines", "refrigerator",
        "UN2857", "UN3358", "SP119", "SP291", "NON-DG", "비위험물", "2.2", "2.1",
        "암모니아수", "UN2672", "12kg", "12L", "가연성 가스", "비가연성", "액화가스"
      ]
    },
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
      "a": "죄송합니다만, 숯(UN1361)은 장금상선 및 흥아라인에서 **전면 선적 금지**로 운영하고 있습니다. 위험물뿐 아니라 SP925·SP978 비위험물 취급 건도 모두 포함됩니다.\n\n**금지 사유 (자사 화재 사고)**\n저희도 안전상의 사유로 부득이 금지 결정을 유지하고 있으며, 다음과 같은 사고 사례가 있었습니다.\n\n1. **2018 CHARLIE호** — 싱가폴 양적하 작업 중 치타공발 숯 컨테이너에서 화재가 발생하였고, 처리 지연으로 거액의 컨테이너 장치료가 발생한 사례가 있습니다.\n2. **2022.05 MANILA VOYAGER호** — 호치민→광양 항해 중 자카르타발 숯(비위험물 취급 건)에서 발화가 발생하였습니다. 5/7 1차 진압 후 5/9 잔불이 재발화되어 5/10 광양 도착 후 최종 진압되었으며, 진압 과정에서 선원 1명이 연기 흡입으로 병원 이송된 안타까운 사고였습니다.\n\n**규정 변경 사항 (2026.01.01 이후)**\n- IMDG 개정으로 4G BOX 골판지 용기(낙하·겹침선적 시험 통과품) 사용이 의무화되었습니다.\n- 기존 진공포장 방식은 불가능하게 되었습니다.\n\n**대체 정보 안내**\n- 활성탄(Activated Carbon, UN1362)도 위험물·비위험물 구분 없이 동일하게 **전면 금지**됩니다. (SKR/HAS 선사 규정집 명시)\n- 카본 블랙(Carbon Black, 일반 산업용 INK/RUBBER/TIRE/PAINT/PLASTIC 원료)은 비위험물 건에 한해 선적이 가능하니, 별도 카본블랙 FAQ를 참고해 주시면 감사하겠습니다.\n\n양해 부탁드리며, 추가 문의 사항 있으시면 운항팀으로 연락 주시기 바랍니다.",
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
      "a": "Carbon Black은 원료와 용도에 따라 선적 가부가 달라집니다. 아래 내용 참고해 주시면 도움이 되실 듯합니다.\n\n**선적 가능 (비위험물)**\n다음 용도의 카본블랙은 정상 선적이 가능합니다.\n- INK · RUBBER · TIRE · PAINT · PLASTIC 원료용 카본블랙\n- Mineral Origin(석유·타르)으로부터 화학적 공정으로 생산된 인공 카본블랙\n- 국내 대표 제조사: OCI, 비를라(Birla), Carbon Tech 등\n\n**선적 금지 — 숯·활성탄은 전면 금지**\n다음 품목은 **위험물·비위험물 구분 없이 모두 선적 금지**입니다. (SKR/HAS 선사 규정집에 명시된 전면 금지 품목)\n- **숯 (CHARCOAL, UN1361)** — 잘게 쪼갠 형태·숯 부산물 포함 (인도네시아·베트남산 등)\n- **활성탄 (ACTIVATED CARBON, UN1362)** — 위험물·비위험물 모두 전면 금지\n- **4.2 / 1361 CARBON, animal or vegetable origin** 표기 건\n→ 위 품목은 형태(POWDER/PELLET 등)나 MSDS상 비위험물 표기와 무관하게 금지되며, 숯 전면 금지 규정이 동일하게 적용됩니다.\n\n**판단을 도와드리는 절차**\n1. 생산자(제조사) 정보를 먼저 확인 부탁드립니다.\n2. MSDS 상의 원재료와 생산 공정 내용을 살펴봐 주시기 바랍니다.\n3. 형태가 POWDER/PELLET이라 하더라도 4.2/1361 표기가 있으면 금지에 해당합니다.\n4. 모호한 경우 화주께 원재료를 한 번 더 확인 요청 부탁드립니다.\n\n**2026.01.01 이후 유의 사항**\n- 4.2/1361 비위험물 취급 규정이 삭제되었습니다.\n- MSDS상 비위험물로 표기되어 있더라도 4.2/1361 표기가 있으면 선적이 어려우니, 화주께 다시 한 번 확인을 요청 부탁드립니다.",
      "tags": [
        "Carbon Black",
        "카본블랙",
        "숯 금지",
        "활성탄 금지",
        "원재료 확인"
      ]
    },
    {
      "id": "pro-li-metal",
      "cat": "🚫 전면 금지 화물",
      "q": "리튬 금속 배터리(UN3090 / UN3091)는 선적 가능한가요? (전면 금지)",
      "a": "리튬 금속 배터리 **UN3090(배터리 단독)·UN3091(장비에 포함/함께 포장)** 은 장금상선/흥아라인에서 **전면 선적 금지**입니다. **SP188 비위험물 취급 건도 포함**되어 모두 금지됩니다.\n\n**금지 사유**\n- 1차 전지(충전 불가)로 100% 완충 상태로 출고되며, 음극재가 **리튬 금속**이라 수분 접촉 시 폭발 위험이 있습니다.\n- 리튬이온(2차) 대비 **열폭주 위험이 훨씬 높고**, 배터리 화재는 소화가 사실상 불가능하며 유독가스가 발생합니다.\n- 2024.06.24 아리셀(화성) 공장 화재 등 사고 사례.\n\n**참고**\n- 리튬메탈 셀과 리튬이온 셀을 함께 포함한 혼합 전지는 SP387에 따라 **UN3090/3091(메탈 기준)** 으로 분류되어 동일하게 금지됩니다.\n- 파나소닉 코인전지 등 일상용 1차 전지도 동일하게 적용됩니다.\n- (리튬이온 UN3480/3481은 조건부 선적 가능 — '🔋 리튬 배터리' 카테고리 참고)",
      "tags": [
        "리튬금속",
        "리튬메탈",
        "UN3090",
        "UN3091",
        "1차전지",
        "전면 금지",
        "SP188",
        "SP387",
        "Class 9",
        "아리셀"
      ]
    },
    {
      "id": "pro-op-class52",
      "cat": "🚫 전면 금지 화물",
      "q": "유기과산화물(Class 5.2) 위험물은 선적 가능한가요? (전면 금지)",
      "a": "**Class 5.2(유기과산화물, Organic Peroxides)** 위험물은 장금상선/흥아라인에서 **전면 선적 금지**입니다.\n\n**제품 특성·금지 사유**\n- 유기과산화물은 **열적으로 불안정**하여 자기가속분해(자기반응성)·발열분해를 일으킬 수 있고, 가열·충격·마찰·오염에 민감합니다.\n- 일부 품목은 **온도 관리(제어온도/비상온도)** 가 필요할 만큼 분해 위험이 커, 해상 운송 중 화재·폭발 위험이 높습니다.\n- 자체 위험성에 더해 산화성·인화성을 동반하는 경우가 많습니다.\n\n**적용 범위**\n- **UN3101~3120 계열 등 Class 5.2 전 품목**(Type B~F, 온도관리 품목 포함)이 대상입니다.\n- 위험물 신고 건은 선적이 불가하니, 사전에 운항팀(DG Center)으로 확인 부탁드립니다.\n\n**실제 폭발 사고 사례 — 'YM Mobility'호 (2024.8.9, 중국 닝보-저우산항 베일룬 3터미널)**\n- 양밍해운(Yang Ming) 6,589TEU 컨테이너선에서 유기과산화물 **TBPB(tert-butyl perbenzoate)** 가 폭발. 냉동(리퍼) 컨테이너에 적재됐으나 **전원 미연결 상태로 방치**되어, 한여름 약 35℃ 환경에서 내부 온도가 분해 임계온도 60℃를 초과 → 통제 불가능한 **열폭주(Thermal Runaway)** 발생.\n- (전개) 13:31 자극적 냄새·백색 연기·문틈 황색 액체 누출 → 13:38 선수 우현 연기 분출·전원 대피 → 13:46 연쇄 폭발. 주변 컨테이너 6개가 바다로 튕겨나가고 3개 공중분해, 약 1km 밖 건물 유리가 깨질 정도의 위력. 신속 대피로 **인명피해는 없었음.**\n- (영향) 선체 해치 코밍·해치 커버 등 심각한 구조 손상, 베일룬 3터미널 폐쇄로 피크시즌 글로벌 공급망 차질. 사고 직후 **HMM 등 대형 선사가 중국산 유기과산화물 예약·선적 전면 금지/제한**, 전 세계 항만·선사가 냉동 위험물(Reefer DG) 신고 검증과 전원 연결 모니터링을 대폭 강화.\n- 이처럼 유기과산화물은 **온도관리가 실패하면 통제 불가능한 폭발**로 이어질 수 있어, 당사(장금/흥아)는 Class 5.2 전 품목을 전면 선적 금지하고 있습니다.\n\n※ 산화성 물질(Class 5.1, 예: 과탄산나트륨 UN3378)은 별도 기준입니다 — 본 카테고리의 과탄산나트륨 항목 및 '💥 산화/자연발화' 카테고리를 참고해 주세요.",
      "tags": [
        "유기과산화물",
        "Organic Peroxide",
        "Class 5.2",
        "5.2",
        "전면 금지",
        "온도관리",
        "자기반응성",
        "UN3101"
      ]
    },
    {
      "id": "pro-3378",
      "cat": "🚫 전면 금지 화물",
      "q": "과탄산나트륨(UN3378) 선적 가능한가요?",
      "a": "과탄산나트륨(UN3378)은 현재 장금/흥아에서 **선적 금지** 화물로 운영하고 있습니다(DRY DG 기준). 안전상의 사유로 운영 중인 점 양해 부탁드립니다.\n\n**제품 특성 안내**\n- Class 5.1 (산화성 물질) / UN 3378\n- 별칭: 과탄산소다, Sodium Percarbonate\n- 발열분해온도 **+60°C** — 물·산류 접촉 시 열분해 + 발화 위험이 있습니다.\n\n**사고 사례**\n- **2017.08.13 의왕시 오봉역 화재** — 노후 컨테이너에 빗물이 침투된 상태에서 하절기 고온으로 열분해 반응이 일어나 내부 포장재가 발화한 사례가 있습니다.",
      "tags": [
        "과탄산나트륨",
        "Sodium Percarbonate",
        "Class 5.1",
        "금지",
        "오봉역 사고"
      ]
    },
    {
      "id": "li-3480-3481",
      "cat": "🔋 리튬 배터리",
      "q": "UN3480 / UN3481 (리튬이온 배터리) 선적 규정은? (단독 / 장비 포함·동봉 통합)",
      "a": "UN3480은 **리튬이온 배터리 단독**, UN3481은 **장비에 포함(contained in)되거나 함께 포장(packed with)된** 리튬이온 배터리입니다. UN3481은 UN3480 대비 완화된 조건이나, 위험물 취급 시 승인 제조사 조건은 동일하게 적용됩니다.\n\n**1. 분류 (단독 / 장비)**\n- **UN3480**: 배터리 단독 운송.\n- **UN3481**: 장비 내장 또는 장비와 함께 포장.\n- 장비 + 별도 동봉 배터리가 함께 있으면 내장/동봉분은 **UN3481**, 단독분은 **UN3480**으로 **각각 분류·신고**합니다(둘을 합쳐 \"더 위험한 쪽\"으로 묶지 않음).\n\n**2. 비위험물 취급 (SP188)**\n- 셀 **20Wh 이하** 또는 배터리 **100Wh 이하**이면 NON-DG DRY 컨테이너로 진행 가능합니다.\n- (UN3481) **4개 셀 이하 / 배터리 2개 이하**가 내장된 장비는 SP188 적용 검토가 가능합니다.\n- MSDS 1.5 항목(또는 제품 사양서)의 **Wh rating**을 확인해 주세요.\n\n**3. 위험물 취급 (RFDG 필수)**\n- 100Wh 초과(또는 SP188 미충족)이면 **위험물(Class 9)** 입니다.\n- ✅ **삼성SDI / LG에너지솔루션 / SK On 3사 제조 건에 한해 RFDG 진행 가능**.\n- ❌ 그 외 제조사(중국 BYD·CATL 등)는 진행이 어려운 점 양해 부탁드립니다.\n- **모든 위험물 건은 RFDG 필수**이며 DRY DG로는 불가합니다(예외 없음). DGD에 **SOC ≤ 30%** 를 명시해 주세요.\n\n**4. 공통 필수 서류·조건**\n- **UN 38.3 시험성적서**(제조사 발급) 첨부 필수.\n- MSDS 14번에 **UN3480 / UN3481** 이 명시되어 있어야 합니다.\n- **손상·리콜·리퍼브** 배터리는 선적이 어렵습니다.\n- 단락 방지(**양극 단자 절연**) 확인. UN3481은 **장비 구동 시험**도 함께 확인 부탁드립니다.\n\n**5. ⚠️ 리튬금속(1차 전지) 동봉 주의**\n- 장비에 리튬금속 배터리가 동봉되면 **UN3091**에 해당하며, **UN3091은 당사 전면 금지** 품목이라 동봉 시 선적이 불가합니다. 사전에 운항팀(DG Center)으로 확인 부탁드립니다.\n\n**적용 Remark 코드**: SP188(소형 배터리 비위험물), SP230(운송 일반 조건), SP310(시제품 / 소량 생산 추가 조건)",
      "tags": [
        "리튬배터리",
        "리튬이온",
        "Lithium Ion",
        "UN3480",
        "UN3481",
        "Class 9",
        "RFDG",
        "SP188",
        "SP230",
        "SP310",
        "장비 내장",
        "contained in equipment",
        "100Wh",
        "20Wh",
        "삼성 LG SK",
        "SOC",
        "UN38.3",
        "비위험물",
        "NON-DG"
      ]
    },
    {
      "id": "li-3090-3091",
      "cat": "🔋 리튬 배터리",
      "q": "UN3090 / UN3091 (리튬 금속 배터리) 선적 가능한가요?",
      "a": "리튬 금속 배터리(UN3090·UN3091)는 현재 장금/흥아에서 **전면 선적 금지**로 운영하고 있습니다. SP188 비위험물 취급 건도 포함되며, 안전상의 사유로 부득이 운영 중인 점 양해 부탁드립니다.\n\n**제품 특성 (위험성)**\n- 1차 전지(충전 불가) — 100% 완충 상태로 출고됩니다.\n- 음극재가 리튬 금속이라 수분 접촉 시 폭발 위험이 있습니다.\n- 2차 전지(리튬이온) 대비 **열폭주 위험성이 훨씬 높습니다.**\n\n**1차 / 2차 전지 구분**\n| 항목 | 1차 전지 (3090/3091) | 2차 전지 (3480/3481) |\n|---|---|---|\n| 충전 | 불가 | 가능 |\n| 음극재 | 리튬 금속 | 흑연 |\n| 출하 충전율 | 100% | 30% 미만 |\n\n**SP387 (메탈+이온 혼합 전지)**\n리튬메탈 셀과 리튬이온 셀을 함께 포함한 배터리는 SP387에 따라 **UN3090/3091**(메탈 기준)으로 분류됩니다. (SP388은 차량 UN3166/3171용)\n\n**금지 결정의 배경 (사고 사례)**\n- **2024.06.24 아리셀 화성공장 화재** — 비의 영향으로 불량 배터리가 수분과 반응하여 열폭주가 발생하였고, 대형 화재로 번지며 인명 피해까지 이어진 사고가 있었습니다. 배터리 화재는 소화가 불가능하고 유독가스가 발생하여 매우 위험합니다.\n\n파나소닉 코인 배터리 등 일상용 1차 전지도 동일하게 적용되니 참고 부탁드립니다.",
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
      "q": "리튬이온 배터리 선적 시 승인 제조사는?",
      "a": "리튬이온 배터리(EV 셀 포함) 중 위험물 취급 건은 안전 검증을 거친 승인 제조사 제품에 한해 선적이 가능합니다.\n\n**🟢 SP188 비위험물(NON-DG)은 제조사 제한 없음**\n- 리튬이온 셀 ≤20Wh·배터리 ≤100Wh 등 SP188 조건을 충족해 **비위험물(NON-DG)로 분류**되는 리튬배터리는 제조사(삼성·LG·SK) 제한이 **적용되지 않습니다.**\n- 제조사 제한은 **위험물(DG)로 선적되는 경우에만** 적용됩니다.\n\n**✅ 승인 제조사 (위험물 DG 선적 시 · MSDS 'Manufacture' 정보 기준)**\n- 삼성 SDI\n- LG 에너지솔루션 (LG Chem 포함, LG 합작 생산법인 **PT. HLI GREEN POWER**〔현대글로비스×LG에너지솔루션 합작, 실제 제조 LG에너지솔루션〕 포함)\n- SK On\n\n**⚠️ 첨부가 여러 개면 자료별 제조사 확인**\n- MSDS와 UN38.3 TEST REPORT(성적서)의 제조사가 다를 수 있습니다. 한 자료가 승인 제조사라도 다른 자료(특히 성적서)에 미승인 제조사가 있으면 선적 불가이니, 모든 자료의 제조사를 확인해 주세요.\n\n**❌ 거절 안내**\n- 중국·기타 해외 제조사(BYD, CATL, EVE, Gotion 등)는 현재 선적이 어려운 점 양해 부탁드립니다.\n- 신규 거래 시 제조사 정보를 사전에 확인해 주시면 신속한 검토가 가능합니다.\n\n**제조사 확인 방법**\n1. MSDS 1번(제품 식별) — 제조사명, 주소 확인\n2. 배터리 본체 라벨 사진 첨부 부탁드립니다.\n3. UN 38.3 시험성적서 발행처도 함께 확인 부탁드립니다.\n\n**모든 위험물 건 RFDG 필수**\n- DRY DG로는 진행이 어려운 점 양해 바랍니다 (예외 없음).\n- 닝보 입항 시 6시간 간격 온도 모니터링이 요구되니 사전 안내 드립니다.\n\n신규 제조사 추가는 별도 협의가 필요합니다 (사고 발생 시 책임 및 제품 신뢰성 검증 후 진행).",
      "tags": [
        "리튬이온 배터리",
        "리튬배터리",
        "UN3480",
        "UN3481",
        "EV 배터리",
        "삼성 LG SK",
        "승인 제조사",
        "RFDG"
      ]
    },
    {
      "id": "veh-3166",
      "cat": "🚗 차량 / EV",
      "q": "UN3166 (가스/액체 연료 차량) 선적 절차는?",
      "a": "UN3166 차량은 연료 잔량 및 안전 조치를 충족하시면 선적이 가능합니다. 아래 사항 확인 후 진행 부탁드립니다.\n\n**가솔린·디젤 차량**\n- 연료탱크는 **1/4 미만** 충전 부탁드립니다.\n- 연료 캡과 밸브의 누유 방지를 확인해 주시기 바랍니다.\n- 배터리 단자는 절연 처리해 주시면 감사하겠습니다.\n\n**LPG / CNG 차량**\n- 가스 잔량은 **1/4 미만**이어야 합니다.\n- 밸브 폐쇄 상태를 꼭 확인 부탁드립니다.\n- 압력 시험 기록도 함께 준비해 주시면 좋습니다.\n\n**필요 서류**\n- MSDS\n- 차량등록증 (또는 동등 서류)\n- 차량 사진 (외관·연료 상태가 확인되는 사진)\n- 보험증명\n\n**선적이 어려운 경우**\n다음 케이스는 안전상 사유로 선적이 어려운 점 양해 부탁드립니다.\n- 누유 흔적이 있는 경우\n- 사고 이력 / 외관 손상이 확인되는 경우\n- 일부 항만의 차량 사전 승인을 받지 못한 경우\n\n**적용 Remark**\n- SP240 (차량 일반 조건)\n- SP312 (가스 연료 차량)\n- 전기차(배터리 구동)는 별도 **UN3556**(SP388)로 분류",
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
      "a": "UN3556(리튬 배터리 구동 차량 / EV)은 장금/흥아에서 **전면 선적 금지(Prohibited DG)** 품목으로 확정 운영하고 있습니다(Ver.12 규정 반영). 안전상의 사유로 부득이 금지하고 있는 점 양해 부탁드립니다.\n\n**대상 화물**\n- 전기차(EV), 전동 휠체어, 전기 자전거 등 리튬 배터리로 구동되는 차량 전체가 해당됩니다.\n\n**금지 사유**\n- 리튬 배터리 화재는 소화가 사실상 불가능하고 열폭주·유독가스 발생 위험이 매우 높습니다.\n- 차량에 장착된 대용량 배터리는 사고 시 선박·인명 피해로 이어질 수 있어 전면 금지로 운영하고 있습니다.\n\n추가 문의 사항은 운항팀(DG Center)으로 연락 주시기 바랍니다.",
      "tags": [
        "전기차",
        "EV",
        "전면 금지"
      ]
    },
    {
      "id": "fl-1263",
      "cat": "🔥 인화성 (Cl.3)",
      "q": "UN1263 (페인트 / 래커) 선적 가능한가요?",
      "a": "UN1263 페인트류는 Class 3에 해당하며, 포장등급(PG)에 따라 조건을 충족하시면 선적이 가능합니다.\n\n**PG별 안내**\n- **PG I** (인화점 < 23°C, 끓는점 ≤ 35°C) — 일부 노선 제한이 있으며 갑판 적재로 진행됩니다.\n- **PG II / III** — 정상 선적 가능, UN 인증 포장재가 필요합니다.\n\n**Limited Quantity (LQ) 적용 시**\n- 5L 이하 내포장의 경우\n- 외부 박스에 LQ 마크를 부착해 주시기 바랍니다.\n- 일부 규정 완화가 가능합니다.\n\n**필요 서류**\n- MSDS (인화점·끓는점·SP163/SP223 확인)\n- DGD\n- UN 인증 포장재 마킹 사진\n\n**Marine Pollutant 동반 시 추가 조치**\n- DGD에 MP를 명시해 주시기 바랍니다.\n- 외부에 Marine Pollutant Mark 부착이 필요합니다.\n- UN1263 자체 적용 특별규정은 SP163·SP367·SP650이며, 해양오염에 대한 별도 특별규정은 없습니다(위 MP 마크·DGD 표기로 처리). ※ SP335는 UN3077(고체 혼합물) 전용 규정으로 UN1263에는 적용되지 않습니다.",
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
      "a": "불산은 고위험 부식성 물질이라 **사전 PRE-CHECK가 필수**입니다. 선적 검토 시 미리 운항팀으로 연락 부탁드립니다.\n\n**분류 / 포장 안내**\n- 농도에 따라 **PG I 또는 PG II**로 분류됩니다.\n- **PTFE 라이닝** 내산 용기 또는 UN 인증 IBC를 사용해 주셔야 합니다.\n- 농도 **60% 초과 시 PG I**, 60% 이하는 PG II로 분류됩니다 (IMDG Code 기준).\n\n**필요 서류 / 라벨**\n- MSDS (영문 + 한글) 모두 준비 부탁드립니다.\n- DGD\n- 외부 라벨 + 응급 처치 카드 부착이 필요합니다.\n- 비상연락처를 함께 명시해 주시면 감사하겠습니다.\n\n**적재 및 격리 안내**\n- Segregation Group **1 (Acids)** — 식품·유기물과는 \"Separated from\" 격리가 필요합니다.\n- 알칼리·시안화물과도 격리해 주셔야 합니다 (반응성).\n- 갑판 적재를 권장드립니다.\n\n**항만 제한 안내**\n- 부산 신항: 특정 부두에서만 가능합니다.\n- 일부 중국 항만은 사전 승인이 필요합니다.\n\n응급 대응 SOP를 사전에 합의해 주셔야 하며, 누출 시 즉시 통제가 가능한 체계가 갖춰져야 합니다.",
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
      "a": "산화성 물질은 분해온도와 격리 조건을 잘 관리해 주시면 정상 진행이 가능한 화물군입니다.\n\n**Class 분류**\n- **Class 5.1** — 산화성 물질\n- **Class 5.2** — 유기 과산화물\n\n**⛔ Class 5.2 (유기 과산화물) — 자사 선적 전면 금지**\n- 닝보(NGB)항 위험물 컨테이너 폭발사고 이후, 장금·흥아(SKR/HAS) 규정상 **Class 5.2 유기 과산화물은 선적 전면 금지**입니다.\n- IMDG상으로는 온도 통제(SADT) 후 운송이 가능한 물질이나, 자사 규정이 우선하므로 진행이 불가합니다.\n\n**핵심 위험성**\n- 다른 가연물과 접촉 시 발화 / 폭발 위험이 있습니다.\n- 열·물·산류 접촉 시 분해되어 발화 가능성이 있습니다.\n\n**적재 안내**\n- Class 3 (인화성)과는 \"Separated from\" 격리가 필요합니다.\n- Class 4.1 (가연성 고체)과는 \"Away from\" (1), Class 4.2 / 4.3과는 \"Separated from\" (2) 격리가 필요합니다.\n- 5.2 (유기 과산화물)는 IMDG상 온도 통제(SADT)가 필요한 화물이나, **자사 규정상 선적 전면 금지**입니다 (상단 참조).\n\n**필요 서류**\n- MSDS (분해 온도 / SADT 명시)\n- DGD (UN No, Class, PG, 분해온도 부기)\n- 일부 항만은 사전 승인이 필요합니다.\n\n**자사 사례 안내 — UN3378 과탄산나트륨**\n- 발열분해온도 +60°C로 하절기 위험이 증가합니다.\n- 의왕 오봉역 사고(2017.08) 이후 장금/흥아는 금지로 운영하고 있습니다.\n\n**자사 사례 — UN3377 / UN1942 등**\n- 정책은 별도로 확인이 필요합니다 (대부분 PRE-CHECK 후 결정).",
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
      "a": "UN3082는 적절한 표기와 서류를 충족하시면 선적이 가능합니다. 아래 사항 참고 부탁드립니다.\n\n**표준 답신 (해외 파트너 대응 시)**\n> \"We would accept your DG application subject to your slot allocation and provided that the DG cargo is properly packed, labeled and documented in accordance with IMO regulations and the laws or regulations in force at the port of shipment, the port of discharge and any scheduled port of call.\"\n\n**필수 확인 사항**\n1. **Marine Pollutant Mark**를 외부에 부착해 주시고 DGD에도 명시 부탁드립니다.\n2. MSDS 상의 정확한 성분이 기재되어 있는지 확인 부탁드립니다.\n3. 일반 화학물질에 Marine Pollutant 표기가 추가되는 경우, Class 9 신고가 필수입니다.\n4. IMDG 2.10 / SP274 (정확한 성분명 부기)에 따라 처리됩니다.\n5. **SHA / NGB 항만의 local restriction을 추가로 확인해 주시기 바랍니다** (CAS No. 기준).\n\n**적재 안내**\n- 갑판 적재를 권장드립니다 (누출 시 환경 보호 + 점검 용이성 확보).\n- Stowage Category A/B에 해당합니다.",
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
      "a": "Flexitank 화물은 COA 권장 절차와 자사 적재 규정을 준수하시면 선적이 가능합니다.\n\n**표준 답신 (영문 파트너 대응)**\n> \"The shipment is acceptable provided that all documents reflect actual condition of container/cargo/flexi tank, and the shipper shall comply with the COA Recommended Code of Practice for the Manufacture of Flexi tanks and Operation of Flexi tank/Container Combinations.\"\n\n**필수 요건 안내**\n1. **20' Dry Van 컨테이너에 Flexitank 1개**로 진행해 주시기 바랍니다 (다중 적입은 불가합니다).\n2. **원칙적으로 갑판(On-deck) 적재**로 진행하나, 선박·화물 특성에 따라 **사전 승인 시 Underdeck 적재도 가능**합니다 (하절기 열팽창·파손 위험 등 고려).\n3. **Booking List / CBF에 \"flexi-tank\"를 표기**해 주시기 바랍니다.\n4. 선박 Stowage 제한으로 Restow가 발생할 경우, 비용은 box operator 측 부담입니다.\n\n**Flexitank 자체 요건**\n- COA Test Criteria를 충족하는 설계여야 합니다.\n- 제조사 권장 적입 절차를 준수해 주시기 바랍니다.\n- 적입 후 누설 시험을 완료해 주시면 감사하겠습니다.\n\n**선적이 어려운 사례 (참고)**\n다음 케이스는 안전·운영상의 사유로 선적이 어려우니 양해 부탁드립니다.\n- 40ft 등 23ft 이상 컨테이너 사용 (20ft만 가능)\n- 다중 flexitank (2개 이상)\n- 식품·의약품 등 청결도 요구 화물과 동일 위치 적재",
      "tags": [
        "Flexitank",
        "플렉시탱크",
        "Underdeck 사전승인",
        "20ft 1개"
      ]
    },
    {
      "id": "rf-rfdg",
      "cat": "❄️ RFDG (Reefer DG)",
      "q": "RFDG (Reefer DG) 진행 시 요건은?",
      "a": "RFDG는 Reefer 컨테이너에 위험물을 적재하여 온도 통제로 안정성을 확보하는 방식입니다.\n\n**진행 대상 화물**\n- 위험물 취급 배터리(UN3480/3481 위험물 건)는 **RFDG가 필수**입니다.\n- 온도 통제로 안정성 확보가 필요한 화물\n\n**🔒 안정성 검토 — 당사 금지/제한 CLASS 확인**\n선적 전 당사 금지 운송 / 제한 CLASS 여부를 먼저 확인합니다.\n\n| 구분 | 해당 CLASS |\n|---|---|\n| **금지** (검토 불가) | 1 · 2.1 · 2.2 · 2.3 · 5.1 · 5.2 · 6.2 · 7 |\n| **제한** (CASE BY CASE 운송 검토) | 3 · 4.1 · 4.2 · 4.3 · 8 · 9 |\n\n**제한 CLASS 세부 — 운송 금지 기준**\n- CLASS 3: 인화점 **23℃ 미만 운송 금지** (Sub. Risk 포함)\n- 독극물 **CLASS 6.1**\n- **Packing Group I 또는 II 운송 금지**\n\n**운송 불가(Reject) 조건**\n- 같은 UNNO가 아닌 **다른 위험물과 혼적 시 운송 불가** (단, UN3480·UN3481끼리는 허가). ※ 혼적 금지는 **위험물 화물 간에만** 적용되며, 위험물 1개와 **비위험물(일반화물)의 혼적은 가능**\n- **당사 선박으로만 운송 가능** — 공동사(타선사) 선박일 경우 운송 불가 (단, DRY ICE 화물의 Unplugged Reefer인 경우 공동사 진행 가능)\n- 유출 시 심각한 **화재·폭발·분해 위험**이 있는 경우 운송 불가\n- **온도 제어 실패 시** 화물 특성이 변질되어 안전상 위험이 발생하는 경우 운송 불가\n- 포장재가 내용물과 반응하는 경우 → 포장재 변경을 화주와 협의\n\n**참고 사항**\n- 인화점 23℃ 미만 금지 사유: 23℃ 미만 인화성 화물(CLASS 2.1·3 등) 선적 시 IMDG **7.3.7.6** 항목에 의거 방폭형 전기설비가 필요합니다.\n- 독극물 운송이 필요한 경우: 장비팀을 통해 컨테이너 반납 후 **세척 처리** 협조 요청이 필요하며, 관련 비용은 화주께 청구됩니다.\n- **POL/POD 총 구간 T/T가 7일 초과 시 선적 금지**입니다.",
      "tags": [
        "RFDG",
        "Reefer DG",
        "선적 제한",
        "금지/제한 CLASS"
      ]
    },
    {
      "id": "proc-precheck",
      "cat": "📋 절차 / PRE-CHECK",
      "q": "DG PRE-CHECK 절차는 어떻게 되나요?",
      "a": "DG PRE-CHECK는 부킹 확정 전 위험물 적재 가능 여부를 사전 검토하는 절차입니다. 선적 14일 전까지 요청 부탁드립니다 (긴급 건은 별도 협의).\n\n**1단계: 사전 준비 서류**\n- MSDS (영문 + 한글)\n- 위험물 신고서(DGD) 또는 임시 정보 (UN No, Class, PG, 수량)\n- UN 38.3 시험성적서 (배터리류)\n- 포장재 UN 마킹 사진\n\n**2단계: 정보 입력**\n- 운항팀에서 직접 대응하고 있습니다 (고지팀을 거치지 않습니다).\n- 웹 양식 또는 메일로 PRE-CHECK를 요청해 주시기 바랍니다.\n- 항만/노선별로 각각 확인이 필요합니다 (출발지·도착지·환적지).\n\n**3단계: 운항팀 검토**\n- 통상 **1~3 영업일** 내로 회신드리고 있습니다.\n- 동일 화주의 반복 화물은 일괄 승인이 가능합니다.\n- 거절 사유는 명시하여 회신드리오니 참고해 주시기 바랍니다.\n\n**4단계: 부킹 확정**\n- PRE-CHECK 승인 후 부킹을 진행 부탁드립니다.\n- **승인 없는 적입은 거절될 수 있으며**, 현장 발견 시 비용은 화주께서 부담하시게 되니 사전 절차를 꼭 지켜주시기 바랍니다.",
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
      "a": "위험물의 적재 및 격리는 IMDG Code 7장 기준을 따르고 있습니다. 아래 내용을 참고해 주시면 도움이 되실 듯합니다.\n\n**Stowage Category 분류**\n- **A** — 데크 / 언더데크 모두 가능\n- **B / C** — 일반 적재\n- **D** — 갑판 적재만 가능\n- **E** — 갑판 적재 (관계자만 접근)\n\n**Segregation (격리) — IMDG 7.2.4**\n| 코드 | 의미 |\n|---|---|\n| 1 | \"Away from\" — 같은 컨테이너 적재 불가, 최소 3m |\n| 2 | \"Separated from\" — 1 컨테이너 거리 |\n| 3 | \"Separated by complete compartment\" — 격벽 분리 |\n| 4 | \"Separated longitudinally by intervening complete compartment\" — 종방향 격벽 + 거리 |\n| X | 같은 컨테이너 가능 |\n\n**Segregation Group**\n- SGG1: Acids (산 — 염산·불산 등)\n- SGG18: Alkalis (염기 — 가성소다 등)\n- SGG6: Cyanides / SGG16: Peroxides\n- 전체 18개 그룹은 IMDG 3.1.4.4 참조\n- 식품·식수와의 격리는 별도 규정이 있습니다 (IMDG 7.3.4).\n\n**자주 문의주시는 사례**\n- CLASS 9 + CLASS 4.1 혼적은 격리 문제가 없어 같은 컨테이너에 적재 가능합니다.\n- CLASS 8 산 + CLASS 8 염기(SGG1 vs SGG18)는 \"Away from\" (격리구분 1) 격리가 적용됩니다.\n- 인화성 + 산화성 (Class 3 + 5.1)도 \"Separated from\" 격리가 필요합니다.",
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
      "cat": "📋 절차 / PRE-CHECK",
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
      "a": "소화기는 비교적 간단한 절차로 선적이 가능합니다.\n\n**주요 조건**\n- Class 2.2 (비인화성 압축가스)에 해당합니다.\n- 작동 압력 확인과 안전핀 고정을 부탁드립니다.\n- SP225의 제조·시험 기준을 충족하면 IMDG Code 규정 적용 면제(예외)가 가능합니다. (※ 'LQ 완화'가 아니며, UN1044의 LQ 한도는 120 mL로 일반 소화기에는 적용되지 않습니다.)\n- 일반 적재가 가능하나 충격·낙하 방지에 유의해 주시기 바랍니다.\n- 외부 손상이나 누설이 있는 경우 선적이 어려우니 양해 바랍니다.",
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
      "a": "SADT는 Self-Accelerating Decomposition Temperature의 약자로, 화학물질이 외부 에너지 없이 자체적으로 분해를 가속화하는 최저 온도를 말합니다.\n\n**중요성**\n- 주로 **Class 5.2 (유기 과산화물)** 및 일부 자기반응성 물질(Class 4.1)에 적용됩니다.\n- SADT 미달 = 안전 / SADT 초과 = 폭주 분해 → 화재·폭발 위험으로 이어질 수 있습니다.\n- 따라서 운송 중 화물 온도는 SADT 이하로 반드시 유지되어야 합니다.\n\n**Control Temperature / Emergency Temperature**\n| 항목 | 정의 |\n|---|---|\n| **TC (Control Temp)** | 정상 운송 시 유지해야 하는 최대 온도 |\n| **TE (Emergency Temp)** | 이 온도 초과 시 비상 절차 발동 |\n\n* SADT 구간별로 차등 적용됩니다 (SADT>35°C → TC=SADT−10·TE=SADT−5 / 20~35°C → TC=SADT−15·TE=SADT−10 / ≤20°C → TC=SADT−20·TE=SADT−10). IMDG 7.3.7 참조.\n\n**예시**\n- UN3110 Organic Peroxide Type F, Solid, Temp Control: SADT 60°C → TC 50°C / TE 55°C\n- 운송 컨테이너는 RFDG (Reefer)를 사용하시고 50°C 이하 유지가 필요합니다.\n\n**DGD 기재 안내**\n- 14번 컬럼에 \"Temperature Controlled\"를 표기 부탁드립니다.\n- TC / TE를 명시해 주시기 바랍니다.\n- RFDG 컨테이너 사용이 필수입니다.",
      "tags": [
        "SADT",
        "자기가속분해",
        "Class 5.2",
        "Temperature Control",
        "RFDG"
      ]
    },
    {
      "id": "sapt",
      "cat": "📘 IMDG 전문지식",
      "q": "SAPT(자기가속중합온도)는 무엇이고 왜 중요한가요?",
      "a": "SAPT는 Self-Accelerating Polymerization Temperature(자기가속중합온도)의 약자로, 안정제가 없는 상태의 물질이 포장·IBC·탱크에 담긴 채로 자체적으로 중합반응을 가속하기 시작하는 최저 온도를 말합니다.\n\n**적용 대상 — 중합성 물질(Polymerizing Substances)**\n- 운송 중 통상 조건에서 강한 발열 중합반응을 일으켜 더 큰 분자(중합체)를 형성할 수 있는 물질입니다.\n- IMDG에서는 **Class 4.1**로 분류되며, 안정화(stabilization)가 요구됩니다.\n\n**관련 UN 번호**\n| UN | 품명 | 온도제어 |\n|---|---|---|\n| **UN3531** | 중합성 물질, 고체, 안정화 | 불요 |\n| **UN3532** | 중합성 물질, 액체, 안정화 | 불요 |\n| **UN3533** | 중합성 물질, 고체, 온도제어 | 필요 |\n| **UN3534** | 중합성 물질, 액체, 온도제어 | 필요 |\n\n**온도제어 기준**\n- 포장·IBC 상태에서 **SAPT ≤ 50°C**이면 온도제어 대상입니다(UN3533/3534). 그보다 높으면 안정제만으로 운송이 가능합니다(UN3531/3532).\n\n**Control / Emergency Temperature** (SADT와 동일한 IMDG 7.3.7 공식)\n| 항목 | 정의 |\n|---|---|\n| **TC (Control Temp)** | 정상 운송 시 유지해야 하는 최대 온도 |\n| **TE (Emergency Temp)** | 이 온도 초과 시 비상 절차 발동 |\n* SAPT>35°C → TC=SAPT−10·TE=SAPT−5 / 20~35°C → TC=SAPT−15·TE=SAPT−10 / ≤20°C → TC=SAPT−20·TE=SAPT−10.\n\n**위험성**\n- 온도가 SAPT를 넘으면 폭주 중합이 일어나 급격한 발열·압력 상승으로 용기 파열·화재 위험이 있습니다.\n- 안정제(억제제) 소진, 직사광선·열원 노출이 주요 유발 요인입니다.\n\n**대표 물질(예)** — 스티렌, 아크릴산·메타크릴산 및 그 에스터, 비닐계 단량체 등 중합 우려 물질.\n\n**DGD 기재·운송 안내**\n- 온도제어품(UN3533/3534)은 \"Temperature Controlled\"와 TC/TE를 명시해 주시기 바랍니다.\n- RFDG(Reefer) 컨테이너로 TC 이하 유지가 필요합니다.\n- 안정제 종류·유효기간 및 안정화 방식(억제제/온도/불활성화)을 사전에 확인해 주시기 바랍니다.",
      "tags": [
        "SAPT",
        "자기가속중합",
        "중합성 물질",
        "Polymerizing",
        "UN3531",
        "UN3534",
        "Class 4.1",
        "Temperature Control",
        "RFDG"
      ]
    },
    {
      "id": "sapt-vs-sadt",
      "cat": "📘 IMDG 전문지식",
      "q": "SAPT와 SADT는 어떻게 다른가요?",
      "a": "둘 다 \"온도가 임계치를 넘으면 스스로 반응이 폭주한다\"는 개념이지만, **반응의 종류와 대상 물질이 다릅니다.**\n\n| 구분 | **SADT** | **SAPT** |\n|---|---|---|\n| 풀네임 | Self-Accelerating **Decomposition** Temperature | Self-Accelerating **Polymerization** Temperature |\n| 한글 | 자기가속**분해**온도 | 자기가속**중합**온도 |\n| 반응 | 분자가 스스로 **분해** | 분자가 스스로 **중합(결합·고분자화)** |\n| 대상 물질 | 자기반응성 물질(Class 4.1)·유기과산화물(Class 5.2) | 중합성 물질(Class 4.1) |\n| 대표 UN | 자기반응성 UN3221~3240, 유기과산화물 UN3101~3120 | UN3531~3534 |\n| 위험 양상 | 분해열·가스 발생 → 화재·폭발 | 중합열·압력 상승 → 용기 파열·화재 |\n| 온도제어 기준 | 포장·IBC상 **SADT ≤ 55°C** | 포장·IBC상 **SAPT ≤ 50°C** |\n| 안정화 방법 | 온도제어(희석·둔감화 포함) | 안정제(억제제) 첨가 + 필요 시 온도제어 |\n\n**한 줄 요약**\n- **SADT = 분해**가 폭주하는 온도(유기과산화물·자기반응성 물질), **SAPT = 중합**이 폭주하는 온도(중합성 물질).\n\n**공통점**\n- 둘 다 운송 중 화물 온도를 임계치 이하로 유지해야 하며, **TC/TE 산출 공식은 동일**합니다(IMDG 7.3.7).\n- 온도제어가 필요하면 **RFDG(Reefer)** 로 운송하고, DGD에 \"Temperature Controlled\"·TC·TE를 기재합니다.\n- 임계온도 초과 시 비상온도(TE) 절차를 발동합니다.\n\n**실무 포인트**\n- 같은 Class 4.1이라도 \"자기반응성(SADT)\"인지 \"중합성(SAPT)\"인지에 따라 UN번호·서류·기준치가 달라지므로, MSDS의 명칭과 시험값을 먼저 확인해 주시기 바랍니다.",
      "tags": [
        "SAPT",
        "SADT",
        "차이",
        "중합",
        "분해",
        "Class 4.1",
        "Class 5.2",
        "Temperature Control"
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
      "a": "Class 4는 가연성 고체류로 3개 sub-class로 세분됩니다.\n\n**Class 4.1 — 가연성 고체 (Flammable Solid)**\n- 외부 화염원 접촉 시 쉽게 발화됩니다.\n- 마찰 / 충격에도 발화가 가능합니다.\n- 자기반응성 물질(Self-Reactive)이 포함됩니다.\n- 예: 황(Sulphur, UN1350), 나프탈렌(UN1334)\n- **자기반응성 + 온도 통제** 필요 시 RFDG로 진행합니다.\n\n**Class 4.2 — 자연 발화성 (Spontaneously Combustible)**\n- 공기 접촉만으로 가열·발화될 수 있습니다 (Pyrophoric).\n- 화학물질 자체의 산화 반응입니다.\n- 예: 백린(White Phosphorus, UN1381), 활성탄(UN1362), **숯(UN1361)**\n- ⚠️ **자사 정책: UN1361/1362 전면 금지**입니다.\n- 운송 시 산소 차단(질소 충전 등) 조치가 필요합니다.\n\n**Class 4.3 — 물 반응성 (Dangerous When Wet)**\n- 물 접촉 시 가연성 가스가 발생하며 발화 위험이 있습니다.\n- 예: 알루미늄 분말(UN1396), 칼슘(UN1401), 나트륨(UN1428)\n- 외부 라벨에 \"X\" (물 사용 금지)가 표기됩니다.\n- 화재 시 **물 사용 절대 금지** → EmS F-G (특수 소화제)\n- 적재 시 습기 차단(방수 포장)이 필수입니다.\n\n**자주 문의주시는 사례**\n- 황(UN1350) PG III: 정상 선적 가능\n- 활성탄(UN1362): 비위험물 취급(SP223)이지만 자사는 금지\n- 마그네슘 분말: 화재 시 물 사용 절대 금지\n\n**격리 안내**\n- 4.1 + 5.1 (산화성) → \"Away from\" (1)\n- 4.2 / 4.3 + 5.1 / 5.2 → \"Separated from\" (2)\n- 4.2 + Class 3 → \"Separated from\"\n- 4.3 + 물반응성 → 같은 격벽 적재 가능",
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
let fqAdminMode = false;   // FAQ 관리자 모드(admin1234) 폐지 — 회원 관리자 권한(dgIsAdmin)으로 일원화
let fqPosts = [];
let fqNewPostAttachments = [];   // 새 문의 작성 시 첨부파일(임시) — {name,type,size,data(dataURL)}
let fqCurrentCat = '전체';
let fqEditingId = null;   // 이메일 문의 수정 중인 항목 id (null이면 신규 등록)
let fqOpenPostId = null;

// ─── Supabase 전체 공유: 시드(코드 49건) + 동적 항목(공용 DB) 분리 ───
const FQ_SEED_ITEMS = (FQ_FAQ_DATA.items || []).slice();
const FQ_SEED_CATS = (FQ_FAQ_DATA.categories || []).slice();
let fqRemoteOK = false;   // 공용 DB 연결 성공 여부

// ─── 공용 저장소: 사용자 소유 Supabase 프로젝트에 직접 연결 (publishable 키) ───
// inquiry_state(id='faq'|'board', data jsonb) 단일 행에 전체 상태 저장 (전체 행 upsert)
const FQ_SB_URL = 'https://jasgjzzazgkwcpghzjop.supabase.co';
const FQ_SB_KEY = 'sb_publishable_nlY-SPzGQVowYbZ4LuwCpw_65sd2539';
const FQ_SB_HEADERS = { apikey: FQ_SB_KEY, Authorization: 'Bearer ' + FQ_SB_KEY };

async function fqRemoteGet(id) {
  const res = await fetch(`${FQ_SB_URL}/rest/v1/inquiry_state?id=eq.${id}&select=data`, { headers: FQ_SB_HEADERS });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const rows = await res.json();
  return (rows[0] && rows[0].data) || (id === 'board' ? { posts: [] } : { items: [] });
}
async function fqRemoteSet(id, data) {
  const res = await fetch(`${FQ_SB_URL}/rest/v1/inquiry_state?on_conflict=id`, {
    method: 'POST',
    headers: Object.assign({}, FQ_SB_HEADERS, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify({ id, data, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text().catch(() => '')));
}
// 동적 항목(dyn) + 시드 병합 → FQ_FAQ_DATA 재구성
function fqMergeFaq(dyn) {
  dyn = (dyn || []).map(it => {
    // 레거시(이메일/게시판 전용) 또는 알 수 없는 카테고리는 내용 기반 태그로 재분류
    let cat = it.cat;
    if (!cat || !FQ_SEED_CATS.includes(cat)) cat = fqClassifyKeyword((it.q || '') + '\n' + (it.a || ''));
    return Object.assign({}, it, { cat });
  });
  // 시드(정리된 49건)를 앞에, 동적 항목(이메일/게시판)은 뒤에 — 단, 메인 목록 렌더에서는 시드만 노출
  FQ_FAQ_DATA.items = FQ_SEED_ITEMS.concat(dyn);
  // 카테고리 칩은 시드 카테고리만 (이메일/게시판 전용 카테고리 노출 안 함)
  FQ_FAQ_DATA.categories = FQ_SEED_CATS.slice();
}
// 현재 항목 중 시드가 아닌 동적 항목만 추출
function fqDynItems() {
  const seedIds = new Set(FQ_SEED_ITEMS.map(x => x.id));
  return (FQ_FAQ_DATA.items || []).filter(x => x && !seedIds.has(x.id));
}
// 내용 기반 카테고리 태그 분류 (동적 항목 표시용 — 기존 시드 카테고리 중 선택)
function fqClassifyKeyword(text) {
  const t = String(text || '');
  const pick = kw => FQ_SEED_CATS.find(c => c.includes(kw));
  const rules = [
    // 혼적/격리 문의는 '물질의 위험성'이 아니라 '적재·격리' 주제 → 클래스 규칙(부식/인화 등)보다 우선
    [/격리|segregation|stowage|적재|혼적|혼합|함께\s*(선적|적재|운송)|동일\s*컨테이너|같은\s*컨테이너|\bSGG\b|compartment/i, '적재'],
    [/리튬|lithium|배터리|battery|UN ?-?34(80|81)|UN ?-?309[01]|\bSP ?-?188\b|[12]차\s*전지|power\s*bank|보조\s*배터리/i, '리튬'],
    [/전기차|\bEV\b|차량|vehicle|UN ?-?3166|UN ?-?355[67]|전동(휠체어|자전거)|지게차|forklift/i, '차량'],
    [/숯|charcoal|활성탄|activated\s*carbon|carbon\s*black|카본\s*블랙|과탄산|percarbonate|UN ?-?136[12]|UN ?-?3378/i, '금지'],
    [/해양\s*오염|marine\s*pollutant|환경\s*유해|UN ?-?3082|UN ?-?3077/i, '해양'],
    [/부식|corros|불산|hydrofluoric|염산|hydrochloric|황산|sulfuric|UN ?-?1790|UN ?-?1789|\bclass ?-?8\b|\bcl ?8\b/i, '부식'],
    [/인화|flammable|페인트|paint|래커|lacquer|에탄올|메탄올|알코올|alcohol|UN ?-?1263|UN ?-?1170|UN ?-?1993|\bclass ?-?3\b|\bcl ?3\b/i, '인화'],
    [/산화|oxidi[sz]|과산화|peroxide|자기\s*반응|self-?react|자연\s*발화|spontaneous|SADT|\bclass ?-?5\b/i, '산화'],
    [/에어로졸|aerosol|UN ?-?1950|소화기|extinguisher|UN ?-?1044|압축\s*가스|liquefied\s*gas|\bclass ?-?2\b/i, '에어로졸'],
    [/flexitank|플렉시|flexi\s*tank|\bIBC\b|벌크백/i, 'Flexitank'],
    [/\bRFDG\b|reefer|냉동|온도\s*(통제|모니터|기록)/i, 'RFDG'],
    [/\bOOG\b|flat\s*rack|\bFR\b|open\s*top|\bOT\b|coil|코일|heavy\s*cargo|중량물|강재|steel|컨테이너\s*(규격|스펙|종류)|super\s*rack|supercon/i, 'OOG'],
    [/항만|\bport\b|상해|닝보|칭다오|샤먼|천진|terminal|CAS\s*(no|번호)|하역\s*(불가|제한)/i, '항만'],
    [/MSDS|\bSDS\b|DGD|위험물\s*신고서|B\/L|bill\s*of\s*lading|manifest|적하목록|\bVGM\b|declaration|서류/i, '서류'],
    [/PRE-?CHECK|프리\s*체크|사전\s*검토|부킹|승인\s*(절차|요청)|application/i, '절차'],
    [/\bLQ\b|\bEQ\b|limited\s*quantity|excepted\s*quantity|special\s*provision|\bSP ?-?\d/i, '특별'],
    [/EmS|UN ?-?38\.3|packing\s*instruction|\bP\d{3}\b|tank\s*container|portable\s*tank|overpack|N\.?O\.?S|\bDGL\b|컬럼|column/i, 'IMDG'],
    [/\bclass ?-?[1-9]\b|폭발|explosive|compatibility|독성|toxic|감염|infectious|방사|radioactive/i, 'Class'],
    [/손상|salvage|사고|damaged|클레임|claim|incident|화재/i, '사고'],
    [/타\s*선사|선사별|carrier/i, '선사']
  ];
  for (const [re, kw] of rules) { if (re.test(t)) { const c = pick(kw); if (c) return c; } }
  return pick('판정') || FQ_SEED_CATS[0];
}
// 질문 정규화 + 중복 판정 (RE:/FW:·[..]·기호 제거 후 비교)
function fqNormQ(s) {
  return String(s || '').replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, '').replace(/\[[^\]]*\]/g, '').replace(/[^0-9A-Za-z가-힣]/g, '').toLowerCase();
}
function fqBigrams(s) { const out = new Set(); for (let i = 0; i + 1 < s.length; i++) out.add(s.slice(i, i + 2)); return out; }
function fqIsDupQuestion(q, excludeId) {
  const nq = fqNormQ(q); if (nq.length < 4) return false;
  const tq = fqBigrams(nq);
  return (FQ_FAQ_DATA.items || []).some(it => {
    if (it.id === excludeId) return false;
    const ni = fqNormQ(it.q); if (ni.length < 4) return false;
    if (ni === nq) return true;
    if (ni.length > 6 && (ni.includes(nq) || nq.includes(ni))) return true;
    const ti = fqBigrams(ni); let inter = 0; tq.forEach(x => { if (ti.has(x)) inter++; });
    const uni = tq.size + ti.size - inter;
    return uni > 0 && inter / uni >= 0.82;
  });
}
// 공용 DB에서 FAQ 동적 항목 동기화 (실패 시 로컬 캐시 유지)
async function fqSyncFaqRemote() {
  try {
    const data = await fqRemoteGet('faq');
    fqRemoteOK = true;
    const dyn = data.items || [];
    try { localStorage.setItem(FQ_CONFIG.FAQ_CACHE_KEY, JSON.stringify(dyn)); } catch (e) {}
    fqMergeFaq(dyn);
    fqRenderFaq();
    if (typeof fqRenderEmailList === 'function') fqRenderEmailList();
    if (typeof fqReportRender === 'function') fqReportRender();   // 동기화된 이메일 문의 등을 관리자 리포트(현황판)에도 즉시 반영
  } catch (e) { console.warn('FAQ 공용 DB 동기화 실패(로컬 사용):', e.message); fqRemoteOK = false; }
}
// 공용 DB에서 게시판 글 동기화
async function fqSyncPostsRemote() {
  try {
    const data = await fqRemoteGet('board');
    fqRemoteOK = true;
    fqPosts = data.posts || [];
    try { localStorage.setItem(FQ_CONFIG.BOARD_KEY, JSON.stringify(fqPosts)); } catch (e) {}
    fqRenderPosts();
  } catch (e) { console.warn('게시판 공용 DB 동기화 실패(로컬 사용):', e.message); }
}
// 현재 동적 FAQ 항목 전체를 공용 DB에 저장
async function fqPushFaqRemote() {
  try { await fqRemoteSet('faq', { items: fqDynItems() }); fqRemoteOK = true; }
  catch (e) { console.warn('FAQ 공용 저장 실패(로컬):', e.message); }
}
// 현재 게시판 글 전체를 공용 DB에 저장
async function fqPushPostsRemote() {
  try { await fqRemoteSet('board', { posts: fqPosts }); fqRemoteOK = true; }
  catch (e) { console.warn('게시판 공용 저장 실패(로컬):', e.message); }
}


// ═══════════════════════════════════════════════════════════════
// 초기화
// ═══════════════════════════════════════════════════════════════
function fqInit(scope) {
  scope = scope || document;
  fqLoadFaq();
  fqLoadPosts();
  fqLoadAuditCache();   // 오류·모순 검토 결과 캐시(플래그 표시용) 로드
  fqBindTabs(scope);
  fqBindFaq(scope);
  fqBindBoard(scope);
  fqBindReport(scope);
  fqRenderFaq();
  fqRenderPosts();
  fqUpdateAdminUI();
  // 공용 DB(Supabase) 최신 데이터 동기화 (비동기 — 끝나면 자동 재렌더)
  fqSyncFaqRemote();
  fqSyncPostsRemote();
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
      // 탭 전환 시 공용 DB에서 최신 데이터 새로고침
      if (tab === 'faq') fqSyncFaqRemote();
      else if (tab === 'board') fqSyncPostsRemote();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 관리자 리포트 — 문의 통계 + 답변 검토
// ═══════════════════════════════════════════════════════════════
// 문의 항목의 날짜 추정 (ts 필드 우선, 없으면 id의 base36 타임스탬프)
function fqItemDate(i) {
  if (i && i.ts) { const d = new Date(i.ts); if (!isNaN(d)) return d; }
  const m = String((i && i.id) || '').match(/^faq_eml_([0-9a-z]+)_/i);
  if (m) { const ms = parseInt(m[1], 36); if (ms > 1577836800000 && ms < 4102444800000) return new Date(ms); }
  return null;
}
// 통계 대상: 등록된 이메일 문의(source==='email') + AI 문의(source==='ai') + 게시판 글
// 관리자 리포트 문의내역에서 카테고리 직접 변경 (출처별 저장소로 라우팅)
async function fqChangeRptCat(id, src, cat) {
  if (src === '게시판') {
    if (typeof fqChangePostCat === 'function') await fqChangePostCat(id, cat);   // 자체적으로 저장 + 리포트 재렌더
    return;
  }
  // 이메일 / AI문의 → FQ_FAQ_DATA 항목 (둘 다 fqPushFaqRemote로 저장)
  const m = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (!m || m.cat === cat) return;
  m.cat = cat;
  if (typeof fqRenderEmailList === 'function') fqRenderEmailList();
  if (typeof fqRenderFaq === 'function') fqRenderFaq();
  if (typeof fqReportRender === 'function') fqReportRender();
  try { await fqPushFaqRemote(); fqToast('✓ 카테고리 변경 저장됨', 'success'); }
  catch (e) { fqToast('카테고리 저장 실패(로컬만 반영): ' + e.message, 'warn'); }
}
function fqReportInquiries() {
  const out = [];
  (FQ_FAQ_DATA.items || []).filter(i => i.source === 'email').forEach(i => {
    out.push({ date: fqItemDate(i), cat: i.cat || '기타', src: '이메일', q: i.q || '', id: i.id });
  });
  (FQ_FAQ_DATA.items || []).filter(i => i.source === 'ai').forEach(i => {
    out.push({ date: fqItemDate(i), cat: i.cat || '기타', src: 'AI문의', q: i.q || '', id: i.id });
  });
  (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).forEach(p => {
    out.push({ date: p.createdAt ? new Date(p.createdAt) : null, cat: p.category || '기타', src: '게시판', q: p.title || p.subject || p.q || '', id: p.id });
  });
  return out;
}
function fqReportRender() {
  const yearSel = document.getElementById('rptYear');
  if (!yearSel) return;
  const inq = fqReportInquiries();
  const years = [...new Set(inq.map(x => x.date && x.date.getFullYear()).filter(Boolean))].sort((a, b) => b - a);
  const curY = yearSel.value;
  yearSel.innerHTML = '<option value="">전체 연도</option>' + years.map(y => `<option value="${y}">${y}년</option>`).join('');
  if (curY && years.includes(+curY)) yearSel.value = curY;
  const fy = yearSel.value;
  const fq = (document.getElementById('rptQuarter') || {}).value || '';
  const fm = (document.getElementById('rptMonth') || {}).value || '';
  const fsrc = (document.getElementById('rptSource') || {}).value || '';
  const filtered = inq.filter(x => {
    if (fsrc && x.src !== fsrc) return false;
    if (fy || fq || fm) { if (!x.date) return false; }
    if (fy && x.date.getFullYear() !== +fy) return false;
    if (fq && (Math.floor(x.date.getMonth() / 3) + 1) !== +fq) return false;
    if (fm && (x.date.getMonth() + 1) !== +fm) return false;
    return true;
  });
  const byCat = {}; filtered.forEach(x => { byCat[x.cat] = (byCat[x.cat] || 0) + 1; });
  const rows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const total = filtered.length;
  const bySrc = {}; filtered.forEach(x => { bySrc[x.src] = (bySrc[x.src] || 0) + 1; });
  const periodLabel = `${fy ? fy + '년' : '전체기간'}${fq ? ' ' + fq + '분기' : ''}${fm ? ' ' + fm + '월' : ''}`;
  const sumEl = document.getElementById('rptSummary');
  if (sumEl) sumEl.innerHTML =
    `<span class="rpt-kpi"><b>${total}</b>건 문의</span>` +
    Object.entries(bySrc).map(([s, n]) => `<span class="rpt-kpi-sm">${fqEsc(s)} ${n}건</span>`).join('') +
    `<span class="rpt-kpi-sm">${fqEsc(periodLabel)}</span>`;
  const max = rows.length ? rows[0][1] : 1;
  const barsEl = document.getElementById('rptBars');
  if (barsEl) barsEl.innerHTML = rows.length
    ? rows.map(([c, n]) => `<div class="rpt-bar-row"><span class="rpt-bar-label">${fqEsc(c)}</span><span class="rpt-bar"><span class="rpt-bar-fill" style="width:${Math.round(n / max * 100)}%"></span></span><span class="rpt-bar-val">${n}건 · ${total ? Math.round(n / total * 100) : 0}%</span></div>`).join('')
    : '<div class="fq-empty">해당 기간에 등록된 문의가 없습니다.</div>';

  // 문의 리스트 (연/월/일별 — 날짜 내림차순). AI문의·이메일·게시판을 한 곳에서 확인
  const listEl = document.getElementById('rptList');
  if (listEl) {
    const withDate = filtered.filter(x => x.date).sort((a, b) => b.date - a.date);
    const undated = filtered.filter(x => !x.date).length;
    const badgeCls = { 'AI문의': 'ai', '이메일': 'eml', '게시판': 'brd' };
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const body = withDate.map(x => {
      const issue = fqAuditResults[x.id];   // 답변 오류·모순 발견 시 표시
      const _adm = (typeof dgIsAdmin === 'function' && dgIsAdmin());   // 오류체크(검토 결과)는 관리자만
      const _resolved = fqAuditResolved[x.id];                          // 담당자 정리·해결 완료
      const flag = !_adm ? '' : (_resolved
        ? '<button class="rpt-resolved" onclick="fqToggleAuditDetail(\'' + x.id + '\')" title="담당자 정리·해결 완료 — 클릭해 확인">✓ 오류정리 완료</button>'
        : (issue ? '<button class="rpt-flag" onclick="fqToggleAuditDetail(\'' + x.id + '\')" title="답변 오류·모순 발견 — 클릭해 확인/수정">❗ 오류체크</button>' : ''));
      const detail = (_adm && (issue || _resolved)) ? '<div class="rpt-audit-detail" id="fqAuditDetail-' + x.id + '" hidden></div>' : '';
      return '<div class="rpt-li' + (issue && !_resolved && _adm ? ' rpt-li-flagged' : '') + '">' +
        '<span class="rpt-li-date">' + fmt(x.date) + '</span>' +
        '<span class="rpt-li-src"><span class="rpt-src rpt-src-' + (badgeCls[x.src] || 'etc') + '">' + fqEsc(x.src) + '</span></span>' +
        '<span class="rpt-li-cat">' + ((typeof dgIsAdmin === 'function' && dgIsAdmin())
          ? '<select class="fq-cat-select rpt-cat-select" title="카테고리 변경" onclick="event.stopPropagation()" onchange="fqChangeRptCat(\'' + x.id + '\',\'' + x.src + '\',this.value)">' + fqEmailCatOptions(x.cat) + '</select>'
          : fqEsc(x.cat || '-')) + '</span>' +
        '<span class="rpt-li-q rpt-li-q-click" title="클릭 시 답변 펼치기" onclick="fqToggleRptAnswer(\'' + x.id + '\')">' + fqEsc((x.q || '(제목 없음)').slice(0, 90)) + '</span>' +
        flag +
        (_adm ? '<button class="rpt-edit" onclick="fqEditAnswer(\'' + x.id + '\')" title="이 문의의 답변을 직접 수정">✏️ 답변수정</button>' : '') +
        (_adm ? '<button class="rpt-del" onclick="fqDeleteInquiry(\'' + x.id + '\',\'' + fqEsc(x.src) + '\')" title="이 문의 내역 삭제(유사 문의 재등록용)">🗑</button>' : '') +
        '</div>' + detail +
        (_adm ? '<div class="rpt-edit-box" id="fqEditBox-' + x.id + '" hidden></div>' : '') +
        '<div class="rpt-ans" id="fqRptAns-' + x.id + '" hidden></div>';
    }).join('');
    listEl.innerHTML = (withDate.length || undated)
      ? '<div class="rpt-li rpt-li-head"><span class="rpt-li-date">날짜</span><span class="rpt-li-src">출처</span><span class="rpt-li-cat">카테고리</span><span class="rpt-li-q">문의 내용</span></div>' +
        body + (undated ? '<div class="rpt-li rpt-li-undated">· 날짜 미상 ' + undated + '건</div>' : '')
      : '<div class="fq-empty">해당 기간에 등록된 문의가 없습니다.</div>';
  }

  // 답변 검토 상태 표시
  const auditStatusEl = document.getElementById('rptAuditStatus');
  if (auditStatusEl && !fqAuditRunning) {
    const n = Object.keys(fqAuditResults || {}).length;
    auditStatusEl.textContent = fqAuditMeta.date
      ? `최근 답변 검토: ${fqAuditMeta.date} · 점검 ${fqAuditMeta.checked}건 · 오류·모순 ${n}건` + (n ? ' → 목록의 ❗ 오류체크 클릭' : '')
      : '[새 답변 검토] 버튼을 눌러 답변 오류·모순을 검토하세요. (새/변경된 답변만 검토)';
  }
}
// AI 답변 검토 (오류·모순 탐지) — faq-ai mode='audit'
async function fqRunAudit() {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 답변 검토를 실행할 수 있습니다', 'warn'); return; }
  const out = document.getElementById('rptAuditResult');
  const btn = document.getElementById('rptAuditBtn');
  if (!out) return;
  const all = (FQ_FAQ_DATA.items || []).filter(i => (i.q && i.a));
  if (all.length < 2) { out.innerHTML = '<div class="fq-empty">검토할 답변 데이터가 충분하지 않습니다.</div>'; return; }
  // AI·이메일·게시판 등 등록 문의를 먼저 검토(최신 사용자 답변 우선), 그다음 시드 지식
  const items = all.filter(i => i.source).concat(all.filter(i => !i.source));
  const ctx = items.slice(0, 60).map(i => ({ q: i.q, a: (i.a || '').slice(0, 1200), cat: i.cat }));
  out.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span>🔎 쌓인 답변들을 점검해 오류·모순을 찾고 있습니다…</div>';
  if (btn) btn.disabled = true;
  try {
    const res = await fetch('/api/faq-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'audit', context: ctx })
    });
    let j = {}; try { j = await res.json(); } catch (e) {}
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    out.innerHTML = '<div class="fq-ai-result">' + fqRenderText(j.audit || '(결과 없음)') + '</div>' +
      '<div class="fq-ai-disclaimer">⚠️ AI 검토 의견입니다. 실제 수정 전 담당자가 IMDG Code·사내 규정과 대조해 확인하세요.</div>';
  } catch (e) {
    out.innerHTML = '<div class="fq-ai-error">검토 실패: ' + fqEsc(e.message) + '</div>';
  } finally { if (btn) btn.disabled = false; }
}
// ═══ 항목별 답변 오류·모순 자동 검토 (하루 1회 정오 기준) ═══
const FQ_AUDIT_CACHE_KEY = 'fq_audit_daily_v1';
let fqAuditResults = {};   // { id: issueText } — 오류·모순이 발견된 항목
let fqAuditResolved = {};  // { id: { decision, at } } — 담당자가 정리·해결 처리한 항목(초록 '오류정리 완료')
let fqAuditMeta = { date: '', checked: 0 };
let fqAuditRunning = false;
let fqAuditedSigs = {};   // { id: 답변 시그니처 } — 이미 검토한 항목(증분 검토용)
// 검토 대상: 답변이 있는 문의 (이메일/AI 항목 + 답변 달린 게시판 글)
function fqAuditableRows() {
  const out = [];
  (FQ_FAQ_DATA.items || []).forEach(i => {
    if ((i.source === 'email' || i.source === 'ai') && i.q && i.a)
      out.push({ id: i.id, q: i.q, a: i.a, cat: i.cat || '', src: i.source === 'ai' ? 'AI문의' : '이메일' });
  });
  (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).forEach(p => {
    if (p.answer && p.subject)
      out.push({ id: p.id, q: p.subject + (p.body ? ' / ' + p.body : ''), a: p.answer, cat: p.category || '', src: '게시판' });
  });
  return out;
}
function fqLoadAuditCache() {
  try {
    const c = JSON.parse(localStorage.getItem(FQ_AUDIT_CACHE_KEY) || '{}');
    if (c && c.results) { fqAuditResults = c.results; fqAuditMeta = { date: c.date || '', checked: c.checked || 0 }; }
    if (c && c.audited) fqAuditedSigs = c.audited;
    if (c && c.resolved) fqAuditResolved = c.resolved;
  } catch (e) {}
}
function fqAnsSig(a) { a = String(a || ''); return a.length + '|' + a.slice(0, 30) + '|' + a.slice(-30); }
function fqSaveAuditCache() {
  try { localStorage.setItem(FQ_AUDIT_CACHE_KEY, JSON.stringify({ date: fqAuditMeta.date, checked: fqAuditMeta.checked, results: fqAuditResults, audited: fqAuditedSigs, resolved: fqAuditResolved })); } catch (e) {}
}
// 혼적/격리 항목의 IMDG 격리표 결정론적 판정 문자열 (감사 근거 주입용)
function fqRowSeg(text, unMap) {
  if (typeof fqParseSegCargos !== 'function' || typeof fqSegregationCheck !== 'function') return null;
  const parsed = fqParseSegCargos(text);
  if (!parsed.rows || parsed.rows.length < 2) return null;
  const cargos = parsed.rows
    .map(r => ({ class: r.class || (r.unno && unMap ? unMap[r.unno] : null), unno: r.unno, name: r.unno ? ('UN' + r.unno) : ('Class ' + (r.class || '?')) }))
    .filter(c => c.class);
  if (cargos.length < 2) return null;
  const chk = fqSegregationCheck(cargos);
  return chk.verdict + (chk.detail && chk.detail.length ? ' [' + chk.detail.join(' / ') + ']' : '');
}
// 증분 검토: 이미 검토한(시그니처 동일) 답변은 건너뛰고 새/변경된 답변만 검토
async function fqRunDailyAudit(fullRecheck) {
  if (fqAuditRunning) return;
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 답변 검토를 실행할 수 있습니다', 'warn'); return; }
  const all = fqAuditableRows();
  const statusEl = document.getElementById('rptAuditStatus');
  // 사라진 항목은 결과·시그니처에서 정리
  const liveIds = new Set(all.map(r => r.id));
  Object.keys(fqAuditResults).forEach(id => { if (!liveIds.has(id)) delete fqAuditResults[id]; });
  Object.keys(fqAuditedSigs).forEach(id => { if (!liveIds.has(id)) delete fqAuditedSigs[id]; });
  if (!all.length) {
    fqAuditResults = {}; fqAuditedSigs = {}; fqAuditMeta = { date: fqTodayStr(), checked: 0 };
    fqSaveAuditCache();
    if (statusEl) statusEl.textContent = '검토할 답변(문의)이 아직 없습니다.';
    fqReportRender(); return;
  }
  const targets = (fullRecheck === true) ? all : all.filter(r => fqAuditedSigs[r.id] !== fqAnsSig(r.a));
  if (!targets.length) {
    fqAuditMeta = { date: fqTodayStr(), checked: all.length };
    fqSaveAuditCache();
    if (statusEl) statusEl.textContent = '새로 검토할 답변이 없습니다 (모두 검토 완료).';
    fqReportRender();
    fqToast('새로 추가·변경된 답변이 없어 검토를 건너뛰었습니다', 'success');
    return;
  }
  fqAuditRunning = true;
  if (statusEl) statusEl.innerHTML = `<span class="fq-spin" aria-hidden="true"></span> 새 답변 ${targets.length}건 오류·모순 검토 중…`;
  try {
    // 혼적/격리 항목에 IMDG 격리표 결정론적 판정을 근거로 주입(AI가 임의로 뒤집지 못하게)
    const segTargets = targets.filter(r => /혼적|격리|segregat/i.test((r.q || '') + (r.a || '')));
    if (segTargets.length) {
      const allUn = [...new Set(targets.flatMap(r => (typeof fqExtractUnnos === 'function' ? fqExtractUnnos((r.q || '') + ' ' + (r.a || '')) : [])))];
      let unMap = {};
      if (allUn.length) {
        try {
          const dr = await fetch('/api/dg-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unnos: allUn }) });
          const dj = await dr.json().catch(() => ({}));
          if (dr.ok && dj.ok && Array.isArray(dj.data)) dj.data.forEach(d => { const u = String(d.UNNO || d.unno || ''); if (u && !unMap[u]) unMap[u] = d.Class || d.class; });
        } catch (_) {}
      }
      segTargets.forEach(r => { const sg = fqRowSeg((r.q || '') + ' ' + (r.a || ''), unMap); if (sg) r.seg = sg; });
    }
    const res = await fetch('/api/faq-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'auditrows', rows: targets.map(r => ({ q: r.q, a: r.a, cat: r.cat, seg: r.seg })) })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    const issueByIdx = {};
    (j.issues || []).forEach(it => { issueByIdx[it.i] = it.issue; });
    targets.forEach((r, i) => {
      if (fqAuditResolved[r.id]) { delete fqAuditResults[r.id]; fqAuditedSigs[r.id] = fqAnsSig(r.a); return; }  // 담당자 정리완료 → 재플래그 안 함
      if (issueByIdx[i]) fqAuditResults[r.id] = issueByIdx[i];   // 문제 발견 → 등록
      else delete fqAuditResults[r.id];                          // 재검토 후 깨끗 → 기존 표시 제거
      fqAuditedSigs[r.id] = fqAnsSig(r.a);                       // 검토 완료 기록
    });
    fqAuditMeta = { date: fqTodayStr(), checked: all.length };
    fqSaveAuditCache();
    fqReportRender();
    const newIssues = Object.keys(issueByIdx).length;
    fqToast(`✓ 새 답변 ${targets.length}건 검토 — 오류·모순 ${newIssues}건`, newIssues ? 'warn' : 'success');
  } catch (e) {
    if (statusEl) statusEl.textContent = '검토 실패: ' + e.message;
  } finally { fqAuditRunning = false; }
}
// 리포트 열람 시: 캐시된 검토결과(플래그)만 표시 — 검토는 [새 답변 검토] 버튼으로만 수동 실행
function fqAuditAutoCheck() {
  fqLoadAuditCache();
  fqReportRender();
}
// 원본 문의/답변 + 지적된 오류 + 담당자 결정 → AI 수정요청 텍스트 구성
function fqComposeFix(id) {
  const row = fqAuditableRows().find(r => r.id === id) || {};
  const dec = (document.getElementById('fqAdDec-' + id) || {}).value || '';
  const issue = fqAuditResults[id] || '';
  return '[문의]\n' + (row.q || '') + '\n\n[현재 답변]\n' + (row.a || '') + '\n\n[지적된 오류·모순]\n' + issue +
    '\n\n[담당자 결정/수정 방향]\n' + (dec || '(미입력)') +
    '\n\n위 [지적된 오류]와 [담당자 결정]을 반영해 IMDG Code 기준으로 정정된 최종 답변을 작성해줘.';
}
// 문의 내역 행의 문의내용 클릭 → 해당 문의의 답변을 아래에 펼침/접기
function fqToggleRptAnswer(id) {
  const box = document.getElementById('fqRptAns-' + id);
  if (!box) return;
  if (!box.hidden) { box.hidden = true; box.innerHTML = ''; return; }
  let q = '', a = '';
  const it = (FQ_FAQ_DATA.items || []).find(x => x.id === id);
  if (it) { q = it.q || ''; a = it.a || ''; }
  else {
    const p = (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).find(x => x.id === id);
    if (p) { q = p.subject || ''; a = p.answer || ''; }
  }
  box.innerHTML =
    (q ? '<div class="rpt-ans-q"><b>문의</b> ' + fqEsc(q) + '</div>' : '') +
    (a ? '<div class="rpt-ans-a"><b>답변</b><br>' + fqRenderText(a) + '</div>'
       : '<div class="rpt-ans-empty">아직 등록된 답변이 없습니다.</div>');
  box.hidden = false;
}
// 문의 내역 삭제 (관리자 전용) — 동적 FAQ(AI/이메일) 또는 게시판 글 제거. 유사문의 중복으로 더 나은 답을 못 올릴 때 기존 항목 정리용.
async function fqDeleteInquiry(id, src) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 삭제할 수 있습니다', 'warn'); return; }
  if (!confirm('이 문의 내역을 삭제하시겠습니까?\n(유사 문의 재등록을 위해 기존 항목을 지웁니다. 복구 불가)')) return;
  let removed = false;
  const before = (FQ_FAQ_DATA.items || []).length;
  FQ_FAQ_DATA.items = (FQ_FAQ_DATA.items || []).filter(i => i.id !== id);
  if ((FQ_FAQ_DATA.items || []).length < before) {
    fqSaveFaq();
    try { await fqPushFaqRemote(); } catch (e) { fqToast('공용 저장 실패(로컬만): ' + e.message, 'warn'); }
    removed = true;
  } else if (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts)) {
    const b2 = fqPosts.length;
    fqPosts = fqPosts.filter(p => p.id !== id);
    if (fqPosts.length < b2) {
      fqSavePosts();
      try { await fqPushPostsRemote(); } catch (e) { fqToast('공용 저장 실패(로컬만): ' + e.message, 'warn'); }
      if (typeof fqRenderPosts === 'function') fqRenderPosts();
      removed = true;
    }
  }
  // 오류체크 캐시 정리
  if (fqAuditResults) delete fqAuditResults[id];
  if (fqAuditResolved) delete fqAuditResolved[id];
  if (fqAuditedSigs) delete fqAuditedSigs[id];
  if (typeof fqSaveAuditCache === 'function') fqSaveAuditCache();
  fqReportRender();
  fqToast(removed ? '✓ 문의 내역 삭제됨 — 이제 유사 문의도 새로 등록할 수 있습니다' : '대상을 찾지 못했습니다', removed ? 'success' : 'warn');
}
function fqToggleAuditDetail(id) {
  const box = document.getElementById('fqAuditDetail-' + id);
  if (!box) return;
  if (!box.hidden) { box.hidden = true; box.innerHTML = ''; return; }
  const resolved = fqAuditResolved[id];
  const priorDec = (resolved && resolved.decision) ? resolved.decision : '';
  const issue = fqAuditResults[id] || (resolved ? '(정리 완료된 항목)' : '(내용 없음)');
  box.innerHTML =
    (resolved ? '<div class="rpt-ad-resolved-banner">✓ 담당자 정리·해결 완료' + (resolved.at ? ' · ' + new Date(resolved.at).toLocaleString('ko') : '') + '</div>' : '') +
    '<div class="rpt-ad-issue"><b>⚠️ 지적된 오류·모순</b><div>' + fqEsc(issue) + '</div></div>' +
    '<label class="rpt-ad-label">담당자 결정 / 수정 방향 (직접 입력)</label>' +
    '<textarea class="rpt-ad-decision" id="fqAdDec-' + id + '" placeholder="예: 산+염기 격리는 Away from(1)로 정정. 근거: IMDG 7.2.4 …">' + fqEsc(priorDec) + '</textarea>' +
    '<div class="rpt-ad-actions">' +
      '<button class="fq-btn ghost" onclick="fqCopyAuditFix(\'' + id + '\')">📋 수정요청 복사</button>' +
      '<button class="fq-btn ghost" onclick="fqAiFixAnswer(\'' + id + '\')">🤖 AI 수정안 작성</button>' +
      '<button class="fq-btn accent" onclick="fqApplyDecision(\'' + id + '\')">✓ 적용 (AI 답변에 반영)</button>' +
      (resolved
        ? '<button class="fq-btn ghost" onclick="fqReopenAudit(\'' + id + '\')">↩ 검토대상으로 되돌리기</button>'
        : '<button class="fq-btn primary" onclick="fqResolveAudit(\'' + id + '\')">✓ 오류 해결 처리 (답변 정확)</button>') +
    '</div>' +
    '<div class="rpt-ad-result" id="fqAdRes-' + id + '"></div>';
  box.hidden = false;
}

// 담당자 결정을 답변에 반영(AI 참고용) + 해결 처리
async function fqApplyDecision(id) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 적용할 수 있습니다', 'warn'); return; }
  const decEl = document.getElementById('fqAdDec-' + id);
  const dec = decEl ? decEl.value.trim() : '';
  if (!dec) { fqToast('담당자 결정/수정 방향을 입력하세요', 'warn'); return; }
  const note = '\n\n[담당자 정정 · ' + (new Date().toLocaleDateString('ko')) + '] ' + dec;
  let applied = false;
  const fi = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (fi) {
    fi.a = (fi.a || '') + note; fi.decision = dec;
    fqSaveFaq();
    try { await fqPushFaqRemote(); applied = true; } catch (e) { fqToast('공용 저장 실패(로컬만 반영): ' + e.message, 'warn'); applied = true; }
  } else {
    const p = (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).find(x => x.id === id);
    if (p) {
      p.answer = (p.answer || '') + note; p.decision = dec;
      fqSavePosts();
      try { await fqPushPostsRemote(); applied = true; } catch (e) { fqToast('공용 저장 실패(로컬만 반영): ' + e.message, 'warn'); applied = true; }
      if (typeof fqRenderPosts === 'function') fqRenderPosts();
    }
  }
  fqAuditResolved[id] = { decision: dec, at: new Date().toISOString() };
  delete fqAuditResults[id];
  fqSaveAuditCache();
  fqReportRender();
  fqToast(applied ? '✓ 담당자 결정을 답변에 반영했습니다 — 이후 AI 문의·초안에 참고됩니다' : '✓ 해결 처리 완료', 'success');
}

// 오류 해결 처리(답변이 정확한 경우 — 답변 변경 없이 초록 표시로 전환)
function fqResolveAudit(id) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 처리할 수 있습니다', 'warn'); return; }
  const decEl = document.getElementById('fqAdDec-' + id);
  const dec = decEl && decEl.value.trim() ? decEl.value.trim() : '(답변 정확 — 오류 아님으로 확인)';
  fqAuditResolved[id] = { decision: dec, at: new Date().toISOString() };
  delete fqAuditResults[id];
  fqSaveAuditCache();
  fqReportRender();
  fqToast('✓ 오류 해결 처리 완료 — "오류정리 완료"로 표시됩니다', 'success');
}

// 해결 처리 취소 — 다시 검토대상으로
function fqReopenAudit(id) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 처리할 수 있습니다', 'warn'); return; }
  delete fqAuditResolved[id];
  if (fqAuditedSigs) delete fqAuditedSigs[id];   // 다음 검토 때 다시 검사
  fqSaveAuditCache();
  fqReportRender();
  fqToast('검토대상으로 되돌렸습니다 — 다음 답변 검토 시 재검사됩니다', 'success');
}
function fqCopyAuditFix(id) {
  const txt = fqComposeFix(id);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(
      () => fqToast('✓ 수정요청 내용 복사됨 — AI 문의 등에 붙여넣어 사용하세요', 'success'),
      () => fqToast('복사 실패 — 직접 선택해 복사하세요', 'warn'));
  } else { fqToast('이 브라우저는 자동 복사를 지원하지 않습니다', 'warn'); }
}
async function fqAiFixAnswer(id) {
  const resEl = document.getElementById('fqAdRes-' + id);
  if (resEl) resEl.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span> AI가 수정안을 작성 중…</div>';
  try {
    const res = await fetch('/api/faq-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: fqComposeFix(id), context: [] })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    if (resEl) resEl.innerHTML = '<div class="fq-ai-result"><b>🤖 AI 수정안 (담당자 검토 후 반영)</b><br>' + fqRenderText(j.answer || '(빈 응답)') + '</div>';
  } catch (e) {
    if (resEl) resEl.innerHTML = '<div class="fq-ai-error">수정안 작성 실패: ' + fqEsc(e.message) + '</div>';
  }
}

// ═══ 답변 직접 수정 (오류체크 알람과 무관하게 모든 문의에서 사용) ═══
// 문의내역의 어떤 항목이든 ✏️ 답변수정 버튼으로 현재 답변을 직접 고쳐 저장한다.
function fqEditAnswer(id) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 답변을 수정할 수 있습니다', 'warn'); return; }
  const box = document.getElementById('fqEditBox-' + id);
  if (!box) return;
  if (!box.hidden) { box.hidden = true; box.innerHTML = ''; return; }   // 토글 닫기
  // 현재 답변 찾기 (AI문의·이메일 = FQ_FAQ_DATA.items / 게시판 = fqPosts)
  let cur = '', found = false;
  const fi = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (fi) { cur = fi.a || ''; found = true; }
  else {
    const p = (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).find(x => x.id === id);
    if (p) { cur = p.answer || ''; found = true; }
  }
  if (!found) { fqToast('이 문의 항목을 찾을 수 없습니다', 'warn'); return; }
  box.innerHTML =
    '<label class="rpt-edit-label">답변 수정 (현재 답변을 직접 고쳐 저장합니다)</label>' +
    '<textarea id="fqEdAns-' + id + '" placeholder="이 문의에 대한 답변을 입력/수정하세요">' + fqEsc(cur) + '</textarea>' +
    '<div class="rpt-edit-actions">' +
      '<button class="fq-btn accent" onclick="fqSaveAnswerEdit(\'' + id + '\')">💾 답변 저장</button>' +
      '<button class="fq-btn ghost" onclick="fqEditAnswer(\'' + id + '\')">✖ 닫기</button>' +
    '</div>';
  box.hidden = false;
  const ta = document.getElementById('fqEdAns-' + id);
  if (ta) ta.focus();
}
// 수정한 답변 저장 → 항목(FAQ item / 게시판 글)에 반영 + 공용 DB 동기화
async function fqSaveAnswerEdit(id) {
  if (!(typeof dgIsAdmin === 'function' && dgIsAdmin())) { fqToast('관리자만 답변을 수정할 수 있습니다', 'warn'); return; }
  const ta = document.getElementById('fqEdAns-' + id);
  if (!ta) return;
  const val = ta.value.trim();
  let saved = false;
  const fi = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (fi) {
    fi.a = val;
    fqSaveFaq();
    try { await fqPushFaqRemote(); } catch (e) { fqToast('공용 저장 실패(로컬만 반영): ' + e.message, 'warn'); }
    saved = true;
  } else {
    const p = (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts) ? fqPosts : []).find(x => x.id === id);
    if (p) {
      p.answer = val;
      if (val && p.status !== 'answered') p.status = 'answered';
      fqSavePosts();
      try { await fqPushPostsRemote(); } catch (e) { fqToast('공용 저장 실패(로컬만 반영): ' + e.message, 'warn'); }
      if (typeof fqRenderPosts === 'function') fqRenderPosts();
      saved = true;
    }
  }
  if (!saved) { fqToast('항목을 찾을 수 없어 저장하지 못했습니다', 'warn'); return; }
  // 답변이 바뀌었으니 기존 오류체크 플래그는 정리(다음 검토 때 새 답변으로 재검사)
  if (fqAuditResults[id]) delete fqAuditResults[id];
  if (fqAuditedSigs && fqAuditedSigs[id]) delete fqAuditedSigs[id];
  fqSaveAuditCache();
  const box = document.getElementById('fqEditBox-' + id);
  if (box) { box.hidden = true; box.innerHTML = ''; }
  fqReportRender();
  fqToast('✓ 답변을 수정·저장했습니다 — 이후 AI 문의·초안에도 반영됩니다', 'success');
}

// ── 위험물 사고 뉴스 (하루 1회 조회, 헤드라인+위험물/선적금지 의견) ──
const FQ_NEWS_CACHE_KEY = 'fq_dg_news_v1';
function fqTodayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function fqRenderNewsList(news, updated) {
  const box = document.getElementById('rptNewsList');
  const up = document.getElementById('rptNewsUpdated');
  if (up) up.textContent = updated ? `최근 업데이트: ${updated}` : '';
  if (!box) return;
  if (!news || !news.length) { box.innerHTML = '<div class="fq-empty">표시할 사고 뉴스가 없습니다. ‘🔍 뉴스검색하기’ 버튼을 눌러보세요.</div>'; return; }
  box.innerHTML = news.map(n => {
    const chemLink = n.chemLink || ('https://pubchem.ncbi.nlm.nih.gov/#query=' + encodeURIComponent(n.substance || ''));
    const chem = n.substance ? `<span class="news-chem" title="클릭 시 PubChem(미국 국립보건원) 물질정보로 이동">🧪
        <a class="news-chem-name" href="${fqEsc(chemLink)}" target="_blank" rel="noopener">${fqEsc(n.substance)}</a>
        ${n.cas ? `<span class="news-chem-id">CAS ${fqEsc(n.cas)}</span>` : ''}
        ${n.un ? `<span class="news-chem-id un">UN ${fqEsc(n.un)}</span>` : ''}
      </span>` : '';
    return `
    <div class="news-item">
      <div class="news-head">
        <a class="news-title" href="${fqEsc(n.link)}" target="_blank" rel="noopener">${fqEsc(n.title)}</a>
        ${chem}
      </div>
      <div class="news-meta">${fqEsc(n.source || '')}${n.pub ? ' · ' + fqEsc(new Date(n.pub).toLocaleDateString('ko')) : ''}</div>
      ${(n.dg || n.hazard || n.opinion) ? `<div class="news-opinion">
        ${n.dg ? `<span class="news-dg">⚠️ ${fqEsc(n.dg)}</span>` : ''}
        ${n.hazard ? `<div>위험성: ${fqEsc(n.hazard)}</div>` : ''}
        ${n.opinion ? `<div>📌 선적 검토 의견: ${fqEsc(n.opinion)}</div>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}
async function fqLoadNews(force) {
  const box = document.getElementById('rptNewsList');
  if (!force) {
    try { const c = JSON.parse(localStorage.getItem(FQ_NEWS_CACHE_KEY) || '{}'); if (c.date === fqTodayStr() && c.news) { fqRenderNewsList(c.news, c.date); return; } } catch (e) {}
  }
  if (box) box.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span>📰 위험물 사고 뉴스를 수집·분석 중입니다…</div>';
  try {
    const res = await fetch('/api/faq-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'news' }) });
    let j = {}; try { j = await res.json(); } catch (e) {}
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    const today = fqTodayStr();
    try { localStorage.setItem(FQ_NEWS_CACHE_KEY, JSON.stringify({ date: today, news: j.news })); } catch (e) {}
    fqRenderNewsList(j.news, today);
  } catch (e) {
    if (box) box.innerHTML = '<div class="fq-ai-error">뉴스를 불러오지 못했습니다: ' + fqEsc(e.message) + '</div>';
  }
}
function fqRenderNews() {
  // 탭 진입 시 자동 검색하지 않는다 — 오늘 검색해 둔 캐시가 있으면 보여주고, 없으면 버튼 안내만 표시.
  try { const c = JSON.parse(localStorage.getItem(FQ_NEWS_CACHE_KEY) || '{}'); if (c.date === fqTodayStr() && c.news) { fqRenderNewsList(c.news, c.date); return; } } catch (e) {}
  const box = document.getElementById('rptNewsList');
  const up = document.getElementById('rptNewsUpdated');
  if (up) up.textContent = '';
  if (box) box.innerHTML = '<div class="fq-empty">‘🔍 뉴스검색하기’ 버튼을 누르면 최신 위험물 사고 뉴스를 검색합니다.</div>';
}
function fqBindReport(scope) {
  // 서브탭 전환
  scope.querySelectorAll('[data-rpt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.rpt;
      scope.querySelectorAll('[data-rpt]').forEach(b => b.classList.toggle('active', b.dataset.rpt === t));
      scope.querySelectorAll('[data-rpt-panel]').forEach(p => p.classList.toggle('active', p.dataset.rptPanel === t));
      if (t === 'news') fqRenderNews();
      if (t === 'members' && typeof dgRefreshMembers === 'function') dgRefreshMembers();
    });
  });
  const newsRefresh = scope.querySelector('#rptNewsRefresh');
  if (newsRefresh) newsRefresh.addEventListener('click', () => fqLoadNews(true));
  ['rptYear', 'rptQuarter', 'rptMonth', 'rptSource'].forEach(id => {
    const el = scope.querySelector('#' + id);
    if (el) el.addEventListener('change', fqReportRender);
  });
  const reset = scope.querySelector('#rptResetBtn');
  if (reset) reset.addEventListener('click', () => {
    ['rptYear', 'rptQuarter', 'rptMonth', 'rptSource'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    fqReportRender();
  });
  const audit = scope.querySelector('#rptAuditBtn');
  if (audit) audit.addEventListener('click', fqRunAudit);
  const auditNow = scope.querySelector('#rptAuditNowBtn');
  if (auditNow) auditNow.addEventListener('click', fqRunDailyAudit);
}

// ═══════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════
function fqLoadFaq() {
  // 오프라인 캐시(동적 항목)만 로드 → 시드와 병합 (공용 DB는 fqSyncFaqRemote가 갱신)
  let dyn = [];
  try { const c = localStorage.getItem(FQ_CONFIG.FAQ_CACHE_KEY); if (c) dyn = JSON.parse(c) || []; } catch (e) {}
  fqMergeFaq(dyn);
}

function fqSaveFaq() {
  // 동적 항목만 로컬 캐시에 저장 (시드는 코드에 유지)
  try { localStorage.setItem(FQ_CONFIG.FAQ_CACHE_KEY, JSON.stringify(fqDynItems())); }
  catch (e) { console.error('FAQ cache 실패:', e); }
}

function fqBindFaq(scope) {
  const fqSearchEl = scope.querySelector('#fqSearch');
  fqSearchEl.addEventListener('input', fqRenderFaq);
  // 검색창 예시 placeholder 회전 (입력/포커스 중이 아닐 때만) — 무엇을 검색할지 안내
  if (fqSearchEl && !fqSearchEl._phRotating) {
    fqSearchEl._phRotating = true;
    const fqPhExamples = [
      '🔍 키워드를 입력하면 관련 FAQ가 아래에 표시됩니다',
      '🔍 예: 리튬배터리 100Wh 초과',
      '🔍 예: 숯 UN1361 선적 가능?',
      '🔍 예: 과탄산나트륨 금지',
      '🔍 예: UN1950 에어로졸 격리',
      '🔍 예: MSDS 14번 운송정보',
      '🔍 예: 플렉시탱크 / 부식성 / 해양오염'
    ];
    let fqPhIdx = 0;
    fqSearchEl.placeholder = fqPhExamples[0];
    setInterval(() => {
      if (document.activeElement === fqSearchEl || fqSearchEl.value) return;
      fqPhIdx = (fqPhIdx + 1) % fqPhExamples.length;
      fqSearchEl.placeholder = fqPhExamples[fqPhIdx];
    }, 2800);
  }
  scope.querySelector('#fqExpandAll').addEventListener('click', () => {
    scope.querySelectorAll('.fq-item').forEach(i => i.classList.add('open'));
  });
  scope.querySelector('#fqCollapseAll').addEventListener('click', () => {
    scope.querySelectorAll('.fq-item').forEach(i => i.classList.remove('open'));
  });
  // (FAQ 관리자 모드 폐지 — 🔐관리자 버튼/JSON 편집기 제거됨)
  // AI에게 문의
  const aiBtn = scope.querySelector('#fqAiBtn');
  if (aiBtn) aiBtn.addEventListener('click', () => {
    const box = document.getElementById('fqAiBox');
    if (box) { box.hidden = !box.hidden; if (!box.hidden) document.getElementById('fqAiInput').focus(); }
  });
  const aiAsk = scope.querySelector('#fqAiAskBtn');
  if (aiAsk) aiAsk.addEventListener('click', fqAskAi);
  const aiInput = scope.querySelector('#fqAiInput');
  if (aiInput) aiInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fqAskAi(); } });
  // AI 문의 첨부파일 — 드래그앤드롭 + 클릭 선택
  const aiDrop = scope.querySelector('#fqAiDrop');
  const aiFile = scope.querySelector('#fqAiFile');
  if (aiDrop && aiFile) {
    ['dragenter', 'dragover'].forEach(ev => aiDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); aiDrop.classList.add('drag'); }));
    ['dragleave', 'dragend'].forEach(ev => aiDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); aiDrop.classList.remove('drag'); }));
    aiDrop.addEventListener('drop', e => {
      e.preventDefault(); e.stopPropagation(); aiDrop.classList.remove('drag');
      const fs = e.dataTransfer && e.dataTransfer.files;
      if (fs && fs.length) fqAiAddFiles(fs);
    });
    aiDrop.addEventListener('click', () => aiFile.click());
    aiFile.addEventListener('change', () => { if (aiFile.files && aiFile.files.length) fqAiAddFiles(aiFile.files); aiFile.value = ''; });
  }
  // 이메일 업로드 → FAQ
  const emBtn = scope.querySelector('#fqEmailUploadBtn');
  if (emBtn) emBtn.addEventListener('click', fqToggleEmailForm);
  const emToggle = scope.querySelector('#fqEmFormToggle');
  if (emToggle) emToggle.addEventListener('click', fqToggleEmFormFields);
  const emCancel = scope.querySelector('#fqEmCancelBtn');
  if (emCancel) emCancel.addEventListener('click', () => {
    document.getElementById('fqEmailForm').hidden = true;
    // 수정 중이었다면 편집 모드·버튼 라벨 원복
    if (fqEditingId) { fqEditingId = null; fqResetEmSubmitBtn(); fqRenderEmailList(); }
  });
  const emSubmit = scope.querySelector('#fqEmSubmitBtn');
  if (emSubmit) emSubmit.addEventListener('click', fqSubmitEmail);
  const emFile = scope.querySelector('#fqEmFile');
  if (emFile) emFile.addEventListener('change', fqReadEmailFile);
  // 드래그앤드롭 등록
  const emDrop = scope.querySelector('#fqEmDrop');
  if (emDrop) {
    ['dragenter', 'dragover'].forEach(ev => emDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); emDrop.classList.add('drag'); }));
    ['dragleave', 'dragend'].forEach(ev => emDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); emDrop.classList.remove('drag'); }));
    emDrop.addEventListener('drop', e => {
      e.preventDefault(); e.stopPropagation(); emDrop.classList.remove('drag');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) fqProcessEmailFile(f);
    });
    emDrop.addEventListener('click', () => { const fi = document.getElementById('fqEmFile'); if (fi) fi.click(); });
  }
  const emDraft = scope.querySelector('#fqEmDraftBtn');
  if (emDraft) emDraft.addEventListener('click', fqDraftReply);
  const emSend = scope.querySelector('#fqEmSendBtn');
  if (emSend) emSend.addEventListener('click', fqSendReplyForm);
}

// ── AI에게 문의 (FAQ·문의답변 DB 기반 LLM 답변) ──
// UN번호 추출 — UN / UNNO / UN NO / U.N. 등 다양한 표기 + 구분자(공백·-·.·#·:) 허용.
// 격리·DG조회의 결정론적 판정이 표기 형식 때문에 누락되지 않도록 공통 사용.
function fqExtractUnnos(text) {
  const re = /U\s*\.?\s*N\s*\.?\s*(?:N\s*\.?\s*O|NO|No)?\s*\.?\s*[-#:]?\s*(\d{4})/gi;
  const out = []; let m;
  while ((m = re.exec(String(text || ''))) !== null) out.push(m[1]);
  return [...new Set(out)];
}

// 혼적 질문에서 화물 엔티티 추출 — UN/UNNO/맨 4자리(연도·단위 제외) → UN번호,
// "2.1"·"Class 3"·"3류" 등 → CLASS. UN 바로 뒤(접속사 없이)에 붙은 클래스는 그 UN의 분류로 보정.
// 반환: { rows:[{unno|null, class|null}], lookup:[UN번호…(조회 대상)] }
function fqParseSegCargos(text) {
  const t = String(text || '');
  const VALID = new Set(['1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9']);
  const uns = []; const numSeen = new Set(); let m;
  const consumed = []; const slashRows = [];
  const inSpan = idx => consumed.some(s => idx >= s.start && idx < s.end);
  // 0) CLASS/UNNO 슬래시 쌍 우선 (예: 2.1/1950, 8/1760, 1950/2.1) — 가장 명확한 표기
  const isCls = x => /^[1-9](?:\.[1-6])?$/.test(x) && VALID.has(x);
  const isUn = x => /^\d{4}$/.test(x);
  const pairRe = /(\d{1,4}(?:\.\d)?)\s*\/\s*(\d{1,4}(?:\.\d)?)/g;
  while ((m = pairRe.exec(t)) !== null) {
    const a = m[1], b = m[2]; let cls = null, un = null;
    if (isCls(a) && isUn(b)) { cls = a; un = b; }
    else if (isUn(a) && isCls(b)) { un = a; cls = b; }
    else continue;
    slashRows.push({ unno: un, class: cls }); numSeen.add(un);
    consumed.push({ start: m.index, end: pairRe.lastIndex });
  }
  // UN/UNNO 접두 (항상)
  const unRe = /U\s*\.?\s*N\s*\.?\s*(?:N\s*\.?\s*O|NO|No)?\s*\.?\s*[-#:]?\s*(\d{4})/gi;
  while ((m = unRe.exec(t)) !== null) { if (inSpan(m.index)) continue; uns.push({ unno: m[1], idx: m.index, end: unRe.lastIndex }); numSeen.add(m[1]); }
  // 맨 4자리 숫자 (연도·단위 뒤따르면 제외, UN 범위 0001~3600)
  const bareRe = /(\d{4})(?!\s*(?:년|월|일|원|개|대|톤|박스|호|%|kg|t\b))/gi;
  while ((m = bareRe.exec(t)) !== null) {
    const n = m[1];
    if (numSeen.has(n) || inSpan(m.index)) continue;
    if (uns.some(u => m.index >= u.idx && m.index < u.end)) continue;
    if (+n >= 1 && +n <= 3600) { uns.push({ unno: n, idx: m.index, end: bareRe.lastIndex }); numSeen.add(n); }
  }
  // 클래스 토큰: "class/클래스 N", "N류/급", 또는 소수형 클래스(2.1 등)
  const cls = [];
  const cRe = /(?:class|클래스|클라스|등급)\s*[:#-]?\s*([1-9](?:\.[1-6])?)|([1-9](?:\.[1-6])?)\s*(?:류|급)|(1\.[1-6]|2\.[1-3]|4\.[1-3]|5\.[1-2]|6\.[1-2])/gi;
  while ((m = cRe.exec(t)) !== null) { if (inSpan(m.index)) continue; cls.push({ cls: (m[1] || m[2] || m[3]), idx: m.index }); }
  // UN 바로 뒤(≤10자, 접속사 없음)에 붙은 클래스는 그 UN의 분류로 보정
  const usedC = new Set();
  for (const u of uns) {
    for (let i = 0; i < cls.length; i++) {
      if (usedC.has(i)) continue;
      const c = cls[i];
      if (c.idx < u.end) continue;
      const gap = t.substring(u.end, c.idx);
      if (gap.length > 10) continue;
      if (/[과와및\+\/,&·]|그리고|and/i.test(gap)) continue;   // 분리 접속 → 별개 화물
      u.cls = c.cls; usedC.add(i); break;
    }
  }
  const rows = []; const seen = new Set();
  slashRows.forEach(r => { if (seen.has('U' + r.unno)) return; seen.add('U' + r.unno); rows.push({ unno: r.unno, class: (r.class && VALID.has(r.class)) ? r.class : null }); });
  uns.sort((a, b) => a.idx - b.idx).forEach(u => { if (seen.has('U' + u.unno)) return; seen.add('U' + u.unno); rows.push({ unno: u.unno, class: (u.cls && VALID.has(u.cls)) ? u.cls : null }); });
  cls.forEach((c, i) => { if (usedC.has(i) || !VALID.has(c.cls) || seen.has('C' + c.cls)) return; seen.add('C' + c.cls); rows.push({ unno: null, class: c.cls }); });
  const lookup = [...new Set(rows.filter(r => r.unno).map(r => r.unno))];
  return { rows, lookup };
}

// SKR/HAL(자사) 선적 금지·제한 리스트만 조회 — AI 문의/회신 초안의 '선적 가부' 근거로 사용.
//   (사용자 요청: 자사 SKR/HAS 규정만 참고, 타 선사 정보는 제공하지 않음)
async function fqFetchSkrRules(unnos) {
  const list = [...new Set((unnos || []).map(u => String(u)).filter(u => /^\d{3,4}$/.test(u)))].slice(0, 5);
  const out = [];
  for (const u of list) {
    try {
      const r = await fetch(`/api/carrier-check?unno=${encodeURIComponent(u)}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) continue;
      const skr = (j.results || []).find(x => x.carrier_group === 'SKR_HAL');
      if (!skr) continue;
      out.push({
        unno: u,
        name: (j.dg && (j.dg.Name || j.dg.name)) || '',
        status: skr.status || '',
        status_label: skr.status_label || '',
        rules: (skr.matched_rules || []).map(rule => ({
          class_no: rule.class_no || '', unno: rule.unno || '', status: rule.status || '',
          remark: rule.remark || rule.condition || '', document_required: rule.document_required || ''
        }))
      });
    } catch (_) { /* 조회 실패 시 무시하고 진행 */ }
  }
  return out;
}

let fqLastAiInquiry = null;   // 직전 AI 문의/답변 (저장 버튼에서 사용)

// ── AI 문의 첨부파일 ── 이미지/PDF/텍스트를 base64로 보관해 질문과 함께 faq-ai로 전송(Gemini가 직접 판독)
let fqAiAttachments = [];                        // [{ name, mime, data(base64), size, thumb }]
const FQ_AI_ATT_MAX = 4;                         // 첨부 개수 상한
const FQ_AI_ATT_TOTAL = 3.4 * 1024 * 1024;       // base64 합계 상한(요청 본문 4.5MB 한도 보호)
function fqAiAttTotalBytes() { return fqAiAttachments.reduce((s, a) => s + (a.data ? a.data.length : 0), 0); }
// File → base64(접두어 제거)
function fqFileToBase64Raw(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read fail'));
    reader.onload = () => { const r = reader.result || ''; resolve(r.includes(',') ? r.split(',')[1] : r); };
    reader.readAsDataURL(file);
  });
}
function fqFmtSize(n) { return n < 1024 ? n + 'B' : (n < 1048576 ? (n / 1024).toFixed(0) + 'KB' : (n / 1048576).toFixed(1) + 'MB'); }
// 드롭/선택한 파일들을 검증·인코딩해 첨부 목록에 추가
async function fqAiAddFiles(fileList) {
  const files = Array.from(fileList || []);
  for (const f of files) {
    if (fqAiAttachments.length >= FQ_AI_ATT_MAX) { fqToast('첨부는 최대 ' + FQ_AI_ATT_MAX + '개까지 가능합니다', 'warn'); break; }
    const isImg = /^image\//.test(f.type);
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    const isTxt = /^text\//.test(f.type) || /\.(txt|csv|md)$/i.test(f.name);
    if (!isImg && !isPdf && !isTxt) { fqToast('이미지·PDF·텍스트(.txt) 파일만 첨부할 수 있습니다. 그 외 문서(엑셀·워드 등)는 PDF로 변환해 첨부해 주세요.', 'warn'); continue; }
    if (f.size > 8 * 1024 * 1024) { fqToast('"' + f.name + '"이(가) 너무 큽니다(8MB 초과)', 'warn'); continue; }
    try {
      let mime, data, thumb = '';
      if (isImg) {
        const durl = await fireCargoCompress(f);   // 1280px/JPEG 압축(기존 헬퍼 재사용) → 용량 절감
        mime = 'image/jpeg'; data = durl.split(',')[1]; thumb = durl;
      } else {
        data = await fqFileToBase64Raw(f);
        mime = isPdf ? 'application/pdf' : 'text/plain';
      }
      if (fqAiAttTotalBytes() + data.length > FQ_AI_ATT_TOTAL) { fqToast('첨부 용량 합계가 너무 큽니다. 파일을 줄이거나 일부를 제거해 주세요.', 'warn'); break; }
      fqAiAttachments.push({ name: f.name, mime, data, size: f.size, thumb });
    } catch (e) { fqToast('"' + f.name + '" 읽기에 실패했습니다', 'warn'); }
  }
  fqAiRenderAtts();
}
// 첨부 칩 목록 렌더
function fqAiRenderAtts() {
  const box = document.getElementById('fqAiAttachList');
  if (!box) return;
  box.innerHTML = fqAiAttachments.map((a, i) => {
    const ic = a.thumb ? '<img class="fq-ai-att-thumb" src="' + a.thumb + '" alt="">' : (a.mime === 'application/pdf' ? '<span class="fq-ai-att-ic">📄</span>' : '<span class="fq-ai-att-ic">📃</span>');
    return '<span class="fq-ai-att">' + ic +
      '<span class="fq-ai-att-name" title="' + fqEsc(a.name) + '">' + fqEsc(a.name) + '</span>' +
      '<span class="fq-ai-att-size">' + fqFmtSize(a.size) + '</span>' +
      '<button class="fq-ai-att-x" onclick="fqAiRemoveAtt(' + i + ')" title="첨부 제거">×</button></span>';
  }).join('');
}
function fqAiRemoveAtt(i) { fqAiAttachments.splice(i, 1); fqAiRenderAtts(); }

async function fqAskAi() {
  const inputEl = document.getElementById('fqAiInput');
  const ansEl = document.getElementById('fqAiAnswer');
  const q = (inputEl.value || '').trim();
  if (!q) { fqToast('질문을 입력하세요', 'warn'); return; }
  // 회원 1인당 하루 AI 문의 횟수 제한 (토큰 절약)
  const _aiUser = (typeof dgCurrentUser !== 'undefined' && dgCurrentUser) ? dgCurrentUser : null;
  if (_aiUser && _aiUser.id && !dgAiCanUse(_aiUser.id)) {
    const _lim = dgAiLimitForCurrent();
    ansEl.innerHTML = '<div class="fq-ai-error">오늘 AI 문의 한도(' + _lim + '회)를 모두 사용하셨습니다.<br>토큰 절약을 위해 하루 ' + _lim + '회로 제한됩니다. 내일 다시 이용해 주세요.</div>';
    fqToast('오늘 AI 문의 한도(' + _lim + '회)를 모두 사용했습니다', 'warn');
    return;
  }
  ansEl.innerHTML = '<div class="fq-ai-loading"><span class="fq-spin" aria-hidden="true"></span>🤖 ' +
    (fqAiAttachments.length ? '첨부파일과 사내 FAQ·문의답변을 함께 분석해' : '사내 FAQ·문의답변을 정리해') +
    ' 답변을 만들고 있습니다…</div>';
  // 질문과 관련도 높은 자료 우선 선별 (키워드 겹침)
  const items = FQ_FAQ_DATA.items || [];
  const qWords = q.toLowerCase().split(/[\s,./]+/).filter(w => w.length > 1);
  const scored = items.map(it => {
    const hay = (it.q + ' ' + (it.a || '') + ' ' + ((it.tags || []).join(' '))).toLowerCase();
    let s = 0; qWords.forEach(w => { if (hay.includes(w)) s++; });
    return { it, s };
  }).sort((a, b) => b.s - a.s);
  // 관련 자료 우선 + 최소 분량 보장
  const top = scored.slice(0, 24).map(x => ({ q: x.it.q, a: (x.it.a || '').slice(0, 1500), cat: x.it.cat }));
  try {
    // 질문에 UN번호가 2개 이상이면 IMDG 7.2.4 격리표로 결정론적 판정 → 화면에 권위 결과로 직접 표시 + AI에 근거로 전달
    let segInfo = null, segChk = null, dgData = [];
    const isSegQ = /혼적|격리|segregat|함께[^\n]{0,8}(적재|컨테이너|선적)|같은[^\n]{0,4}컨테이너|같이[^\n]{0,6}(싣|선적|적재)|co-?load|stow(ed)?\s+together|same\s+container|load(ed)?\s+together|together\s+in/i.test(q);
    const baseUn = fqExtractUnnos(q);
    const parsed = isSegQ ? fqParseSegCargos(q) : { rows: baseUn.map(u => ({ unno: u, class: null })), lookup: baseUn };
    let unnos = parsed.lookup;
    if (unnos.length) {
      try {
        const dr = await fetch('/api/dg-search', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unnos })
        });
        const dj = await dr.json().catch(() => ({}));
        if (dr.ok && dj.ok && Array.isArray(dj.data)) dgData = dj.data;
      } catch (_) { /* 조회 실패 시 일반 답변으로 진행 */ }
    }
    // SKR/HAL(자사) 선적 금지·제한 리스트 조회 — 선적 가부 근거 (타 선사 제외)
    let skrCarrier = [];
    if (unnos.length) { try { skrCarrier = await fqFetchSkrRules(unnos); } catch (_) {} }
    {
      const dgMap = {};
      dgData.forEach(r => { const u = String(r.UNNO || r.unno || ''); if (u && !dgMap[u]) dgMap[u] = r; });   // UN 중복행 1건만
      const finalRows = []; const seenKey = new Set();
      for (const row of parsed.rows) {
        if (row.unno) {
          if (seenKey.has('U' + row.unno)) continue; seenKey.add('U' + row.unno);
          const d = dgMap[row.unno] || {};
          finalRows.push({ unno: row.unno, class: row.class || d.Class || d.class || null, sub: d.SUB || d.sub, name: d.Name || d.name || ('UN' + row.unno) });
        } else if (row.class) {
          if (seenKey.has('C' + row.class)) continue; seenKey.add('C' + row.class);
          finalRows.push({ unno: null, class: row.class, sub: null, name: 'Class ' + row.class });   // 클래스 직접 입력 화물
        }
      }
      if (isSegQ && finalRows.length >= 2) {
        segChk = fqSegregationCheck(finalRows);
        segInfo = { verdict: segChk.verdict, allow: segChk.allow, worst: segChk.worst, detail: segChk.detail, anyAmbiguous: segChk.anyAmbiguous, cargos: segChk.cargos };
        // ── SKR/HAL RFDG 혼적 금지 규칙 (IMDG 일반 격리표보다 우선) ──
        //   UN3480·3481(리튬이온)을 위험물(DG)로 선적하면 RFDG(Reefer) 필수이고,
        //   RFDG 화물은 '같은 UNNO가 아닌 다른 화물과 같은 컨테이너 혼적 불가'(단 3480·3481끼리는 허가).
        //   → 다른 UNNO 화물과 함께 묻는 혼적이면 IMDG 표가 '가능'이라도 자사 규정상 혼적 불가.
        const isRfdgUn = u => /^0*(3480|3481)$/.test(String(u || ''));
        const rfdgRows = finalRows.filter(r => isRfdgUn(r.unno));
        const otherRows = finalRows.filter(r => !isRfdgUn(r.unno));
        if (rfdgRows.length && otherRows.length) {
          segInfo.rfdgConflict = true;
          segInfo.rfdgUns = rfdgRows.map(r => 'UN' + String(r.unno).replace(/^0+/, ''));
          segInfo.dryCargos = otherRows.map(r => r.unno ? ('UN' + String(r.unno).replace(/^0+/, '')) : ('Class ' + r.class));
        }
      } else if (isSegQ) {
        // 혼적 질문인데 화물 2개를 인식하지 못함 → 결정론적 입력 안내(AI 추정 대신)
        segInfo = { guide: true };
      }
    }
    const res = await fetch('/api/faq-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, context: top, dgData, unnos, segInfo, skrCarrier,
        attachments: fqAiAttachments.map(a => ({ name: a.name, mime: a.mime, data: a.data })) })
    });
    let j = {}; try { j = await res.json(); } catch (e) {}
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    fqLastAiInquiry = { q: q, a: (j.answer || '').trim() };   // 저장 버튼용 캡처
    if (_aiUser && _aiUser.id) dgAiIncUsage(_aiUser.id);   // AI 문의 1회 사용 기록(횟수 차감)
    ansEl.innerHTML =
      ((segInfo && segInfo.rfdgConflict) ? fqRfdgConflictHtml(segInfo) : '') +
      (segChk ? fqSegPanelHtml(segChk) : (segInfo && segInfo.guide ? fqSegGuideHtml() : '')) +
      '<div class="fq-ai-result">' + fqRenderText(j.answer || '(빈 응답)') + '</div>' +
      '<div class="fq-ai-disclaimer">⚠️ AI 보조 답변입니다. 혼적·격리 코드는 위 [IMDG 격리표 판정]이 기준이며, 최종 판단은 IMDG Code·선사/터미널/국가 규정과 담당자 확인이 필요합니다.</div>' +
      '<div class="fq-ai-actions"><button class="fq-btn primary" id="fqAiSaveBtn" onclick="fqSaveAiInquiry()">✅ 답변확인! 새로운 문의하기</button>' +
      '<span class="fq-ai-save-hint">클릭하면 이 문의·답변이 DB에 저장되어 ① 다음 문의 답변에 활용 ② 관리자 리포트 통계·답변검토에 반영됩니다.</span></div>';
  } catch (e) {
    ansEl.innerHTML = '<div class="fq-ai-error">답변 생성 실패: ' + fqEsc(e.message) + '<br>잠시 후 다시 시도해 주세요.</div>';
  }
}
// '답변확인! 새로운 문의하기' → AI 문의/답변을 DB에 저장(다음 문의 활용 + 리포트 통계·검토 반영) 후 입력창 초기화
async function fqSaveAiInquiry() {
  if (!fqLastAiInquiry || !fqLastAiInquiry.q) { fqToast('저장할 문의가 없습니다', 'warn'); return; }
  const { q, a } = fqLastAiInquiry;
  const btn = document.getElementById('fqAiSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = '저장 중…'; }
  const cat = (typeof fqClassifyKeyword === 'function') ? fqClassifyKeyword(q + '\n' + a) : '🔎 자동 분류 (내용 기반 추천)';
  const item = {
    id: 'faq_ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    cat: cat, q: q, a: a, tags: ['AI문의'], source: 'ai',
    inquiry: q, ts: Date.now()
  };
  let saved = false;
  try { saved = await fqUpsertFaqItem(item); }   // 로컬 반영 + 공용 DB 저장 (유사문의면 false)
  catch (e) { fqToast('저장 실패: ' + e.message, 'warn'); if (btn) { btn.disabled = false; btn.textContent = '✅ 답변확인! 새로운 문의하기'; } return; }
  fqToast(saved ? '✓ 문의·답변이 저장되었습니다. 새 문의를 입력하세요.' : '유사 문의가 이미 있어 저장은 생략했습니다. 새 문의를 입력하세요.', saved ? 'success' : 'warn');
  fqLastAiInquiry = null;
  const inp = document.getElementById('fqAiInput'); if (inp) { inp.value = ''; inp.focus(); }
  const ans = document.getElementById('fqAiAnswer'); if (ans) ans.innerHTML = '';
  fqAiAttachments = []; fqAiRenderAtts();   // 첨부도 초기화
  if (typeof fqReportRender === 'function') fqReportRender();   // 통계 즉시 반영
}

// SKR/HAL RFDG 혼적 금지 — 자사 규정 권위 패널 (IMDG 일반 격리표보다 우선). 리튬배터리(3480/3481) DG 혼적 시.
function fqRfdgConflictHtml(seg) {
  const rfdg = (seg.rfdgUns || []).map(fqEsc).join(' · ') || 'UN3480/3481';
  const dry = (seg.dryCargos || []).map(fqEsc).join(', ') || '나머지 DRY DG 화물';
  return '<div class="fq-seg-panel fq-rfdg-panel" style="border-left:4px solid #b02020">' +
    '<div class="fq-seg-head" style="color:#b02020">🚫 SKR/HAL 규정 — 혼적 불가 (RFDG 분리 선적)</div>' +
    '<div style="font-size:13px;line-height:1.6;margin-top:6px">' +
'<b>SKR/HAL 사내 규정</b>에 따라, ' +
    '<b>' + rfdg + '</b>(리튬이온 배터리)은(는) 위험물(DG)로 선적 시 <b>RFDG(Reefer) 컨테이너 필수</b>이며, ' +
    'RFDG 화물은 <b>다른 위험물(DG)과 같은 컨테이너 혼적이 금지</b>됩니다(단 UN3480·UN3481끼리는 허가).' +
    '<ul style="margin:6px 0 0 18px;padding:0">' +
    '<li><b>' + rfdg + '</b> → 다른 위험물과는 분리(<b>별도 RFDG 컨테이너 단독</b>), <b>비위험물(일반화물)과는 혼적 가능</b></li>' +
    '<li><b>' + dry + '</b> → 그들끼리 <b>별도 DRY DG 컨테이너</b>에 혼적 (IMDG 격리표 기준, 아래 참고)</li>' +
    '</ul>' +
    '<div style="font-size:12px;color:#888;margin-top:6px">※ 이 RFDG 혼적 금지는 IMDG 국제규정이 아닌 <b>SKR/HAL 사내 규정</b>이며, <b>금지 기준은 위험물 화물 간에만</b> 적용됩니다(위험물 1개 + 비위험물 일반화물은 혼적 가능). 위 화물이 모두 위험물인 경우, IMDG 격리표상 같은 컨테이너 적재(X)가 가능해도 사내 규정이 우선하여 <b>혼적 불가</b>입니다. ' +
    '(예외: 해당 리튬배터리가 SP188로 비위험물(NON-DG)로 분류되는 경우 DRY 혼적 가능)</div>' +
    '</div></div>';
}

// IMDG 격리표 결정론적 판정 결과를 화면에 권위 패널로 렌더 (AI 답변과 독립). 세부분류 미상이면 분류별 안내.
function fqSegPanelHtml(seg) {
  const color = seg.worst >= 3 ? '#b02020' : ((seg.anyAmbiguous || seg.allow === 'check') ? '#b8860b' : (seg.worst >= 1 ? '#b8860b' : '#1a7f37'));
  const cargoLine = (seg.cargos && seg.cargos.length) ? '<div style="font-size:12px;color:#666;margin-top:4px">대상: ' + seg.cargos.map(fqEsc).join(' / ') + '</div>' : '';
  const lab = x => x.unno ? ('UN' + x.unno) : ('Class ' + (x.cls || '?'));
  const rows = (seg.pairs || []).map(p => {
    const head = fqEsc(lab(p.A)) + ' ↔ ' + fqEsc(lab(p.B));
    if (p.unknown) return '<li><b>' + head + '</b> : 클래스 미상 — 수동 확인 필요</li>';
    if (p.ambiguous) {
      const gl = p.groups.map(g => fqEsc(g.keys.join('·')) + '이면 <b>' + fqEsc(g.label) + '</b>').join(' · ');
      return '<li><b>' + head + '</b> : 세부분류에 따라 상이 — ' + gl + '</li>';
    }
    return '<li><b>' + head + '</b> : ' + fqEsc(p.groups.map(g => g.label).join(', ')) + '</li>';
  }).join('');
  return '<div class="fq-seg-panel" style="border:1px solid var(--border,#ddd);border-left:4px solid ' + color + ';border-radius:8px;padding:12px 14px;margin-bottom:12px;background:rgba(0,0,0,0.02)">'
    + '<div style="font-size:12px;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:6px">IMDG 7.2.4 격리표 판정 · 시스템 결정론적 계산(권위 기준)</div>'
    + '<div style="font-weight:700;color:' + color + ';font-size:14px">' + fqEsc(seg.verdict) + '</div>'
    + cargoLine
    + (rows ? '<ul style="font-size:12.5px;color:#444;margin:8px 0 0 16px;padding:0;line-height:1.6">' + rows + '</ul>' : '')
    + '</div>';
}

// 혼적 화물 2개를 인식하지 못했을 때의 결정론적 입력 안내 (AI 추정 대신)
function fqSegGuideHtml() {
  return '<div class="fq-seg-panel" style="border:1px solid var(--border,#ddd);border-left:4px solid #b8860b;border-radius:8px;padding:12px 14px;margin-bottom:12px;background:rgba(0,0,0,0.02)">'
    + '<div style="font-size:12px;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:6px">혼적 격리 — 입력 안내</div>'
    + '<div style="font-weight:700;color:#b8860b;font-size:14px">화물 2개 이상을 인식하지 못해 자동 격리판정을 하지 못했습니다.</div>'
    + '<div style="font-size:12.5px;color:#444;margin-top:8px;line-height:1.7">아래 중 한 방법으로 <b>다시 입력</b>해 주세요:'
    + '<ul style="margin:6px 0 0 16px;padding:0">'
    + '<li>UN번호: <b>UN1950, UN1993</b> (또는 1950 1993)</li>'
    + '<li>클래스: <b>Class 2.1, Class 3</b></li>'
    + '<li>표기가 헷갈리면 <b>CLASS/UNNO</b> 형식으로: <b>2.1/1950, 8/1760, 3/1993</b></li>'
    + '</ul></div>'
    + '<div style="font-size:12.5px;color:#444;margin-top:8px">또는 좌측 사이드바의 <b>[격리규정 확인]</b> 메뉴에서 UN번호를 입력하면 표 기준으로 정확히 조회됩니다.</div>'
    + '</div>';
}

// ── IMDG 일반 격리표 (7.2.4) — 클래스×클래스 격리코드 결정론적 조회 ──
// 코드: 0=요건없음, 1=Away from, 2=Separated from, 3=완전구획 격리, 4=종방향 구획격리, X=개별품목 확인, *=class1 특수
const IMDG_SEG_ORDER = ['1', '1.6', '2.1', '2.2', '2.3', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9'];
const IMDG_SEG_TABLE = {
  '1':   ['*','*',4,2,2,4,4,4,4,4,4,2,4,2,4,'X'],
  '1.6': ['*','*',4,2,2,4,4,4,4,4,4,2,4,2,4,'X'],
  '2.1': [4,4,0,0,0,2,1,2,2,2,2,0,4,2,1,0],
  '2.2': [2,2,0,0,0,1,0,2,1,0,2,0,2,1,0,0],
  '2.3': [2,2,0,0,0,2,0,2,2,0,2,0,2,1,0,0],
  '3':   [4,4,2,1,2,0,0,2,2,2,2,0,3,2,0,0],
  '4.1': [4,4,1,0,0,0,0,1,0,1,2,0,3,2,1,0],
  '4.2': [4,4,2,2,2,2,1,0,1,2,2,1,3,2,1,0],
  '4.3': [4,4,2,1,2,2,0,1,0,2,2,0,2,2,1,0],
  '5.1': [4,4,2,0,0,2,1,2,2,0,2,0,3,1,2,0],
  '5.2': [4,4,2,2,2,2,2,2,2,2,0,1,3,2,2,0],
  '6.1': [2,2,0,0,0,0,0,1,0,0,1,0,1,0,0,0],
  '6.2': [4,4,4,2,2,3,3,3,2,3,3,1,0,3,3,0],
  '7':   [2,2,2,1,1,2,2,2,2,1,2,0,3,0,2,0],
  '8':   [4,4,1,0,0,0,1,1,1,2,2,0,3,2,0,0],
  '9':   ['X','X',0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};
function fqNormClass(c) {
  c = String(c || '').trim();
  if (/^1\.[1-5]/.test(c)) return '1';
  if (/^1\.6/.test(c)) return '1.6';
  const m = c.match(/^(2\.1|2\.2|2\.3|4\.1|4\.2|4\.3|5\.1|5\.2|6\.1|6\.2|[3789])/);
  if (m) return m[1];
  return null;
}
function fqSegCode(a, b) {
  const ai = IMDG_SEG_ORDER.indexOf(a), bi = IMDG_SEG_ORDER.indexOf(b);
  if (ai < 0 || bi < 0) return null;
  return IMDG_SEG_TABLE[a][bi];
}
// 세부분류 없는 메인 클래스 → 격리표 하위 키 (AI 회신/문의 경로용)
const FQ_MAIN_SUB = { '2': ['2.1', '2.2', '2.3'], '4': ['4.1', '4.2', '4.3'], '5': ['5.1', '5.2'], '6': ['6.1', '6.2'] };
function fqExpandClass(raw) {
  const n = fqNormClass(raw);
  if (n) return [n];
  const s = String(raw || '').trim();
  if (FQ_MAIN_SUB[s]) return FQ_MAIN_SUB[s];
  if (/^1(\.|$)/.test(s)) return ['1'];
  return [];
}
// 두 화물 간 격리코드 + 혼적 판정. 세부분류가 명확하면 표대로, 미상이면 분류별로 나눠 안내.
// rows: [{class, sub, unno, name}]
function fqSegregationCheck(rows) {
  const norm = rows.map(r => {
    const set = new Set();
    fqExpandClass(r.class).forEach(c => set.add(c));
    fqExpandClass(r.sub).forEach(c => set.add(c));
    return { unno: r.unno, name: r.name, cls: r.class, sub: r.sub, tokens: [...set], label: r.unno ? ('UN' + r.unno) : ('Class ' + (r.class || '?')) };
  });
  const codeNames = { 0: 'X(격리 없음)', 1: '1 Away from(이격)', 2: '2 Separated from(격리)', 3: '3 완전구획 격리', 4: '4 종방향 구획 격리' };
  const pairs = [];
  let worst = 0, hasStar = false, anyAmbiguous = false, anyUnknown = false;
  for (let i = 0; i < norm.length; i++) for (let j = i + 1; j < norm.length; j++) {
    const A = norm[i], B = norm[j];
    if (!A.tokens.length || !B.tokens.length) { anyUnknown = true; pairs.push({ A, B, unknown: true }); continue; }
    const byCode = new Map();
    for (const ca of A.tokens) for (const cb of B.tokens) {
      const code = fqSegCode(ca, cb);
      if (code === '*') { hasStar = true; continue; }
      if (code === undefined || code === null) continue;
      let label;
      if (A.tokens.length > 1 && B.tokens.length > 1) label = `${ca}↔${cb}`;
      else if (A.tokens.length > 1) label = ca;
      else if (B.tokens.length > 1) label = cb;
      else label = `${ca}↔${cb}`;
      if (!byCode.has(code)) byCode.set(code, new Set());
      byCode.get(code).add(label);
      if (typeof code === 'number') worst = Math.max(worst, code);
    }
    const ambiguous = byCode.size > 1;
    if (ambiguous) anyAmbiguous = true;
    const groups = [...byCode.entries()].map(([code, set]) => ({ code, keys: [...set], label: codeNames[code] || (code === 'X' ? 'X(격리 없음)' : String(code)) }));
    pairs.push({ A, B, ambiguous, groups });
  }
  let verdict, allow;
  if (hasStar) { verdict = 'Class 1(화약류) 포함 — 개별 규정 확인 필요'; allow = 'check'; }
  else if (anyUnknown) { verdict = '클래스 분류 미상 — 격리표 확인 불가, 수동 확인 필요'; allow = 'check'; }
  else if (anyAmbiguous) { verdict = '세부분류(2.1/2.2 등)에 따라 격리코드 상이 — 분류별 안내 참고'; allow = 'check'; }
  else if (worst === 0) { verdict = '혼적 가능 (격리표상 격리요건 없음)'; allow = 'yes'; }
  else if (worst === 1) { verdict = '조건부 — 같은 컨테이너 적재 시 이격(Away from) 필요'; allow = 'cond'; }
  else { verdict = `격리 필요(${codeNames[worst]})`; allow = 'no'; }
  const detail = pairs.map(p => {
    if (p.unknown) return `${p.A.label} ↔ ${p.B.label}: 클래스 미상 — 확인 필요`;
    if (p.ambiguous) return `${p.A.label} ↔ ${p.B.label}: 세부분류별 — ` + p.groups.map(g => `${g.keys.join('·')}이면 ${g.label}`).join(' / ');
    return `${p.A.label} ↔ ${p.B.label}: ${p.groups.map(g => g.label).join(', ')}`;
  });
  return {
    worst, hasStar, anyAmbiguous, anyUnknown, verdict, allow, pairs, detail,
    cargos: norm.map(r => r.unno
      ? `UN${r.unno} ${r.name || ''} (Class ${r.cls}${r.sub && !/^[-–?\s]*$/.test(String(r.sub)) ? ', 부위험성 ' + r.sub : ''})`
      : `Class ${r.cls} (직접 입력)`)
  };
}

// ── AI 회신 초안 작성 (기존 FAQ·문의답변 DB 분석 → 이메일 회신 초안) ──
async function fqDraftReply() {
  const subject = (document.getElementById('fqEmSubject').value || '').trim();
  const inquiry = (document.getElementById('fqEmInquiry').value || '').trim();
  const replyEl = document.getElementById('fqEmReply');
  if (!subject && !inquiry) { fqToast('제목이나 문의 내용을 먼저 입력(또는 이메일 파일 첨부)하세요', 'warn'); return; }
  // 문의와 관련도 높은 사내 자료 선별 (fqAskAi와 동일 방식)
  const q = subject + '\n' + inquiry;
  const items = FQ_FAQ_DATA.items || [];
  const qWords = q.toLowerCase().split(/[\s,./]+/).filter(w => w.length > 1);
  const scored = items.map(it => {
    const hay = (it.q + ' ' + (it.a || '') + ' ' + ((it.tags || []).join(' '))).toLowerCase();
    let s = 0; qWords.forEach(w => { if (hay.includes(w)) s++; });
    return { it, s };
  }).sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 30).map(x => ({ q: x.it.q, a: (x.it.a || '').slice(0, 1500), cat: x.it.cat }));
  const btn = document.getElementById('fqEmDraftBtn');
  const prev = replyEl.value;
  replyEl.value = '🤖 회신 초안 작성 중… (종합 판단 → 오류·모순 검증 2단계, 잠시 걸릴 수 있습니다)';
  if (btn) btn.disabled = true;
  try {
    // 문의에 언급된 UN번호 추출 → DG_TABLE에서 class·격리 등 상세 조회(혼적/금지 판단 근거)
    let unnos = fqExtractUnnos(q);
    // 첨부 MSDS(PDF) 분석 → 회신 근거로 활용 + 발견한 UN번호를 격리 판정에 합류
    let attachAnalyses = [];
    let attachUnread = [];   // 자동 분석 못한 첨부(용량초과·실패) — 제조사 미확인 → 회신서 경고
    if (fqEmailAttachments.length) {
      replyEl.value = `📎 첨부 ${fqEmailAttachments.length}건 분석 중… (잠시 걸릴 수 있습니다)`;
      for (const att of fqEmailAttachments) {
        if (att.tooBig || !att.b64) {   // 용량 초과(서버 4.5MB 한도) → 첫 페이지 이미지로 렌더해 분석 재시도
          let done = false;
          if (att.bytes && window.pdfjsLib) {
            try {
              const jpg = await fqPdfToJpeg(att.bytes, 2, 1500);
              const ar = await fetch('/api/analyze-sds', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_name: att.name, file_type: 'image/jpeg', file_base64: jpg })
              });
              const aj = await ar.json().catch(() => ({}));
              if (ar.ok && aj.ok && aj.result) { attachAnalyses.push(Object.assign({ name: att.name, from_image: true }, aj.result)); done = true; }
            } catch (_) { /* 렌더/분석 실패 시 미확인으로 폴백 */ }
          }
          if (!done) attachUnread.push({ name: att.name, reason: '용량이 커서 자동 분석 불가 — 제조사 직접 확인 필요' });
          continue;
        }
        try {
          const ar = await fetch('/api/analyze-sds', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_name: att.name, file_type: 'application/pdf', file_base64: att.b64 })
          });
          const aj = await ar.json().catch(() => ({}));
          if (ar.ok && aj.ok && aj.result) attachAnalyses.push(Object.assign({ name: att.name }, aj.result));
          else attachUnread.push({ name: att.name, reason: (aj && aj.message) ? String(aj.message).slice(0, 80) : ('분석 실패(HTTP ' + ar.status + ')') });
        } catch (_) { attachUnread.push({ name: att.name, reason: '분석 중 오류' }); }
      }
      attachAnalyses.forEach(a => { const u = String(a.unno || '').replace(/^0+/, ''); if (/^\d{3,4}$/.test(u)) unnos.push(u); });
      unnos = [...new Set(unnos)];
    }
    let dgData = [];
    if (unnos.length) {
      try {
        const dr = await fetch('/api/dg-search', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unnos })
        });
        const dj = await dr.json().catch(() => ({}));
        if (dr.ok && dj.ok && Array.isArray(dj.data)) dgData = dj.data;
      } catch (_) { /* DG 상세 조회 실패 시 FAQ·IMDG 일반지식만으로 진행 */ }
    }
    // 혼적/격리 판정은 (1) 문의가 실제로 혼적/격리를 물을 때 + (2) 서로 다른 UN번호가 2개 이상일 때만 수행.
    //   같은 UN의 PG 변형(예: UN1866 PG I/II/III)이 여러 행으로 와도 단일 품목이므로 혼적 판정하지 않는다.
    //   (이전엔 dgData 행 수만 봤다가, 단일 품목을 자기 자신과 혼적 판정해 묻지 않은 혼적 답변이 나왔음)
    let segInfo = null;
    const isSegQ = /혼적|격리|segregat|함께[^\n]{0,8}(적재|컨테이너|선적)|같은[^\n]{0,4}컨테이너|같이[^\n]{0,6}(싣|선적|적재)|co-?load|stow(ed)?\s+together/i.test(q);
    const distinctUn = new Set(dgData.map(r => String(r.UNNO || r.unno || '').replace(/^0+/, ''))).size;
    if (isSegQ && distinctUn >= 2) {
      // 서로 다른 UN 1건씩만 골라 격리 판정 (PG 변형 중복 제거)
      const seenUn = new Set();
      const rows = dgData.filter(r => { const u = String(r.UNNO || r.unno || '').replace(/^0+/, ''); if (seenUn.has(u)) return false; seenUn.add(u); return true; })
        .map(r => ({ class: r.Class || r.class, sub: r.SUB || r.sub, unno: r.UNNO || r.unno, name: r.Name || r.name }));
      const chk = fqSegregationCheck(rows);
      segInfo = { verdict: chk.verdict, allow: chk.allow, worst: chk.worst, detail: chk.detail,
        cargos: rows.map(r => `UN${r.unno} ${r.name || ''} (Class ${r.class}${r.sub ? ', 부위험성 ' + r.sub : ''})`) };
      // SKR/HAL RFDG 혼적 금지 규칙 (IMDG 일반 격리표보다 우선) — 리튬배터리(3480/3481) DG 혼적 시 분리 선적
      const isRfdgUn = u => /^0*(3480|3481)$/.test(String(u || ''));
      const rfdgRows = rows.filter(r => isRfdgUn(r.unno));
      const otherRows = rows.filter(r => !isRfdgUn(r.unno));
      if (rfdgRows.length && otherRows.length) {
        segInfo.rfdgConflict = true;
        segInfo.rfdgUns = rfdgRows.map(r => 'UN' + String(r.unno).replace(/^0+/, ''));
        segInfo.dryCargos = otherRows.map(r => 'UN' + String(r.unno).replace(/^0+/, ''));
      }
    }
    // SKR/HAL(자사) 선적 금지·제한 리스트 조회 — 선적 가부 근거 (타 선사 제외)
    let skrCarrier = [];
    if (unnos.length) { try { skrCarrier = await fqFetchSkrRules(unnos); } catch (_) {} }
    const res = await fetch('/api/faq-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'reply', subject, inquiry, context: top, dgData, unnos, segInfo, skrCarrier, attachments: attachAnalyses, attachUnread, lang: (!/[가-힣]/.test(q) && /[A-Za-z]/.test(q)) ? 'en' : 'ko' })
    });
    let j = {}; try { j = await res.json(); } catch (e) {}
    if (!res.ok || !j.ok) throw new Error((j && j.message) || ('HTTP ' + res.status));
    replyEl.value = (j.reply || '').trim();
    fqToast('✓ AI 회신 초안 완료 — 내용을 검토·수정한 뒤 등록하거나 회신 보내기 하세요', 'success');
  } catch (e) {
    replyEl.value = prev;
    fqToast('회신 초안 작성 실패: ' + e.message, 'warn');
  } finally { if (btn) btn.disabled = false; }
}

// ── 이메일 업로드 / 이메일 문의 목록 ──
const FQ_AUTO_CAT = '🔎 자동 분류 (내용 기반 추천)';

// ── 이메일 첨부(MSDS) 처리 — 회신 초안 작성 시 참고 ──
let fqEmailAttachments = [];   // 현재 불러온 이메일의 첨부 PDF(MSDS) base64 목록
// Uint8Array → base64 (대용량 안전: 스택 초과 방지 위해 청크 처리)
function fqU8ToBase64(u8) {
  let s = ''; const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return btoa(s);
}
// 파일명 정리(제어문자·NUL 제거)
function fqCleanName(x) { return String(x || '').replace(/[ -]+/g, '').trim(); }
// .msg 첨부 추출 — 37010102(PR_ATTACH_DATA_BIN), 파일명 3707001F(long)/3704001F(short), 디렉터리 순서로 페어링
function __fqMsgAtt(entries, readStream, utf16) {
  const data = entries.filter(e => e.type === 2 && /37010102/i.test(e.name));
  const longN = entries.filter(e => e.type === 2 && /3707001F/i.test(e.name)).map(e => fqCleanName(utf16(readStream(e))));
  const shortN = entries.filter(e => e.type === 2 && /3704001F/i.test(e.name)).map(e => fqCleanName(utf16(readStream(e))));
  return data.map((e, i) => ({ name: longN[i] || shortN[i] || ('attachment_' + (i + 1)), bytes: readStream(e) }));
}
// .eml MIME 멀티파트에서 PDF 첨부 추출 (best-effort)
function __fqEmlAtt(raw) {
  const out = [];
  try {
    const top = String(raw || '');
    const bm = top.match(/boundary="?([^"\r\n;]+)"?/i);
    if (!bm) return out;
    top.split('--' + bm[1]).forEach(p => {
      const sep = p.search(/\r?\n\r?\n/);
      if (sep < 0) return;
      const h = p.slice(0, sep);
      if (!/content-transfer-encoding:\s*base64/i.test(h)) return;
      const isPdf = /application\/pdf/i.test(h) || /name\*?="?[^"\r\n]*\.pdf/i.test(h);
      if (!isPdf) return;
      const nm = h.match(/name\*?="?([^"\r\n;]+\.pdf)/i) || h.match(/filename\*?="?([^"\r\n;]+)/i);
      const b64 = p.slice(sep).replace(/[^A-Za-z0-9+/=]/g, '');
      if (b64.length < 100) return;
      try {
        const bin = atob(b64);
        out.push({ name: nm ? fqDecodeRfc2047(nm[1]) : 'attachment.pdf', bytes: Uint8Array.from(bin, c => c.charCodeAt(0)) });
      } catch (_) {}
    });
  } catch (_) {}
  return out;
}
// 첨부 목록에서 PDF(MSDS·성적서)만 골라 base64로 (최대 4개). 용량이 커서 서버 한도(요청 4.5MB)
//   를 넘는 PDF는 조용히 버리지 않고 tooBig 플래그로 표시 → 회신에서 '제조사 미확인'으로 경고한다.
function fqCollectPdfAttachments(atts) {
  const out = [];
  const RAW_MAX = 3.0 * 1024 * 1024;   // base64(×~1.37)+JSON 여유 → 서버 4.5MB 한도 내 안전치
  (atts || []).forEach(a => {
    const b = a.bytes; if (!b || b.length < 5) return;
    const head = String.fromCharCode(b[0], b[1], b[2], b[3]);
    const isPdf = head === '%PDF' || /\.pdf$/i.test(a.name || '');
    if (!isPdf) return;
    const item = { name: a.name || 'MSDS.pdf', mimeType: 'application/pdf', size: b.length };
    if (b.length > RAW_MAX) { item.tooBig = true; item.bytes = b; }   // 용량 초과 → 첫 페이지 이미지 렌더로 재시도
    else { item.b64 = fqU8ToBase64(b); }
    out.push(item);
  });
  return out.slice(0, 4);
}
// 대용량/이미지 PDF를 pdf.js로 앞 N페이지를 1장의 JPEG(base64, 접두어 제외)로 렌더 — 제조사 판독용
async function fqPdfToJpeg(bytes, maxPages, maxW) {
  if (!window.pdfjsLib) throw new Error('pdfjs 미로드');
  try { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; } catch (_) {}
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const np = Math.min(maxPages || 2, pdf.numPages);
  const canvases = []; let totalH = 0, W = 0;
  for (let i = 1; i <= np; i++) {
    const page = await pdf.getPage(i);
    let vp = page.getViewport({ scale: 1 });
    const scale = Math.min(2, (maxW || 1500) / vp.width);
    vp = page.getViewport({ scale });
    const c = document.createElement('canvas');
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    canvases.push(c); totalH += c.height; W = Math.max(W, c.width);
  }
  const out = document.createElement('canvas');
  out.width = W; out.height = totalH;
  const ctx = out.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, totalH);
  let y = 0; for (const c of canvases) { ctx.drawImage(c, 0, y); y += c.height; }
  return out.toDataURL('image/jpeg', 0.72).split(',')[1];
}
function fqToggleEmailForm() {
  const f = document.getElementById('fqEmailForm');
  if (!f) return;
  f.hidden = !f.hidden;
  if (!f.hidden) { fqPopulateEmailCats(); fqRenderEmailList(); fqSetEmFormToggle(true); }
}
// 입력 폼 영역 접기/펴기
function fqSetEmFormToggle(open) {
  const ff = document.getElementById('fqEmFormFields');
  const arrow = document.querySelector('#fqEmFormToggle .fq-em-arrow');
  if (ff) ff.hidden = !open;
  if (arrow) arrow.textContent = open ? '▲ 접기' : '▼ 펴기';
}
function fqToggleEmFormFields() {
  const ff = document.getElementById('fqEmFormFields');
  fqSetEmFormToggle(ff ? ff.hidden : true);
}
function fqPopulateEmailCats() {
  const sel = document.getElementById('fqEmCat');
  if (!sel) return;
  const cats = [FQ_AUTO_CAT, ...FQ_SEED_CATS.filter(c => c !== '전체')];
  sel.innerHTML = cats.map(c => `<option value="${fqEsc(c)}"${c === FQ_AUTO_CAT ? ' selected' : ''}>${fqEsc(c)}</option>`).join('');
}
// 카테고리 드롭다운 옵션 (현재 선택값 표시)
function fqEmailCatOptions(sel) {
  return FQ_SEED_CATS.filter(c => c !== '전체')
    .map(c => `<option value="${fqEsc(c)}"${c === sel ? ' selected' : ''}>${fqEsc(c)}</option>`).join('');
}
// 등록된 이메일 문의의 카테고리 수동 변경 → 저장
async function fqChangeEmailCat(id, cat) {
  const m = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (!m) return;
  m.cat = cat;
  fqRenderEmailList();
  if (typeof fqRenderFaq === 'function') fqRenderFaq();
  try { await fqPushFaqRemote(); fqToast('✓ 카테고리 변경 저장됨', 'success'); }
  catch (e) { fqToast('카테고리 저장 실패(로컬만 반영): ' + e.message, 'warn'); }
}
// 등록된 이메일 문의 목록 (source === 'email') — 📧 아이콘 클릭 시 표시
function fqRenderEmailList() {
  const box = document.getElementById('fqEmailList');
  if (!box) return;
  const mails = (FQ_FAQ_DATA.items || []).filter(i => i.source === 'email');
  if (mails.length === 0) {
    box.innerHTML = '<div class="fq-empty">등록된 이메일 문의가 없습니다. 위에서 이메일을 업로드해 등록하세요.</div>';
    return;
  }
  box.innerHTML = mails.map(m => {
    const toCount = (m.emails || []).length;
    return `
    <div class="fq-item" data-id="${fqEsc(m.id)}">
      <div class="fq-q" onclick="fqToggleFaqItem('${fqEsc(m.id)}')">
        <div style="flex:1;"><div class="fq-q-text">${fqEsc(m.q)}</div></div>
        <select class="fq-cat-select" title="카테고리 변경" onclick="event.stopPropagation()" onchange="fqChangeEmailCat('${fqEsc(m.id)}', this.value)">${fqEmailCatOptions(m.cat)}</select>
        <span class="fq-q-arrow">▼</span>
      </div>
      <div class="fq-a">${fqRenderText(m.a || '')}
        <div class="fq-email-actions" style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button type="button" class="fq-btn primary" onclick="fqSendReply('${fqEsc(m.id)}')">✉️ 회신 보내기</button>
          <button type="button" class="fq-btn" onclick="fqEditEmail('${fqEsc(m.id)}')">✏️ 수정</button>
          <button type="button" class="fq-btn danger" onclick="fqDeleteEmail('${fqEsc(m.id)}')">🗑 삭제</button>
          <span style="font-size:12px;color:#888;">${toCount ? `수신 ${toCount}명 · 참조 dgcenter@sinokor.co.kr` : '⚠️ 저장된 수신주소 없음 — 재등록 시 받는사람란을 채워주세요'}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}
// 아웃룩 회신창 열기 (공용) — 수신=메일 내 모든 주소, 참조=dg@, 발신=기본계정(현 wtlee@; mailto는 From 강제 불가)
//   (추후 로그인 기능 추가 시 로그인 id(메일주소)를 발신자로 사용하도록 확장 예정)
function fqOpenOutlookReply(toList, subject, body) {
  const to = (toList || []).filter(Boolean).join(';');   // Outlook 다중 수신인 구분자
  if (!to) { fqToast('받는사람(수신) 메일주소가 없습니다 — 받는사람란을 채워주세요', 'warn'); return false; }
  const url = 'mailto:' + to + '?cc=' + encodeURIComponent('dgcenter@sinokor.co.kr')
    + '&subject=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || '');
  window.location.href = url;
  fqToast('✉️ 아웃룩 회신창을 엽니다 (수신·참조·내용 자동 입력)', 'success');
  return true;
}
// 등록된 문의 목록에서 회신
function fqSendReply(id) {
  const m = (FQ_FAQ_DATA.items || []).find(i => i.id === id);
  if (!m) { fqToast('항목을 찾을 수 없습니다', 'warn'); return; }
  fqOpenOutlookReply(m.emails, 'RE: ' + (m.q || ''), m.reply || m.a || '');
}
// 초안 작성 폼에서 바로 회신 (등록 없이) — 폼의 받는사람/제목/회신 내용 사용
function fqSendReplyForm() {
  const to = fqExtractEmails((document.getElementById('fqEmTo') || {}).value || '');
  const subject = 'RE: ' + ((document.getElementById('fqEmSubject') || {}).value || '').trim();
  const body = ((document.getElementById('fqEmReply') || {}).value || '').trim();
  if (!body) { fqToast('회신 내용이 비어 있습니다 — 🤖 AI 회신 초안 작성 후 발송하세요', 'warn'); return; }
  fqOpenOutlookReply(to, subject, body);
}
// ── Outlook .msg (OLE/CFB 복합문서) 파서 — 제목·본문 추출 ──
function fqParseMsg(arrayBuffer) {
  const u8 = new Uint8Array(arrayBuffer);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const LE = true;
  if (dv.getUint32(0, false) !== 0xD0CF11E0) throw new Error('지원하지 않는 .msg 형식입니다');
  const secSize = 1 << dv.getUint16(0x1e, LE);
  const miniSize = 1 << dv.getUint16(0x20, LE);
  const firstDir = dv.getUint32(0x30, LE);
  const miniCutoff = dv.getUint32(0x38, LE);
  const firstMiniFat = dv.getUint32(0x3c, LE);
  const firstDifat = dv.getUint32(0x44, LE), numDifat = dv.getUint32(0x48, LE);
  const ENDOFCHAIN = 0xFFFFFFFE, FREESECT = 0xFFFFFFFF;
  const secOff = s => (s + 1) * secSize;
  const difat = [];
  for (let i = 0; i < 109; i++) { const v = dv.getUint32(0x4c + i * 4, LE); if (v === FREESECT || v === ENDOFCHAIN) break; difat.push(v); }
  let ds = firstDifat;
  for (let n = 0; n < numDifat && ds !== ENDOFCHAIN && ds !== FREESECT; n++) {
    const base = secOff(ds), cnt = (secSize / 4) - 1;
    for (let i = 0; i < cnt; i++) { const v = dv.getUint32(base + i * 4, LE); if (v !== FREESECT && v !== ENDOFCHAIN) difat.push(v); }
    ds = dv.getUint32(base + cnt * 4, LE);
  }
  const fat = new Uint32Array(difat.length * (secSize / 4));
  let fi = 0;
  for (const f of difat) { const base = secOff(f); for (let i = 0; i < secSize / 4; i++) fat[fi++] = dv.getUint32(base + i * 4, LE); }
  const chain = start => { const out = []; let s = start, g = 0; while (s !== ENDOFCHAIN && s !== FREESECT && g++ < 1e7) { out.push(s); s = fat[s]; } return out; };
  const readChain = start => { const secs = chain(start); const out = new Uint8Array(secs.length * secSize); secs.forEach((s, i) => out.set(u8.subarray(secOff(s), secOff(s) + secSize), i * secSize)); return out; };
  const dirBytes = readChain(firstDir);
  const entries = [];
  for (let off = 0; off + 128 <= dirBytes.length; off += 128) {
    const nameLen = dirBytes[off + 0x40] | (dirBytes[off + 0x41] << 8);
    if (nameLen <= 0) continue;
    let name = ''; for (let i = 0; i < nameLen - 2; i += 2) name += String.fromCharCode(dirBytes[off + i] | (dirBytes[off + i + 1] << 8));
    const ddv = new DataView(dirBytes.buffer, dirBytes.byteOffset + off, 128);
    entries.push({ name, type: dirBytes[off + 0x42], start: ddv.getUint32(0x74, LE), size: ddv.getUint32(0x78, LE) });
  }
  const root = entries.find(e => e.type === 5);
  const miniStream = root ? readChain(root.start) : new Uint8Array(0);
  let miniFat = new Uint32Array(0);
  if (firstMiniFat !== ENDOFCHAIN) { const mb = readChain(firstMiniFat); miniFat = new Uint32Array(mb.buffer, mb.byteOffset, Math.floor(mb.byteLength / 4)); }
  const readStream = e => {
    if (e.size >= miniCutoff) return readChain(e.start).subarray(0, e.size);
    const out = new Uint8Array(e.size); let s = e.start, o = 0, g = 0;
    while (s !== ENDOFCHAIN && s !== FREESECT && o < e.size && g++ < 1e7) { const mo = s * miniSize, n = Math.min(miniSize, e.size - o); out.set(miniStream.subarray(mo, mo + n), o); o += n; s = miniFat[s]; }
    return out;
  };
  const utf16 = b => { let s = ''; for (let i = 0; i + 1 < b.length; i += 2) s += String.fromCharCode(b[i] | (b[i + 1] << 8)); return s; };
  const find = tag => entries.find(e => e.type === 2 && e.name.toUpperCase().includes(tag));
  const getStr = (uniTag, ansiTag) => {
    const u = find(uniTag); if (u) return utf16(readStream(u));
    const a = find(ansiTag);
    if (a) { const b = readStream(a); try { return new TextDecoder('euc-kr').decode(b); } catch (_) { return new TextDecoder().decode(b); } }
    return '';
  };
  return {
    subject: getStr('0037001F', '0037001E').replace(/ +$/, '').trim(),
    body: getStr('1000001F', '1000001E').replace(/ +$/, '').trim(),
    from: getStr('0C1A001F', '0C1A001E').replace(/ +$/, '').trim(),
    headers: getStr('007D001F', '007D001E'),
    attachments: __fqMsgAtt(entries, readStream, utf16)
  };
}

// .eml/.txt 텍스트에서 제목·본문 추출 (간단 파싱)
function fqDecodeRfc2047(s) {
  return String(s || '').replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (m, cs, enc, data) => {
    try {
      let bytes;
      if (enc.toUpperCase() === 'B') { const bin = atob(data); bytes = Uint8Array.from(bin, c => c.charCodeAt(0)); }
      else { const t = data.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (x, h) => String.fromCharCode(parseInt(h, 16))); bytes = Uint8Array.from(t, c => c.charCodeAt(0)); }
      return new TextDecoder(cs).decode(bytes);
    } catch (_) { return m; }
  });
}
function fqParseEml(text) {
  const idx = text.search(/\r?\n\r?\n/);
  const head = idx >= 0 ? text.slice(0, idx) : text;
  let body = idx >= 0 ? text.slice(idx).replace(/^\r?\n\r?\n/, '') : '';
  const unfolded = head.replace(/\r?\n[ \t]+/g, ' ');
  const sm = unfolded.match(/^subject:\s*(.+)$/im);
  const subject = sm ? fqDecodeRfc2047(sm[1].trim()) : '';
  const cte = (unfolded.match(/^content-transfer-encoding:\s*(.+)$/im) || [])[1] || '';
  if (/quoted-printable/i.test(cte)) body = body.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
  return { subject, body, attachments: __fqEmlAtt(text) };
}

// 텍스트에서 이메일 주소를 모두 추출 (중복 제거, 회신 수신인/참조용)
function fqExtractEmails(text) {
  const re = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
  const seen = new Set(), out = [];
  (String(text || '').match(re) || []).forEach(e => {
    const k = e.toLowerCase();
    // 수신인·발신인·참조인 모든 주소를 전부 추출 (중복만 제거)
    if (!seen.has(k)) { seen.add(k); out.push(e); }
  });
  return out;
}
// .msg 전체를 UTF-16/Latin1로 디코드 — 헤더·수신자 스트림에 저장된 주소(수신/참조)까지 스캔용
function fqMsgTextDump(arrayBuffer) {
  try {
    const u8 = new Uint8Array(arrayBuffer);
    let s = '';
    try { s += new TextDecoder('utf-16le').decode(u8); } catch (_) {}
    try { s += '\n' + new TextDecoder('latin1').decode(u8); } catch (_) {}
    return s;
  } catch (_) { return ''; }
}
function fqReadEmailFile(e) {
  const file = e.target.files && e.target.files[0];
  if (file) fqProcessEmailFile(file);
}
function fqProcessEmailFile(file) {
  if (!file) return;
  const isMsg = /\.msg$/i.test(file.name);
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      let subject = '', body = '', emailSrc = '';
      fqEmailAttachments = [];   // 새 이메일 로드 시 이전 첨부 초기화
      if (isMsg) {
        const r = fqParseMsg(ev.target.result);
        subject = r.subject; body = r.body;
        // 발신(from)+전송헤더(To/Cc)+.msg 전체 텍스트(수신자 스트림)+본문 → 수신/발신/참조 전부 추출
        emailSrc = (r.from || '') + '\n' + (r.headers || '') + '\n' + fqMsgTextDump(ev.target.result) + '\n' + (r.subject || '') + '\n' + body;
        fqEmailAttachments = fqCollectPdfAttachments(r.attachments || []);
      } else {
        const raw = String(ev.target.result || '');
        const r = fqParseEml(raw);
        subject = r.subject; body = r.body || raw;
        emailSrc = raw;   // 헤더(From/To/Cc)+본문 전체에서 주소 추출
        fqEmailAttachments = fqCollectPdfAttachments(r.attachments || []);
      }
      const subjEl = document.getElementById('fqEmSubject');
      const inq = document.getElementById('fqEmInquiry');
      if (subjEl && subject) subjEl.value = subject;
      if (inq) inq.value = body.length > 20000 ? body.slice(0, 20000) + '\n...(이하 생략)' : body;
      // 받는사람(수신) 메일주소 자동 채우기
      const toEl = document.getElementById('fqEmTo');
      const emails = fqExtractEmails(emailSrc);
      if (toEl && emails.length) toEl.value = emails.join(', ');
      const attNote = fqEmailAttachments.length ? ` · 첨부 MSDS ${fqEmailAttachments.length}건` : '';
      fqToast(`📎 이메일을 불러왔습니다${emails.length ? ` · 수신주소 ${emails.length}개 추출` : ''}${attNote}. 🤖 회신 초안 작성 시 첨부 MSDS도 참고합니다`, 'success');
    } catch (err) {
      fqToast('이메일 파일 분석 실패: ' + err.message, 'warn');
    }
  };
  if (isMsg) reader.readAsArrayBuffer(file); else reader.readAsText(file);
}
// ── 격리표 검증 보조 (등록 직전 안전장치) ──────────────────────────
// 글에서 UN번호 추출 (예: "UN 2196", "UN2196", "UN NO. 1052")
function fqExtractUNNOs(text) {
  const set = new Set();
  const re = /\bUN\s*(?:NO\.?|넘버|번호)?\s*[:#]?\s*(\d{3,4})\b/gi;
  let m;
  while ((m = re.exec(String(text || '')))) set.add(normalizeUNNO(m[1]));
  return [...set];
}
// 글에서 클래스 토큰 추출 (UN번호가 부족할 때 폴백) — 예: "CLS 2.3", "Class 8", "클래스 6.1"
function fqExtractClassTokens(text) {
  const out = [], seen = new Set();
  const re = /(?:CLS|CLASS|클래스|클라스)\s*[:.]?\s*(1(?:\.[1-6])?|2\.[1-3]|3|4\.[1-3]|5\.[1-2]|6\.[1-2]|7|8|9)\b/gi;
  let m;
  while ((m = re.exec(String(text || '')))) { const c = m[1]; if (!seen.has(c)) { seen.add(c); out.push(c); } }
  return out;
}
// 작성한 답변이 "혼적 가능/불가/조건부" 중 무엇을 주장하는지 판별 (회신 본문만 대상)
function fqDetectAnswerClaim(reply) {
  const t = String(reply || '').replace(/\s+/g, ' ');
  const neg = /(?:불가능|불가합니다|불가|금지|불허|어렵습니다|안\s?됩니다)/.test(t) || /격리[^.]{0,12}(?:필수|필요)/.test(t);
  const pos = /가능합니다/.test(t) || /(?:혼적|동일\s*컨테이너|함께|선적|진행|적재)[^.]{0,14}가능/.test(t);
  const cond = /(?:조건부|이격|away\s*from)/i.test(t);
  if (neg && pos) return 'ambiguous';
  if (neg) return 'no';
  if (cond) return 'cond';
  if (pos) return 'yes';
  return 'unknown';
}
// 등록 직전 격리표 검증 — IMDG 격리 엔진(calcPairSeg)으로 재계산해 답변과 대조
//   반환: { applicable, verdict('yes'|'cond'|'no'|'check'), verdictText, claim, status('pass'|'review'|'conflict') }
async function fqSegregationGate(subject, inquiry, reply) {
  const NOPE = { applicable: false };
  const allText = [subject, inquiry, reply].filter(Boolean).join('\n');
  let items = [];
  // 1) UN번호 우선 (DG_TABLE 조회 — Class·SUB·SG코드까지 정확)
  const unnos = fqExtractUNNOs(allText);
  if (unnos.length >= 2) {
    try {
      const resp = await fetch('/api/dg-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unnos })
      });
      const j = await resp.json().catch(() => ({}));
      if (resp.ok && j.ok && Array.isArray(j.data)) {
        const map = new Map();
        j.data.forEach(it => { const k = normalizeUNNO(it.UNNO); if (!map.has(k)) map.set(k, prepareEntry(it)); });
        items = [...map.values()];
      }
    } catch (e) { /* 조회 실패 → 클래스 기반 폴백 */ }
  }
  // 2) UN으로 2건을 못 모으면 클래스 토큰 기반 폴백 (일반 격리표만 적용)
  if (items.length < 2) {
    const cls = fqExtractClassTokens(allText);
    if (cls.length >= 2) items = cls.map((c, i) => prepareEntry({ UNNO: 'C' + i, Class: c, SUB: '-', Segregation: '' }));
  }
  if (items.length < 2) return NOPE;   // 위험물 2건 이상이 아니면 혼적 판정 대상 아님

  // 3) 모든 쌍의 최악 격리레벨 계산 (UI 격리분석과 동일 엔진)
  let worst = 0, hasStar = false;
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const r = calcPairSeg(items[i], items[j]);
    if (r.level === '*') hasStar = true;
    else if (typeof r.level === 'number') worst = Math.max(worst, r.level);
  }
  let verdict, verdictText;
  if (worst >= 2) { verdict = 'no'; verdictText = '혼적 불가 — 격리 필요 (Segregation ' + worst + ')'; }
  else if (worst === 1) { verdict = 'cond'; verdictText = '조건부 — 같은 컨테이너 적재 시 이격(Away from) 필요'; }
  else if (hasStar) { verdict = 'check'; verdictText = 'Class 1 특수규정 — 개별 확인 필요'; }
  else { verdict = 'yes'; verdictText = '혼적 가능 — 별도 격리 규정 없음'; }

  const claim = fqDetectAnswerClaim(reply);
  let status;
  const decisiveEngine = (verdict === 'yes' || verdict === 'no');
  const decisiveClaim = (claim === 'yes' || claim === 'no');
  if (decisiveEngine && decisiveClaim && verdict !== claim) status = 'conflict';   // 정반대 → 차단
  else if (verdict === 'cond' && decisiveClaim) status = 'review';                  // 조건부인데 단정한 답
  else if (verdict === 'check') status = 'review';                                  // Class 1 특수
  else if (claim === 'unknown' || claim === 'ambiguous') status = 'review';         // 답변 판단 불명확
  else status = 'pass';

  return { applicable: true, worst, hasStar, verdict, verdictText, claim, status };
}

async function fqSubmitEmail() {
  const subject = document.getElementById('fqEmSubject').value.trim();
  const inquiry = document.getElementById('fqEmInquiry').value.trim();
  const reply = document.getElementById('fqEmReply').value.trim();
  const by = document.getElementById('fqEmBy').value.trim();
  let cat = document.getElementById('fqEmCat').value || FQ_AUTO_CAT;
  if (!subject || !reply) { fqToast('제목과 회신(답변)은 필수입니다', 'warn'); return; }
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');
  }
  // ── 등록 직전 격리표 자동검증 (혼적/격리 문의일 때 강제) ──
  // IMDG 격리 엔진(calcPairSeg)으로 다시 계산해, 작성한 답변이 규정과 어긋나면 등록을 막는다.
  const gate = await fqSegregationGate(subject, inquiry, reply);
  if (gate.applicable) {
    if (gate.status === 'conflict') {
      const claimTxt = gate.claim === 'no' ? '혼적 불가' : (gate.claim === 'yes' ? '혼적 가능' : '판단 불명확');
      const msg = '⚠️ 격리표 자동검증 — 답변이 규정과 다릅니다\n\n'
        + '· 격리표 판정: ' + gate.verdictText + '\n'
        + '· 작성한 답변: ' + claimTxt + '으로 안내\n\n'
        + '두 결과가 서로 다릅니다. 답변이 잘못되었을 수 있으니\n[취소]를 눌러 답변을 수정하세요.\n\n'
        + '그래도 이대로 등록하려면 [확인]을 누르세요.';
      if (!confirm(msg)) { fqToast('등록을 멈췄습니다 — 격리표 판정(' + gate.verdictText + ')에 맞게 답변을 확인하세요', 'warn'); return; }
    } else if (gate.status === 'review') {
      const msg = '🔎 격리표 자동검증 — 확인이 필요합니다\n\n'
        + '· 격리표 판정: ' + gate.verdictText + '\n\n'
        + '답변이 이 판정과 일치하는지 확인하세요.\n'
        + '등록하려면 [확인], 답변을 더 볼거면 [취소].';
      if (!confirm(msg)) { fqToast('등록을 멈췄습니다 — 격리표 판정을 확인하세요', 'warn'); return; }
    } else {
      fqToast('✓ 격리표 검증 통과 — ' + gate.verdictText, 'success');
    }
  }
  const bodyPart = inquiry ? ('**문의 내용**\n' + inquiry + '\n\n**답변**\n') : '';
  // 자동 분류 선택 시 내용 기반으로 카테고리 태그 부여
  if (cat === FQ_AUTO_CAT) cat = fqClassifyKeyword(subject + '\n' + inquiry + '\n' + reply);
  // 받는사람(수신) 메일주소 — 회신 보내기 버튼에서 사용
  const toRaw = (document.getElementById('fqEmTo') ? document.getElementById('fqEmTo').value : '') || '';
  const emails = fqExtractEmails(toRaw);
  // 수정 중이면 기존 항목의 id·등록시각을 유지해 같은 항목을 갱신 (신규면 새 id 발급)
  const editing = fqEditingId ? (FQ_FAQ_DATA.items || []).find(i => i.id === fqEditingId && i.source === 'email') : null;
  const item = {
    id: editing ? editing.id : ('faq_eml_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)),
    cat: cat, q: subject, a: bodyPart + reply, tags: ['이메일', by].filter(Boolean), source: 'email',
    emails: emails, reply: reply, inquiry: inquiry,   // 회신 보내기·재편집용 원문
    ts: editing && editing.ts ? editing.ts : Date.now()   // 통계용 등록시각 (수정 시 원래 시각 유지)
  };
  const ok = await fqUpsertFaqItem(item);   // 로컬 즉시 반영 + 공용 DB 저장 (중복이면 false)
  const wasEditing = !!editing;
  fqEditingId = null;   // 편집 상태 해제
  fqResetEmSubmitBtn();
  ['fqEmSubject', 'fqEmInquiry', 'fqEmTo', 'fqEmReply', 'fqEmBy'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const fileEl = document.getElementById('fqEmFile'); if (fileEl) fileEl.value = '';
  fqRenderEmailList();   // 📧 이메일 문의 목록 갱신 (메인 FAQ엔 노출 안 함)
  if (ok) {
    // 등록/수정 완료 → 입력 폼 영역을 접어서 초기화 (목록은 유지). 📧 버튼으로 다시 펼침.
    const ff = document.getElementById('fqEmFormFields');
    if (ff) ff.hidden = true;
    fqSetEmFormToggle(false);
    if (wasEditing) fqToast(fqRemoteOK ? '✓ 수정 완료 — 답변이 갱신되었습니다' : '✓ 수정 완료 (로컬)', 'success');
    else fqToast(fqRemoteOK ? '✓ 등록 완료 — 입력창을 접었습니다. 📧 목록에서 확인하세요' : '✓ 이메일 문의 등록 (로컬)', 'success');
  }
}

// 등록된 이메일 문의 수정 — 기존 내용을 입력 폼에 채우고 편집 모드로 전환
function fqEditEmail(id) {
  const m = (FQ_FAQ_DATA.items || []).find(i => i.id === id && i.source === 'email');
  if (!m) { fqToast('항목을 찾을 수 없습니다', 'warn'); return; }
  // 등록과 동일하게 담당자 비밀번호 1회 확인
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');
  }
  fqEditingId = id;
  // 폼 펼치기 + 기존 값 채우기
  const form = document.getElementById('fqEmailForm');
  if (form) form.hidden = false;
  fqPopulateEmailCats();
  fqSetEmFormToggle(true);
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  set('fqEmSubject', m.q);
  set('fqEmInquiry', m.inquiry);
  set('fqEmReply', m.reply || m.a);   // reply 원문 없으면 a 본문 사용 (구버전 호환)
  set('fqEmTo', (m.emails || []).join(', '));
  set('fqEmBy', (m.tags || []).find(t => t && t !== '이메일') || '');
  const catSel = document.getElementById('fqEmCat');
  if (catSel) catSel.value = m.cat || FQ_AUTO_CAT;
  // 등록 버튼을 '수정 저장'으로 표시
  const btn = document.getElementById('fqEmSubmitBtn');
  if (btn) { btn.textContent = '✏️ 수정 저장'; btn.dataset.editing = '1'; }
  if (form && form.scrollIntoView) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  fqRenderEmailList();
  fqToast('✏️ 수정 모드 — 내용을 고친 뒤 "수정 저장"을 누르세요', 'success');
}

// 등록 버튼 라벨/상태를 신규 등록 기본값으로 되돌림
function fqResetEmSubmitBtn() {
  const btn = document.getElementById('fqEmSubmitBtn');
  if (btn) { btn.textContent = '📥 이메일 문의 등록'; delete btn.dataset.editing; }
}

// 등록된 이메일 문의 삭제 — 확인 + 담당자 비밀번호
async function fqDeleteEmail(id) {
  const m = (FQ_FAQ_DATA.items || []).find(i => i.id === id && i.source === 'email');
  if (!m) { fqToast('항목을 찾을 수 없습니다', 'warn'); return; }
  if (!confirm('이 이메일 문의 답변을 삭제하시겠습니까?\n\n제목: ' + (m.q || '') + '\n\n되돌릴 수 없습니다.')) return;
  if (!fqAdminMode && !sessionStorage.getItem('fq_reply_ok')) {
    const pwd = prompt('담당자 비밀번호를 입력하세요:');
    if (pwd !== FQ_CONFIG.REPLY_PWD) { fqToast('✗ 비밀번호가 일치하지 않습니다', 'warn'); return; }
    sessionStorage.setItem('fq_reply_ok', '1');
  }
  // 삭제하려는 항목을 지금 수정 중이었다면 편집 상태 해제
  if (fqEditingId === id) {
    fqEditingId = null;
    fqResetEmSubmitBtn();
    ['fqEmSubject', 'fqEmInquiry', 'fqEmTo', 'fqEmReply', 'fqEmBy'].forEach(eid => { const el = document.getElementById(eid); if (el) el.value = ''; });
  }
  FQ_FAQ_DATA.items = (FQ_FAQ_DATA.items || []).filter(x => x.id !== id);
  fqSaveFaq();
  fqRenderEmailList();
  if (typeof fqRenderFaq === 'function') fqRenderFaq();
  await fqPushFaqRemote();   // 공용 DB 반영
  fqToast(fqRemoteOK ? '🗑 삭제됨' : '🗑 삭제됨 (로컬)', 'warn');
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

  // 목록 — 메인 FAQ는 정리된 시드 지식만 노출 (이메일/게시판 동적 항목은 제외, 각자 별도 영역에서 조회)
  let items = (FQ_FAQ_DATA.items || []).filter(i => !i.source);
  // 검색어가 있으면 전(全) 카테고리 대상으로 검색(카테고리 제한 무시), 없으면 선택 카테고리만
  if (!search && fqCurrentCat !== '전체') items = items.filter(i => i.cat === fqCurrentCat);
  if (search) {
    const tokens = search.split(/\s+/).filter(Boolean);   // 여러 단어 → 모두 포함(AND)
    const scored = [];
    for (const i of items) {
      const q = (i.q || '').toLowerCase();
      const tags = (i.tags || []).join(' ').toLowerCase();
      const cat = (i.cat || '').toLowerCase();
      const ans = (i.a || '').toLowerCase();
      const hay = q + ' ' + tags + ' ' + cat + ' ' + ans;
      if (!tokens.every(t => hay.includes(t))) continue;   // 모든 토큰이 어딘가 포함돼야 매칭
      let score = 0;                                        // 관련도: 질문>태그>카테고리>답변
      for (const t of tokens) {
        if (q.includes(t)) score += 5;
        if (tags.includes(t)) score += 3;
        if (cat.includes(t)) score += 2;
        if (ans.includes(t)) score += 1;
      }
      scored.push({ i, score });
    }
    items = scored.sort((a, b) => b.score - a.score).map(s => s.i);
  } else {
    // 검색이 아닐 때: 카테고리 칩 순서대로 그룹 정렬 (전면 금지 화물 등 상위 카테고리가 리스트 맨 위)
    const catOrder = FQ_FAQ_DATA.categories || [];
    const catIdx = c => { const k = catOrder.indexOf(c); return k < 0 ? 999 : k; };
    items = items
      .map((it, n) => ({ it, n }))
      .sort((a, b) => (catIdx(a.it.cat) - catIdx(b.it.cat)) || (a.n - b.n))
      .map(s => s.it);
  }
  const fqListEl = document.getElementById('fqList');
  if (items.length === 0) {
    fqListEl.innerHTML = '<div class="fq-empty">"' + fqEsc(search) + '" 에 대한 FAQ를 찾지 못했습니다.<br>다른 키워드로 검색하거나, 오른쪽 <b>🤖 AI에게 문의</b> 로 질문해 보세요.</div>';
  } else {
    fqListEl.innerHTML =
      (search ? '<div class="fq-search-count">🔎 「' + fqEsc(search) + '」 검색 결과 ' + items.length + '건 (관련도순)</div>' : '') +
      items.map(i => `
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
  }

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
  const badge = document.getElementById('fqAdminBadge'); if (badge) badge.hidden = !fqAdminMode;
  const tools = document.getElementById('fqAdminTools'); if (tools) tools.classList.toggle('show', fqAdminMode);
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
    if (!form.hidden) { fqPopulateBoardCats(); if (typeof dgAutofillForms === 'function') dgAutofillForms(); }   // FAQ 카테고리 + 로그인 정보 자동입력
  });
  scope.querySelector('#fqCancelPostBtn').addEventListener('click', () => {
    scope.querySelector('#fqNewPostForm').hidden = true;
    fqResetNewForm();
  });
  scope.querySelector('#fqNpPrivate').addEventListener('change', (e) => {
    scope.querySelector('#fqNpPwdWrap').style.display = e.target.checked ? 'block' : 'none';
  });
  scope.querySelector('#fqSubmitPostBtn').addEventListener('click', fqSubmitPost);

  // 첨부파일 — 파일 선택 + 드래그앤드롭
  const attInput = scope.querySelector('#fqNpAttachInput');
  const attDrop = scope.querySelector('#fqNpAttachDrop');
  if (attInput) attInput.addEventListener('change', e => { fqAddBoardFiles(e.target.files); e.target.value = ''; });
  if (attDrop) {
    attDrop.addEventListener('click', () => { if (attInput) attInput.click(); });
    ['dragenter', 'dragover'].forEach(ev => attDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); attDrop.classList.add('drag'); }));
    ['dragleave', 'dragend'].forEach(ev => attDrop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); attDrop.classList.remove('drag'); }));
    attDrop.addEventListener('drop', e => {
      e.preventDefault(); e.stopPropagation(); attDrop.classList.remove('drag');
      if (e.dataTransfer && e.dataTransfer.files) fqAddBoardFiles(e.dataTransfer.files);
    });
  }
}

// ── 게시판 첨부파일 처리 ──
const FQ_ATTACH_MAX = 2 * 1024 * 1024;   // 파일당 2MB 상한 (공용 DB 부담 방지)
function fqFmtSize(b) { return b < 1024 ? b + 'B' : b < 1048576 ? Math.round(b / 1024) + 'KB' : (b / 1048576).toFixed(1) + 'MB'; }
function fqAddBoardFiles(fileList) {
  Array.from(fileList || []).forEach(f => {
    if (f.size > FQ_ATTACH_MAX) { fqToast(`"${f.name}"는 2MB를 초과해 제외됩니다 (큰 파일은 이메일 문의 이용)`, 'warn'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      fqNewPostAttachments.push({ name: f.name, type: f.type || '', size: f.size, data: reader.result });
      fqRenderNpAttachList();
    };
    reader.onerror = () => fqToast(`"${f.name}" 읽기 실패`, 'warn');
    reader.readAsDataURL(f);
  });
}
function fqRenderNpAttachList() {
  const box = document.getElementById('fqNpAttachList');
  if (!box) return;
  box.innerHTML = fqNewPostAttachments.map((a, i) =>
    `<span class="fq-attach-chip">${/^image\//.test(a.type) ? '🖼' : '📄'} ${fqEsc(a.name)} <span class="fq-attach-size">(${fqFmtSize(a.size)})</span><button type="button" class="fq-attach-x" onclick="fqRemoveNpAttach(${i})" title="제거">✕</button></span>`
  ).join('');
}
function fqRemoveNpAttach(i) { fqNewPostAttachments.splice(i, 1); fqRenderNpAttachList(); }

// 첨부 보기 — 글의 첨부(base64)를 Blob으로 열기(이미지·PDF는 새 탭, 그 외 다운로드)
function fqOpenAttachment(postId, idx) {
  const p = fqPosts.find(x => x.id === postId);
  if (!p || !Array.isArray(p.attachments) || !p.attachments[idx]) return;
  const a = p.attachments[idx];
  try {
    const arr = String(a.data).split(',');
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || a.type || 'application/octet-stream';
    const bin = atob(arr[1]); const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([u8], { type: mime }));
    if (/^image\//.test(mime) || mime === 'application/pdf') {
      window.open(url, '_blank');
    } else {
      const el = document.createElement('a'); el.href = url; el.download = a.name;
      document.body.appendChild(el); el.click(); el.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) { fqToast('첨부 열기 실패: ' + e.message, 'warn'); }
}
// 게시글에 첨부 목록 표시(본문 열람 가능할 때만)
function fqRenderPostAttachments(p, canSee) {
  if (!canSee || !Array.isArray(p.attachments) || !p.attachments.length) return '';
  const chips = p.attachments.map((a, i) =>
    `<button type="button" class="fq-attach-view" onclick="fqOpenAttachment('${p.id}', ${i})" title="클릭하면 내용 보기">${/^image\//.test(a.type) ? '🖼' : '📄'} ${fqEsc(a.name)} <span class="fq-attach-size">(${fqFmtSize(a.size)})</span></button>`
  ).join('');
  return `<div class="fq-post-attachs"><span class="fq-attach-label">📎 첨부 ${p.attachments.length}개</span>${chips}</div>`;
}

// 게시판 카테고리 = FAQ 카테고리 사용 (전체 제외)
function fqPopulateBoardCats() {
  const sel = document.getElementById('fqNpCategory');
  if (!sel) return;
  const cats = (FQ_FAQ_DATA.categories || []).filter(c => c && c !== '전체');
  const cur = sel.value;
  sel.innerHTML = (cats.length ? cats : ['일반']).map(c => `<option value="${fqEsc(c)}">${fqEsc(c)}</option>`).join('');
  if (cur && cats.includes(cur)) sel.value = cur;
}
function fqResetNewForm() {
  ['fqNpAuthor','fqNpCompany','fqNpSubject','fqNpBody','fqNpPwd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fqNpPrivate').checked = false;
  document.getElementById('fqNpPwdWrap').style.display = 'none';
  fqNewPostAttachments = [];
  fqRenderNpAttachList();
  fqPopulateBoardCats();
}

async function fqSubmitPost() {
  const author = document.getElementById('fqNpAuthor').value.trim();
  const company = document.getElementById('fqNpCompany').value.trim();
  const subject = document.getElementById('fqNpSubject').value.trim();
  const body = document.getElementById('fqNpBody').value.trim();
  if (!company || !subject || !body) {
    fqToast('회사/부서·제목·내용은 필수입니다', 'warn'); return;
  }
  const isPrivate = document.getElementById('fqNpPrivate').checked;
  const pwd = document.getElementById('fqNpPwd').value;
  if (isPrivate && (!pwd || pwd.length < 4)) {
    fqToast('비밀글: 비밀번호 4자 이상', 'warn'); return;
  }
  const post = {
    id: 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    author,
    company,
    category: document.getElementById('fqNpCategory').value,
    subject, body,
    isPrivate,
    pwdHash: isPrivate ? await fqHash(pwd) : null,
    userId: (typeof dgCurrentUser !== 'undefined' && dgCurrentUser) ? dgCurrentUser.id : null,   // 작성자(비밀글 본인 열람용)
    status: 'unanswered',
    createdAt: new Date().toISOString(),
    attachments: fqNewPostAttachments.slice(),
    answer: null,
    answeredAt: null,
    answerBy: null
  };
  fqPosts.unshift(post);
  fqSavePosts();
  await fqPushPostsRemote();   // 공용 DB 저장 (실패 시 로컬 유지)
  fqResetNewForm();
  document.getElementById('fqNewPostForm').hidden = true;
  fqRenderPosts();
  fqToast(fqRemoteOK ? '✓ 문의 등록됨 (전체 공유)' : '✓ 문의 등록됨 (로컬)', 'success');
}

// 사이드바 '담당자 직접문의 게시판' 메뉴에 미답변 알림(반짝이는 빨간 느낌표) 표시
function fqUpdateBoardBadge() {
  const badge = document.getElementById('fqBoardAlert');
  if (!badge) return;
  const list = (typeof fqPosts !== 'undefined' && Array.isArray(fqPosts)) ? fqPosts : [];
  const pending = list.filter(p => p && p.status !== 'answered').length;
  if (pending > 0) {
    badge.hidden = false;
    badge.title = `답변 대기 문의 ${pending}건`;
  } else {
    badge.hidden = true;
  }
}

function fqRenderPosts() {
  fqUpdateBoardBadge();
  const total = fqPosts.length;
  const answered = fqPosts.filter(p => p.status === 'answered').length;
  document.getElementById('fqBoardStats').textContent = total > 0 ? `${total}개 문의 · ${answered}개 답변 완료` : '';

  document.getElementById('fqPostsList').innerHTML = total === 0
    ? '<div class="fq-empty">등록된 문의가 없습니다. 새 문의를 작성해보세요.</div>'
    : fqPosts.map(p => {
      const isOpen = fqOpenPostId === p.id;
      const canManage = (typeof dgIsAdmin === 'function' && dgIsAdmin()) || fqAdminMode;   // 관리자 권한(회원 역할 또는 admin1234 모드)
      const isOwner = !!(dgCurrentUser && p.userId && dgCurrentUser.id === p.userId);       // 작성 본인
      const canSeeBody = !p.isPrivate || canManage || isOwner;
      const pcats = (FQ_FAQ_DATA.categories || []).filter(c => c && c !== '전체');
      let catOpts = pcats.map(c => `<option value="${fqEsc(c)}"${c === p.category ? ' selected' : ''}>${fqEsc(c)}</option>`).join('');
      if (p.category && !pcats.includes(p.category)) catOpts = `<option value="${fqEsc(p.category)}" selected>${fqEsc(p.category)}</option>` + catOpts;
      return `
        <div class="fq-post ${isOpen ? 'open' : ''}" data-id="${p.id}">
          <div class="fq-post-head" onclick="fqTogglePost('${p.id}')">
            <div class="fq-post-info">
              <div class="fq-post-meta">
                <span class="fq-post-author">${fqEsc(p.company || p.author || '익명')}</span>
                ${(p.author && p.company) ? `<span>· ${fqEsc(p.author)}</span>` : ''}
                <span>·</span>
                <span class="fq-post-date">${new Date(p.createdAt).toLocaleString('ko')}</span>
                ${canManage
                  ? `<span class="fq-post-catsel-wrap" onclick="event.stopPropagation()" title="카테고리 변경 (관리자)">🏷<select class="fq-post-catsel" onchange="fqChangePostCat('${p.id}', this.value)">${catOpts}</select></span>`
                  : `<span class="fq-post-cat-plain">🏷 ${fqEsc(p.category || '-')}</span>`}
                ${p.isPrivate ? '<span class="fq-post-private-icon">🔒</span>' : ''}
              </div>
              <div class="fq-post-subject">${fqEsc(p.subject)}</div>
            </div>
            <span class="fq-post-status ${p.status}">${p.status === 'answered' ? '✓ 답변완료' : '대기'}</span>
          </div>
          <div class="fq-post-body">${canSeeBody ? fqRenderText(p.body) : '🔒 비밀글입니다. <span style="color:var(--fq-muted);font-size:12px;">관리자 또는 작성 본인만 열람할 수 있습니다.</span>'}</div>
          ${fqRenderPostAttachments(p, canSeeBody)}
          ${p.answer ? `
            <div class="fq-post-answer">
              <div class="fq-post-answer-head">✓ 답변 — ${p.answerBy || '관리자'} · ${new Date(p.answeredAt).toLocaleString('ko')}</div>
              ${fqRenderText(p.answer)}
            </div>` : ''}
          ${canManage ? `
          <div class="fq-post-actions">
            <button class="fq-btn accent" onclick="fqRequestReply('${p.id}')">${p.answer ? '✏️ 답변 수정' : '✏️ 답글 작성'}</button>
            <button class="fq-btn danger" onclick="fqDeletePost('${p.id}')">🗑 삭제</button>
          </div>
          <div class="fq-answer-form" id="fqAnsForm-${p.id}">
            <textarea id="fqAnsText-${p.id}" placeholder="답변 내용 입력... (저장하면 FAQ에도 자동 등록됩니다)">${fqEsc(p.answer || '')}</textarea>
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

// 담당자: 게시판 문의의 카테고리 변경 (저장 + 공용 동기화 + 리포트 통계 반영)
async function fqChangePostCat(id, cat) {
  const p = fqPosts.find(x => x.id === id);
  if (!p || p.category === cat) return;
  // 관리자 권한 회원만 카테고리 변경 가능
  if (!((typeof dgIsAdmin === 'function' && dgIsAdmin()) || fqAdminMode)) {
    fqToast('관리자 권한이 있는 회원만 변경할 수 있습니다', 'warn'); fqRenderPosts(); return;
  }
  p.category = cat;
  fqSavePosts();
  fqRenderPosts();
  if (typeof fqReportRender === 'function') fqReportRender();
  try { await fqPushPostsRemote(); fqToast('✓ 카테고리 변경 저장됨', 'success'); }
  catch (e) { fqToast('카테고리 저장 실패(로컬만 반영): ' + e.message, 'warn'); }
}

async function fqUnlockPost(evt, id) {
  evt.stopPropagation();
  const post = fqPosts.find(p => p.id === id);
  if (!post) return;
  const pwd = prompt('이 글의 비밀번호 (담당자는 1234 입력 시 모든 비밀글 열람):');
  if (!pwd) return;
  // 담당자 마스터 비밀번호(1234) → 모든 비밀글 열람·답글 허용
  if (pwd === FQ_CONFIG.REPLY_PWD) {
    sessionStorage.setItem('fq_reply_ok', '1');
    fqRenderPosts();
    fqToast('✓ 담당자 인증 — 비밀글 열람/답글 가능', 'success');
    return;
  }
  const hash = await fqHash(pwd);
  if (hash === post.pwdHash) {
    sessionStorage.setItem('fq_unlocked_' + id, '1');
    fqRenderPosts();
    fqToast('✓ 잠금 해제됨', 'success');
  } else {
    fqToast('✗ 비밀번호 불일치', 'warn');
  }
}

// 답글 작성 요청 — 관리자 권한 회원만(비밀번호 기능 제거)
function fqRequestReply(id) {
  if (!((typeof dgIsAdmin === 'function' && dgIsAdmin()) || fqAdminMode)) {
    fqToast('관리자 권한이 있는 회원만 답변할 수 있습니다', 'warn'); return;
  }
  fqOpenAnswerForm(id);
}
function fqOpenAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.add('open');
}
function fqCloseAnswerForm(id) {
  document.getElementById('fqAnsForm-' + id).classList.remove('open');
}
async function fqSaveAnswer(id) {
  const text = document.getElementById('fqAnsText-' + id).value.trim();
  if (!text) { fqToast('답변 내용 필요', 'warn'); return; }
  // 작성 권한 재확인 — 관리자 권한 회원만
  if (!((typeof dgIsAdmin === 'function' && dgIsAdmin()) || fqAdminMode)) {
    fqToast('관리자 권한이 있는 회원만 답변할 수 있습니다', 'warn'); return;
  }
  const post = fqPosts.find(p => p.id === id);
  if (!post) return;
  const answerBy = prompt('답변자 (예: 운항팀, 이원태 차장):', post.answerBy || '담당자') || '담당자';
  post.answer = text;
  post.answeredAt = new Date().toISOString();
  post.answerBy = answerBy;
  post.status = 'answered';
  fqSavePosts();
  await fqPushPostsRemote();   // 답변 반영(게시판 전체 행 저장)
  // 문의 + 답변을 FAQ 공용 DB로 자동 등록
  await fqAddBoardAnswerToFaq(post);
  fqCloseAnswerForm(id);
  fqRenderPosts();
  fqToast(fqRemoteOK ? '✓ 답변 등록 + FAQ 자동 반영 (전체 공유)' : '✓ 답변 등록 (로컬)', 'success');
}

// FAQ 카테고리 보장 (없으면 추가)
function fqEnsureCategory(cat) {
  FQ_FAQ_DATA.categories = FQ_FAQ_DATA.categories || [];
  if (!FQ_FAQ_DATA.categories.includes(cat)) FQ_FAQ_DATA.categories.push(cat);
}

// FAQ 항목을 로컬(즉시) + 공용 DB에 등록/갱신
async function fqUpsertFaqItem(item) {
  FQ_FAQ_DATA.items = FQ_FAQ_DATA.items || [];
  const i = FQ_FAQ_DATA.items.findIndex(x => x.id === item.id);
  if (i >= 0) {
    FQ_FAQ_DATA.items[i] = item;                 // 동일 항목 갱신
  } else if (fqIsDupQuestion(item.q, item.id)) {
    fqToast('이미 유사한 문의가 있어 등록을 건너뜁니다', 'warn');
    return false;                                // 중복이면 등록 안 함
  } else {
    FQ_FAQ_DATA.items.push(item);                // 뒤에 추가 (메인 FAQ 목록엔 노출 안 됨)
  }
  fqSaveFaq();
  if (typeof fqRenderFaq === 'function') fqRenderFaq();
  await fqPushFaqRemote();   // 공용 DB 저장
  return true;
}

// 게시판 답변 → FAQ DB 자동 축적 (AI 문의·중복검사에 활용 / 메인 FAQ 목록엔 노출 안 함, 게시판 탭에서 확인)
async function fqAddBoardAnswerToFaq(post) {
  const faqId = 'faq_brd_' + post.id;
  // 비밀글은 본문(문의 내용)을 공개하지 않고 제목+답변만 등록
  const bodyPart = (!post.isPrivate && post.body) ? ('**문의 내용**\n' + post.body + '\n\n**답변**\n') : '';
  const item = {
    id: faqId, cat: fqClassifyKeyword(post.subject + '\n' + (post.body || '') + '\n' + post.answer),
    q: post.subject, a: bodyPart + post.answer,
    tags: ['게시판', post.category, post.answerBy].filter(Boolean), source: 'board'
  };
  await fqUpsertFaqItem(item);
}

async function fqDeletePost(id) {
  if (!confirm('이 문의를 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
  fqPosts = fqPosts.filter(p => p.id !== id);
  // 연동된 게시판 FAQ 항목도 함께 제거
  FQ_FAQ_DATA.items = (FQ_FAQ_DATA.items || []).filter(x => x.id !== 'faq_brd_' + id);
  fqSavePosts();
  fqSaveFaq();
  fqRenderPosts();
  fqRenderFaq();
  // 공용 DB 반영 (글 + FAQ 전체 행 저장)
  await fqPushPostsRemote();
  await fqPushFaqRemote();
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
// ════════════════════════════════════════════════════════════════
//   사용자 로그인 / 회원가입 / 승인 (클라이언트 소프트 인증)
//   저장: Supabase inquiry_state id='members' (publishable 키, fqRemoteGet/Set 재사용)
//   ⚠️ 정적 사이트 소프트 게이트 — 일반 사용자 차단·회원관리·자동입력용(완전한 접근제어 아님)
// ════════════════════════════════════════════════════════════════
const DG_AUTH_KEY = 'dg_auth_user_v1';
const DG_APPROVE_PWD = '1234';      // 회원가입 승인 비밀번호
const DG_ADMIN_IDS = ['wtlee'];     // 내장 관리자 ID(가입 시 자동 승인+관리자, 로그인 시 항상 관리자)
let dgMembers = [];
let dgCurrentUser = null;

function dgIsAuthed() { return !!dgCurrentUser; }
function dgIsAdminId(id) { return DG_ADMIN_IDS.includes(String(id || '').toLowerCase()); }
function dgIsAdmin() { return !!dgCurrentUser && (dgCurrentUser.role === 'admin' || dgIsAdminId(dgCurrentUser.id)); }

async function dgLoadMembers() {
  try { const data = await fqRemoteGet('members'); dgMembers = Array.isArray(data.members) ? data.members : []; }
  catch (e) { dgMembers = []; }
}
async function dgSaveMembers() { await fqRemoteSet('members', { members: dgMembers }); }

function dgRestoreSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(DG_AUTH_KEY) || 'null');
    if (saved && saved.id) {
      const m = dgMembers.find(x => x.id === saved.id && x.status === 'approved');
      if (m) dgCurrentUser = { id: m.id, company: m.company, name: m.name, role: (m.role === 'admin' || dgIsAdminId(m.id)) ? 'admin' : 'general' };
      else { dgCurrentUser = null; localStorage.removeItem(DG_AUTH_KEY); }
    }
  } catch (e) { dgCurrentUser = null; }
}

async function dgLogin(id, pw) {
  id = (id || '').trim();
  if (!id || !pw) { fqToast('ID와 비밀번호를 입력하세요', 'warn'); return; }
  await dgLoadMembers();
  const m = dgMembers.find(x => String(x.id).toLowerCase() === id.toLowerCase());
  if (!m) { fqToast('등록되지 않은 ID입니다', 'warn'); return; }
  if (m.status !== 'approved') { fqToast('아직 승인되지 않은 계정입니다 (관리자 승인 대기 중)', 'warn'); return; }
  if (await fqHash(pw) !== m.pwdHash) { fqToast('비밀번호가 일치하지 않습니다', 'warn'); return; }
  dgCurrentUser = { id: m.id, company: m.company, name: m.name, role: (m.role === 'admin' || dgIsAdminId(m.id)) ? 'admin' : 'general' };
  localStorage.setItem(DG_AUTH_KEY, JSON.stringify(dgCurrentUser));
  if (typeof dgApplyReportAccess === 'function') dgApplyReportAccess();
  dgUpdateAuthUI(); dgCloseModals(); dgAutofillForms();
  fqToast('✓ ' + (m.name || m.id) + '님 로그인되었습니다', 'success');
}

function dgLogout() {
  dgCurrentUser = null;
  localStorage.removeItem(DG_AUTH_KEY);
  dgUpdateAuthUI();
  if (typeof activateTab === 'function') activateTab('tab-home');
  fqToast('로그아웃되었습니다', 'success');
}

async function dgSignup(company, name, id, pw) {
  company = (company || '').trim(); name = (name || '').trim(); id = (id || '').trim();
  if (!company || !name || !id || !pw) { fqToast('모든 항목을 입력하세요', 'warn'); return; }
  if (pw.length < 4) { fqToast('비밀번호는 4자 이상이어야 합니다', 'warn'); return; }
  await dgLoadMembers();
  if (dgMembers.some(x => String(x.id).toLowerCase() === id.toLowerCase())) { fqToast('이미 사용 중인 ID입니다', 'warn'); return; }
  const isAdminId = dgIsAdminId(id);
  dgMembers.push({ id, company, name, pwdHash: await fqHash(pw),
    role: isAdminId ? 'admin' : 'general',
    status: isAdminId ? 'approved' : 'pending',
    createdAt: new Date().toISOString(), approvedAt: isAdminId ? new Date().toISOString() : null });
  try { await dgSaveMembers(); }
  catch (e) { fqToast('가입 요청 저장 실패: ' + e.message, 'warn'); return; }
  dgCloseModals();
  ['dgSuCompany', 'dgSuName', 'dgSuId', 'dgSuPw'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
  if (typeof dgUpdateMemberBadge === 'function') dgUpdateMemberBadge();
  fqToast(isAdminId ? '✓ 관리자 계정으로 가입·승인 완료 — 바로 로그인하세요' : '✓ 가입 요청이 접수되었습니다 — 관리자 승인 후 로그인할 수 있습니다', 'success');
}

async function dgApprove(id) {
  if (!dgIsAdmin()) { fqToast('관리자만 승인할 수 있습니다', 'warn'); return; }
  await dgLoadMembers();
  const m = dgMembers.find(x => x.id === id);
  if (!m) { fqToast('대상을 찾을 수 없습니다', 'warn'); dgRenderMembers(); return; }
  m.status = 'approved'; m.approvedAt = new Date().toISOString();
  try { await dgSaveMembers(); fqToast('✓ ' + (m.name || m.id) + ' 승인 완료 — 이제 로그인할 수 있습니다', 'success'); }
  catch (e) { fqToast('승인 저장 실패: ' + e.message, 'warn'); }
  dgRenderMembers();
}

async function dgDeleteMember(id) {
  if (!dgIsAdmin()) { fqToast('관리자만 삭제할 수 있습니다', 'warn'); return; }
  if (!confirm('이 회원을 삭제하시겠습니까?')) return;
  await dgLoadMembers();
  dgMembers = dgMembers.filter(x => x.id !== id);
  try { await dgSaveMembers(); fqToast('회원이 삭제되었습니다', 'success'); }
  catch (e) { fqToast('삭제 저장 실패: ' + e.message, 'warn'); }
  dgRenderMembers();
}

// ── UI ──
// ═══ 회원별 AI 문의 일일 횟수 제한 (토큰 절약) ═══
const DG_AI_LIMIT = 20;                       // 일반 회원 하루 AI 문의 허용 횟수
const DG_AI_ADMIN_LIMIT = 20;                 // 관리자 하루 AI 문의 허용 횟수
const DG_AI_USAGE_KEY = 'dg_ai_usage_v1';
function dgAiLimitForCurrent() { return ((typeof dgIsAdmin === 'function') && dgIsAdmin()) ? DG_AI_ADMIN_LIMIT : DG_AI_LIMIT; }
function dgAiUsageData() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(DG_AI_USAGE_KEY) || '{}'); } catch (e) {}
  const today = (typeof fqTodayStr === 'function') ? fqTodayStr() : new Date().toISOString().slice(0, 10);
  if (!d || d.date !== today) d = { date: today, counts: {} };   // 날짜 바뀌면 자동 초기화
  if (!d.counts) d.counts = {};
  return d;
}
function dgAiUsedCount(userId) { return dgAiUsageData().counts[userId] || 0; }
function dgAiCanUse(userId) { return dgAiUsedCount(userId) < dgAiLimitForCurrent(); }
function dgAiIncUsage(userId) {
  const d = dgAiUsageData();
  d.counts[userId] = (d.counts[userId] || 0) + 1;
  try { localStorage.setItem(DG_AI_USAGE_KEY, JSON.stringify(d)); } catch (e) {}
  dgUpdateAiUsageUI();
}
// 사이드바 계정정보 — 이름 옆 'AI n/10' 표시 갱신
function dgUpdateAiUsageUI() {
  const el = document.getElementById('dgAiUsage');
  if (!el) return;
  const u = (typeof dgCurrentUser !== 'undefined' && dgCurrentUser) ? dgCurrentUser : null;
  if (!u || !u.id) { el.textContent = ''; el.hidden = true; return; }
  const used = dgAiUsedCount(u.id);
  const lim = dgAiLimitForCurrent();
  el.hidden = false;
  el.textContent = 'AI ' + used + '/' + lim;
  el.classList.toggle('dg-ai-over', used >= lim);
  el.title = '오늘 사용한 AI 문의 ' + used + '회 / 하루 한도 ' + lim + '회';
}
function dgUpdateAuthUI() {
  // 우측상단(언어 버튼 옆) 로그인 표시
  const top = document.getElementById('dgTopUser');
  if (top) {
    if (dgCurrentUser) { top.hidden = false; top.innerHTML = '<span class="dg-top-dot"></span>' + fqEsc(dgCurrentUser.id) + ' 로그인됨'; top.title = fqEsc((dgCurrentUser.name || '') + ' · ' + (dgCurrentUser.company || '')); }
    else top.hidden = true;
  }
  const box = document.getElementById('sidebarAuth');
  if (!box) return;
  if (dgCurrentUser) {
    box.innerHTML =
      '<div class="dg-auth-user" title="' + fqEsc(dgCurrentUser.company || '') + '">👤 <span class="dg-auth-name">' + fqEsc(dgCurrentUser.name || dgCurrentUser.id) + '</span></div>' +
      '<span class="dg-ai-usage" id="dgAiUsage" hidden></span>' +
      '<button type="button" class="dg-auth-btn dg-auth-logout" onclick="dgLogout()">로그아웃</button>';
  } else {
    box.innerHTML =
      '<button type="button" class="dg-auth-btn dg-auth-login" onclick="dgShowLogin()">🔐 로그인</button>' +
      '<button type="button" class="dg-auth-btn dg-auth-signup" onclick="dgShowSignup()">회원가입</button>';
  }
  dgUpdateAiUsageUI();   // 이름 옆 AI 사용횟수 표시 갱신
}
function dgCloseModals() { document.querySelectorAll('.dg-modal').forEach(m => m.hidden = true); }
function dgShowModal(id) { dgCloseModals(); const m = document.getElementById(id); if (m) m.hidden = false; }
function dgShowLogin() { dgShowModal('dgLoginModal'); const i = document.getElementById('dgLoginId'); if (i) setTimeout(() => i.focus(), 60); }
function dgShowSignup() { dgShowModal('dgSignupModal'); const i = document.getElementById('dgSuCompany'); if (i) setTimeout(() => i.focus(), 60); }
function dgShowLoginRequired() { dgShowModal('dgLoginReqModal'); }

function dgAutofillForms() {
  if (!dgCurrentUser) return;
  const c = document.getElementById('fqNpCompany'); if (c && !c.value) c.value = dgCurrentUser.company || '';
  const a = document.getElementById('fqNpAuthor'); if (a && !a.value) a.value = dgCurrentUser.name || '';
}

// ── 회원관리 (관리자 리포트) ──
async function dgRefreshMembers() { await dgLoadMembers(); dgRenderMembers(); }
function dgRenderMembers() {
  const box = document.getElementById('dgMemberList');
  if (!box) return;
  const pending = dgMembers.filter(m => m.status !== 'approved');
  const approved = dgMembers.filter(m => m.status === 'approved');
  const fmt = d => d ? new Date(d).toLocaleString('ko') : '-';
  const isAdm = m => m.role === 'admin' || dgIsAdminId(m.id);
  const row = (m, isPending) =>
    '<div class="dg-mem-row' + (isPending ? ' pending' : '') + '">' +
      '<div class="dg-mem-info"><b>' + fqEsc(m.id) + '</b> ' +
        (isAdm(m) ? '<span class="dg-role-badge admin">👑 관리자</span>' : '<span class="dg-role-badge">일반</span>') +
        ' · ' + fqEsc(m.name || '') + ' · <span class="dg-mem-co">' + fqEsc(m.company || '') + '</span>' +
        '<span class="dg-mem-date">' + (isPending ? '요청 ' + fmt(m.createdAt) : '승인 ' + fmt(m.approvedAt)) + '</span></div>' +
      '<div class="dg-mem-actions">' +
        (isPending ? '<button class="fq-btn primary" data-approve="' + fqEsc(m.id) + '">✅ 승인</button>' : '') +
        (!isPending && !isAdm(m) ? '<button class="fq-btn accent" data-grant="' + fqEsc(m.id) + '">👑 관리자 지정</button>' : '') +
        (!isPending && m.role === 'admin' && !dgIsAdminId(m.id) ? '<button class="fq-btn ghost" data-revoke="' + fqEsc(m.id) + '">관리자 해제</button>' : '') +
        '<button class="fq-btn danger" data-del="' + fqEsc(m.id) + '">삭제</button>' +
      '</div></div>';
  box.innerHTML =
    '<div class="dg-mem-stats">전체 ' + dgMembers.length + '명 · 승인 ' + approved.length + ' · 대기 ' + pending.length + '</div>' +
    '<div class="dg-mem-group-title">⏳ 승인 대기 (' + pending.length + ')</div>' +
    (pending.length ? pending.map(m => row(m, true)).join('') : '<div class="dg-mem-empty">승인 대기 중인 가입 요청이 없습니다.</div>') +
    '<div class="dg-mem-group-title">✅ 승인된 회원 (' + approved.length + ')</div>' +
    (approved.length ? approved.map(m => row(m, false)).join('') : '<div class="dg-mem-empty">승인된 회원이 없습니다.</div>');
  box.querySelectorAll('[data-approve]').forEach(b => b.onclick = () => dgApprove(b.dataset.approve));
  box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => dgDeleteMember(b.dataset.del));
  box.querySelectorAll('[data-grant]').forEach(b => b.onclick = () => dgSetRole(b.dataset.grant, 'admin'));
  box.querySelectorAll('[data-revoke]').forEach(b => b.onclick = () => dgSetRole(b.dataset.revoke, 'general'));
  dgUpdateMemberBadge();
}

// 관리자 권한 부여/해제 (관리자만)
async function dgSetRole(id, role) {
  if (!dgIsAdmin()) { fqToast('관리자만 권한을 변경할 수 있습니다', 'warn'); return; }
  if (!confirm(role === 'admin' ? '이 회원에게 관리자 권한을 부여하시겠습니까?' : '이 회원의 관리자 권한을 해제하시겠습니까?')) return;
  await dgLoadMembers();
  const m = dgMembers.find(x => x.id === id);
  if (!m) { dgRenderMembers(); return; }
  m.role = role;
  try { await dgSaveMembers(); fqToast(role === 'admin' ? '✓ 관리자로 지정되었습니다' : '관리자 권한이 해제되었습니다', 'success'); }
  catch (e) { fqToast('저장 실패: ' + e.message, 'warn'); }
  dgRenderMembers();
}

// 승인 대기 회원이 있으면 사이드바 '관리자 리포트' 메뉴 + '회원관리' 서브탭에 빨간 느낌표
function dgUpdateMemberBadge() {
  const pending = (Array.isArray(dgMembers) ? dgMembers : []).filter(m => m && m.status !== 'approved').length;
  const show = pending > 0;
  const nav = document.getElementById('dgReportAlert');
  if (nav) { nav.hidden = !show; if (show) nav.title = '승인 대기 회원 ' + pending + '명'; }
  const sub = document.getElementById('dgMembersTabAlert');
  if (sub) sub.hidden = !show;
}
// 관리자 리포트 열 때 등 — 최신 회원을 불러와 배지만 갱신
async function dgRefreshMemberBadge() { await dgLoadMembers(); dgUpdateMemberBadge(); }

// 관리자 리포트 접근제어 — 관리자만 모든 서브탭(검토·뉴스·회원관리), 일반회원은 문의통계만
function dgApplyReportAccess() {
  const admin = dgIsAdmin();
  const adminTabs = ['audit', 'news', 'members'];
  document.querySelectorAll('#tab-report [data-rpt]').forEach(b => {
    if (adminTabs.includes(b.dataset.rpt)) b.style.display = admin ? '' : 'none';
  });
  // 문의통계 내 '🔄 새 답변 검토' 도구는 관리자만
  document.querySelectorAll('#tab-report .rpt-audit-bar').forEach(el => { el.style.display = admin ? '' : 'none'; });
  if (!admin) {   // 일반회원: 문의통계만 활성
    document.querySelectorAll('#tab-report [data-rpt]').forEach(b => b.classList.toggle('active', b.dataset.rpt === 'stat'));
    document.querySelectorAll('#tab-report [data-rpt-panel]').forEach(p => p.classList.toggle('active', p.dataset.rptPanel === 'stat'));
  }
}

// ── 바인딩 + 초기화 ──
function dgBindAuth() {
  const ls = document.getElementById('dgLoginSubmit');
  if (ls) ls.addEventListener('click', () => dgLogin(document.getElementById('dgLoginId').value, document.getElementById('dgLoginPw').value));
  const ss = document.getElementById('dgSignupSubmit');
  if (ss) ss.addEventListener('click', () => dgSignup(document.getElementById('dgSuCompany').value, document.getElementById('dgSuName').value, document.getElementById('dgSuId').value, document.getElementById('dgSuPw').value));
  ['dgLoginId', 'dgLoginPw'].forEach(id => { const e = document.getElementById(id); if (e) e.addEventListener('keydown', ev => { if (ev.key === 'Enter') dgLogin(document.getElementById('dgLoginId').value, document.getElementById('dgLoginPw').value); }); });
  document.querySelectorAll('[data-dg-close]').forEach(b => b.addEventListener('click', dgCloseModals));
  document.querySelectorAll('[data-dg-go-login]').forEach(b => b.addEventListener('click', dgShowLogin));
  document.querySelectorAll('[data-dg-go-signup]').forEach(b => b.addEventListener('click', dgShowSignup));
  document.querySelectorAll('.dg-modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) dgCloseModals(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') dgCloseModals(); });
}
async function dgInit() {
  dgBindAuth();
  dgUpdateAuthUI();           // 우선 버튼 표시
  await dgLoadMembers();
  dgRestoreSession();
  dgUpdateAuthUI();           // 세션 복원 후 갱신
  dgAutofillForms();
  dgUpdateMemberBadge();      // 승인 대기 회원 알림
  dgApplyReportAccess();      // 권한별 리포트 서브탭 표시
}

function fqBootstrap() {
  fqInit();
  dgInit();
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

/* ============================================================
   🔥 화재위험 화물 (Fire-Hazard Cargo) — 팀 학습 자료 모듈
   화재·폭발 위험 화물 분류 / 위험성·위험도·사고사례·위험관리·당사규정
   ============================================================ */

// 위험도: 3=매우높음(red) / 2=높음(orange) / 1=주의(amber)
const FIRE_CARGO_CATS = [
  { key: 'all',        label: '전체',            icon: '🗂' },
  { key: 'explosive',  label: '폭발성 1',        icon: '💣' },
  { key: 'flam-gas',   label: '인화성가스 2.1',  icon: '💨' },
  { key: 'gas22',      label: '비인화성가스 2.2', icon: '🟢' },
  { key: 'flam-liquid',label: '인화성액체 3',    icon: '🛢' },
  { key: 'spontaneous',label: '자연발화 4.2',    icon: '🪵' },
  { key: 'oxidizer',   label: '산화성 5.1',      icon: '🧪' },
  { key: 'peroxide',   label: '유기과산화물 5.2', icon: '💥' },
  { key: 'lithium',    label: '리튬배터리 9',     icon: '🔋' },
  { key: 'ev',         label: '전기차·차량 9',    icon: '🚗' }
];

const FIRE_CARGO_DATA = [
  {
    id: 'fc-explosive', cat: 'explosive', level: 3,
    name: '폭발성 물질 (Explosives)', cls: 'Class 1',
    un: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'], unMore: '화약·폭약·뇌관·불꽃류(폭죽)·탄약 등',
    why: [
      '점화·충격·마찰·열에 의해 순간적으로 폭발(폭굉)하며 다량의 가스·열·파편을 방출 — 단순 화재를 넘어 선체·인명에 치명적 손상.',
      '등급에 따라 위험도 차이가 큼: 1.1(대량폭발)·1.2(비산) 위험이 가장 높고, 1.4(경미)·1.5·1.6(극저감도) 순. 적합성그룹(A~S)도 함께 확인 필요.',
      '소량이라도 적재·격리·점화원 관리 실패 시 연쇄 폭발로 확대되며, 일반화물로 오신고(위장)되어 반입되는 위험이 상존.'
    ],
    accidents: [
      "현대상선(HMM) ‘Hyundai Fortune’호 폭발·화재 (2006.3.21, 아덴만/예멘 인근 인도양) — 5,500TEU급 컨테이너선의 선미 화물구역에서 대형 폭발이 발생, 컨테이너 수십 개가 폭발로 바다에 유실되거나 전소되고 선체가 크게 손상됨. 원인은 컨테이너에 실린 미신고·오신고 위험물(불꽃류 등 폭발성 화물 추정)로 지목됨. 승무원 27명은 전원 신속 대피해 인명피해는 없었음.",
      '이처럼 폭발성 화물(불꽃류·폭죽 등)은 일반화물로 위장(오신고)되어 선적되면 적발·관리가 어렵고, 단 한 건의 오신고만으로도 선박 전체에 치명적인 폭발·전손 피해를 줄 수 있음.'
    ],
    manage: [
      'Class 1 전용 신고·승인·전용 적재구역 격리, 점화원·충격·정전기 차단.',
      '정확한 등급(1.1~1.6)·적합성그룹 확인, 미신고·오신고(위장) 적발 시 즉시 반입 거부.'
    ],
    rule: '당사(SKR/HAL) — Class 1 전 등급 사실상 전면 선적 금지. (타사 금지표 기준 KMTC·SM·ONE·완하이·에버그린·TSL·머스크·양밍 모두 금지, HMM은 자사부킹만 허용)',
    refs: [
      { type: 'scholar', label: '📚 폭발물 운송안전 논문', q: 'class 1 explosives maritime transport safety hazard' },
      { type: 'news', label: '📰 위험물 폭발 사고뉴스', q: '위험물 폭발 사고 선박 항만' }
    ]
  },
  {
    id: 'fc-peroxide', cat: 'peroxide', level: 3,
    name: '유기과산화물 (Organic Peroxides)', cls: 'Class 5.2',
    un: ['3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109', '3110'],
    unMore: 'UN3101~3120 계열', queryUn: '3101',
    why: [
      '열적으로 매우 불안정 — 일정 온도(자기가속분해온도, SADT)를 넘으면 스스로 분해하며 발열하는 자기반응성 물질.',
      '가열·충격·마찰·오염에 민감하고, 산화성·인화성을 동반하는 경우가 많아 화재·폭발 위험이 큼.',
      '온도 관리(제어온도/비상온도)가 필요할 만큼 분해 위험이 커, 해상운송 중 통제 실패 시 폭발로 직결.'
    ],
    accidents: [
      "‘YM Mobility’호 폭발 (2024.8.9, 중국 닝보-저우산항 베일룬 3터미널) — 양밍해운 6,589TEU선의 유기과산화물 TBPB(tert-butyl perbenzoate)가, 냉동(리퍼) 컨테이너에 적재됐으나 전원 미연결로 방치되어 한여름 35℃ 환경에서 분해 임계온도 60℃를 초과 → 열폭주(Thermal Runaway).",
      "13:31 자극적 냄새·백색 연기·황색 액체 누출 → 13:46 연쇄 폭발. 주변 컨테이너 6개가 바다로 튕겨나가고 3개 공중분해, 약 1km 밖 건물 유리 파손. 신속 대피로 인명피해는 없었음.",
      "여파 — 선체 해치 코밍·커버 심각 손상, 베일룬 3터미널 폐쇄로 피크시즌 공급망 차질. HMM 등 대형선사가 중국산 유기과산화물 예약·선적 전면 금지/제한, 냉동 위험물(Reefer DG) 신고 검증·전원 모니터링 강화."
    ],
    manage: [
      '제어온도/비상온도 유지 — 리퍼 컨테이너 전원 연결 상태를 선적 전·운송 중 반드시 확인.',
      'DG 신고서(Declaration) 진위·등급(Type B~F)·SADT 검증, 직사광선·고온 노출 회피.',
      '점화원·가연물·산화제와 격리, 누출·이상 징후(냄새·연기) 즉시 보고.'
    ],
    rule: '당사(장금/흥아) Class 5.2 전 품목 전면 선적 금지.',
    refs: [
      { type: 'scholar', label: '📚 유기과산화물 자기분해 논문', q: 'organic peroxide self-accelerating decomposition temperature container fire' },
      { type: 'news', label: "📰 'YM Mobility' 폭발 등 뉴스", q: 'YM Mobility 유기과산화물 컨테이너 폭발 닝보' }
    ]
  },
  {
    id: 'fc-li-ion', cat: 'lithium', level: 3,
    name: '리튬이온 배터리 (2차전지)', cls: 'Class 9',
    un: ['3480', '3481'], queryUn: '3480',
    why: [
      '내부 단락·손상·과충전·과열 시 열폭주 → 고온·유독가스 분출, 일반 소화로 진압이 매우 어려움.',
      '셀 하나의 발화가 인접 셀·화물로 연쇄 전이되며 대형화재로 확대.',
      'SP188로 비위험(9) 처리되는 소형 배터리라도 물량·적재 상태에 따라 화재 위험 상존.'
    ],
    accidents: [
      '2025.1 김해공항 에어부산 항공기 화재 — 기내 휴대 보조배터리(리튬이온) 발화 추정으로 항공기 전소·승객 대피 → 항공기 내 보조배터리 휴대·보관 규제 강화.',
      '전동킥보드·노트북·보조배터리 등 생활 리튬이온 배터리 화재가 국내에서 빈발.'
    ],
    manage: [
      'UN38.3 시험성적서·해상운송 감정서 확인, 본사 승인 제조사 여부 점검.',
      '신품/손상·중고품 구분(손상·결함·폐배터리 금지), 충전율(SOC) 관리, 포장·단락방지.',
      'RFDG(냉동위험물) 조건·적재위치 준수.'
    ],
    rule: '당사 — 본사 승인 제조사(SAMSUNG SDI / LG ENERGY SOLUTION / SK ON) 한정 RFDG 조건 선적 허용. SP188 비위험(9) 3480·3481만 DRY 컨테이너 예외.',
    refs: [
      { type: 'scholar', label: '📚 리튬이온 열폭주 논문', q: 'lithium-ion battery thermal runaway transport safety' },
      { type: 'news', label: '📰 리튬배터리 화재 뉴스', q: '리튬이온 배터리 보조배터리 화재' }
    ]
  },
  {
    id: 'fc-li-metal', cat: 'lithium', level: 3,
    name: '리튬금속 배터리 (1차전지)', cls: 'Class 9',
    un: ['3090', '3091'], queryUn: '3090',
    why: [
      '음극재인 리튬금속이 수분과 접촉 시 폭발 위험. 100% 완충 상태로 출고되어 2차전지보다 열폭주 위험이 높음.',
      '충전 불가(1차전지)로 회수·재활용이 어렵고, 화재 시 소화 불가·유독가스 발생.',
      'SP388 — 1차전지(3090)와 2차전지(3480)가 함께 장착된 기기는 위험도가 더 큰 1차전지 기준으로 3091로 분류.'
    ],
    accidents: [
      '2024.6.24 화성 아리셀 리튬메탈 제조공장 화재 — 불량 배터리가 수분과 반응해 열폭주, 인접 배터리로 연쇄 전이되며 대형화재. 소화 불가·유독가스로 23명 사망의 대형 인명피해.',
      '국내 화재를 계기로 국적선사(장금·흥아·HMM·고려·남성·동영·천경)가 3090/3091을 SP188 비위험 처리 건까지 포함해 전면 금지.'
    ],
    manage: [
      '수분 차단·완충상태 취급 주의, SP388 분류 정확히 적용.',
      '제조사·시험성적서 검증, 손상·중고품 반입 금지.'
    ],
    rule: '당사 — 3090·3091(리튬금속) 전면 선적 금지.',
    refs: [
      { type: 'scholar', label: '📚 리튬금속전지 화재 논문', q: 'lithium metal primary battery fire thermal runaway hazard' },
      { type: 'news', label: '📰 아리셀 화재 등 뉴스', q: '아리셀 리튬배터리 공장 화재 화성' }
    ]
  },
  {
    id: 'fc-ev', cat: 'ev', level: 3,
    name: '전기차 · 리튬배터리 장착 차량', cls: 'Class 9',
    un: ['3556', '3557', '3558'], unMore: '구 UN3171에서 분리', queryUn: '3556', queryUn2: '3557',
    why: [
      '【2026년 분류 변경】 배터리를 장착한 차량은 2026년부터 배터리 종류별로 별도 UN번호로 분리 지정 — UN3556(리튬이온 배터리 차량) / UN3557(리튬금속 배터리 차량) / UN3558(소듐이온 배터리 차량), 모두 Class 9. (기존에는 UN3171 단일 분류였음)',
      '차량 내장 리튬배터리의 열폭주 시 소화 곤란·재발화. 밀폐된 선창(車갑판)에서 대형 전손 위험.',
      '중고·침수·손상 차량은 배터리 결함 위험이 높음.'
    ],
    accidents: [
      'Felicity Ace(2022, 약 4천 대 적재 후 화재·침몰), Fremantle Highway(2023), Morning Midas(2025) 등 자동차운반선(PCTC) 화재 다수.',
      '2024.8 인천 청라 아파트 지하주차장 벤츠 전기차 화재 — 차량 140여 대 피해·주민 대피. 이후 전국 EV 화재 잇따라 정부 배터리 안전대책(인증·충전율 제한 등) 마련 계기.'
    ],
    manage: [
      '충전율(SOC) 50% 미만 유지, 배터리 분리/단자 보호, LOI(적재확인서) 확보.',
      '중고·손상·침수 배터리 차량 금지, IMDG SP962 등 신규 분류 특별규정 확인.'
    ],
    rule: '당사(SKR/HAL) — 신규 분류 UN3556·3557·3558 모두 전면 선적 금지(금지리스트 등재). ※ 구 UN3171(단일분류)은 배터리 분리·SOC 50% 미만·RFDG 조건의 제한 허용이었으나, 2026 재분류 차량은 금지. (다른 선사 — CKL·SITC·TSL 허용 / NSS·DYS: 3556 제한·3557 금지 / HMM·KMTC 금지)',
    refs: [
      { type: 'scholar', label: '📚 전기차 배터리 화재 논문', q: 'electric vehicle battery fire car carrier ship thermal runaway' },
      { type: 'news', label: '📰 전기차 화재 뉴스', q: '전기차 화재 자동차운반선 청라 아파트' },
      { type: 'url', label: '📖 위키백과: Felicity Ace', url: 'https://en.wikipedia.org/wiki/Felicity_Ace' }
    ]
  },
  {
    id: 'fc-charcoal', cat: 'spontaneous', level: 3,
    name: '숯 · 활성탄 (Charcoal / Activated Carbon)', cls: 'Class 4.2',
    un: ['1361', '1362'], queryUn: '1361',
    why: [
      '수분·온도에 의한 자기발열(Self-heating)로 컨테이너·선내 화재 유발(자연발화성).',
      '항차당 다량(20~30대) 선적되어 현지 전수검사 불가, 화재 시 소화가 어려워 화물·선박 전손 위험.'
    ],
    accidents: [
      '당사(장금/흥아) 2018년 CHARLIE호, 2022년 MANILA VOYAGER호 화재 — 인증서·포장사진을 받고 선적했으나 실제로는 쿨링·포장조건 위반으로 발화.',
      '2026년 광양항에서 천경해운(CK Line) 숯 화물 관련 화재 발생 → 천경해운 숯·활성탄 DG·Non-DG 불문 전면 금지로 강화.',
      'IMDG 2026.1 개정으로 용기규정 강화(낙하·겹침시험 통과 4G 골판지 의무, 진공포장 불인정). 국내 유통 숯의 약 98%가 수입품.'
    ],
    manage: [
      '인증서·쿨링·포장조건(4G 박스) 현지 점검, 적재 전 온도 확인.',
      '습기·열원 회피, 의심 화물 운항팀(DG센터) 사전 확인.'
    ],
    rule: '당사 — 모든 숯(CHARCOAL)·활성탄 전면 선적 금지. (KMTC·TSL·HMM·CKL·NSS/DYS 금지 / SITC 허용)',
    refs: [
      { type: 'scholar', label: '📚 숯 자기발열 논문', q: 'charcoal self-heating spontaneous combustion shipping container' },
      { type: 'news', label: '📰 숯 화물 화재 뉴스', q: '숯 목탄 컨테이너 선박 화재' }
    ]
  },
  {
    id: 'fc-oxidizer', cat: 'oxidizer', level: 3,
    name: '산화성 물질 — 질산암모늄 · 과탄산나트륨 등', cls: 'Class 5.1',
    un: ['1942', '2067', '3378', '1479'], unMore: '질산암모늄·질안비료·과탄산나트륨 등', queryUn: '1942', queryUn2: '3378',
    why: [
      '스스로 산소를 방출해 다른 물질의 연소를 강하게 촉진(산화성). 자체로는 잘 안 타지만 가연물·연료와 만나면 폭발적 연소를 일으킴.',
      '질산암모늄(UN1942)은 다량 저장·고온·오염·밀폐 조건에서 분해→폭굉으로 이어질 수 있는 대표적 산화성 폭발 위험물질(질안비료 UN2067 포함).',
      '과탄산나트륨(UN3378) 등은 수분과 반응해 산소 방출·발열이 가속될 수 있어 보관·격리·방습이 중요.'
    ],
    accidents: [
      '2020 베이루트항 폭발 — 부두 창고에 장기 방치된 질산암모늄(UN1942 계열) 약 2,750t이 인근 화재로 폭발, 항만·도심 궤멸·200여 명 사망·6천여 명 부상. 산화성 물질 대량 보관·관리 실패의 대표 참사.',
      '2015 톈진항 대폭발 — 질산암모늄 등 산화성·위험물 혼적·관리 부실로 연쇄 대폭발, 170여 명 사망.',
      '1947 텍사스시티(질산암모늄 비료 선적 화물선 폭발, 581명 사망) 등 질산암모늄 해상·항만 폭발 사고가 역사적으로 반복.',
      '과탄산나트륨(세탁·표백제 원료) 컨테이너 발열·화재 사례 — 수분 유입·가연물 혼재 시 위험 (사내 「과탄산나트륨 사고 자료」 참조).'
    ],
    manage: [
      '가연물·인화성 물질·열원과 철저히 격리, 수분 차단·건조·환기 유지, 대량·장기 보관 금지.',
      'IMDG 등급·포장기준 준수, 신고(품명·등급) 검증, 오신고 차단.'
    ],
    rule: '당사(SKR/HAL) — 질산암모늄(UN1942)·질안비료(UN2067)·과탄산나트륨(UN3378) 등 선적 금지. 선적 전 운항팀(DG센터) 확인 필요. (산화성 5.1 ↔ 유기과산화물 5.2 혼동 주의)',
    refs: [
      { type: 'scholar', label: '📚 질산암모늄 폭발위험 논문', q: 'ammonium nitrate explosion hazard storage decomposition' },
      { type: 'news', label: '📰 질산암모늄 폭발 뉴스', q: '질산암모늄 폭발 사고' },
      { type: 'url', label: '📖 위키백과: 2020 베이루트 폭발', url: 'https://en.wikipedia.org/wiki/2020_Beirut_explosion' }
    ]
  },
  {
    id: 'fc-flam-liquid', cat: 'flam-liquid', level: 2,
    name: '인화성 액체 (Flammable Liquids)', cls: 'Class 3',
    un: ['1090', '1263', '1170', '1219', '1089', '1993'], unMore: '아세톤·페인트·알코올·아세트알데히드 등', queryUn: '1090', queryUn2: '1263',
    why: [
      '낮은 인화점(Flash Point)으로 상온에서도 인화성 증기를 발생 — 점화원과 만나면 즉시 발화. 위험도는 인화점·끓는점에 따라 PG I(인화점<23℃·초기끓는점≤35℃) > PG II(인화점<23℃) > PG III(인화점 23~60℃) 순.',
      '증기가 공기와 폭발성 혼합기를 형성하고 바닥으로 퍼지며, 정전기·마찰로도 발화. 인화점이 매우 낮은 품목(F.P −18℃ 이하)은 위험이 특히 큼.',
      'DG 신고 화물 중 물동량이 가장 많은 클래스(예: 아세톤 UN1090) — 빈번한 취급만큼 누출·발화 노출 빈도도 높음.'
    ],
    accidents: [
      '컨테이너 내 인화성 액체(페인트·신너·알코올·접착제) 누출·증기 축적 후 정전기·열에 의한 화재가 해상운송에서 다수 보고됨.',
      '저인화점 품목의 위험성 때문에, 타사 금지표상 에버그린·TSL·완하이는 인화점이 낮은 Class 3 품목(예: 아세트알데히드 UN1089, 펜탄 UN1265 등) 다수를 선적 금지.'
    ],
    manage: [
      '용기 밀폐·누출 점검, 점화원·정전기 차단, 환기·온도(직사광선) 관리.',
      '산화성 물질(5.1)·과산화물(5.2)·발화원과 격리, 포장등급(PG)·IMDG 기준 준수.',
      '인화점이 매우 낮은 품목은 선사·포트별 제한이 상이하므로 선적 전 확인.'
    ],
    rule: '당사(SKR/HAL) — IMDG 기준 준수 선적이 원칙(페인트 UN1263 등 다수 허용, 아세톤 UN1090은 제한 조건). 일부 저인화점 품목은 신규 선적금지 검토 중(Q). 타사 — 에버그린·TSL·완하이는 저인화점 Class 3 다수 금지, 선사별 차이 큼.',
    refs: [
      { type: 'scholar', label: '📚 인화성 액체 화재 논문', q: 'flammable liquid container fire flash point marine transport' },
      { type: 'news', label: '📰 인화성 액체 화재 뉴스', q: '인화성 액체 신너 컨테이너 화재' }
    ]
  },
  {
    id: 'fc-flam-gas', cat: 'flam-gas', level: 3,
    name: '인화성 가스 · 에어로졸', cls: 'Class 2.1',
    un: ['1978', '1075', '1011', '1950', '1971'], unMore: '프로판·LPG·부탄·에어로졸·천연가스 등', queryUn: '1978',
    why: [
      '누출 시 공기와 폭발성 혼합기를 형성, 작은 점화원에도 폭발·화염 분출. 고압 액화가스는 가열 시 용기 파열(BLEVE)로 대형 폭발.',
      '공기보다 무거운 가스(프로판·부탄)는 바닥·선창 저지대에 고여 점화 위험이 지속.',
      '에어로졸(UN1950)은 다량 적재 시 가열·낙하로 연쇄 파열·화재로 확대.'
    ],
    accidents: [
      '에어로졸·LPG 등 인화성 가스 용기의 가열·누출에 의한 컨테이너 폭발·화재 사례 다수. 냉동·고온 노출 구간에서 위험 증가.'
    ],
    manage: [
      '밸브·용기 상태 점검, 직사광선·고온 회피, 점화원 차단, 환기·적재격리 확보.',
      '포장·표시(라벨) 기준 준수, 선사·포트 제한 확인.'
    ],
    rule: '당사(SKR/HAL) — 일부 인화성 가스 UN 선적 금지(예: 프로판 UN1978, 디메틸아민 UN1032, 라이터 UN1057 등)하며, 추가 품목 신규금지 검토 중(Q). 타사 — 선사별 금지 품목 상이.',
    refs: [
      { type: 'scholar', label: '📚 인화성 가스 BLEVE 논문', q: 'flammable gas LPG BLEVE container ship transport' },
      { type: 'news', label: '📰 가스 폭발 사고뉴스', q: '가스 누출 폭발 BLEVE 에어로졸' }
    ]
  },
  {
    id: 'fc-gas22', cat: 'gas22', level: 2,
    name: '비인화성·비독성 가스 (산화성 가스 포함)', cls: 'Class 2.2',
    un: ['1013', '1072', '2455', '1003'], unMore: '이산화탄소·산소·아산화질소 등', queryUn: '1013',
    why: [
      '자체 인화성은 없으나, 산화성 가스(산소 UN1072·아산화질소 등)는 다른 물질의 연소를 강하게 촉진해 작은 불씨도 큰 화재로 키움.',
      '고압·가열 시 용기 파열(물리적 폭발) 위험, 밀폐공간 다량 누출 시 질식.'
    ],
    accidents: [
      '산소 등 산화성 가스 누출 시 주변 화재가 급격히 확대된 사례, 고압 가스용기 파열·비산 사고.'
    ],
    manage: [
      '고압용기 상태·밸브 점검, 가열·충격 방지, 산화성 가스는 가연물·유증기와 격리.',
      '환기 확보, 포장·표시 기준 준수.'
    ],
    rule: '당사(SKR/HAL) — 대부분 허용하나 일부 UN은 신규금지 검토(Q). 운송 금지 물질(예: 메틸 나이트라이트 UN2455)은 전 선사 금지. (KMTC는 다수 금지)',
    refs: [
      { type: 'scholar', label: '📚 산화성 가스 위험 논문', q: 'oxidizing gas oxygen cylinder fire hazard' },
      { type: 'news', label: '📰 고압가스 사고뉴스', q: '산소 고압가스 용기 폭발 파열' }
    ]
  }
];

let fireCargoCat = 'all';
let fireCargoImages = {};      // { itemId: [ { src, caption, type, ts } ] } — Supabase 공유 저장
let fireCargoImgLoaded = false;
let fireCargoImgTarget = null; // 업로드 대상 itemId

// 참고자료 링크 생성 — type: scholar(논문검색) / news(사고뉴스) / url(직접링크)
function fireCargoRefUrl(r) {
  if (r.type === 'scholar') return 'https://scholar.google.com/scholar?q=' + encodeURIComponent(r.q || '');
  if (r.type === 'news') return 'https://news.google.com/search?q=' + encodeURIComponent(r.q || '') + '&hl=ko&gl=KR&ceid=KR:ko';
  return r.url || '#';
}
function fireCargoRefsHtml(it) {
  const refs = it.refs || [];
  if (!refs.length) return '';
  return `
    <div class="fc-block fc-block-ref">
      <div class="fc-block-title">📎 참고자료 · 논문 · 사고뉴스</div>
      <div class="fc-refs">
        ${refs.map(r => `<a class="fc-ref" href="${fireCargoRefUrl(r)}" target="_blank" rel="noopener">${escapeHtml(r.label)} ↗</a>`).join('')}
      </div>
    </div>`;
}

function fireCargoLevelInfo(level) {
  if (level >= 3) return { cls: 'lv3', label: '위험도 매우높음' };
  if (level === 2) return { cls: 'lv2', label: '위험도 높음' };
  return { cls: 'lv1', label: '위험도 주의' };
}

function renderFireCargo() {
  const chips = document.getElementById('fireCargoChips');
  if (chips && !chips.dataset.ready) {
    chips.innerHTML = FIRE_CARGO_CATS.map(c =>
      `<button type="button" class="fc-chip${c.key === fireCargoCat ? ' active' : ''}" data-cat="${c.key}" onclick="fireCargoSetCat('${c.key}')">${c.icon} ${escapeHtml(c.label)}</button>`
    ).join('');
    chips.dataset.ready = '1';
  }
  fireCargoApply();
  fireCargoSyncImages();   // 공유 이미지 동기화 (최초 1회 + 갱신)
}

// Supabase(id='firecargo')에서 공유 이미지 로드 후 갤러리 갱신
async function fireCargoSyncImages() {
  try {
    const data = await fqRemoteGet('firecargo');
    fireCargoImages = (data && data.images) || {};
    fireCargoImgLoaded = true;
    // 현재 펼쳐진 카드 상태 유지하며 갤러리만 다시 그림
    const openIds = [...document.querySelectorAll('#fireCargoList .fc-card.open')].map(c => c.id);
    fireCargoApply();
    openIds.forEach(id => { const c = document.getElementById(id); if (c) { c.classList.add('open'); const h = c.querySelector('.fc-card-head'); if (h) h.setAttribute('aria-expanded', 'true'); } });
  } catch (_) { /* 네트워크 실패 시 무시 (로컬/오프라인) */ }
}

function fireCargoSetCat(key) {
  fireCargoCat = key;
  document.querySelectorAll('#fireCargoChips .fc-chip').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === key));
  fireCargoApply();
}

function fireCargoApply() {
  const listEl = document.getElementById('fireCargoList');
  const statsEl = document.getElementById('fireCargoStats');
  if (!listEl) return;
  const q = (document.getElementById('fireCargoSearch')?.value || '').trim().toLowerCase();

  const items = FIRE_CARGO_DATA.filter(it => {
    if (fireCargoCat !== 'all' && it.cat !== fireCargoCat) return false;
    if (!q) return true;
    const hay = (it.name + ' ' + it.cls + ' ' + it.un.join(' ') + ' ' + (it.unMore || '') + ' '
      + it.why.join(' ') + ' ' + it.accidents.join(' ') + ' ' + (it.rule || '')).toLowerCase();
    return hay.includes(q);
  });

  if (statsEl) {
    const catLabel = (FIRE_CARGO_CATS.find(c => c.key === fireCargoCat) || {}).label || '전체';
    statsEl.innerHTML = `<span class="fc-stat-badge">📂 ${escapeHtml(catLabel)}</span>`
      + `<span class="fc-stat-count">${items.length}개 화물군</span>`
      + (q ? `<span class="fc-stat-q">검색: "${escapeHtml(q)}"</span>` : '');
  }

  if (!items.length) {
    listEl.innerHTML = `<div class="fc-empty">조건에 맞는 화물이 없습니다. 검색어나 분류를 바꿔보세요.</div>`;
    return;
  }

  listEl.innerHTML = items.map(it => {
    const lv = fireCargoLevelInfo(it.level);
    const unBadges = it.un.map(u => `<span class="fc-un">UN${escapeHtml(u)}</span>`).join('')
      + (it.unMore ? `<span class="fc-un fc-un-more">${escapeHtml(it.unMore)}</span>` : '');
    return `
    <div class="fc-card ${lv.cls}" id="${it.id}">
      <button type="button" class="fc-card-head" onclick="fireCargoToggle('${it.id}')" aria-expanded="false">
        <div class="fc-card-headmain">
          <div class="fc-card-title">${escapeHtml(it.name)}</div>
          <div class="fc-card-meta"><span class="fc-cls">${escapeHtml(it.cls)}</span> ${unBadges}</div>
        </div>
        <div class="fc-card-right">
          <span class="fc-level ${lv.cls}">${lv.label}</span>
          <span class="fc-caret">▾</span>
        </div>
      </button>
      <div class="fc-card-body">
        <div class="fc-block">
          <div class="fc-block-title">⚠️ 위험성 (왜 위험한가)</div>
          <ul>${it.why.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
        </div>
        <div class="fc-block fc-block-accident">
          <div class="fc-block-title">🔥 주요 사고사례</div>
          <ul>${it.accidents.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
        </div>
        <div class="fc-block">
          <div class="fc-block-title">🛡️ 위험관리 방법</div>
          <ul>${it.manage.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
        </div>
        <div class="fc-rule"><b>📌 당사(SKR/HAL) 규정</b> ${escapeHtml(it.rule)}</div>
        ${fireCargoRefsHtml(it)}
        ${fireCargoImagesHtml(it.id)}
        ${(it.queryUn || it.queryUn2) ? `<div class="fc-actions">
          ${it.queryUn ? `<button type="button" class="btn accent2" onclick="fireCargoGoCarrier('${it.queryUn}')">▦ UN${escapeHtml(it.queryUn)} 선사별 선적가부 조회</button>` : ''}
          ${it.queryUn2 ? `<button type="button" class="btn accent2" onclick="fireCargoGoCarrier('${it.queryUn2}')">▦ UN${escapeHtml(it.queryUn2)} 선사별 선적가부 조회</button>` : ''}
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function fireCargoToggle(id) {
  const card = document.getElementById(id);
  if (!card) return;
  const open = card.classList.toggle('open');
  const head = card.querySelector('.fc-card-head');
  if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function fireCargoGoCarrier(un) {
  const targetInput = document.getElementById('carrierCheckInput');
  if (!targetInput) return;
  activateTab('tab-carrier-check');
  targetInput.value = un;
  if (typeof checkCarrierLoadingPossibility === 'function') checkCarrierLoadingPossibility();
}

/* ── 사진·도표 갤러리 ── */
function fireCargoIsAdmin() {
  return typeof dgIsAdmin === 'function' && dgIsAdmin();
}

function fireCargoImagesHtml(itemId) {
  const imgs = fireCargoImages[itemId] || [];
  const admin = fireCargoIsAdmin();
  const thumbs = imgs.map((im, idx) => `
    <figure class="fc-thumb">
      <img src="${im.src}" alt="${escapeHtml(im.caption || '관련 이미지')}" loading="lazy" onclick="fireCargoViewImage('${itemId}',${idx})">
      ${im.type ? `<span class="fc-thumb-type">${escapeHtml(im.type)}</span>` : ''}
      ${im.caption ? `<figcaption>${escapeHtml(im.caption)}</figcaption>` : ''}
      ${admin ? `<button type="button" class="fc-thumb-del" title="이미지 삭제" onclick="fireCargoDeleteImage(event,'${itemId}',${idx})">✕</button>` : ''}
    </figure>`).join('');

  if (!imgs.length && !admin) return '';   // 일반 회원에겐 빈 갤러리 숨김
  return `
    <div class="fc-block fc-block-img">
      <div class="fc-block-title">📷 관련 사진·도표 ${imgs.length ? `<span class="fc-img-count">${imgs.length}</span>` : ''}</div>
      <div class="fc-gallery">
        ${thumbs || '<div class="fc-img-empty">등록된 이미지가 없습니다.</div>'}
        ${admin ? `<button type="button" class="fc-img-add" onclick="fireCargoAddImage('${itemId}')">＋<span>사고사진·격리표·포장기준 등 추가</span></button>` : ''}
      </div>
      ${admin ? `<div class="fc-img-hint">관리자만 추가/삭제할 수 있으며, 등록 시 팀원 전체에게 공유됩니다. (이미지는 자동 압축되어 저장)</div>` : ''}
    </div>`;
}

function fireCargoExpandAll(open) {
  document.querySelectorAll('#fireCargoList .fc-card').forEach(c => {
    c.classList.toggle('open', !!open);
    const h = c.querySelector('.fc-card-head');
    if (h) h.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function fireCargoPrint() {
  fireCargoExpandAll(true);                 // 인쇄 전 전체 펼침
  document.body.classList.add('fc-printing');
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove('fc-printing'), 300);
  }, 120);
}

/* ── 이미지 업로드 (관리자) ── */
function fireCargoAddImage(itemId) {
  if (!fireCargoIsAdmin()) { fqToast('관리자만 이미지를 추가할 수 있습니다', 'warn'); return; }
  fireCargoImgTarget = itemId;
  const input = document.getElementById('fireCargoImgInput');
  if (input) { input.value = ''; input.click(); }
}

// canvas 압축 → base64(JPEG). 최대 변 1280px, 품질 0.8
function fireCargoCompress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.onload = () => {
        const MAX = 1280;
        let { width: w, height: h } = img;
        if (w > MAX || h > MAX) { const r = Math.min(MAX / w, MAX / h); w = Math.round(w * r); h = Math.round(h * r); }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function fireCargoHandleImgFile(file) {
  const itemId = fireCargoImgTarget;
  if (!itemId || !file) return;
  if (!/^image\//.test(file.type)) { fqToast('이미지 파일만 첨부할 수 있습니다', 'warn'); return; }
  const list = fireCargoImages[itemId] || [];
  if (list.length >= 8) { fqToast('카드당 이미지는 최대 8장까지입니다', 'warn'); return; }
  fqToast('이미지를 처리 중입니다…', 'info');
  let src;
  try { src = await fireCargoCompress(file); }
  catch (e) { fqToast('이미지 처리 실패: ' + e.message, 'warn'); return; }
  if (src.length > 700000) { fqToast('이미지 용량이 너무 큽니다(압축 후에도 큼). 더 작은 이미지를 사용해 주세요', 'warn'); return; }

  const type = (prompt('이미지 종류를 입력하세요 (예: 사고사진 / 격리표 / 포장기준 / 기타)', '사고사진') || '').trim().slice(0, 12);
  const caption = (prompt('이미지 설명(캡션)을 입력하세요 (선택)', '') || '').trim().slice(0, 80);

  list.push({ src, type, caption, ts: Date.now() });
  fireCargoImages[itemId] = list;
  try {
    await fqRemoteSet('firecargo', { images: fireCargoImages });
    fqToast('이미지가 추가되어 팀원에게 공유되었습니다', 'success');
  } catch (e) {
    list.pop(); fqToast('저장 실패: ' + e.message, 'warn');
  }
  fireCargoApply();
  const c = document.getElementById(itemId); if (c) c.classList.add('open');
}

async function fireCargoDeleteImage(ev, itemId, idx) {
  if (ev) ev.stopPropagation();
  if (!fireCargoIsAdmin()) return;
  if (!confirm('이 이미지를 삭제할까요? (팀원 전체에서 제거됩니다)')) return;
  const list = fireCargoImages[itemId] || [];
  const removed = list.splice(idx, 1);
  fireCargoImages[itemId] = list;
  try {
    await fqRemoteSet('firecargo', { images: fireCargoImages });
    fqToast('이미지를 삭제했습니다', 'success');
  } catch (e) {
    if (removed[0]) list.splice(idx, 0, removed[0]); fqToast('삭제 실패: ' + e.message, 'warn');
  }
  fireCargoApply();
  const c = document.getElementById(itemId); if (c) c.classList.add('open');
}

/* ── 라이트박스 (확대 보기) ── */
function fireCargoViewImage(itemId, idx) {
  const im = (fireCargoImages[itemId] || [])[idx];
  if (!im) return;
  let lb = document.getElementById('fcLightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'fcLightbox';
    lb.className = 'fc-lightbox';
    lb.onclick = () => { lb.classList.remove('open'); };
    document.body.appendChild(lb);
  }
  lb.innerHTML = `
    <div class="fc-lb-inner" onclick="event.stopPropagation()">
      <button type="button" class="fc-lb-close" onclick="document.getElementById('fcLightbox').classList.remove('open')">✕</button>
      <img src="${im.src}" alt="${escapeHtml(im.caption || '')}">
      <div class="fc-lb-cap">${im.type ? `<b>[${escapeHtml(im.type)}]</b> ` : ''}${escapeHtml(im.caption || '')}</div>
    </div>`;
  lb.classList.add('open');
}

// 파일 입력 핸들러 바인딩
(function bindFireCargoImgInput() {
  const bind = () => {
    const input = document.getElementById('fireCargoImgInput');
    if (input && !input.dataset.bound) {
      input.dataset.bound = '1';
      input.addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) fireCargoHandleImgFile(f); });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
