# Supabase SQL 가이드

## 적용 방식

| 방식 | 용도 |
|------|------|
| **마이그레이션** (`migrations/0001` ~ `0013`) | 기존 Supabase 프로젝트에 **순차 적용** |
| **setup.sql** | 신규 환경 **일괄 구축** (스키마 + RLS + Storage + Realtime + seed) |

이미 마이그레이션을 쓰는 환경에서는 `setup.sql` 전체를 다시 실행하지 마세요.  
누락분만 해당 migration 파일로 적용합니다.

## 마이그레이션 목록

| # | 파일 | 내용 |
|---|------|------|
| 0001 | schema | 기본 테이블 |
| 0002 | rls | RLS 정책 |
| 0003 | storage | Storage 버킷 |
| 0004 | message_reservation_links | 메시지 예약 링크 |
| 0005 | store_consent_agreements | 매장 약관 동의 |
| 0006 | onboarding_application_password | (이후 0007에서 제거) |
| 0007 | onboarding_user_signup | user_id, 본인 신청 RLS |
| 0008 | store_document_rejection_reason | 서류 반려 사유 |
| 0009 | onboarding_application_reviewed_at | 입점 처리 일시 |
| 0010 | onboarding_applications_realtime | Realtime publication |
| 0011 | inquiry_messages | 문의 댓글 |
| 0012 | inquiry_schema_cleanup | status/answer/parent_id 제거 |
| 0013 | inquiry_category | 문의 구분 |

## 로컬/운영 DB 확인

Supabase SQL Editor에서 아래로 누락 여부를 확인할 수 있습니다.

```sql
-- 문의 category 컬럼 (0013)
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'inquiries' and column_name = 'category';

-- inquiry_messages 테이블 (0011)
select to_regclass('public.inquiry_messages');

-- 문의 legacy 컬럼 제거 (0012)
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'inquiries'
  and column_name in ('status', 'answer');

-- Realtime (0010)
select * from pg_publication_tables
where pubname = 'supabase_realtime' and tablename = 'onboarding_applications';
```

## inquiries 최종 스키마

```sql
-- inquiries: title, body, category, answered_at, last_message_at (status/answer 없음)
-- inquiry_messages: 평면 댓글 (parent_id 없음)
```

## 고객 대화 (conversations)

현재 SQL 변경 **예정 없음**.  
메신저 연동 시 `0014+` 마이그레이션 예정:

- `store_channel_connections`
- `conversations` / `messages` external ID
- Realtime `messages` publication

→ [chat-architecture.md](./chat-architecture.md)

## 시드

| 파일 | 내용 |
|------|------|
| `supabase/seed.sql` | 요금제, 동의 문구 (Auth 불필요) |
| `scripts/seed.mjs` | 샘플 대화·문의·usage (매장 승인 후) |

`seed.mjs` 문의 샘플은 `category`, `last_message_at` 기준 (구 `status` 컬럼 사용 안 함).
