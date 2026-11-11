# Cloudflare 운영 매뉴얼 작성 결과

- 일시: 2026-11-11 KST
- 지시: Cloudflare 가입부터 Pages·DB 생성 등 해야 할 일을 `CloudflareManual.md`에 상세히 정리

## 한 일

- 저장소 최상위에 `CloudflareManual.md` 작성
- 구성: 전체 순서표 → 가입(2단계 인증) → 개발 도구·wrangler 로그인 → D1(`consulting-db`) 생성·스키마 적용 → Pages(GitHub 연결, Workers로 만들었을 때 복구) → Turnstile → Resend(도메인 전후 주소 조건) → 비밀 값 7개 → 재배포 → Access(Zero Trust, pages.dev 등록 방법) → 동작 확인표 → 도메인 구매·연결(.kr은 외부 등록업체) → 운영(삭제·설정 변경·백업) → 문제 해결 → 비용
- 이번 세션에서 실제로 겪은 문제(Workers로 생성되어 빌드 실패, 비밀 값 미등록으로 Turnstile 미표시, 재배포 필요)를 문제 해결 항목에 반영
- 개인 이메일·키 값은 쓰지 않음

## 확인하지 못한 것

- Cloudflare·Resend 화면의 실제 메뉴 이름·위치(화면 개편 가능성 있어 문서 첫머리에 안내)
- Access의 pages.dev 등록 절차는 Cloudflare 문서 기준이며 실제 화면에서 따라 해 보지 않음

## 참고

- `README.md`의 백업 명령과 `wrangler.toml` 주석의 DB 이름이 아직 `mr-chois-friend-db`임(실제 `consulting-db`). 이번 지시 범위 밖이라 고치지 않음
