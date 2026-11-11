# mr-chois-friend

김광열 팀장 보험 상담 1페이지 웹사이트. Cloudflare Pages에서 정적 페이지 + Pages Functions로 운영한다.

- 상담 신청 → Cloudflare D1에 저장 → Resend로 담당자에게 알림 메일
- 관리자 페이지 `/admin/` (Cloudflare Access 로그인) → 신청 목록·상세·상태(신규/상담 예정/상담 완료)·삭제
- 스팸 방지: Cloudflare Turnstile

## 폴더

| 경로 | 내용 |
| --- | --- |
| `public/` | 배포되는 정적 파일. **이 폴더만 공개된다** |
| `public/index.html` | 사이트 본문 |
| `public/admin/index.html` | 관리자 페이지 |
| `functions/` | Pages Functions(API). 경로가 곧 URL |
| `lib/` | Functions 공용 코드(검증·메일·인증·보유 기간) |
| `migrations/` | D1 스키마 |
| `scripts/preview-email.mjs` | 알림 메일 미리보기 |
| `wrangler.toml` | Pages·D1 설정 |

## API

| 메서드 · 경로 | 내용 | 인증 |
| --- | --- | --- |
| `GET /api/config` | Turnstile 사이트 키 | 없음 |
| `POST /api/consult` | 상담 신청 접수 | Turnstile |
| `GET /api/admin/consultations` | 목록(최근 신청 먼저, 20건씩) | Access |
| `GET /api/admin/consultations/:id` | 상세 | Access |
| `PATCH /api/admin/consultations/:id` | 상태 변경 `{ "status": "planned" \| "done" }` | Access |
| `DELETE /api/admin/consultations/:id` | 삭제 | Access |

## 로컬 실행

```bash
npm install
cp .dev.vars.example .dev.vars      # Turnstile 테스트 키, 관리자 로컬 우회 포함
npm run db:migrate:local
npm run dev                          # http://localhost:8788 , 관리자 http://localhost:8788/admin/
npm run preview:email                # .wrangler/email-preview.html 로 메일 모양 확인
```

- 로컬에서는 `RESEND_API_KEY`가 비어 있어 메일을 보내지 않고 관리자 화면에 "발송 실패"로 표시된다.
- `ADMIN_DEV_BYPASS=true`는 `localhost`·`127.0.0.1`에서만 동작한다.

## 배포 (처음 1회)

### 1. D1 데이터베이스

```bash
npx wrangler login
npx wrangler d1 create mr-chois-friend-db
```

- 출력된 `database_id`를 `wrangler.toml`의 `database_id`에 넣고 커밋
- 스키마 적용: `npm run db:migrate:remote`

### 2. Pages 프로젝트 (GitHub 연결)

- Cloudflare 대시보드 → Workers & Pages → 만들기 → Pages → Git에 연결 → 이 저장소 선택
- 프로젝트 이름 `mr-chois-friend`, 프레임워크 없음, 빌드 명령 비움, 출력 폴더 `public`
- 이후 `main`에 push하면 자동 배포. D1 바인딩은 `wrangler.toml`에서 읽는다.

### 3. Turnstile

- 대시보드 → Turnstile → 위젯 추가 → 호스트 이름에 `mr-chois-friend.pages.dev`(도메인 연결 후 그 도메인도) 추가
- 사이트 키 → `TURNSTILE_SITE_KEY`, 비밀 키 → `TURNSTILE_SECRET_KEY`

### 4. 메일 (Resend, 도메인 구매 후)

- Resend 가입 → Domains에 구매한 도메인 추가 → 안내된 DNS 레코드(SPF·DKIM)를 Cloudflare DNS에 추가 → 인증 완료 확인
- API Keys에서 발송 전용 키 발급 → `RESEND_API_KEY`
- `MAIL_FROM` 예: `상담신청 <noreply@구매한도메인>`
- `CONSULT_TO_EMAIL`: 알림 받을 주소(여러 개면 쉼표로 구분). 바꿀 때는 이 값만 바꾸고 다시 배포

### 5. 관리자 로그인 (Cloudflare Access)

- 대시보드 → Zero Trust → Access → Applications → Self-hosted 추가
  - 도메인·경로: `<사이트 주소>/admin`, `<사이트 주소>/api/admin` 두 개
  - 정책: Allow, Include → Emails → 관리자 이메일
  - 로그인 방법: One-time PIN(이메일로 받은 코드)
- 앱의 Application Audience(AUD) Tag → `ACCESS_AUD`
- 팀 도메인 `https://<팀이름>.cloudflareaccess.com` → `ACCESS_TEAM_DOMAIN`
- 이 두 값이 없으면 관리자 화면·API는 항상 막힌다(403).

### 6. 비밀 값 넣기

Pages 프로젝트 → 설정 → 변수 및 비밀 → **프로덕션**에 "비밀"로 추가하거나:

```bash
npx wrangler pages secret put TURNSTILE_SITE_KEY --project-name mr-chois-friend
# TURNSTILE_SECRET_KEY, RESEND_API_KEY, MAIL_FROM, CONSULT_TO_EMAIL, ACCESS_TEAM_DOMAIN, ACCESS_AUD 도 같은 방법
```

- 미리보기(브랜치) 환경에는 넣지 않는다. 넣지 않으면 미리보기 배포에서는 신청·관리자 기능이 막힌다.
- 값을 바꾼 뒤에는 다시 배포해야 반영된다.

### 7. 도메인 연결 (구매 후)

- Pages 프로젝트 → 사용자 지정 도메인 추가
- Turnstile 호스트 이름, Access 앱 도메인에 새 도메인 추가

## 운영

- 개인정보 보유 기간: 상담 완료 후 즉시 파기, 미완료 시 신청일로부터 최대 1년. 자동 삭제는 없고, 관리자 화면에서 기한 1개월 이내·초과·상담 완료 건에 "삭제 권장"을 표시한다. 삭제는 상세 화면의 [신청 내역 삭제].
- D1은 시점 복구(Time Travel) 기록을 일정 기간 보관한다(무료 요금제 7일). 삭제한 신청도 그 기간 동안은 복구 기록에 남는다.
- 백업: `npx wrangler d1 export mr-chois-friend-db --remote --output backup.sql` (개인정보가 들어 있으므로 저장소에 넣지 않는다)
