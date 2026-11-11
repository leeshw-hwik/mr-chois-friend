# Cloudflare 운영 매뉴얼

상담 신청 웹사이트를 Cloudflare에 처음 올리고 운영하기까지 해야 할 일을 순서대로 정리함.

- 사이트: Cloudflare Pages(정적 파일 + Pages Functions)
- 저장: Cloudflare D1 (`consulting-db`)
- 메일: Resend
- 스팸 방지: Cloudflare Turnstile
- 관리자 로그인: Cloudflare Access(Zero Trust)

> Cloudflare·Resend 화면의 메뉴 이름과 위치는 화면 개편에 따라 조금씩 다를 수 있음. 메뉴를 못 찾으면 대시보드 위쪽 검색창에 메뉴 이름(예: "Turnstile", "D1")을 입력함.
> 무료 한도·요금은 작성 시점(2026-11) 기준. 가입할 때 다시 확인함.

---

## 0. 전체 순서 한눈에 보기

| 순서 | 할 일 | 어디서 | 필수 |
| --- | --- | --- | --- |
| 1 | Cloudflare 가입 | dash.cloudflare.com | 필수 |
| 2 | 내 PC에 개발 도구 설치·로그인 | 터미널 | 필수 |
| 3 | D1 데이터베이스 만들기 + 표 만들기 | 터미널 | 필수 |
| 4 | Pages 프로젝트 만들기(GitHub 연결) | Cloudflare 대시보드 | 필수 |
| 5 | Turnstile 위젯 만들기 | Cloudflare 대시보드 | 필수 |
| 6 | Resend 가입·API 키 | resend.com | 메일 받으려면 필수 |
| 7 | 비밀 값 등록 | Cloudflare 대시보드 | 필수 |
| 8 | 재배포 | Cloudflare 대시보드 | 필수 |
| 9 | Access(관리자 로그인) 설정 | Cloudflare Zero Trust | 관리자 페이지 쓰려면 필수 |
| 10 | 동작 확인 | 브라우저 | 필수 |
| 11 | 도메인 구매·연결 | Cloudflare 대시보드 | 나중에 |

비밀 값(7단계)은 5·6·9단계에서 얻은 값을 넣는 것이므로, 값을 얻을 때마다 메모해 둠. **메모는 저장소나 메신저에 남기지 않음.**

---

## 1. Cloudflare 가입

1. 브라우저에서 https://dash.cloudflare.com/sign-up 접속
2. 이메일·비밀번호 입력 → 가입
3. 받은 편지함의 인증 메일에서 인증 링크 클릭
4. 로그인 후 "웹사이트 추가" 같은 안내가 나오면 건너뜀(도메인은 11단계에서)
5. **2단계 인증 켜기(강력 권장)**: 오른쪽 위 계정 아이콘 → 프로필(My Profile) → 인증(Authentication) → 2단계 인증 → 인증 앱(Google Authenticator 등)으로 설정. 복구 코드는 안전한 곳에 보관
   - 이 계정으로 고객 개인정보가 담긴 DB를 관리하므로 꼭 켬
   - GitHub 계정, Resend 계정도 같은 이유로 2단계 인증을 켬

---

## 2. 내 PC에 개발 도구 설치·로그인

D1 생성·표 만들기는 터미널 명령으로 하는 것이 가장 간단함.

### 2.1 준비물

- Node.js 20 이상: https://nodejs.org 에서 LTS 설치. 설치 확인: `node -v`
- 이 저장소가 내 PC에 있어야 함(`git clone https://github.com/<계정>/mr-chois-friend.git`)

### 2.2 설치

```bash
cd mr-chois-friend
npm install
```

### 2.3 Cloudflare 로그인

```bash
npx wrangler login
```

- 브라우저가 열리면 Cloudflare 로그인 → **Allow(허용)** 클릭
- 터미널에 `Successfully logged in`이 나오면 완료
- 확인: `npx wrangler whoami` → 로그인한 이메일과 계정이 보이면 정상

