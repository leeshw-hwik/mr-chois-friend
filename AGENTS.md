# 🤖 AI Agent Persona &amp; Rules

이 파일은 AI 개발 에이전트(Claude Code, Gemini, Codex 등)가 공통으로 준수해야 하는 프로젝트 규칙이다.

---

## 🗂️ 프로젝트 개요

보험 설계사 소개·상담 신청용 1페이지 정적 웹사이트를 개발하는 프로젝트다.

- `public/` — 배포되는 웹사이트(`index.html` 본문, `admin/` 관리자 페이지)
- `functions/`, `lib/`, `migrations/` — Cloudflare Pages Functions(API)·D1 스키마
- `README.md` — 프로젝트 개요

---

## 🧭 코딩 행동 지침

속도보다 신중함을 우선한다. 사소한 작업은 상황에 맞게 판단한다.

1. **코딩 전에 생각한다** — 가정을 명시하고, 해석이 여러 가지면 임의로 고르지 않고 제시한다. 불명확하면 멈추고 질문한다. 더 단순한 방법이 있으면 말한다.
2. **단순함을 우선한다** — 요청받지 않은 기능·추상화·설정 가능성·불필요한 예외 처리를 넣지 않는다. 더 짧게 가능하면 다시 작성한다.
3. **필요한 부분만 수정한다** — 인접 코드·주석·포맷을 "개선"하지 않고 기존 스타일을 따른다. 자신의 변경으로 미사용이 된 요소만 제거하고, 기존 죽은 코드는 언급만 한다. 변경된 모든 줄은 요청과 직접 연결되어야 한다.
4. **목표 중심으로 실행한다** — 작업을 검증 가능한 목표로 바꾸고, 여러 단계 작업은 `[단계] → 검증: [확인 방법]` 형태의 계획을 먼저 밝힌다.

---

## 🔒 보호 및 제한 대상 (Explicit Restriction &amp; Protection)

다음 항목들은 데이터 보안, 저장소 무결성 및 외부 유출 방지를 위해 사용자의 명시적 지시가 있을 때만 한정적으로 다룬다.

1. **`doc/` 디렉토리**:
   - `doc/` 하위의 모든 자료는 **사용자의 별도 명시적 지시가 없는 한 AI가 사용·참조하지 않는다.**
   - 절대 외부로 유출되거나 AI 학습/외부 서버로 전송되어서는 안 된다.
2. **AI 임의 사용 금지 디렉토리**:
   - `task/task_history/` 하위의 자료는 불필요한 토큰 사용량을 줄일기 위해 **사용자의 별도 명시적 지시가 없는 한 AI가 사용·참조하지 않는다.**
   - `donotreadai/` 하위의 자료는 불필요한 토큰 사용량을 줄일기 위해 **사용자의 별도 명시적 지시가 없는 한 AI가 사용·참조하지 않는다.**
3. **보안 및 환경 설정 파일 (`.env*`, 인증키 등)**:
   - `.env.local`, `.env.dev`, `.env.prod`, `environment-*.yaml` 및 인증 키/토큰 정보는 메모리 내에서만 참조하며, **절대 PC 외부로 반출할 수 없다.**
   - 비밀번호, ID, 카드번호, 주민번호, 전화번호, 이메일 등 민감 개인정보는 AI 제공사 서버, 외부 API, GitHub를 포함한 어떤 외부로도 절대 전송하지 않는다.
4. **Git 원격 저장소 푸시 및 릴리즈**:
   - `git push`, `git tag`, 릴리즈 배포 등 원격 저장소에 영향을 미치는 동작은 사용자의 명시적 지정 명령어(`깃헙푸시`, `깃헙태그`, `깃헙릴리즈`) 또는 직접적인 지시 없이 임의로 수행하지 않는다.
   - 커밋 등 로컬 git 명령도 지시 없이 수행하지 않는다.
5. **핸드오프 문서 생성**:
   - `task/HANDOFF.md` 문서는 사용자의 명시적 명령(`종료준비`, `핸드오프`) 없이 임의로 생성하거나 덮어쓰지 않는다.

---

## 버전 관리 규칙

### [Version Rule: vMAJOR.MINOR.PATCH]

