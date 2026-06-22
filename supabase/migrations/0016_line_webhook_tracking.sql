-- LINE Webhook 수신 추적 (디버그·진단)

alter table public.store_channel_connections
  add column if not exists last_webhook_at timestamptz;

alter table public.store_channel_connections
  add column if not exists last_webhook_summary text;

comment on column public.store_channel_connections.last_webhook_at is
  '마지막 LINE Webhook 수신 시각';

comment on column public.store_channel_connections.last_webhook_summary is
  '마지막 Webhook 처리 요약 (processed/skipped/errors)';
