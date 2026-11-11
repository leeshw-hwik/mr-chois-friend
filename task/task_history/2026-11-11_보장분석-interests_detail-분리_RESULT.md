# 보장분석 체크 항목 interests_detail 컬럼 분리 결과

- 일시: 2026-11-11 KST
- 지시: 보장분석 체크 항목을 문의 내용에 붙이지 말고 `interests_detail` 컬럼에 따로 저장. 운영 D1에는 컬럼을 추가해 두었으니 스키마 생성 파일만 수정

## 확인된 문제 (중요)

- **운영 D1 `consulting-db`에 `interests_detail` 컬럼이 없음.** `pragma_table_info` 결과 기존 10개 컬럼만 있음. 계정의 D1은 이것 하나뿐
- 이 상태로 새 코드를 배포하면 신청 저장(INSERT)이 모두 실패함 → 커밋·푸시하지 않음
- 운영에 컬럼 추가 명령(사용자 실행 또는 지시 시 AI 실행):
  - `npx wrangler d1 execute DB --remote --command "ALTER TABLE consultations ADD COLUMN interests_detail TEXT NOT NULL DEFAULT ''"`
  - 또는 대시보드 D1 → consulting-db → Console에서 같은 SQL 실행

## 한 일

- `migrations/0001_init.sql`: `interests` 다음에 `interests_detail TEXT NOT NULL DEFAULT ''` 추가(지시대로 기존 파일 수정, 새 마이그레이션 파일 없음)
  - 운영은 0001이 이미 적용 기록되어 있어 이 파일 수정으로는 컬럼이 생기지 않음. 위 ALTER가 필요함
- `lib/validate.js`: 체크 항목을 문의 내용에 붙이던 처리 삭제, `interestsDetail`(화면 순서, 쉼표 구분) 반환
- `functions/api/consult.js`: INSERT에 `interests_detail` 추가
- `lib/consultation.js`: 관리자 API에 `interestsDetail` 추가
- `public/admin/index.html`: 상세에 "보장분석 체크 항목" 행 추가(상담 분야 다음, 없으면 "(없음)")
- `lib/email.js`: 알림 메일에 "보장분석 체크" 행 추가(있을 때만, HTML·텍스트)
- `scripts/preview-email.mjs`: 예시 데이터에 체크 항목 추가
- `CLAUDE.md`: 보장분석 항목 저장 위치 설명 갱신
- 로컬 D1에만 같은 컬럼 ALTER로 추가(운영 DB 변경 없음)

## 확인 결과 (로컬)

| 항목 | 결과 |
| --- | --- |
| 스키마 파일로 새 DB 생성 시 `interests_detail` 포함 | 통과(sqlite3) |
| 문의 500자 + 체크 2개 → 문의 500자 그대로, `interests_detail`에 2개 | 통과 |
| 문의 501자 → 400 | 통과 |
| 허용 안 된 항목 → 400 | 통과 |
| 체크 없음 → `interests_detail` 빈 값 | 통과 |
| 신청서 표시·체크 반영·문의 입력란 비어 있음 | 통과 |
| 관리자 상세 "보장분석 체크 항목" 표시, 문의 내용에 섞이지 않음 | 통과 |
| 메일 텍스트에 "보장분석 체크" 행 | 통과(미리보기) |

## 남은 것

- 운영 D1에 컬럼 추가 → 확인 → 커밋·푸시
- 직전 작업(문의 본문에 붙이기) 결과 보고서는 이번 변경으로 내용이 바뀜(이력으로 남겨 둠)
- `CLAUDE.md` 규칙 "스키마는 새 번호 파일 추가"와 이번 지시(0001 직접 수정)가 다름. 규칙 유지 여부 결정 필요
