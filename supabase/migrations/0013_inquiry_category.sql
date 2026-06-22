-- 문의 구분(category) 추가
alter table public.inquiries
  add column if not exists category text not null default 'OTHER';

update public.inquiries
set category = 'OTHER'
where category is null or category = '';

alter table public.inquiries drop constraint if exists inquiries_category_check;
alter table public.inquiries
  add constraint inquiries_category_check
  check (category in ('SYSTEM_ERROR', 'SIGNUP', 'MESSENGER', 'CHAT', 'STORE_STAFF', 'OTHER'));

create index if not exists idx_inquiries_category on public.inquiries(category);
