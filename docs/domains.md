# 기능 도메인 구분

혼동하기 쉬운 기능을 명확히 구분합니다.

## 고객 대화 (Customer Chat)

| 항목 | 내용 |
|------|------|
| **대상** | 매장 ↔ **실제 고객** (WhatsApp, LINE, Instagram, WEB 등) |
| **DB** | `conversations`, `messages`, `message_attachments`, `message_reservation_links` |
| **매장 UI** | `/store/chats` — 목록·검색·메시지 전송 |
| **관리자 UI** | `/admin/chats` — **읽기 전용** 로그 |
| **상태** | UI·DB CRUD **목업** — 외부 메신저·Realtime **미연동** |
| **상세** | [chat-architecture.md](./chat-architecture.md) |

## 매장 문의 (Store Inquiry)

| 항목 | 내용 |
|------|------|
| **대상** | 매장 ↔ **Timeplex 운영팀** (플랫폼 CS) |
| **DB** | `inquiries`, `inquiry_messages` |
| **매장 UI** | `/store/inquiries` |
| **관리자 UI** | `/admin/store-inquiries` |
| **상태** | 게시판형 모달, 구분 필터, 댓글 CRUD **구현 완료** |

## 심사 서류 (Store Documents)

| 항목 | 내용 |
|------|------|
| **대상** | 매장 → 카드사 심사용 서류 제출 |
| **DB** | `store_documents` |
| **UI** | `/store/documents`, 관리자 매장 상세 내 검수 |
| **Storage** | `store-documents` |

## 입점 (Onboarding)

| 항목 | 내용 |
|------|------|
| **DB** | `onboarding_applications` (승인/반려 후 row 삭제) |
| **UI** | `/admin/store-admissions`, 로그인 회원가입 |

## 동의/고지 (Consent)

| 항목 | 내용 |
|------|------|
| **용도** | **고객 대화 이용 전** 필수 동의 |
| **DB** | `consent_notices`, `store_consent_agreements` |
| **UI** | `StoreChatConsentGate`, 설정 `/admin/settings` |

---

**주의:** 고객 대화(`conversations`)와 매장 문의(`inquiries`)는 UI 패턴(스레드·댓글)이 비슷하지만 **별도 도메인**입니다. 코드·액션·테이블을 섞지 않습니다.
