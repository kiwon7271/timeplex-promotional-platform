# Timeplex Admin MVP

Timeplex 통합 관리 플랫폼의 최소 기능(MVP). 인증, 역할 기반 라우팅, DB CRUD, 스토리지 업로드, 관리자/매장 대시보드 골격을 제공합니다.

## 문서

| 문서 | 대상 |
|------|------|
| [docs/README.md](./docs/README.md) | 문서 목록·인덱스 |
| [docs/domains.md](./docs/domains.md) | 기능 도메인 구분 |
| [docs/project-structure.md](./docs/project-structure.md) | 코드 구조·일관성 |
| [docs/chat-architecture.md](./docs/chat-architecture.md) | **고객 대화** 현황·로드맵 |
| [docs/work-summary-2026-06-18.md](./docs/work-summary-2026-06-18.md) | 비개발자용 기능 요약 |
| [AGENTS.md](./AGENTS.md) | AI 에이전트 작업 가이드 |

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (레이아웃/간격/반응형)
- Supabase Auth / Postgres / Storage
- Vercel 배포 호환

## 역할

| 역할 | 설명 | 진입 경로 |
| --- | --- | --- |
| `SUPER_ADMIN` | Timeplex 통합관리자 | `/admin` |
| `STORE_OWNER` | 매장관리자 | `/store` |
| `STORE_STAFF` | 매장 직원 | `/store` |

- 로그인 후 역할에 따라 자동 분기합니다.
- 모든 라우트는 미들웨어(`src/middleware.ts`)로 보호됩니다.
- 슈퍼관리자는 전체 데이터, 매장 사용자는 소속 매장 데이터만 접근(RLS 강제).

## 폴더 구조

```txt
src/
  app/            # 라우트 (login / admin / store)
  actions/        # Server Actions
  components/     # ui, layout, chat, store, admin, inquiries …
  lib/            # supabase, auth, 상수, 도메인 유틸
  types/          # database 타입, props
supabase/
  migrations/     # 0001 ~ 0014
  setup.sql       # 통합 스키마
  seed.sql
scripts/
docs/             # 프로젝트 문서
```

상세: [docs/project-structure.md](./docs/project-structure.md) · [docs/supabase.md](./docs/supabase.md)

## 환경 변수

`.env.example`를 복사해 `.env.local`을 만들고 값을 채웁니다.

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다. 클라이언트에서 import 하지 마세요.

통합관리자 계정(최초 1회 또는 비밀번호 재설정):

```txt
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
```

```bash
npm run create-admin
```

매장 계정은 로그인 화면 **매장 회원가입** → 통합관리자 **입점 승인**으로 생성합니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

## Supabase 설정 순서

1. Supabase 프로젝트 생성 후 환경 변수 입력.
2. SQL Editor 또는 CLI로 마이그레이션 **순서대로** 적용:

| 파일 | 내용 |
|------|------|
| `0001_schema.sql` | 기본 테이블 |
| `0002_rls.sql` | RLS |
| `0003_storage.sql` | Storage 버킷 |
| `0004_message_reservation_links.sql` | 메시지 예약 링크 |
| `0005_store_consent_agreements.sql` | 매장 약관 동의 |
| `0006_onboarding_application_password.sql` | 입점 신청 비밀번호 |
| `0007_onboarding_user_signup.sql` | 회원가입 |
| `0008_store_document_rejection_reason.sql` | 서류 반려 사유 |
| `0009_onboarding_application_reviewed_at.sql` | 입점 reviewed_at |
| `0010_onboarding_applications_realtime.sql` | 입점 Realtime |
| `0011_inquiry_messages.sql` | 문의 댓글 |
| `0012_inquiry_schema_cleanup.sql` | 문의 스키마 정리 |
| `0013_inquiry_category.sql` | 문의 구분 |
| `0014_chat_foundation.sql` | 고객 언어, 메신저 연결, Realtime |
| `0015_line_integration.sql` | LINE external ID, credentials |
| `0016_line_webhook_tracking.sql` | Webhook 수신 추적 |
| `0017_conversation_thread_unique.sql` | LINE 중복 대화방 병합·방지 |

3. 기본 시드: `supabase/seed.sql`
4. 통합관리자: `npm run create-admin`
5. (선택) 샘플 대화: `npm run seed` — 매장 승인 후

> Auth 계정은 시드 스크립트로 만들지 않습니다. 비밀번호는 8자 이상.

## 스토리지

- 버킷: `store-documents`, `chat-attachments` (비공개)
- 허용: `jpg`, `jpeg`, `png` / 최대 5MB
- 경로
  - `store-documents/{store_id}/{doc_type}/{file_name}`
  - `chat-attachments/{store_id}/{conversation_id}/{file_name}`

## 라우트

```txt
/login
/admin  /admin/stores  /admin/store-admissions  /admin/demand  /admin/visitor-stats
/admin/chats  /admin/chat-usage  /admin/store-inquiries  /admin/settings
/store  /store/info  /store/staff  /store/reservation-links
/store/documents  /store/chats  /store/inquiries
```

## MVP 제외 · 다음 작업

- **다음 핵심:** 고객 대화 — 메신저 webhook, Realtime, 아웃바운드 ([chat-architecture.md](./docs/chat-architecture.md))
- 제외: 결제, PDF/OCR, 푸시, 최종 브랜드 디자인, 번역 API(스키마만 존재)

## 도메인 구분

- **고객 대화** (`/store/chats`) — 매장 ↔ 고객 (메신저)
- **매장 문의** (`/store/inquiries`) — 매장 ↔ Timeplex 운영팀

→ [docs/domains.md](./docs/domains.md)
