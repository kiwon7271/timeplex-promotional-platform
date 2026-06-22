# 프로젝트 구조 · 코드 일관성

## 폴더 구조

```txt
src/
  app/                    # App Router (admin / store / login)
  actions/                # Server Actions (도메인별 파일)
  components/
    ui/                     # 공통 UI (Button, Modal, Table, DropdownMenu …)
    layout/                 # AppShell, nav
    chat/                   # 고객 대화 공통 (→ elements/templates 분리 예정)
    store/                  # 매장 전용
      elements/             # 하위 UI 조각
    admin/                  # 통합관리자 전용
      elements/
    inquiries/              # 매장 문의 (elements + templates 성격)
    documents/              # 서류 미리보기 등 공용
  lib/                      # 순수 로직, 상수, Supabase 헬퍼
  types/                    # database.ts, 도메인별 props
  hooks/
supabase/
  migrations/               # 0001 ~ 0013
  setup.sql                 # 통합 스키마 (신규 환경 참고용)
  seed.sql
scripts/
docs/                       # 본 디렉터리
```

## 네이밍

| 대상 | 규칙 | 예 |
|------|------|-----|
| 컴포넌트 | PascalCase | `DocumentChecklistItem` |
| 파일명 | kebab-case | `document-checklist-item.tsx` |
| 함수·변수 | camelCase | `onClickUploadButton` |
| 이벤트 핸들러 | `on` + 이벤트 + 대상 | `onClosePreviewModal` |
| Server Action | `on` + 동사 | `onSendMessage`, `onCreateInquiry` |
| lib export | camelCase | `getInquiryCategoryLabel` |

## 컴포넌트 조립

- **elements** — 단일 책임 UI (버튼, 행, 필터, 메뉴)
- **templates** — elements + layout 조합 (목록+모달, 채팅 레이아웃)
- 페이지(`app/`) — 데이터 fetch + template 조립

> **현재:** `inquiries/`, `store/elements/`는 패턴 적용됨. `chat/`은 flat 구조 → 고객 대화 본격 작업 시 `chat/elements`, `chat/templates`로 정리 예정.

## Server / Client

- **page.tsx** — 가능한 Server Component (Supabase 조회)
- **"use client"** — 상호작용, hooks, 브라우저 API
- **actions/** — `"use server"`, mutation·revalidatePath

## UI 공통

- 반응형 필수 (`sm:`, `lg:` 등)
- 목록 테이블 — `ListSection` + `Table` + `ListPagination`
- 확인/알림 — `useDialog()` (브라우저 `alert` 사용 금지)
- 아이콘 — `@tabler/icons-react`, `ICON_SIZE` / `ICON_STROKE`
- 툴팁 — 스크롤 영역에서는 `tooltipPlacement="bottom"`

## Supabase

- 브라우저/서버 — `createClient()` (`lib/supabase/server` | `client`)
- 웹훅·배치 — `createServiceClient()` (서버 전용, RLS 우회)
- 타입 — `types/database.ts` (스키마 변경 시 동기화)

## 주석

- 비즈니스 로직·비자명한 처리에 **한국어** 주석
- TODO 남기지 않음 — 작업 단위로 완료

## Dead code 정리 (2026-06)

- ~~`components/chat/message-log.tsx`~~ — `chat-thread-log.tsx`로 대체되어 삭제
