-- 메시지 예약 링크 첨부
create table if not exists public.message_reservation_links (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reservation_link_id uuid references public.reservation_links(id) on delete set null,
  provider text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_message_reservation_links_message
  on public.message_reservation_links(message_id);

alter table public.message_reservation_links enable row level security;

drop policy if exists message_reservation_links_access on public.message_reservation_links;
create policy message_reservation_links_access on public.message_reservation_links
  for all using (
    public.is_super_admin()
    or exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id and c.store_id = public.current_store_id()
    )
  ) with check (
    public.is_super_admin()
    or exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id and c.store_id = public.current_store_id()
    )
  );