---

## 3. D1 데이터베이스 만들기

### 3.1 데이터베이스 만들기

```bash
npx wrangler d1 create consulting-db
```

- 위치(location)를 물으면 기본값 또는 아시아(`apac`)를 고름
- 결과에 아래와 같은 내용이 나옴:

```toml
[[d1_databases]]
binding = "DB"
database_name = "consulting-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

> 대시보드로 만들 때: Workers & Pages(또는 Storage & Databases) → D1 SQL Database → 데이터베이스 만들기 → 이름 `consulting-db` → 만들기. 화면에 나오는 Database ID를 복사.

### 3.2 `wrangler.toml`에 넣기

저장소의 `wrangler.toml`에서 아래 두 줄을 결과 값으로 바꿈(`binding = "DB"`는 그대로 둠):

```toml
database_name = "consulting-db"
database_id = "결과로 나온 database_id"
```

- `database_id`는 비밀 값이 아니므로 커밋해도 됨
- 바꾼 뒤 커밋·푸시

### 3.3 표(테이블) 만들기

```bash
npm run db:migrate:remote
```

- "apply?" 같은 확인을 물으면 `y`
- `0001_init.sql │ ✅`가 나오면 완료
- 다시 확인: `npx wrangler d1 migrations list DB --remote` → `No migrations to apply!`

---

## 4. Pages 프로젝트 만들기 (GitHub 연결)

> **주의: 반드시 "Pages"로 만듦.** "Workers"로 만들면 빌드가 `wrangler deploy`로 실행되어
> `Missing entry-point to Worker script or to assets directory` 오류로 실패함.

1. 대시보드 왼쪽 **Workers & Pages**(Compute 아래에 있을 수 있음) → **만들기(Create)**
2. 화면 위쪽 탭에서 **Pages** 선택 → **기존 Git 저장소 가져오기(Import an existing Git repository)**
3. **GitHub 연결** → GitHub 로그인 → Cloudflare 앱 설치 화면에서 **Only select repositories** → `mr-chois-friend`만 선택 → 설치
4. 저장소 목록에서 `mr-chois-friend` 선택 → **설정 시작(Begin setup)**
5. 빌드 설정:

| 항목 | 값 |
| --- | --- |
| 프로젝트 이름 | `mr-chois-friend` (사이트 주소가 `mr-chois-friend.pages.dev`가 됨) |
| 프로덕션 브랜치 | `main` |
| 프레임워크 프리셋 | 없음(None) |
| 빌드 명령 | 비워 둠 |
| 빌드 출력 디렉터리 | `public` |
| 루트 디렉터리 | 비워 둠 |
| 환경 변수 | 여기서는 넣지 않음(7단계에서 비밀 값으로) |

6. **저장 및 배포(Save and Deploy)** → 1~2분 뒤 "성공" 표시
7. `https://mr-chois-friend.pages.dev` 접속 → 사이트가 보이면 완료
   - 이 단계에서는 상담 신청을 하면 "자동 입력 방지 확인이 끝난 뒤 다시 눌러 주세요"가 나오는 것이 정상(Turnstile 미설정)
8. D1 연결 확인: 프로젝트 → 설정 → 바인딩(Bindings)에 `DB → consulting-db`가 보이면 정상(`wrangler.toml`에서 자동으로 읽음)

이후 `main`에 푸시할 때마다 자동으로 배포됨.

### 4.1 Workers로 잘못 만들었을 때

1. Workers & Pages → 잘못 만든 Worker → 설정 → 빌드(Build)에서 Git 연결 끊기, 또는 Worker 삭제
2. 위 4단계를 Pages 탭으로 다시 진행

---

## 5. Turnstile 위젯 만들기 (스팸 방지)

1. 대시보드 왼쪽 **Turnstile**(안 보이면 검색창에 "Turnstile") → **위젯 추가(Add widget)**
2. 입력:

