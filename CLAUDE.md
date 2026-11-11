# 김광열 팀장 보험 상담 웹사이트

20년 경력 보험 설계사(김광열 팀장)의 1페이지 소개·상담 신청 웹사이트. Cloudflare Pages(정적 파일 + Pages Functions)로 운영하고, 상담 신청은 D1에 저장·Resend로 메일 알림, 관리자 페이지는 Cloudflare Access로 보호한다. 배포·운영 절차는 `README.md`.

## 먼저 읽을 것

AI 페르소나(`AGENTS.md`, 세션 시작 때 자동으로 불러옴):

@AGENTS.md

## 구조

- `public/` — **배포되는 유일한 폴더.** 공개해도 되는 파일만 둔다(문서·설정·`task/`를 넣지 않는다)
  - `index.html` — 사이트 본문. HTML·CSS(`<style>`)·JS(`<script>`) 한 파일, 프레임워크·빌드 없음
  - `admin/index.html` — 관리자 페이지(목록 `#/`, 상세 `#/<id>`). 한 파일
  - `_headers`, `robots.txt`
- `functions/` — Pages Functions. 파일 경로가 곧 URL(`functions/api/consult.js` → `POST /api/consult`)
  - `api/admin/_middleware.js`, `admin/_middleware.js` — 관리자 인증(Access 토큰 검증)
- `lib/` — Functions 공용 코드: `constants.js`(선택지·글자 수·상태 이름), `validate.js`, `email.js`, `access.js`, `retention.js`(개인정보 보유 기간), `format.js`, `consultation.js`
- `migrations/` — D1 스키마(`0001_init.sql`). 운영 DB 변경은 사용자가 직접 하므로, 스키마가 바뀌면 이 파일만 맞춰 고친다
- `wrangler.toml` — Pages·D1 설정. 비밀 값은 넣지 않는다
- `index.html` 섹션 순서(앵커 id): `#home` → `#about` → `#services` → `#pension` → `#coverage` → `#contact`(상담신청) → 푸터(보험 광고 고지) + 떠 있는 "무료 상담" 버튼. 섹션을 바꾸면 `nav ul`도 함께 고친다
- `index.html` JS: 나이대 탭, 보장분석 체크 결과, `preset(v)`(상담 분야 미리 선택), 문의 글자 수, Turnstile 표시(`onTurnstileLoad`), `sendForm()`(`POST /api/consult`)

## 기준

- **문구·구성·디자인을 임의로 바꾸거나 "개선"하지 않는다.** 바꿀 이유가 있으면 먼저 묻는다.
- 색은 `:root`의 CSS 변수(`--navy`, `--navy2`, `--accent`, `--teal`, `--bg`, `--card`, `--text`, `--muted`, `--line`)를 쓴다. 새 스타일에 hex 값을 직접 쓰지 않는다. 예외: 메일 본문(`lib/email.js`)은 CSS 변수를 못 쓰므로 같은 값을 옮겨 쓴다. 기존 코드에 남은 hex는 지시 없이 정리하지 않는다.
- `public/admin/index.html`의 `:root`는 `public/index.html`과 같게 유지한다.
- 글꼴은 Pretendard만 쓴다.
- 반응형 기준점은 `max-width:860px` 하나다. 새 요소도 이 기준점에서 모바일 배치를 함께 만든다. 모바일에서 가로 스크롤이 생기지 않게 한다.
- 한국어 줄바꿈은 `word-break:keep-all`(body 기본값)을 유지한다.
- 외부 리소스는 Pretendard CDN, Turnstile 스크립트, Resend API만 쓴다. 새 라이브러리·CDN·서비스·빌드 도구를 추가하지 않는다. 필요하면 먼저 묻는다.
- 폼 선택지(연령대·상담 분야)와 보장분석 체크 항목(`#coverage .chk`의 `<b>` 글자)은 `public/index.html`과 `lib/constants.js`(`COVERAGE_ITEMS`)에 함께 있다. 바꿀 때는 둘 다 바꾼다.
- 보장분석 체크 항목은 신청서의 상담 분야 아래에 표시하고, 문의 내용과 따로 `interests_detail` 컬럼(쉼표 구분)에 저장한다. 사용자 문의 입력란과 500자 제한에는 넣지 않는다.

