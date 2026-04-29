// --- [1. Supabase 초기화] ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 실제 Supabase URL로 변경
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 실제 Anon Key로 변경
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- [2. 격리 상수 데이터] ---
const DB_CONST = {
    // SGG 데이터
    sgg: {
        "SGG1": "acids", "SGG18": "alkalis", "SGG8": "hypochlorites", 
        "SGG10": "liquid halogenated hydrocarbons", "SGG7": "heavy metals", "SGG6": "cyanides"
    },
    // SGCODE 규정 정의
    sgcode: {
        "SG2": { "type": "CLASS", "target": "1.2G", "desc": "Segregation as for class 1.2G" },
        "SG3": { "type": "CLASS", "target": "1.3G", "desc": "Segregation as for class 1.3G" },
        "SG4": { "type": "CLASS", "target": "2.1", "desc": "Segregation as for class 2.1" },
        "SG5": { "type": "CLASS", "target": "3", "desc": "Segregation as for class 3" },
        "SG6": { "type": "CLASS", "target": "5.1", "desc": "Segregation as for class 5.1" },
        "SG7": { "type": "CLASS", "target": "3", "reqSeg": 1, "desc": "Stow 'away from' class 3" },
        "SG35": { "type": "SGG", "target": "SGG1", "reqSeg": 2, "desc": "Stow 'separated from' SGG1 (acids)" },
        "SG36": { "type": "SGG", "target": "SGG18", "reqSeg": 2, "desc": "Stow 'separated from' SGG18 (alkalis)" },
        "SG49": { "type": "SGG", "target": "SGG6", "reqSeg": 2, "desc": "Stow 'separated from' SGG6 (cyanides)" }
    },
    // 격리 테이블 매트릭스
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

// --- [3. 헬퍼 함수] ---
function normalizeClass(cls) {
    if (!cls) return null;
    const s = String(cls).trim();
    const keys = Object.keys(DB_CONST.segTable);
    if (keys.includes(s)) return s;
    for (const k of keys) { if (k.split(' ').includes(s)) return k; }
    return s;
}

// --- [4. 격리 엔진 v2.3] ---
function calcPairSeg(a, b) {
    let maxLevel = 0; let reasons = [];
    const clsA = normalizeClass(a.class);
    const clsB = normalizeClass(b.class);

    // [A] 기본 테이블 조회
    if (clsA && clsB && DB_CONST.segTable[clsA]) {
        const val = DB_CONST.segTable[clsA][clsB];
        if (val === '*') return { level: '*', reason: "Class 1 특별 규정 적용" };
        const tableLevel = (val === 'X' || val === undefined) ? 0 : parseInt(val);
        if (tableLevel > maxLevel) { maxLevel = tableLevel; if (tableLevel > 0) reasons.push(`기본 클래스 격리 (Level ${tableLevel})`); }
    }

    // [B] SG CODE 분석 (SG2~SG6 포함)
    function evaluateSG(source, target) {
        if (!source.sg_codes) return;
        const codes = source.sg_codes.split(/\s+/).filter(Boolean);
        codes.forEach(code => {
            const sg = DB_CONST.sgcode[code];
            if (!sg) return;
            // "Segregation as for Class X" (SG2~SG6) 처리
            if (sg.type === 'CLASS' && (sg.reqSeg === null || sg.reqSeg === undefined)) {
                const pseudoClass = normalizeClass(sg.target);
                const targetClass = normalizeClass(target.class);
                if (pseudoClass && targetClass && DB_CONST.segTable[pseudoClass]) {
                    const val = DB_CONST.segTable[pseudoClass][targetClass];
                    const tableLevel = (val === 'X' || val === undefined) ? 0 : parseInt(val);
                    if (tableLevel > maxLevel) { maxLevel = tableLevel; reasons.push(`${code}: ${sg.desc} (Level ${tableLevel})`); }
                }
            } else {
                let isMatch = false;
                if (sg.type === 'CLASS' && normalizeClass(target.class) === normalizeClass(sg.target)) isMatch = true;
                if (sg.type === 'SGG' && target.sgg === sg.target) isMatch = true;
                if (isMatch && sg.reqSeg > maxLevel) { maxLevel = sg.reqSeg; reasons.push(`${code}: ${sg.desc}`); }
            }
        });
    }
    evaluateSG(a, b); evaluateSG(b, a);
    return { level: maxLevel, reason: reasons.length > 0 ? reasons[reasons.length - 1] : "격리 규정 없음" };
}

// --- [5. Supabase 및 UI 제어] ---
async function addEntries() {
    const input = document.getElementById('searchInput');
    const rawValues = input.value.split(/[\s,]+/).filter(v => v.trim() !== "");
    if (rawValues.length === 0) return;

    // Supabase 데이터 호출
    const { data, error } = await _supabase
        .from('dangerous_goods')
        .select('*')
        .in('unno', rawValues.map(v => parseInt(v)));

    if (error) { alert("DB 호출 오류!"); return; }
    data.forEach(item => { if (!entries.some(e => e.unno === item.unno)) entries.push(item); });
    render(); input.value = '';
}

function render() {
    const list = document.getElementById('cardList');
    const panel = document.getElementById('segPanel');

    list.innerHTML = entries.map(e => `
        <div class="result-card">
            <div class="unno-badge">${e.unno}</div>
            <div class="card-fields">
                <div class="field"><span class="field-label">CLASS</span><span class="field-value">${e.class}</span></div>
                <div class="field"><span class="field-label">SGG</span><span class="field-value tag">${e.sgg || '—'}</span></div>
                <div class="field"><span class="field-label">SG CODE</span><span class="field-value tag sg">${e.sg_codes || '—'}</span></div>
                <div class="field" style="flex:1"><span class="field-label">NAME</span><span class="field-value" style="font-size:11px; color:var(--muted)">${e.name}</span></div>
            </div>
        </div>
    `).join('');

    if (entries.length >= 2) {
        let maxOverall = 0; let pairs = [];
        for(let i=0; i<entries.length; i++) {
            for(let j=i+1; j<entries.length; j++) {
                const res = calcPairSeg(entries[i], entries[j]);
                pairs.push({ a: entries[i].unno, b: entries[j].unno, ...res });
                if(typeof res.level === 'number') maxOverall = Math.max(maxOverall, res.level);
            }
        }
        const status = maxOverall === 0 ? {t:"혼적 가능", c:"var(--green)", i:"✅"} : {t:`격리 필요 (Level ${maxOverall})`, c:"var(--red)", i:"⚠️"};
        panel.innerHTML = `
            <div class="seg-panel">
                <div class="seg-panel-header">혼적 분석 결과</div>
                <div class="seg-result-big"><div class="seg-icon">${status.i}</div><div class="seg-main-text" style="color:${status.c}">${status.t}</div></div>
                <div class="pair-grid">${pairs.map(p => `<div class="pair-row"><span style="font-weight:700">UN${p.a} ↔ UN${p.b}</span> <span class="seg-badge s${p.level}">${p.level === 0 ? 'OK' : p.level}</span> <span style="font-size:13px; color:var(--muted); flex:1">${p.reason}</span></div>`).join('')}</div>
            </div>`;
    } else { panel.innerHTML = ""; }
}

document.getElementById('addBtn').addEventListener('click', addEntries);
document.getElementById('clearBtn').addEventListener('click', () => { entries = []; render(); });