| 항목 | 값 |
| --- | --- |
| 위젯 이름 | 상담신청 (아무 이름) |
| 호스트 이름 | `mr-chois-friend.pages.dev` (도메인 연결 후 그 도메인도 추가) |
| 위젯 모드 | 관리형(Managed) |
| 사전 승인(Pre-clearance) | 아니요 |

3. 만들기 → **사이트 키(Site Key)**, **비밀 키(Secret Key)** 메모
   - 사이트 키 → `TURNSTILE_SITE_KEY`
   - 비밀 키 → `TURNSTILE_SECRET_KEY`

---

## 6. Resend 가입·API 키 (메일 발송)

### 6.1 가입

1. https://resend.com → Sign up(GitHub 또는 이메일로 가입)
2. **가입한 이메일 주소를 기억함.** 도메인이 없을 때는 이 주소로만 메일을 받을 수 있음
3. 2단계 인증 켜기: Settings → Security(또는 Account)

### 6.2 API 키

1. 왼쪽 **API Keys** → **Create API Key**
2. 이름 `mr-chois-friend`, 권한 **Sending access**(보내기 전용), 도메인 All
3. 만들어진 키(`re_`로 시작)는 **한 번만 보이므로** 바로 메모 → `RESEND_API_KEY`

### 6.3 보내는 주소·받는 주소

| 상황 | `MAIL_FROM`(보내는 주소) | `CONSULT_TO_EMAIL`(받는 주소) |
| --- | --- | --- |
| **도메인 없음(지금)** | `onboarding@resend.dev` | **Resend 가입 이메일만 가능** |
| 도메인 연결 후(11단계) | `상담신청 <noreply@내도메인>` | 아무 주소나 가능. 여러 개면 쉼표로 구분 |

- 도메인 없이 다른 주소를 받는 주소로 넣으면 메일이 가지 않고 관리자 화면에 "발송 실패"로 남음
- 무료 요금제: 월 3,000건, 하루 100건 수준

---

## 7. 비밀 값 등록

Pages 프로젝트에 아래 7개를 **비밀(Secret)** 로 넣음. 코드·저장소에는 넣지 않음.

| 이름 | 값 | 얻는 곳 |
| --- | --- | --- |
| `TURNSTILE_SITE_KEY` | Turnstile 사이트 키 | 5단계 |
| `TURNSTILE_SECRET_KEY` | Turnstile 비밀 키 | 5단계 |
| `RESEND_API_KEY` | `re_…` | 6.2 |
| `MAIL_FROM` | `onboarding@resend.dev` (도메인 연결 후 변경) | 6.3 |
| `CONSULT_TO_EMAIL` | 알림 받을 주소 | 6.3 |
| `ACCESS_TEAM_DOMAIN` | `https://<팀이름>.cloudflareaccess.com` | 9단계 |
| `ACCESS_AUD` | Access 앱 AUD Tag | 9단계 |

### 7.1 대시보드로 넣기

1. Workers & Pages → `mr-chois-friend` → **설정(Settings)** → **변수 및 비밀(Variables and Secrets)**
2. 환경이 **프로덕션(Production)** 인지 확인 → **추가(Add)**
3. 유형 **비밀(Secret)**, 이름·값 입력 → 저장
4. 7개 모두 반복

- **미리보기(Preview) 환경에는 넣지 않음.** 넣지 않으면 브랜치 미리보기 배포에서는 신청·관리자 기능이 막혀서 운영 DB를 보호함
- 값 앞뒤에 공백이 들어가지 않게 주의

### 7.2 터미널로 넣기(대신)

```bash
npx wrangler pages secret put TURNSTILE_SITE_KEY --project-name mr-chois-friend
```

- 값을 물으면 붙여 넣고 Enter. 나머지 6개도 이름만 바꿔 반복
- 등록된 이름 확인: `npx wrangler pages secret list --project-name mr-chois-friend`

---

## 8. 재배포

