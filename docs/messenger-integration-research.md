# 메신저 연동 조사 (Instagram · LINE · WhatsApp)

> **목적:** 매장주가 SNS 계정을 Timeplex에 연결 → 고객 DM이 `/store/chats`에 표시  
> **원칙:** [Meta](https://developers.facebook.com/), [LINE Developers](https://developers.line.biz/) 공식 문서 기준. 불확실한 내용은 제외.

---

## 1. 목표 동작 (예상)

```
고객 → Instagram DM / LINE / WhatsApp 으로 메시지
     → 각 플랫폼 Webhook → Timeplex 서버
     → conversations / messages 저장
     → 매장관리자 /store/chats 에서 확인·회신
```

**전제:** Timeplex는 **멀티테넌트 플랫폼**(Tech Provider / ISV)이고, **매장주가 본인 계정을 연결**합니다.

---

## 2. 채널별 요약

| | WhatsApp | Instagram | LINE |
|--|----------|-----------|------|
| **매장 계정** | WhatsApp Business Platform (WABA) + 전화번호 | Instagram **Professional**(Business/Creator) + **Facebook Page** 연결 | **LINE Official Account** + Messaging API 채널 |
| **매장 연결 방식** | [Embedded Signup](https://developers.facebook.com/docs/whatsapp/embedded-signup/) (Meta 로그인 UI) | [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/) | LINE Official Account Manager에서 Messaging API 활성화 → **Channel Secret / Access Token** 발급 |
| **수신** | HTTPS Webhook (`messages` 필드) | 동일 Meta Webhook (`messages`) | HTTPS Webhook (`Use webhook` ON) |
| **발신** | Cloud API (`/messages`) | [Instagram Messaging API](https://developers.facebook.com/docs/instagram-messaging/overview/) (`graph.instagram.com`) | [Messaging API](https://developers.line.biz/en/docs/messaging-api/) |
| **Webhook 검증** | GET `hub.verify_token` + POST `X-Hub-Signature-256` (App Secret) | 동일 (Meta 공통) | POST `X-Line-Signature` (Channel Secret, HMAC-SHA256) |
| **Timeplex 사전 요건** | Meta **Tech Provider** 또는 Solution Partner, App Review, (대량 시) Business Verification | 동일 Meta App, **Advanced Access** (`instagram_manage_messages` 등) | 공개 HTTPS Webhook URL |
| **매장 사전 요건** | Meta Business, WABA, (Solution Partner 없으면) **결제 수단 등록** | Page Admin/Editor, IG Professional, Page–IG 연결 | LINE Official Account, Messaging API 사용 설정 |
| **비용 (매장)** | 2025-07-01~ **메시지별 과금**. 고객이 먼저 보낸 뒤 24h **customer service window** 내 non-template 회신은 **무료** ([Meta Pricing](https://developers.facebook.com/docs/whatsapp/pricing/)) | Meta 정책·Messaging API 동일 계열 | LINE Messaging API 요금 정책 별도 ([LINE Developers](https://developers.line.biz/)) |

---

## 3. 채널별 — 매장주 연동 절차 (확실한 부분만)

### 3.1 WhatsApp

**Timeplex(플랫폼) 준비**
1. Meta Developer App 생성, WhatsApp product 추가
2. **Embedded Signup v4** 구현 ([overview](https://developers.facebook.com/docs/whatsapp/embedded-signup/))
3. Webhook URL 등록 — GET 검증 + POST 수신 ([Webhooks 가이드](https://developers.facebook.com/docs/whatsapp/business-management-api/guides/set-up-webhooks/))
4. Tech Provider/Solution Partner 역할 및 App Review 완료

**매장주**
1. Timeplex UI에서 「WhatsApp 연결」→ Embedded Signup 완료
2. WABA·전화번호 생성/연결, Timeplex App에 권한 부여
3. Solution Partner가 아니면 **WABA에 결제 수단 등록** 후 메시징 가능 ([Embedded Signup 문서](https://developers.facebook.com/docs/whatsapp/embedded-signup/))

**제한 (공식)**
- Tech Provider 기본: **7일 rolling 7일간 신규 온보딩 10건** → Business Verification 등 완료 시 **200건** ([Embedded Signup](https://developers.facebook.com/docs/whatsapp/embedded-signup/))

---

### 3.2 Instagram

**전제 (공식)**
- Instagram **Professional**(Business/Creator) 계정
- 해당 IG와 **연결된 Facebook Page** ([Get Started](https://developers.facebook.com/docs/messenger-platform/instagram/get-started/))
- API 메시징 사용 시 IG 설정에서 **connected tools** 허용 필요 ([Overview](https://developers.facebook.com/docs/instagram-messaging/overview/))

**Timeplex(플랫폼) 준비**
1. Meta App + Facebook Login for Business configuration
2. 권한: `instagram_basic`, `instagram_manage_messages`, `pages_manage_metadata`, `pages_show_list` 등 ([Overview](https://developers.facebook.com/docs/instagram-messaging/overview/))
3. **Advanced Access** (App Review) — Standard Access는 **앱 역할 보유자·테스트 계정만** ([Overview](https://developers.facebook.com/docs/instagram-messaging/overview/))
4. Page Webhook `messages` 구독 ([Messenger Webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/))

**매장주**
1. Timeplex에서 Meta 로그인 → Page·Instagram 권한 승인
2. Page Admin/Editor 권한 필요
3. IG ↔ Page 연결이 실제로 완료돼 있어야 함 (Facebook Page 설정에서 확인)

**운영 제약 (공식)**
- 고객 메시지 수신 후 **24시간** 내 응답 ([Overview](https://developers.facebook.com/docs/instagram-messaging/overview/))
- 1:1 대화만 (그룹 DM 미지원)

---

### 3.3 LINE

**전제 (공식)**
- **LINE Official Account** 생성 ([Getting Started](https://developers.line.biz/en/docs/messaging-api/getting-started/))
- LINE Official Account Manager에서 **Messaging API 사용** 활성화 → Messaging API **채널** 생성  
  (2024-09-04 이후 Developers Console에서 채널 **직접 생성 불가** — [LINE 공지](https://developers.line.biz/en/docs/messaging-api/getting-started/))

**Timeplex(플랫폼) 준비**
1. 채널별 Webhook URL (HTTPS, **공인 CA SSL**, 자체 서명 불가) ([Build a bot](https://developers.line.biz/en/docs/messaging-api/building-bot/))
2. Webhook **Verify** 성공 후 **Use webhook** ON ([Build a bot](https://developers.line.biz/en/docs/messaging-api/building-bot/))
3. 수신 시 `X-Line-Signature` 검증 ([Verify webhook signature](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/))

**매장주**
1. 본인 LINE Official Account + Messaging API 활성화
2. LINE Developers Console → 해당 채널  
   - **Channel secret** (Basic settings)  
   - **Channel access token** (Messaging API tab, v2.1 권장) ([Channel access token](https://developers.line.biz/en/docs/basics/channel-access-token/))
3. Timeplex에 채널 ID·Secret·Token 등록 (또는 향후 OAuth UI)
4. LINE Official Account Manager **기본 자동응답 OFF** ([LINE use case validation](https://github.com/line/line-api-use-case-messaging-api/blob/main/docs/en/validation.md))

**한계**
- Meta Embedded Signup 같은 **통합 OAuth UI는 LINE Messaging API에 없음** → SaaS는 보통 **토큰/시크릿 입력** 또는 LINE Login(별 product) 조합

---

## 4. Meta vs LINE — 아키텍처 차이

```
[Meta: WhatsApp + Instagram]
  하나의 Meta App
  → Webhook 1벌 (GET verify + POST + X-Hub-Signature-256)
  → 매장별: Page Access Token / WABA ID / Phone Number ID 저장

[LINE]
  Meta와 별도
  → Webhook /v2/bot/... 또는 채널별 라우팅
  → 매장별: Channel ID + Secret + Access Token
```

Instagram·WhatsApp은 **Meta 앱·Webhook 인프라를 공유**할 수 있음. LINE은 **독립 스택**.

---

## 5. Timeplex 구현 상태 (2026-06)

| 항목 | 상태 |
|------|------|
| `store_channel_connections` + credentials | ✅ 0014·0015 |
| `conversations.external_thread_id` / `messages.external_message_id` | ✅ 0015 |
| `app/api/webhooks/line` | ✅ 서명 검증 + inbound |
| Inbound → `receiveCustomerMessage` | ✅ |
| Outbound LINE (`dispatchOutboundMessage`) | ✅ 텍스트 |
| Realtime | ✅ |
| 매장 UI LINE 연결 + Webhook URL | ✅ `/store/chats` |
| Meta Webhook / Embedded Signup | ❌ |
| WEB 고객 위젯 | ❌ |

→ LINE Vercel 테스트: [line-vercel-setup.md](./line-vercel-setup.md)

---

## 6. 권장 진행 순서

### Step 1 — 공통 기반 (채널 무관, **최우선**)

Meta/LINE 구현 전에 동일하게 필요합니다.

1. DB 마이그레이션 (`store_channel_connections`, external ID)
2. Webhook 수신·서명 검증·**200 즉시 응답** 후 비동기 처리
3. Inbound → `conversations` / `messages` 매핑
4. `/store/chats` Realtime 또는 폴링 개선
5. 매장 「채널 연결」 설정 화면 **껍데기**

**이유:** 세 채널 모두 Webhook + 저장 + UI 표시가 같습니다.

---

### Step 2 — Meta 사업자·앱 준비 (WhatsApp·Instagram **병행 준비**)

코드보다 **선행 행정**이 길어질 수 있습니다.

1. Meta Business Verification
2. Developer App — WhatsApp + Messenger/Instagram product
3. Facebook Login for Business / Embedded Signup v4 configuration
4. App Review — `whatsapp_business_messaging`, `instagram_manage_messages` 등 **Advanced Access**

**이유:** Instagram·WhatsApp 모두 **Live + Advanced Access** 없으면 실제 고객 DM 운영 불가 ([Instagram Overview](https://developers.facebook.com/docs/instagram-messaging/overview/)).

---

### Step 3 — 첫 채널 PoC (둘 중 선택)

| 옵션 | 장점 | 단점 |
|------|------|------|
| **A. LINE 먼저** | App Review 없이 **실제 DM 수신** 테스트 가능, 연동 절차 단순 | Meta 2채널과 코드 분리, 매장주 LOA·토큰 수동 설정 |
| **B. WhatsApp 먼저** | 목표 채널·Embedded Signup 표준, Instagram과 인프라 공유 | Meta 승인·결제 수단·온보딩 한도 |

**실무 제안**
- **기술 검증 속도:** Step 1 → **LINE PoC** (Webhook end-to-end)
- **제품 방향(한국+글로벌):** Step 1 → Meta 준비(Step 2)와 **병렬** → **WhatsApp Embedded Signup** → **Instagram**

Instagram은 WhatsApp보다 **Page–IG 연결·24h 윈도·Advanced Access** 변수가 많아 **WhatsApp 직후**가 무난합니다.

---

### Step 4 — 나머지 채널

1. Instagram (Meta Webhook·토큰 재사용)
2. LINE (또는 Step 3에서 LINE을 먼저 했다면 WhatsApp/Instagram)

---

## 7. 우선 진행 권장 (한 줄)

> **① 공통 Webhook·DB·인박스 Realtime → ② Meta 앱·App Review 준비(병렬) → ③ LINE PoC 또는 WhatsApp Embedded Signup 중 하나로 첫 실메시지**

「어떤 SNS부터 UI에 노출할지」는 **WhatsApp → Instagram → LINE** 순이 사용자 기대와 맞고,  
「언제 처음 실제 DM을 받아볼지」는 **LINE PoC**가 가장 빠릅니다.

---

## 8. 공식 참고 링크

| 주제 | URL |
|------|-----|
| WhatsApp Embedded Signup | https://developers.facebook.com/docs/whatsapp/embedded-signup/ |
| WhatsApp Webhooks | https://developers.facebook.com/docs/whatsapp/business-management-api/guides/set-up-webhooks/ |
| WhatsApp Pricing | https://developers.facebook.com/docs/whatsapp/pricing/ |
| Instagram Messaging Overview | https://developers.facebook.com/docs/instagram-messaging/overview/ |
| Instagram Get Started | https://developers.facebook.com/docs/messenger-platform/instagram/get-started/ |
| Messenger Webhooks | https://developers.facebook.com/docs/messenger-platform/webhooks/ |
| Facebook Login for Business | https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/ |
| LINE Messaging API Getting Started | https://developers.line.biz/en/docs/messaging-api/getting-started/ |
| LINE Webhook / Build a bot | https://developers.line.biz/en/docs/messaging-api/building-bot/ |
| LINE Webhook Signature | https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/ |

---

*구현 착수 시 본 문서와 [chat-architecture.md](./chat-architecture.md)를 함께 갱신합니다.*
