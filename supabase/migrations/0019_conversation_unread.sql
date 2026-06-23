-- 대화 unread_count — 원자적 증가·초기화

create or replace function public.increment_conversation_unread(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversations
  set unread_count = coalesce(unread_count, 0) + 1
  where id = p_conversation_id;
$$;

create or replace function public.reset_conversation_unread(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversations
  set unread_count = 0
  where id = p_conversation_id;
$$;