**비밀 값은 넣거나 바꾼 뒤 다시 배포해야 반영됨.**

1. Pages 프로젝트 → **배포(Deployments)** 탭
2. 맨 위 프로덕션 배포 오른쪽 `⋯` → **배포 재시도(Retry deployment)**
3. "성공"이 되면 반영 완료

새로 푸시해도 재배포됨.

---

## 9. Access 설정 (관리자 로그인)

관리자 페이지(`/admin/`)와 관리자 API(`/api/admin/`)는 Access를 통과한 사람만 들어감. 등록한 이메일로 받은 일회용 코드로 로그인함.

### 9.1 Zero Trust 시작(1회)

1. 대시보드 왼쪽 **Zero Trust** 클릭
2. 처음이면 **팀 이름** 입력(예: `mrchoi`) → 팀 도메인 `https://mrchoi.cloudflareaccess.com`이 생김 → `ACCESS_TEAM_DOMAIN`에 메모
3. 요금제 **Free**(50명까지 무료) 선택. 무료여도 결제 수단 등록을 요구할 수 있음
4. 설정(Settings) → 인증(Authentication) → 로그인 방법에 **One-time PIN**이 있는지 확인(기본으로 있음)

### 9.2 Access 앱 만들기

`pages.dev` 주소는 Pages 프로젝트에서 시작해야 등록됨.

1. Workers & Pages → `mr-chois-friend` → 설정 → **일반(General)** → **Access 정책 사용(Enable access policy)** 켬
   - 미리보기 주소(`*.mr-chois-friend.pages.dev`)를 보호하는 Access 앱이 자동으로 생김
2. Zero Trust → **Access** → **Applications** → 방금 생긴 앱 → **편집(Configure/Edit)**
3. **도메인(Application domain)** 수정:
   - 첫 번째: 서브도메인 `*`를 지우고 도메인 `mr-chois-friend.pages.dev`, 경로 `admin`
   - **도메인 추가**: 도메인 `mr-chois-friend.pages.dev`, 경로 `api/admin`
4. 앱 이름: `상담 신청 관리`, 세션 시간: 24시간(원하는 대로)
5. **정책(Policies)**:
   - 정책 이름 `관리자`, 동작(Action) **Allow**
   - Include → 선택자 **Emails** → 관리자 이메일 입력(여러 명이면 여러 개)
6. **로그인 방법**: One-time PIN 체크
7. 저장
8. 앱 개요(Overview) 화면의 **Application Audience (AUD) Tag** 복사 → `ACCESS_AUD`

### 9.3 비밀 값 넣고 재배포

- 7단계 방법으로 `ACCESS_TEAM_DOMAIN`(`https://` 포함, 끝 `/` 없이), `ACCESS_AUD` 추가 → 8단계 재배포

### 9.4 로그인

1. https://mr-chois-friend.pages.dev/admin/ 접속
2. Cloudflare 로그인 화면 → 관리자 이메일 입력 → 메일로 온 코드 입력
3. 상담 신청 목록이 나오면 완료. 오른쪽 위 [로그아웃]

### 9.5 관리자 추가·삭제

- Zero Trust → Access → Applications → 앱 → 정책 → Emails 목록에서 추가·삭제 → 저장(재배포 필요 없음)

---

## 10. 동작 확인

| 확인 | 방법 | 기대 결과 |
| --- | --- | --- |
| 사이트 | `https://mr-chois-friend.pages.dev` | 사이트 표시 |
| 지도 | 상담신청의 "현대해상 경인지역 구월지점" 클릭 | 네이버 지도 새 탭 |
| 자동 입력 방지 | 신청 폼 아래 Cloudflare 상자 | "확인 중…" 뒤 초록 체크(또는 체크 칸 클릭) |
| 신청 | 시험 내용 입력 → 동의 체크 → 초록 체크 확인 → [상담 신청하기] | "상담 신청이 접수되었습니다" |
| 메일 | 받는 주소 메일함(스팸함 포함) | 1~2분 안에 "[상담신청] …" 메일 |
| 관리자 | `/admin/` 로그인 | 목록에 시험 신청, 상세·상태 변경·삭제 동작 |
| 관리자 보호 | 시크릿 창(로그인 안 한 상태)에서 `/admin/` | Cloudflare 로그인 화면으로 이동 |
| 정리 | 시험 신청 상세 → [신청 내역 삭제] | 목록에서 사라짐 |

