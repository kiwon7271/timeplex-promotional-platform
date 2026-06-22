# Timeplex 문서 목록

프로젝트 문서는 **개발자용**과 **비개발자용**으로 나뉩니다.

## 개발자용

| 문서 | 설명 |
|------|------|
| [../README.md](../README.md) | 설치, 환경 변수, 마이그레이션, 라우트 |
| [project-structure.md](./project-structure.md) | 폴더 구조, 네이밍, 컴포넌트 조립 규칙 |
| [domains.md](./domains.md) | 기능 도메인 구분 (고객 대화 vs 매장 문의 등) |
| [chat-architecture.md](./chat-architecture.md) | **고객 대화** 현황·갭·다음 작업 로드맵 |
| [messenger-integration-research.md](./messenger-integration-research.md) | **메신저 연동** 조사 (Instagram·LINE·WhatsApp) |
| [supabase.md](./supabase.md) | SQL·마이그레이션·DB 확인 |
| [../AGENTS.md](../AGENTS.md) | AI/에이전트 작업 시 참고 규칙 |

## 비개발자용

| 문서 | 설명 |
|------|------|
| [work-summary-2026-06-18.md](./work-summary-2026-06-18.md) | 2026-06-18 기준 기능 요약 |

## 마이그레이션

`supabase/migrations/` — `0001` ~ `0013` 순서 적용. 상세는 [README.md](../README.md#supabase-설정-순서) 참고.

## 다음 작업 우선순위

1. **고객 대화** — 메신저 인입·Realtime·아웃바운드 (→ [chat-architecture.md](./chat-architecture.md))
2. 문서·코드 일관성 유지 (본 디렉터리 + `project-structure.md` 기준)
