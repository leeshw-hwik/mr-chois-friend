# HANDOFF

- 기록 시각: 2026-11-11 17:32:38 KST
- 저장소: `/Users/lee.shw/Documents/Work/999.Work_Space/git/mr-chois-friend` (GitHub `leeshw-hwik/mr-chois-friend`, 브랜치 `main`, 추후 저장소 변경 예정)
- Claude Code 세션 ID: `afa56f76-373f-4f0c-89fb-0ff9ec532fa6` (이어서 열기: `claude --resume afa56f76-373f-4f0c-89fb-0ff9ec532fa6`)
- 진행 중 작업: 없음. 남은 작업 목록은 **`task/TODO.md`** (진행 현황 + 체크리스트)

## 현재 상태

- 김광열 팀장 보험 상담 1페이지 사이트 + 상담 신청 저장·메일 알림·관리자 페이지 개발 완료
- 운영: https://mr-chois-friend.pages.dev (Cloudflare **Pages**, GitHub `main` 푸시 시 자동 배포)
- 최신 커밋 `ea033dd`(푸시 완료). 그 뒤 커밋 안 된 파일은 아래 "커밋 안 된 파일" 참고
- 운영 D1 `consulting-db`: 원격 스키마 적용 완료. 시험 신청 1건(id 1, 2026-11-11 16:16 KST, 상태 `new`, 메일 `sent`) 있음 → 관리자 화면 열리면 삭제할 것
- Pages 프로덕션 비밀 값 등록 완료(5개): `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `MAIL_FROM`(`onboarding@resend.dev`), `CONSULT_TO_EMAIL`(Resend 가입 이메일)
- **미완료: Cloudflare Access.** `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` 없음 → `/admin/`, `/api/admin/*`은 앱 미들웨어가 403으로 막는 중(의도된 동작)
- 문서: `CLAUDE.md`(작업 기준), `README.md`(구조·API·로컬 실행·배포), `CloudflareManual.md`(가입~운영 상세, 문제 해결), 결과 보고서 `task/task_history/2026-11-11_*_RESULT.md`

## 사용자 결정 사항 (2026-11-11)

- 호스팅 Cloudflare Pages 유지, 메일은 Resend(Pages Functions는 `send_email` 바인딩 미지원이라 Workers 전환 대신 선택)
- 동의 체크: 체크 안 하면 신청 막기(기본 체크 아님)
- 신청 제출 시 문자 앱 열기 제거 → 저장·메일
- 개인정보 보유: 상담 완료 후 즉시 파기, 미완료 시 최대 1년. 관리자 삭제 버튼, 자동 삭제 없음. 기한 1개월 이내·초과(상담 완료 포함)는 목록·상세에 "삭제 권장"
- 네이버 지도: `https://naver.me/xX7aoF3h`
- 상태: `신규`(기본) / `상담 예정` / `상담 완료`
- 배포: GitHub 연결 자동 배포. 도메인은 구매 예정(미구매)
- 관리자 이메일·받는 주소는 사용자가 알고 있음. **문서·커밋에 쓰지 않음**

## 다음에 할 일 (`task/TODO.md` 2장)

1. 사용자: Access 설정(`CloudflareManual.md` 9장) → 비밀 값 2개 → 재배포
2. AI 확인: 로그인 안 한 상태에서 `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://mr-chois-friend.pages.dev/admin/` 와 `/api/admin/consultations` → Cloudflare Access 로그인으로 302 되는지(지금은 403)
3. 사용자: 관리자 로그인 → 시험 신청(id 1) 확인·상태 변경·삭제, 메일함 확인
4. 도메인 구매 후: Pages 도메인 연결, Turnstile·Access·Resend 도메인 추가, `MAIL_FROM`·`CONSULT_TO_EMAIL` 변경, 재배포
5. 지시 시 정리: `README.md`·`wrangler.toml` 주석의 DB 이름 `mr-chois-friend-db` → `consulting-db`, 설정 누락 시 안내 문구 개선, `CHANGELOG.md` 새로 쓰기(지금은 이전 Gonnect 내용)
6. 사용자 확인 필요: 푸터 자리표시 `[금액 입력]`·`[번호 입력]`·`[기간 입력]`, 경력 `[연도]`, 개인정보 처리방침·국외 이전 고지(준법감시), 새 화면 문구 검토

## 커밋 안 된 파일

- `CloudflareManual.md` — 커밋 대상(지시 시)
- `task/TODO.md`, `task/HANDOFF.md`, `task/task_history/2026-11-11_Cloudflare-운영-매뉴얼-작성_RESULT.md` — 커밋 대상(지시 시)
- `task/task_history/2026-11-11_상담신청-기능-추가.md` — **개인 이메일 포함, 커밋 금지.** 가린 뒤 커밋하거나 `.gitignore` 추가 여부를 사용자에게 물을 것
- `logs/`, `task/CloudflareAccess.md` — 사용자가 만든 파일. 내용 미확인, 커밋 여부 사용자 결정

## 로컬 개발·확인

```bash
npm install
cp .dev.vars.example .dev.vars     # 이미 있음(커밋 안 됨). Turnstile 테스트 키, ADMIN_DEV_BYPASS=true
npm run db:migrate:local
npm run dev                        # http://localhost:8788 , 관리자 /admin/ (localhost에서만 우회)
npm run preview:email -- <경로>     # 메일 HTML 미리보기
```

- 운영 조회(개인정보 컬럼 빼고): `npx wrangler d1 execute DB --remote --json --command "SELECT id, created_at, status, email_status FROM consultations ORDER BY id DESC LIMIT 10"`
- 비밀 값 이름 확인: `npx wrangler pages secret list --project-name mr-chois-friend`
- 배포 목록: `npx wrangler pages deployment list --project-name mr-chois-friend --environment production`
- wrangler는 이 PC에서 OAuth 로그인되어 있음
- 브라우저 확인 도구(세션 scratchpad, 세션이 바뀌면 없어질 수 있음): `/private/tmp/claude-501/-Users-lee-shw-Documents-Work-999-Work-Space-git-mr-chois-friend/afa56f76-373f-4f0c-89fb-0ff9ec532fa6/scratchpad/pt/` 에 puppeteer-core(`test.mjs` 로컬 전체 시험, `list.mjs` 관리자 페이지 나눔, `prod.mjs`·`prod2.mjs` 운영 위젯 확인). 없어졌으면 scratchpad에 `npm i puppeteer-core`(브라우저 다운로드 없이 설치된 Chrome 사용)로 다시 만듦
- 주의: 운영 Turnstile은 헤드리스 Chrome을 봇으로 보고 막으므로 운영 신청 시험은 사용자가 직접 함. 운영 DB에 AI가 시험 데이터를 넣지 않음

## 겪은 문제와 원인

- Cloudflare 빌드 실패: 프로젝트를 Workers로 만들어 `wrangler deploy` 실행 → Pages로 다시 연결해 해결
- "자동 입력 방지 확인이 끝난 뒤 다시 눌러 주세요"만 나옴: 프로덕션 비밀 값 미등록 → 등록·재배포로 해결. 비밀 값은 **재배포해야 반영**
- 도메인 없이 Resend: 보내는 주소 `onboarding@resend.dev`, 받는 주소는 Resend 가입 이메일만 가능

## 지켜야 할 것 (AGENTS.md 요약)

- 답변 첫 줄 `YYYY-MM-DD HH:mm:ss KST`, 한국어, 콘솔 답변 짧게. 문서는 평어·개조식
- `doc/`, `task/task_history/`, `donotreadai/`는 지시 없이 읽지 않음. `task/.env.*`, `.dev.vars` 읽거나 커밋하지 않음
- 커밋·푸시는 지시(`깃헙푸시` 등) 있을 때만. 이메일·전화번호 등 개인정보는 GitHub로 보내지 않음(사이트에 공개된 연락처는 예외로 이미 포함)
- 작업 끝나면 결과 보고서 → `task/task_history/날짜_작업요약_RESULT.md`
- 문구·디자인 임의 변경 금지, 보험 광고 단정 표현 금지, 자리표시 임의로 채우지 않음(`CLAUDE.md`)
