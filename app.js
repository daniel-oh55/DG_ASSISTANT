// --- [1. Supabase 초기화] ---
const SUPABASE_URL = 'https://atqcxiipzhghwoprqljp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cWN4aWlwemhnaHdvcHJxbGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MzgzNDIsImV4cCI6MjA5MzAxNDM0Mn0.F4nACbzg_91_vpHnJMUy42a-uv9og4iOw3buxKPbONU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- [2. 격리 상수 데이터] ---
const DB_CONST = {
    sgg: {
        "SGG1": "acids", "SGG18": "alkalis", "SGG8": "hypochlorites", 
        "SGG10": "liquid halogenated hydrocarbons", "SGG7": "heavy metals", "SGG6": "cyanides"
    },
    sgcode: {
        "SG1": { "type": "", "target": "", "reqSeg": null, "desc": "Segregation as for class 1.3" },
        "SG2": { "type": "CLASS", "target": "1.2G", "desc": "Segregation as for class 1.2G" },
        "SG3": { "type": "CLASS", "target": "1.3G", "desc": "Segregation as for class 1.3G" },
        "SG4": { "type": "CLASS", "target": "2.1", "desc": "Segregation as for class 2.1" },
        "SG5": { "type": "CLASS", "target": "3", "desc": "Segregation as for class 3" },
        "SG6": { "type": "CLASS", "target": "5.1", "desc": "Segregation as for class 5.1" },
        "SG7": { "type": "CLASS", "target": "3", "reqSeg": 1, "desc": "Stow 'away from' class 3" },
        "SG8": { "type": "CLASS", "target": "4.1", "reqSeg": 1, "desc": "Stow 'away from' class 4.1" },
        "SG35": { "type": "SGG", "target": "SGG1", "reqSeg": 2, "desc": "Stow 'separated from' SGG1 (acids)" },
        "SG36": { "type": "SGG", "target": "SGG18", "reqSeg": 2, "desc": "Stow 'separated from' SGG18 (alkalis)" },
        "SG49": { "type": "SGG", "target": "SGG6", "reqSeg": 2, "desc": "Stow 'separated from' SGG6 (cyanides)" }
    },
    segTable: {
        "1.1 1.2 1.5": {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":4,"2.2":2,"2.3":2,"3":4,"4.1":4,"4.2":4,"4.3":4,"5.1":4,"5.2":4,"6.1":2,"6.2":4,"7":2,"8":4,"9":"X"},
        "1.3 1.6": {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":4,"2.2":2,"2.3":2,"3":4,"4.1":3,"4.2":3,"4.3":4,"5.1":4,"5.2":4,"6.1":2,"6.2":4,"7":2,"8":2,"9":"X"},
        "1.4": {"1.1 1.2 1.5":"*","1.3 1.6":"*","1.4":"*","2.1":2,"2.2":1,"2.3":1,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":4,"7":2,"8":2,"9":"X"},
        "2.1": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":"X","2.2":"X","2.3":"X","3":2,"4.1":1,"4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":4,"7":2,"8":1,"9":"X"},
        "2.2": {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":1,"2.1":"X","2.2":"X","2.3":"X","3":1,"4.1":"X","4.2":1,"4.3":"X","5.1":"X","5.2":1,"6.1":"X","6.2":2,"7":1,"8":"X","9":"X"},
        "2.3": {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":1,"2.1":"X","2.2":"X","2.3":"X","3":2,"4.1":"X","4.2":2,"4.3":"X","5.1":"X","5.2":2,"6.1":"X","6.2":2,"7":1,"8":"X","9":"X"},
        "3": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":"X","4.1":"X","4.2":2,"4.3":2,"5.1":2,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":"X","9":"X"},
        "4.1": {"1.1 1.2 1.5":4,"1.3 1.6":3,"1.4":2,"2.1":1,"2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":1,"4.3":"X","5.1":1,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":1,"9":"X"},
        "4.2": {"1.1 1.2 1.5":4,"1.3 1.6":3,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":2,"4.1":1,"4.2":"X","4.3":1,"5.1":2,"5.2":2,"6.1":1,"6.2":3,"7":2,"8":1,"9":"X"},
        "4.3": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":"X","2.3":"X","3":2,"4.1":"X","4.2":1,"4.3":"X","5.1":2,"5.2":2,"6.1":"X","6.2":2,"7":2,"8":1,"9":"X"},
        "5.1": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":"X","2.3":"X","3":2,"4.1":1,"4.2":2,"4.3":2,"5.1":"X","5.2":2,"6.1":1,"6.2":3,"7":1,"8":2,"9":"X"},
        "5.2": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":2,"2.1":2,"2.2":1,"2.3":2,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":2,"5.2":"X","6.1":1,"6.2":3,"7":2,"8":2,"9":"X"},
        "6.1": {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":"X","2.1":"X","2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":1,"4.3":"X","5.1":1,"5.2":1,"6.1":"X","6.2":1,"7":"X","8":"X","9":"X"},
        "6.2": {"1.1 1.2 1.5":4,"1.3 1.6":4,"1.4":4,"2.1":4,"2.2":2,"2.3":2,"3":3,"4.1":3,"4.2":3,"4.3":2,"5.1":3,"5.2":3,"6.1":1,"6.2":"X","7":3,"8":3,"9":"X"},
        "7": {"1.1 1.2 1.5":2,"1.3 1.6":2,"1.4":2,"2.1":2,"2.2":1,"2.3":1,"3":2,"4.1":2,"4.2":2,"4.3":2,"5.1":1,"5.2":2,"6.1":"X","6.2":3,"7":"X","8":2,"9":"X"},
        "8": {"1.1 1.2 1.5":4,"1.3 1.6":2,"1.4":2,"2.1":1,"2.2":"X","2.3":"X","3":"X","4.1":1,"4.2":1,"4.3":1,"5.1":2,"5.2":2,"6.1":"X","6.2":3,"7":2,"8":"X","9":"X"},
        "9": {"1.1 1.2 1.5":"X","1.3 1.6":"X","1.4":"X","2.1":"X","2.2":"X","2.3":"X","3":"X","4.1":"X","4.2":"X","4.3":"X","5.1":"X","5.2":"X","6.1":"X","6.2":"X","7":"X","8":"X","9":"X"}
    }
};

let entries = [];

// 클래스 번호 정규화 (1.1 1.2 1.5 등을 테이블 키와 매칭)
function normalizeClass(cls) {
    if (!cls) return null;
    const s = String(cls).trim();
    const keys = Object.keys(DB_CONST.segTable);
    if (keys.includes(s)) return s;
    for (const k of keys) { if (k.split(' ').includes(s)) return k; }
    return s;
}

// --- [3. 격리 엔진 v2.5] ---
function calcPairSeg(a, b) {
    let maxLevel = 0; 
    let reasons = [];

    const clsA = normalizeClass(a.Class);
    const clsB = normalizeClass(b.Class);

    // 1. 기본 테이블 체크
if (DB_CONST.segTable[clsA] && DB_CONST.segTable[clsA][clsB]) {
        const val = DB_CONST.segTable[clsA][clsB];
        maxLevel = (val === 'X') ? 0 : parseInt(val);
        if (maxLevel > 0) reasons.push(`기본 클래스 격리 (Level ${maxLevel})`);
    }

    // 2. SG Code & SGG 정밀 분석 로직
function evaluateSG(source, target) {
        if (!source.sg_codes) return;
        // SG Code가 여러 개일 수 있으므로 분리하여 처리합니다.
        const codes = String(source.sg_codes).split(/[\s,]+/).filter(Boolean);

        codes.forEach(code => {
            const sg = DB_CONST.sgcode[code];
            if (!sg) return;

            let isMatch = false;
            // 1. SG 코드가 특정 CLASS를 겨냥하는 경우
            if (sg.type === 'CLASS' && normalizeClass(target.Class) === normalizeClass(sg.target)) isMatch = true;
            // 2. SG 코드가 특정 SGG 그룹을 겨냥하는 경우 (이 부분이 요청하신 핵심 로직입니다!)[cite: 4]
            if (sg.type === 'SGG' && target.sgg === sg.target) isMatch = true;

            if (isMatch) {
                // SG2~6처럼 '해당 클래스처럼 격리'하는 경우와 SG7~처럼 '정해진 수치'가 있는 경우 분리
                const currentReq = sg.reqSeg || 0; 
                if (currentReq > maxLevel) {
                    maxLevel = currentReq;
                    reasons.push(`${code}: ${sg.desc}`);
                }
            }
        });
    }

    evaluateSG(a, b); // A의 규정이 B에 적용되는지 확인
    evaluateSG(b, a); // B의 규정이 A에 적용되는지 확인

    return { level: maxLevel, reason: reasons.length > 0 ? reasons[reasons.length - 1] : "격리 규정 없음" };
}

// --- [4. CRUD 및 UI 제어] ---
async function addEntries() {
    const input = document.getElementById('searchInput');
    const rawValues = input.value.split(/[\s,]+/).filter(v => v.trim() !== "");
    if (rawValues.length === 0) return;

    const formattedValues = rawValues.map(v => {
        const clean = v.trim();
        return isNaN(clean) ? clean : clean.padStart(4, '0');
    });

    const { data, error } = await _supabase
        .from('DG_TABLE')
        .select('*') // 모든 컬럼을 가져옵니다.
        .in('UNNO', formattedValues);

    if (error) { alert("DB 호출 오류!"); return; }
    if (data.length === 0) { alert("조회된 UN 번호가 없습니다."); return; }

    data.forEach(item => { 
        if (!entries.some(e => e.UNNO === item.UNNO)) entries.push(item); 
    });
    
    render(); 
    input.value = '';
}

// 개별 삭제 함수
function removeEntry(index) {
    entries.splice(index, 1);
    render();
}

function render() {
    const list = document.getElementById('cardList');
    const panel = document.getElementById('segPanel');

    // 1. entries 배열을 순회하며 각 위험물 데이터(e)를 HTML 문자열로 변환합니다.
    // map() 함수는 배열의 데이터를 하나씩 꺼내어 새로운 형태(HTML)로 조립할 때 사용합니다.
    list.innerHTML = entries.map((e, index) => `
        <div class="result-card">
            <div class="UNNO-badge">${e.UNNO}</div>
            
            <div class="card-fields">
                <!-- 1. CLASS 정보 -->
                <div class="field">
                    <span class="field-label">CLASS</span>
                    <!-- e.Class 값이 없으면 '-'를 출력하도록 논리 연산자(||) 사용 -->
                    <span class="field-value">${e.Class || '-'}</span>
                </div>

                <!-- 2. SUB RISK 정보 추가 -->
                <div class="field">
                    <span class="field-label">SUB RISK</span>
                    <!-- Supabase의 컬럼명이 sub_risk->SUB 라고 가정합니다. (대소문자/언더바 정확히 일치해야 함) -->
                    <span class="field-value sub" style="color: var(--yellow);">${e.SUB || '-'}</span>
                </div>

                <!-- 3. SGG (격리 그룹) 정보 추가 -->
                <div class="field">
                    <span class="field-label">SGG</span>
                    <!-- 태그 형태의 디자인을 위해 tag 클래스 사용 -->
                    <span class="field-value tag">${e.Segregation || '-'}</span>
                </div>

                <!-- 4. SG CODE (특수 격리 규정) 정보 추가 -->
                <div class="field">
                    <span class="field-label">SG CODE</span>
                    <span class="field-value tag sg">${e.Segregation || '-'}</span>
                </div>

                <!-- 5. NAME (정식 명칭) 정보 추가 -->
                <!-- flex: 1을 주어 카드의 남는 우측 공간을 이름이 모두 차지하도록 레이아웃 설계 -->
                <div class="field" style="flex: 1; min-width: 150px;">
                    <span class="field-label">NAME</span>
                    <span class="field-value name" style="font-size: 12px; color: var(--muted); line-height: 1.3;">
                        ${e.Name || '명칭 정보 없음'}
                    </span>
                </div>
            </div>

            <!-- 개별 삭제 버튼 (선택된 카드의 인덱스를 매개변수로 전달) -->
            <button class="remove-btn" onclick="removeEntry(${index})">×</button>
        </div>
    `).join('');

    // 2. 격리 분석 결과 렌더링
    if (entries.length >= 2) {
        let maxOverall = 0; let pairs = [];
        for(let i=0; i<entries.length; i++) {
            for(let j=i+1; j<entries.length; j++) {
                const res = calcPairSeg(entries[i], entries[j]);
                pairs.push({ a: entries[i].UNNO, b: entries[j].UNNO, ...res });
                if(typeof res.level === 'number') maxOverall = Math.max(maxOverall, res.level);
            }
        }
        const status = maxOverall === 0 ? {t:"혼적 가능", c:"var(--green)", i:"✅"} : {t:`격리 필요 (Level ${maxOverall})`, c:"var(--red)", i:"⚠️"};
        
        panel.innerHTML = `
            <div class="seg-panel">
                <div class="seg-panel-header">혼적 분석 결과</div>
                <div class="seg-result-big">
                    <div class="seg-icon">${status.i}</div>
                    <div class="seg-main-text" style="color:${status.c}">${status.t}</div>
                </div>
                <div class="pair-grid">
                    ${pairs.map(p => `
                        <div class="pair-row">
                            <span style="font-weight:700; font-family:'Space Mono';">UN${p.a} ↔ UN${p.b}</span> 
                            <span class="seg-badge s${p.level}">${p.level === 0 ? 'OK' : p.level}</span> 
                            <span style="font-size:12px; color:var(--muted); flex:1">${p.reason}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    } else { panel.innerHTML = ""; }
}

// 이벤트 리스너
document.getElementById('addBtn').addEventListener('click', addEntries);
document.getElementById('clearBtn').addEventListener('click', () => { entries = []; render(); });
document.getElementById('searchInput').addEventListener('keydown', (e) => { if(e.key === 'Enter') addEntries(); });