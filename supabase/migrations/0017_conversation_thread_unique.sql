-- LINE 고객당 대화 1개 — 중복 병합 후 unique index

-- 1) 동일 LINE userId(external_thread_id) 중복 방 → 가장 오래된 방으로 메시지 합침
with ranked as (
  select
    id,
    store_id,
    channel,
    external_thread_id,
    row_number() over (
      partition by store_id, channel, external_thread_id
      order by created_at asc
    ) as rn
  from public.conversations
  where channel = 'LINE'
    and external_thread_id is not null
),
pairs as (
  select
    dup.id as dupe_id,
    keep.id as keep_id
  from ranked dup
  join ranked keep
    on keep.store_id = dup.store_id
    and keep.channel = dup.channel
    and keep.external_thread_id = dup.external_thread_id
    and keep.rn = 1
  where dup.rn > 1
)
update public.messages m
set conversation_id = p.keep_id
from pairs p
where m.conversation_id = p.dupe_id;

with ranked as (
  select
    id,
    store_id,
    channel,
    external_thread_id,
    row_number() over (
      partition by store_id, channel, external_thread_id
      order by created_at asc
    ) as rn
  from public.conversations
  where channel = 'LINE'
    and external_thread_id is not null
)
delete from public.conversations c
using ranked r
where c.id = r.id
  and r.rn > 1;

-- 2) unique index
create unique index if not exists idx_conversations_thread_unique
  on public.conversations(store_id, channel, external_thread_id)
  where external_thread_id is not null;