- **MAJOR (X.0.0)**: 핵심 역할, 아이덴티티, 입출력 포맷의 근본적 변경 (Breaking Change)
- **MINOR (0.Y.0)**: 새로운 툴/기능, 참조 지식, 예시(Few-shot) 추가
- **PATCH (0.0.Z)**: 오탈자 수정, 지시문 문맥 명확화, 말투 미세 조정

### Changelog Guidelines

모든 변경 사항은 최신순(역순)으로 기록하며, 버저닝 규칙(`vMAJOR.MINOR.PATCH`)을 준수합니다.

#### 작성 형식
``` markdown
## [vX.Y.Z] - YYYY-MM-DD
### Added    - 새로 추가된 기능, 지식 베이스, 프롬프트 예시
### Changed  - 기존 동작, 어투(Tone), 로직 및 구조 변경
### Fixed    - 오탈자, 모호한 표현 수정, 버그 보완
### Removed  - 폐기되거나 제거된 규칙 및 도구
```

---

## 상시 준수 작업 규칙 (Operational Rules)

### 타임라인 기록 (KST)

- 콘솔 답변 시 맨 첫 줄에 반드시 `YYYY-MM-DD HH:mm:ss KST` 형태의 타임라인을 표기한다.

### 작업 지시, 보고서, 계획서 라이프사이클 (`task/`)

- **작업 지시 등록**: 작업 지시는 `task/TODO.md` 형태로 등록된다.
- **작업 완료 보고서 작성**: 작업을 완료하면 별도 지시가 없더라도 반드시 `task/TODO_RESULT.md` 파일로 상세 작업 결과 보고서를 작성한다.
- **작업 계획서 작성**: 계획 수립을 요청받은 경우 `task/TODO_PLAN.md` 파일로 작성한다.
- **이력 아카이빙 (`task_history`)**:
  - 완료된 작업 지시 파일과 보고서는 `task/task_history/` 디렉토리로 이동하여 백업한다. 파일명은 `날짜+작업 요약`으로 하는 마크다운 파일로 한다.
  - 파일명 형식: `날짜+작업 요약.md`, `날짜+작업 요약_RESULT.md` (기존 번호에 이어 1씩 증가, 덮어쓰기 금지).
  - 이동 후에는 비어있는 `task/TODO.md`를 새로 생성하고, `task/TODO_RESULT.md` 및 `task/TODO_PLAN.md`는 남기지 않는다(존재 시 삭제).
- **문체 규정 (중요)**: 작업의 결과물 또는 부산물로 작성되는 모든 문서(MD, TXT, 보고서 등)에는 **일체 경어(존댓말)를 사용하지 않는다.** (평어, 개조식, ~함, ~음, ~임 형태 준수)
- **콘솔 답변 간결화**: 상세 작업 결과는 보고서 파일(`날짜+작업 요약_RESULT.md`)에 작성하며, 콘솔 답변은 결과를 요약하여 간단히 출력한다.

### 기타

- 모든 소통과 문서 작성은 **한국어**를 원칙으로 한다.
- 작업지시가 타당하지 않은 경우 사유를 밝히고 작업을 중지한다.
- 네트워크 제한으로 인한 오류 발생 시, 즉시 사용자에게 보고하고 대안을 제안한다.

<!-- trail:start -->

## Trail — repo context graph

This repo is indexed in `.trail/cache/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `trail map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `trail ask "<your question>" --source` → ranked nodes with the relevant
code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
definitions when the crux isn't enough). Match the tool to the task shape:
for understanding or editing, the top node IS the answer — cite its
`covers:` file:line spans and edit straight from `--source`. For
exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
results are top-N, not complete — run `trail grep "<literal>"` instead
(exhaustive over indexed files, grouped by enclosing symbol), falling back
to raw `grep -rn` only for unindexed files.
- `trail skeleton <file>` → every definition's signature + span, ~10× cheaper
than reading the file; use it to skim an API surface.
- `trail callers <symbol>` gives precomputed, exact edges — who calls this.
Add `--direction out` for what it calls, or `--depth N` to walk
transitively for the full blast radius. For structural questions, skip
ranking and use this directly.
- Or browse: `.trail/cache/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
hits carry `[scope/]` labels naming which one they're from. Narrow with
`trail ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `trail build` (deterministic,
no API key, $0).

<!-- trail:end -->