---

## 11. 도메인 구매·연결 (나중에)

도메인이 있으면 Resend로 아무 주소에나 메일을 보낼 수 있고 사이트 주소도 짧아짐.

### 11.1 도메인 구매

- **`.com` 등**: 대시보드 → 도메인 등록(Domain Registration) → 도메인 등록(Register Domains) → 검색 → 구매. 원가 판매라 연 1~2만 원 수준이고 DNS가 자동으로 Cloudflare에 연결됨
- **`.kr`·`.co.kr`**: Cloudflare에서 살 수 없음. 국내 등록업체(가비아 등)에서 구매 → Cloudflare 대시보드 → 도메인 추가(Add a domain) → Free 요금제 → 안내된 **네임서버 2개**를 등록업체 관리 화면의 네임서버에 입력 → 연결 완료 메일까지 대기(수 분~24시간)

### 11.2 사이트에 도메인 연결

1. Pages 프로젝트 → **사용자 지정 도메인(Custom domains)** → 도메인 설정 → 구매한 도메인(예: `example.com`) 입력 → 활성화
2. `www`도 쓰려면 같은 방법으로 `www.example.com` 추가

### 11.3 따라서 바꿀 것

| 대상 | 할 일 |
| --- | --- |
| Turnstile | 위젯 → 호스트 이름에 새 도메인 추가 |
| Access | 앱 → 도메인에 `새도메인/admin`, `새도메인/api/admin` 추가 |
| Resend | Domains → Add Domain → 새 도메인 → 안내된 DNS 레코드(SPF·DKIM 등) 추가. Cloudflare 도메인이면 자동 설정(Auto configure) 버튼으로 가능 → Verified 확인 |
| `MAIL_FROM` | `상담신청 <noreply@새도메인>` 으로 변경 |
| `CONSULT_TO_EMAIL` | 실제 받을 주소로 변경(여러 개는 쉼표) |
| 재배포 | 8단계 |

---

## 12. 운영

### 12.1 일상 업무

- 새 신청: 알림 메일 → [관리자 페이지에서 보기] → 상세
- 상담 일정 잡으면 [상담 예정], 끝나면 [상담 완료]
- **개인정보 보유 기간: 상담 완료 후 즉시 파기, 미완료 시 최대 1년.** 자동 삭제 없음. 목록·상세의 "삭제 권장" 표시(상담 완료, 기한 초과, 기한 30일 이내)를 보고 [신청 내역 삭제]
- 상세의 메일 알림이 "발송 실패"면 13.3 참고

### 12.2 설정 바꾸기

| 바꿀 것 | 방법 |
| --- | --- |
| 알림 받는 주소 | 비밀 값 `CONSULT_TO_EMAIL` 변경 → 재배포 |
| 관리자 | 9.5 |
| Resend 키 교체 | Resend에서 새 키 → `RESEND_API_KEY` 변경 → 재배포 → 옛 키 삭제 |
| 사이트 내용 | 코드 수정 → `main` 푸시 → 자동 배포 |
| DB 표 구조 | `migrations/`에 새 번호 파일 추가 → `npm run db:migrate:remote` → 푸시 |

### 12.3 백업

```bash
npx wrangler d1 export consulting-db --remote --output backup.sql
```

- 개인정보가 들어 있으므로 저장소·메신저·클라우드 공유 폴더에 두지 않고, 필요 없어지면 지움
- D1은 시점 복구(Time Travel) 기록을 일정 기간(무료 7일) 보관함. 삭제한 신청도 그 기간에는 복구 기록에 남음

