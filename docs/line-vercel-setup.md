# LINE × Vercel 연동 테스트 가이드

Vercel 배포 직후 LINE Webhook end-to-end 테스트 절차입니다.

---

## 0. 사전 조건

- Supabase `0014`, **`0015_line_integration.sql`** 적용 완료
- Vercel에 프로젝트 배포 (Production URL 확보)
- LINE Official Account + Messaging API 채널 생성

---

## 1. Vercel 환경 변수

Vercel Dashboard → Settings → Environment Variables:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (Webhook RLS 우회) |
| `OPENAI_API_KEY` | (선택) 번역 테스트 |
| `NEXT_PUBLIC_APP_URL` | `https://프로젝트명.vercel.app` |

`NEXT_PUBLIC_APP_URL`을 넣으면 `/store/chats`에 표시되는 Webhook URL이 고정됩니다.  
미설정 시 `VERCEL_URL`을 자동 사용합니다.

배포 후 **Redeploy** 한 번 실행하세요.

---

## 2. Timeplex에서 LINE 연결

1. 매장 계정으로 `/store/chats` 접속 (고객 대화 약관 동의 완료)
2. **메신저 연결** → **라인 연결하기**
3. LINE Developers Console에서 입력:
   - **Channel ID** — Basic settings
   - **Channel secret** — Basic settings
   - **Channel access token** — Messaging API (long-lived 권장)
4. **Webhook URL 복사** (화면에 표시됨)

예: `https://your-project.vercel.app/api/webhooks/line`

---

## 3. LINE Developers Console

1. [LINE Developers](https://developers.line.biz/) → 해당 채널
2. **Messaging API** 탭
3. **Webhook URL** — Timeplex에서 복사한 URL 붙여넣기
4. **Verify** — Success 확인
5. **Use webhook** — **ON**
6. **Auto-reply messages** — LINE Official Account Manager에서 **OFF** (Timeplex와 충돌 방지)

---

## 4. 테스트

1. 스마트폰 LINE 앱에서 해당 Official Account에 메시지 전송
2. `/store/chats`에서 **라인** 채널 대화 생성·메시지 Realtime 표시 확인
3. 한국어로 답장 → 고객 LINE에 수신 확인 (번역 ON 시 번역본 전송)

---

## 5. 문제 해결

| 증상 | 확인 |
|------|------|
| `last_webhook_at` **항상 NULL** | ① **0016 SQL** 적용 ② Vercel **Deployment Protection** OFF ③ 아래 버그 수정본 Redeploy (백그라운드 void 처리 금지) |
| Verify 실패 (503) | Timeplex `/store/chats`에서 Secret·Token 재저장 |
| Verify 성공, 메시지 없음 | LINE **친구 추가** 후 1:1 메시지 / Webhook **Redelivery** 로그 |
| `record activity failed` in Vercel Logs | **0016** 미적용 — `last_webhook_at` 컬럼 없음 |

### Vercel Deployment Protection (중요)

Vercel Dashboard → Settings → **Deployment Protection** 이 켜져 있으면  
LINE Webhook POST가 **로그인 페이지(401/307)** 로 막혀 DB에 아무것도 안 쌓입니다.  
**Production Deployment Protection을 끄거나** Webhook URL 예외 설정이 필요합니다.

### 브라우저로 Webhook URL 확인

```
GET https://your-project.vercel.app/api/webhooks/line
→ {"ok":true,"service":"line-webhook",...}
```

### Vercel Logs

Deployments → Functions → `/api/webhooks/line` — `[LINE webhook]` 로그 확인

---

## 6. API 엔드포인트

```
POST /api/webhooks/line
Header: X-Line-Signature
Body: LINE Webhook JSON (destination + events)
```

---

*Meta(Instagram/WhatsApp) 연동은 [messenger-integration-research.md](./messenger-integration-research.md) 참고.*
