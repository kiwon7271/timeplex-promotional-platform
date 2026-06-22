-- LINE 연동 — external ID, credential 저장

alter table public.conversations
  add column if not exists external_thread_id text;

comment on column public.conversations.external_thread_id is
  '채널별 고객 스레드 ID (LINE userId 등)';

alter table public.messages
  add column if not exists external_message_id text;

comment on column public.messages.external_message_id is
  '플랫폼 메시지 ID — Webhook 중복 방지';

alter table public.store_channel_connections
  add column if not exists credentials jsonb;

comment on column public.store_channel_connections.credentials is
  '채널 credential (LINE channel_secret, channel_access_token 등)';

create unique index if not exists idx_messages_external_message_id
  on public.messages(external_message_id)
  where external_message_id is not null;

create index if not exists idx_conversations_external_thread
  on public.conversations(store_id, channel, external_thread_id);

create index if not exists idx_store_channel_line_destination
  on public.store_channel_connections(external_account_id)
  where channel = 'LINE';
