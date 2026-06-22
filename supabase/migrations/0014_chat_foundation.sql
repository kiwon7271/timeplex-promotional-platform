-- 고객 대화 공통 기반 — 고객 언어, 채널 연결, Realtime

alter table public.conversations
  add column if not exists customer_locale text;

comment on column public.conversations.customer_locale is
  '고객이 첫 메시지에 사용한 언어(ISO 639-1). 매장 회신 번역 기준';

-- 매장별 메신저 연결 (Instagram / LINE / WhatsApp 등)
create table if not exists public.store_channel_connections (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  channel text not null check (channel in ('WEB', 'WHATSAPP', 'LINE', 'INSTAGRAM')),
  status text not null default 'DISCONNECTED'
    check (status in ('DISCONNECTED', 'CONNECTING', 'CONNECTED', 'ERROR')),
  external_account_id text,
  display_name text,
  connected_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (store_id, channel)
);

create index if not exists idx_store_channel_connections_store
  on public.store_channel_connections(store_id);

alter table public.store_channel_connections enable row level security;

drop policy if exists store_channel_connections_access on public.store_channel_connections;
create policy store_channel_connections_access on public.store_channel_connections
  for all using (
    public.is_super_admin()
    or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin()
    or store_id = public.current_store_id()
  );

-- Realtime — 대화·메시지
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
