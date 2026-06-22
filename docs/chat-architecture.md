# 고객 대화 (Customer Chat) 아키텍처

매장주·매장직원과 **실제 고객**(메신저 인입) 간 대화 기능의 현재 상태와 다음 구현 범위입니다.

---

## 1. 목표

| 역할 | 목표 |
|------|------|
| **고객** | WhatsApp / LINE / Instagram / WEB 등으로 매장에 문의 |
| **매장** | `/store/chats`에서 채널 통합 인박스, 회신·첨부·예약 링크 |
| **통합관리자** | `/admin/chats`에서 전 매장 대화 **열람** (발신 없음) |

---

## 2. 현재 구현 (목업)

### 2.1 데이터 모델

```
conversations
  store_id, channel (WEB|WHATSAPP|LINE|INSTAGRAM)
  customer_name, customer_phone, customer_email
  customer_locale (ISO 639-1 — 고객 첫 메시지 언어)
  status (OPEN|CLOSED), last_message_at

messages
  conversation_id, sender (CUSTOMER|STORE|SYSTEM)
  body, translated_body  — 원문 + 번역본

store_channel_connections  — 매장별 메신저 연결 골격 (0014)
message_attachments      → Storage: chat-attachments/{store_id}/{conversation_id}/...
message_reservation_links → 예약 링크 스냅샷
usage_monthly            → 월별 message_count (수동 시드만, 자동 집계 없음)
```

### 2.2 RLS

- `SUPER_ADMIN` — 전체
- `STORE_OWNER` / `STORE_STAFF` — `store_id = current_store_id()`인 conversation·message만

### 2.3 애플리케이션 플로우

```
[매장] /store/chats
  → 동의 확인 (hasStoreChatConsent)
  → conversations 목록 (검색 q, 채널 channel)
  → messages + signed URL
  → MessageComposer → onSendMessage (한국어 → 고객 언어 번역)
  → useChatRealtime — conversations/messages Realtime 구독

[인바운드] lib/chat-inbound.ts — receiveCustomerMessage (웹훅 공용)
  → 고객 언어 감지·customer_locale 저장
  → 한국어 translated_body 저장

[관리자] /admin/chats
  → 매장 선택 → 대화 선택 → ChatThreadLog (읽기 전용)
```

### 2.4 관련 파일

| 구분 | 경로 |
|------|------|
| 페이지 | `app/store/chats/page.tsx`, `app/admin/chats/page.tsx` |
| 액션 | `actions/chats.ts` (`onSendMessage`만) |
| 공통 UI | `components/chat/*` |
| 매장 래퍼 | `components/store/store-chat-live-layout.tsx`, `elements/store-chat-guide.tsx`, `store-chat-consent-gate.tsx` |
| 관리자 래퍼 | `components/admin/admin-chat-log-layout.tsx` |
| lib | `lib/chat-messages.ts`, `lib/chat-translation.ts`, `lib/chat-inbound.ts`, `lib/translate.ts`, `lib/locale.ts` |
| Realtime | `hooks/use-chat-realtime.ts` |
| 시드 | `scripts/seed.mjs` (WEB 샘플 1건) |

### 2.5 동의 게이트

고객 대화 이용 전 `consent_notices` 동의 필수 — `StoreChatConsentGate`, `actions/consent.ts`.

---

## 3. 미구현 (프로덕션 갭)

### 3.1 인바운드 (고객 → 매장)

- [x] `lib/chat-inbound.ts` — `receiveCustomerMessage` (번역·locale 저장)
- [ ] Webhook API (`app/api/webhooks/...`) — Meta / LINE / Instagram
- [ ] 외부 사용자 ID → `conversations` upsert
- [ ] 인바운드 미디어 → Storage 업로드
- [ ] Idempotency (중복 이벤트 방지)

### 3.2 아웃바운드 (매장 → 고객)

- [x] `onSendMessage` — 한국어 원문 + 고객 언어 `translated_body` 저장
- [ ] 채널별 API 발송 (WhatsApp / LINE / Instagram)
- [ ] delivery_status / external_message_id

### 3.3 스키마 확장 (예정)

```sql
-- 0014 적용됨
store_channel_connections
conversations.customer_locale

-- 추후
conversations.external_thread_id
messages.external_message_id, delivery_status
webhook_events             -- dedup
```

### 3.4 Realtime

- [x] `conversations`, `messages` publication (0014)
- [x] `useChatRealtime` — 목록·메시지 갱신

### 3.5 기타

- [ ] `usage_monthly` 자동 집계 (trigger 또는 job)
- [x] `translated_body` 번역 pipeline (`lib/translate.ts`, OpenAI)
- [ ] WEB 고객 위젯 (공개 route)
- [ ] conversation 생성·종료 UI
- [ ] 새 메시지 nav badge

---

## 4. 권장 구현 순서

### Phase A — 정리 (현재)

- [x] 도메인 문서화 (`domains.md`, 본 문서)
- [x] dead code 제거 (`message-log.tsx`)
- [ ] `chat/elements`, `chat/templates` 폴더 분리

### Phase B — DB·서비스 골격

1. `store_channel_connections` + external ID 컬럼
2. `lib/messenger/` — 채널별 adapter 인터페이스
3. `inbound-handler` (service client) + webhook route
4. `outbound-dispatcher` — `onSendMessage` 확장

### Phase C — UX

1. Realtime on `ChatThreadLog`
2. 채널 Badge/아이콘/한글 라벨
3. conversation OPEN/CLOSED 관리

### Phase D — 채널별 연동

1. WhatsApp Business API (또는 우선 채널 1개)
2. LINE Messaging API
3. Instagram DM
4. WEB embed

---

## 5. 매장 문의와의 차이

| | 고객 대화 | 매장 문의 |
|--|-----------|-----------|
| 테이블 | `conversations` | `inquiries` |
| 상대 | 고객 | Timeplex 운영팀 |
| UI | 좌측 목록 + 챗 UI | 게시판 목록 + 모달 |
| 액션 | `actions/chats.ts` | `actions/inquiries.ts` |

코드 재사용 시 **UI 패턴만** 참고하고, 테이블·액션은 분리 유지합니다.

---

## 6. 로컬 개발

```bash
npm run dev
# .env.local — OPENAI_API_KEY 설정 시 번역 테스트 가능
# 샘플 대화: npm run seed (매장 승인 후)
# /store/chats — 동의 후 WEB 채널 샘플 대화 확인
```

Webhook 로컬 테스트 시 ngrok 등으로 `app/api/webhooks/*` 노출 예정.

---

*다음 작업 착수 시 본 문서 Phase B부터 갱신합니다.*
