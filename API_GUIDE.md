# DG_ASSISTANT 데이터 연동 가이드 (외부 프로그램용)

운항팀 다른 프로그램에서 DG_ASSISTANT의 데이터를 가져다 쓸 수 있게 하는 API 안내입니다.

- **기준 주소(Base URL)**: `https://dg-assistant-git-main-baseballmeng-7796s-projects.vercel.app`
- **응답 형식**: 모든 응답은 JSON (`Content-Type: application/json; charset=utf-8`)
- **인증**: 사이트 API(1~5번)는 **키가 필요 없습니다.** 주소만 부르면 데이터가 나옵니다.
  FAQ·게시판(6번)만 Supabase 공개키(apikey)가 필요하며 아래에 값을 적어두었습니다.
- **CORS**: 웹(브라우저) 기반 프로그램에서도 바로 호출되도록 열어두었습니다(`Access-Control-Allow-Origin: *`).
- **성공 판별**: 응답 JSON의 `ok` 값이 `true`면 성공입니다. 실패 시 `ok:false`와 `message`가 옵니다.

> ⚠️ 이 API들은 **읽기(조회) 전용**입니다. 데이터 수정/삭제 창구는 외부에 열어두지 않았습니다.

---

## 1. 선사별 선적가부 (Carrier check)

UN번호를 넣으면 SKR/HAL·KMTC·HMM·TSL·SITC·NSS_DYS·CKL·DONGJIN 등 선사별로
선적 가능/제한/금지 판정과 근거를 돌려줍니다.

```
GET /api/carrier-check?unno=1993
```

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `unno` | ✅ | UN번호. `1993`, `UN1993`, `0004` 모두 허용 (4자리 자동보정) |

**요청 예시**
```bash
curl "https://dg-assistant-git-main-baseballmeng-7796s-projects.vercel.app/api/carrier-check?unno=1993"
```

**응답 예시 (요약)**
```json
{
  "ok": true,
  "dg": { "UNNO": "1993", "Name": "FLAMMABLE LIQUID, N.O.S.", "Class": "3", "SUB": "" },
  "results": [
    {
      "carrier_group": "SKR_HAL",
      "carrier_name": "Sinokor / Heung-A (자사)",
      "status": "ALLOWED",
      "status_label": "선적 가능",
      "matched_rules": [ /* 적용된 규정 행들 */ ],
      "common_rules": [ /* 선사 공통 안내 */ ]
    }
    // ... 다른 선사들
  ]
}
```
- `status`: `ALLOWED`(가능) / `RESTRICTED`(조건부·제한) / `PROHIBITED`(금지)
- `matched_rules[]`: 해당 UN(또는 Class 전체)에 걸린 규정 상세 — `psn`, `remark_text`, `condition_text`, `effective_date`, `source_file` 등 포함

---

## 2. UNNO 위험물 분류표 (DG_TABLE 조회)

### 2-A. 여러 UN번호 한 번에 조회
```
POST /api/dg-search
Content-Type: application/json

{ "unnos": ["1993", "1263", "3480"] }
```

**요청 예시**
```bash
curl -X POST "https://dg-assistant-git-main-baseballmeng-7796s-projects.vercel.app/api/dg-search" \
  -H "Content-Type: application/json" \
  -d '{"unnos":["1993","3480"]}'
```

**응답 예시**
```json
{
  "ok": true,
  "data": [
    { "UNNO": "1993", "Name": "FLAMMABLE LIQUID, N.O.S.", "Class": "3", "SUB": "", "PG": "III", "...": "..." }
  ]
}
```

### 2-B. UN번호 하나 상세 조회
```
GET /api/dg-lookup?unno=1993
```
- 응답: `{ "ok": true, "data": [ {DG_TABLE 행 전체} ] }`

---

## 3. Special Provision(특별규정) 조회

```
GET /api/sp-lookup?sp=188
```
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `sp` | ✅ | SP 번호. `188`, `SP188` 모두 허용 |

**응답 예시**
```json
{
  "ok": true,
  "data": { "sp_no": "188", "marker": "...", "content": "특별규정 전문", "source_name": "IMDG", "updated_at": "..." }
}
```

---

## 4. DG 노트(메모/자료) 검색

