-- 문의 스레드 — 댓글·대댓글
create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  parent_id uuid references public.inquiry_messages(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_role text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiry_messages_inquiry
  on public.inquiry_messages(inquiry_id);

create index if not exists idx_inquiry_messages_parent
  on public.inquiry_messages(parent_id);

alter table public.inquiries
  add column if not exists last_message_at timestamptz;

update public.inquiries
set last_message_at = coalesce(answered_at, created_at)
where last_message_at is null;

-- 기존 단일 답변 → 스레드 메시지로 이전
insert into public.inquiry_messages (inquiry_id, parent_id, author_id, author_role, body, created_at)
select
  i.id,
  null,
  p.id,
  'SUPER_ADMIN',
  i.answer,
  coalesce(i.answered_at, i.created_at)
from public.inquiries i
cross join lateral (
  select id from public.profiles where role = 'SUPER_ADMIN' limit 1
) p
where i.answer is not null
  and trim(i.answer) <> '';

alter table public.inquiry_messages enable row level security;

drop policy if exists inquiry_messages_access on public.inquiry_messages;
create policy inquiry_messages_access on public.inquiry_messages
  for all using (
    public.is_super_admin()
    or exists (
      select 1 from public.inquiries iq
      where iq.id = inquiry_id and iq.store_id = public.current_store_id()
    )
  ) with check (
    public.is_super_admin()
    or exists (
      select 1 from public.inquiries iq
      where iq.id = inquiry_id and iq.store_id = public.current_store_id()
    )
  );