### 12.4 사용량 확인

- 대시보드 → Workers & Pages → 프로젝트 → 지표(Metrics), D1 → `consulting-db` → 지표
- Resend → Emails / Logs

---

## 13. 문제 해결

### 13.1 GitHub 푸시 후 빌드 실패

- 오류에 `Missing entry-point to Worker script` → Workers로 만든 것. 4.1 참고
- 오류에 D1·`database_id` 관련 → `wrangler.toml`의 `database_id`가 3단계 값과 같은지 확인
- 그 밖에는 배포 → 실패한 배포 → 빌드 로그 확인

### 13.2 "자동 입력 방지 확인이 끝난 뒤 다시 눌러 주세요"만 나옴

- Cloudflare 상자가 초록 체크가 되기 전에 누른 경우 → 체크 뒤 다시 누름
- 상자 자체가 안 보임 → `TURNSTILE_SITE_KEY` 미등록 또는 재배포 안 함(7·8단계)
- 상자에 오류 표시 → Turnstile 위젯 호스트 이름에 지금 주소가 있는지 확인(5단계)
- "자동 입력 방지 확인에 실패했습니다" → `TURNSTILE_SECRET_KEY`가 같은 위젯의 비밀 키인지 확인
- "일시적인 오류로 신청을 받을 수 없습니다" → `TURNSTILE_SECRET_KEY` 미등록

### 13.3 메일이 안 옴(관리자 상세에 "발송 실패")

1. `RESEND_API_KEY`, `MAIL_FROM`, `CONSULT_TO_EMAIL` 3개 모두 등록했는지, 재배포했는지
2. 도메인이 없으면: `MAIL_FROM`이 `onboarding@resend.dev`이고 `CONSULT_TO_EMAIL`이 Resend 가입 이메일인지
3. 도메인이 있으면: Resend Domains에서 Verified인지, `MAIL_FROM`이 그 도메인 주소인지
4. Resend → Logs에서 거절 사유 확인
5. "발송됨"인데 안 보이면 스팸함 확인

### 13.4 관리자 페이지 "관리자 로그인이 필요합니다"(403)

- Access 로그인 화면 없이 바로 이 문구 → Access 앱 도메인·경로가 맞는지(9.2), 주소가 `/admin/`인지
- 로그인 후에도 이 문구 → `ACCESS_TEAM_DOMAIN`(`https://` 포함, 끝 `/` 없음), `ACCESS_AUD`(같은 앱의 AUD) 확인 → 재배포
- 로그인 화면에서 코드 메일이 안 옴 → 정책 Emails에 그 주소가 있는지, 스팸함

### 13.5 비밀 값을 바꿨는데 그대로임

- 재배포 안 함 → 8단계
- 미리보기(Preview) 환경에 넣음 → 프로덕션에 넣음

---

## 14. 비용 (작성 시점 기준)

| 항목 | 무료 한도(대략) | 예상 사용량 | 비용 |
| --- | --- | --- | --- |
| Pages | 정적 요청 무제한, 빌드 월 500회 | — | 0원 |
| Pages Functions | 하루 10만 요청 | 하루 수십 건 | 0원 |
| D1 | 저장 5GB, 하루 읽기 500만 행·쓰기 10만 행 | 연 수천 건 | 0원 |
| Turnstile | 무료 | — | 0원 |
| Access(Zero Trust Free) | 50명 | 1~3명 | 0원 |
| Resend Free | 월 3,000건, 하루 100건 | 월 수십 건 | 0원 |
| 도메인(선택) | — | `.com` 등 | 연 1~2만 원 수준 |

무료 한도를 넘으면 유료 전환 전까지 요청이 거부될 수 있음(자동 과금 아님). 결제 수단을 등록했다면 대시보드 → 결제(Billing)에서 요금제를 가끔 확인함.