## 보험 광고·개인정보 주의

- 보험 광고 심의 대상 사이트다. **수익·보장·보험료에 대한 단정 표현(확정, 보장, 무조건, 최고 등)이나 근거 없는 수치를 새로 쓰지 않는다.** 상담 문구를 새로 써야 하면 초안으로 제시하고 확인받는다.
- 푸터의 보험 광고 고지문은 지우거나 줄이지 않는다.
- `[금액 입력]`, `[번호 입력]`, `[기간 입력]` 같은 자리표시는 사용자가 채울 값이다. 임의의 값으로 채우지 않는다. 남아 있으면 작업 보고에 적는다.
- 상담 전화번호는 `index.html` 안 여러 곳(히어로 `tel:`, 상담신청 `tel:`·`sms:`, 화면 표시 문자열, 푸터)에 있다. 바꿀 때는 모두 함께 바꾼다.
- 개인정보 보유 기간은 "상담 완료 후 즉시 파기, 미완료 시 최대 1년"이다. 바꾸면 동의 문구(`#fAgree`), `lib/retention.js`, 메일 안내 문구, `README.md`를 함께 바꾼다.
- 입력값 검증은 서버(`lib/validate.js`)에서 다시 한다. 브라우저 검증만 믿지 않는다.
- 관리자 화면·메일에서 입력값은 텍스트로만 넣는다(관리자 화면은 `h()`/`textContent`, 메일은 `escapeHtml`). `innerHTML`에 입력값을 넣지 않는다.
- 관리자 인증은 Access 토큰 검증(`lib/access.js`)을 거친다. 설정이 없으면 막는(403) 동작을 유지한다. `ADMIN_DEV_BYPASS`는 localhost 전용이다.
- 로그에 개인정보(성함·연락처·문의 내용)를 남기지 않는다. 신청 id만 남긴다.
- 분석 스크립트(GA 등)·외부 추적 코드를 추가하지 않는다.
- 비밀 값(Resend 키, Turnstile 비밀 키, 수신·관리자 이메일 등)은 Cloudflare 비밀 값과 `.dev.vars`에만 둔다. 저장소·문서에 쓰지 않는다. `.dev.vars`, `task/.env.*`는 읽거나 커밋하지 않는다.

## 명령

```bash
npm install
cp .dev.vars.example .dev.vars   # 처음 1회
npm run db:migrate:local         # 처음 1회, 스키마나 database_id가 바뀌면 다시
npm run dev                      # http://localhost:8788
npm run preview:email            # 메일 미리보기 → .wrangler/email-preview.html
```

## 확인 방법

- `npm run dev`로 띄워서 확인한다(파일을 직접 열면 API가 동작하지 않는다).
- 바꾼 부분은 데스크톱(1080px 이상)과 모바일(360px 내외, 860px 이하) 두 폭에서 확인한다. 모바일에서는 ☰ 메뉴 열림·닫힘도 본다.
- 상담 신청을 건드렸으면: 501자 입력 불가·글자 수 표시, 미동의 시 제출 막힘, 정상 신청 → 완료 안내, 관리자 목록에 최신순으로 표시.
- 관리자 화면을 건드렸으면: 목록·더 보기·상세·상태 변경·삭제, 보유 기간 삭제 권장 표시(1개월 이내·초과·상담 완료).
- API는 curl로 잘못된 입력(긴 문의, 미동의, 형식 오류, 토큰 없음)이 400으로 막히는지, 다른 출처의 관리자 변경 요청이 403인지 본다.
- 콘솔 오류가 없어야 한다. 메일 실제 발송과 Access 로그인은 로컬에서 확인할 수 없으므로 확인하지 못했다고 보고한다.
- 확인하지 못한 항목은 확인하지 못했다고 보고한다.
