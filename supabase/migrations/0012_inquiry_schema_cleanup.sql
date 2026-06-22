-- 문의: status·answer·대댓글(parent_id) 제거, answered_at 기준으로 정리

-- 운영팀 첫 답변 시각 backfill
update public.inquiries i
set answered_at = sub.first_at
from (
  select inquiry_id, min(created_at) as first_at
  from public.inquiry_messages
  where author_role = 'SUPER_ADMIN'
  group by inquiry_id
) sub
where i.id = sub.inquiry_id
  and i.answered_at is null;

update public.inquiries
set answered_at = coalesce(answered_at, created_at)
where status = 'ANSWERED'
  and answered_at is null;

update public.inquiries
set answered_at = created_at
where answer is not null
  and trim(answer) <> ''
  and answered_at is null;

drop index if exists idx_inquiry_messages_parent;

alter table public.inquiry_messages drop column if exists parent_id;

alter table public.inquiries drop column if exists status;
alter table public.inquiries drop column if exists answer;
