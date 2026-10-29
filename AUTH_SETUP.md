# 회원 인증 설정 (로그인 · 가입 · 비밀번호 찾기)

인증은 서버리스 API `api/auth.js`가 처리하고, 회원 데이터는 Supabase `public.dg_members` 테이블에 저장됩니다.
(브라우저는 회원 데이터에 직접 접근하지 않습니다.)

## 1. Vercel 환경변수 (Project → Settings → Environment Variables)

| 이름 | 설명 |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | 기존 값 그대로 |
| `AUTH_SECRET` | **필수.** 세션 서명용 임의 문자열 (32자 이상 권장). 예: `openssl rand -hex 32` |
| `APP_URL` | 사이트 주소. 예: `https://dg-assistant.vercel.app` (끝에 `/` 없이, 재설정 링크에 사용) |

메일 발송 방식은 **둘 중 하나**를 설정합니다. SMTP 설정이 있으면 SMTP를 우선 사용합니다.

**A. Gmail SMTP (도메인 불필요)** — 전용 Gmail 계정 권장

| 이름 | 설명 |
|---|---|
| `SMTP_USER` | 발송용 Gmail 주소 |
| `SMTP_PASS` | 해당 계정의 **앱 비밀번호** 16자리 (일반 로그인 비밀번호 아님. 계정 2단계 인증 필요) |
| `MAIL_FROM` | (선택) 예: `DG ASSISTANT <발송용Gmail주소>` — 생략 시 자동 |
| `SMTP_HOST`, `SMTP_PORT` | (선택) 기본값 `smtp.gmail.com`, `465` |

Gmail은 하루 약 500통까지 발송할 수 있고, 발신자는 항상 해당 Gmail 주소로 표시됩니다.

**B. Resend (도메인 인증 필요)**

| 이름 | 설명 |
|---|---|
| `RESEND_API_KEY` | [Resend](https://resend.com) API 키 |
| `MAIL_FROM` | 발신자. 예: `DG ASSISTANT <noreply@도메인>` (Resend에서 도메인 인증 필요) |

메일 설정(A 또는 B)이 없으면 로그인·가입은 동작하고, 비밀번호 찾기만 "메일 발송이 설정되지 않았습니다"로 응답합니다.

## 2. 배포 순서

1. Supabase SQL Editor에서 `sql/dg_members.sql`의 **1~3번** 실행 → 테이블 생성 + 기존 회원 이전
   (ID·비밀번호 해시가 그대로 이전되므로 기존 회원은 같은 ID/비밀번호로 로그인됩니다)
2. 위 환경변수를 Vercel에 등록
3. 코드 배포 → 로그인·가입·승인·비밀번호 찾기 동작 확인
4. 확인 후 `sql/dg_members.sql`의 **4번** 실행 → 브라우저가 옛 `members` 행을 읽지 못하게 차단

## 3. 동작 요약

- **기존 회원**: 기존 비밀번호로 로그인하면 해시가 자동으로 scrypt(솔트 포함)로 업그레이드됩니다.
  이메일이 없거나 비밀번호가 8자 미만이면 로그인 직후 "내정보" 창이 열려 이메일 등록·비밀번호 변경을 안내합니다 (건너뛸 수 있음).
- **가입**: 이메일 필수, 비밀번호 8자 이상. 관리자 승인 전에는 로그인할 수 없습니다. 관리자 자동 승인은 없습니다.
- **관리자 지정**: 첫 관리자는 가입 후 SQL로 지정합니다.
  `update public.dg_members set role='admin', status='approved' where id_lower='아이디';`
  (이전 코드에서 항상 관리자였던 `wtlee`는 이전 SQL에서 자동으로 관리자로 반영됩니다.)
- **비밀번호 찾기**: ID + 등록 이메일 → 30분 유효·1회용 링크 메일 → 새 비밀번호 설정. 같은 계정에 60초 안에 재요청할 수 없습니다.
- **로그인 보호**: 연속 5회 실패 시 10분 잠금. 비밀번호를 바꾸면 다른 기기의 기존 로그인은 무효가 됩니다.
- **세션**: httpOnly 쿠키(30일). 관리자 권한은 매 요청마다 DB에서 확인합니다.

## 4. 알려진 한계

- `api/notes*.js`, `api/inquiry.js` 등 다른 API는 아직 로그인 검사를 하지 않습니다 (이번 범위 밖).
- FAQ/게시판은 여전히 브라우저에서 Supabase `inquiry_state`에 직접 접근합니다.
