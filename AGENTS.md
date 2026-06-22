# Agent 작업 가이드

Timeplex promotional platform — Cursor/AI 에이전트용 요약 규칙.

## 프로젝트

- Next.js 14 App Router + TypeScript + Supabase + Tailwind
- 역할: `SUPER_ADMIN` (`/admin`), `STORE_OWNER`/`STORE_STAFF` (`/store`)

## 문서 우선 읽기

1. [docs/domains.md](./docs/domains.md) — **고객 대화 vs 매장 문의** 구분
2. [docs/chat-architecture.md](./docs/chat-architecture.md) — 다음 핵심 작업
3. [docs/project-structure.md](./docs/project-structure.md) — 네이밍·폴더 규칙

## 코드 규칙

- 컴포넌트 PascalCase, 파일 kebab-case
- 이벤트 핸들러: `onClickXxx`, Server Action: `onXxx`
- elements(하위) + templates(상위) 조립
- 반응형 필수, 한국어 주석, TODO 금지
- 최소 diff — 요청 범위 외 수정 금지

## 도메인 주의

- **고객 대화:** `conversations` / `actions/chats.ts` / `/store/chats`
- **매장 문의:** `inquiries` / `actions/inquiries.ts` / `/store/inquiries`
- 혼동 금지

## Supabase

- 마이그레이션: `supabase/migrations/0001` ~ `0013` 순서
- 웹훅·배치: `createServiceClient()` (서비스 롤)
- 커밋은 사용자 요청 시에만

## 현재 우선순위

고객 대화 프로덕션화 — webhook, Realtime, outbound messenger, 스키마 확장.  
상세: [docs/chat-architecture.md](./docs/chat-architecture.md)