```
GET /api/notes?q=리튬
```
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `q` | ❌ | 검색어(제목·내용). 없으면 전체 목록 반환 |

**응답 예시**
```json
{ "ok": true, "keyword": "리튬", "count": 3, "data": [ { "id": 1, "title": "...", "content": "...", "file_url": "...", "created_at": "..." } ] }
```

---

## 5. 포트별 위험물 제한 (SVMS 연동)

항구코드로 해당 항구의 위험물 반입/경유 제한 목록을 돌려줍니다. (장금상선 SVMS API 프록시)

```
GET /api/carrier-check?port=CNSHA&comp=SNKO
```
| 파라미터 | 필수 | 설명 |
|---|---|---|
| `port` | ✅ | 항구코드 (예: `KRPUS`, `CNSHA`) |
| `comp` | ❌ | 선사코드 `SNKO`(기본) / `HALK` / `HSLI` |

**응답 예시**
```json
{ "ok": true, "port": "CNSHA", "comp": "SNKO", "count": 230,
  "data": [ { "CODE": "...", "POSITION": "A", "UNNO": "1005", "CLASS": "2.3", "PKGGROUP": "", "PROPER": "AMMONIA", "RMK": "..." } ] }
```
- `POSITION` 의미: `A`=선적·양하·경유 모두 금지 / `L`=선적(POL) 금지 / `D`=양하(POD) 금지 / `T`(또는 `T/S`)=경유 금지

> ⚠️ 이 창구는 사내망(SVMS) 접근이 필요해서, 서버 환경에 따라 응답이 비어 있거나
> `ok:false`(NO_KEY / UNREACHABLE)가 나올 수 있습니다. 1~4번은 이 제약이 없습니다.

---

## 6. FAQ · 문의게시판 (Supabase 직접 조회)

FAQ·게시판 데이터는 원태님 소유 Supabase에 있어, **공개키(apikey)로 직접** 읽습니다.

- **주소**: `https://jasgjzzazgkwcpghzjop.supabase.co`
- **공개키(apikey)**: `sb_publishable_nlY-SPzGQVowYbZ4LuwCpw_65sd2539`
  - 브라우저에 노출돼도 되는 publishable 키입니다(읽기 공개, RLS로 통제).

### FAQ 항목
```bash
curl "https://jasgjzzazgkwcpghzjop.supabase.co/rest/v1/inquiry_state?id=eq.faq&select=data" \
  -H "apikey: sb_publishable_nlY-SPzGQVowYbZ4LuwCpw_65sd2539"
```
- 응답: `[ { "data": { "items": [ ...동적 FAQ 항목 ] } } ]`

### 게시판 글
```bash
curl "https://jasgjzzazgkwcpghzjop.supabase.co/rest/v1/inquiry_state?id=eq.board&select=data" \
  -H "apikey: sb_publishable_nlY-SPzGQVowYbZ4LuwCpw_65sd2539"
```
- 응답: `[ { "data": { "posts": [ ...게시글 ] } } ]`

> 참고: 위 FAQ는 사용자 등록분(동적)만 담깁니다. 기본 위험물 지식 49건은 사이트 코드에 내장되어 있어
> API로는 내려오지 않습니다. 전체 FAQ 세트가 필요하면 별도 요청 주세요(정적 데이터도 파일로 뽑아드릴 수 있음).

---

## 요약 (창구 한눈에 보기)

| # | 데이터 | 호출 |
|---|---|---|
| 1 | 선사별 선적가부 | `GET /api/carrier-check?unno=1993` |
| 2 | UNNO 분류(여러 개) | `POST /api/dg-search` (body: `{unnos:[...]}`) |
| 2 | UNNO 분류(하나) | `GET /api/dg-lookup?unno=1993` |
| 3 | 특별규정 | `GET /api/sp-lookup?sp=188` |
| 4 | DG 노트 검색 | `GET /api/notes?q=리튬` |
| 5 | 포트별 제한 | `GET /api/carrier-check?port=CNSHA&comp=SNKO` |
| 6 | FAQ·게시판 | Supabase `.../rest/v1/inquiry_state?id=eq.faq` (apikey 헤더) |

---
*문서 생성: DG_ASSISTANT 유지보수용. 엔드포인트 코드는 `api/` 폴더 참조.*
