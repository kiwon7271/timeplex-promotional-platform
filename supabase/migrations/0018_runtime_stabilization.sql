-- Runtime stabilization — 인덱스, 메시지 배달·대화 운영 필드

-- =========================================================
-- 조회 성능 인덱스
-- =========================================================
create index if not exists idx_usage_monthly_store_month
  on public.usage_monthly (store_id, year_month desc);

create index if not exists idx_conversations_store_last_message
  on public.conversations (store_id, last_message_at desc nulls last);

create index if not exists idx_messages_conversation_created
  on public.messages (conversation_id, created_at);

create index if not exists idx_store_members_profile_store
  on public.store_members (profile_id, store_id);

create index if not exists idx_store_documents_store_id
  on public.store_documents (store_id);

create index if not exists idx_inquiries_store_created
  on public.inquiries (store_id, created_at desc);

-- =========================================================
-- messages — 배달·번역 상태
-- =========================================================
alter table public.messages
  add column if not exists delivery_status text default 'PENDING';

alter table public.messages
  add column if not exists delivered_at timestamptz;

alter table public.messages
  add column if not exists failed_reason text;

alter table public.messages
  add column if not exists metadata jsonb default '{}'::jsonb;

comment on column public.messages.delivery_status is
  'PENDING | TRANSLATING | TRANSLATED | SENDING | SENT | FAILED';

create index if not exists idx_messages_delivery_status_created
  on public.messages (delivery_status, created_at desc)
  where delivery_status in ('PENDING', 'SENDING', 'FAILED');

-- =========================================================
-- conversations — 운영 필드
-- =========================================================
alter table public.conversations
  add column if not exists assigned_user_id uuid references public.profiles(id);

alter table public.conversations
  add column if not exists last_customer_message_at timestamptz;

alter table public.conversations
  add column if not exists last_store_message_at timestamptz;

alter table public.conversations
  add column if not exists unread_count int default 0;

alter table public.conversations
  add column if not exists priority text default 'NORMAL';

comment on column public.conversations.priority is 'LOW | NORMAL | HIGH';
