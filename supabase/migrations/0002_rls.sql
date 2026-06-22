-- Timeplex Admin MVP: RLS 정책
-- 규칙:
--   SUPER_ADMIN  -> 모든 데이터 접근
--   STORE 사용자 -> 본인 소속 매장 데이터만 접근

-- =========================================================
-- 헬퍼 함수 (security definer 로 RLS 우회하여 재귀 방지)
-- =========================================================
create or replace function public.is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
$$;

create or replace function public.current_store_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select store_id from public.profiles where id = auth.uid();
$$;

-- =========================================================
-- RLS 활성화
-- =========================================================
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.onboarding_applications enable row level security;
alter table public.store_documents enable row level security;
alter table public.reservation_links enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.inquiries enable row level security;
alter table public.usage_monthly enable row level security;
alter table public.store_events enable row level security;
alter table public.consent_notices enable row level security;

-- =========================================================
-- profiles
-- =========================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or public.is_super_admin()
    or store_id = public.current_store_id()
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or public.is_super_admin());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- =========================================================
-- plans : 모든 인증 사용자 읽기 / 관리자만 쓰기
-- =========================================================
drop policy if exists plans_select on public.plans;
create policy plans_select on public.plans
  for select using (auth.role() = 'authenticated');

drop policy if exists plans_admin on public.plans;
create policy plans_admin on public.plans
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- =========================================================
-- stores
-- =========================================================
drop policy if exists stores_select on public.stores;
create policy stores_select on public.stores
  for select using (
    public.is_super_admin() or id = public.current_store_id()
  );

drop policy if exists stores_update on public.stores;
create policy stores_update on public.stores
  for update using (
    public.is_super_admin() or id = public.current_store_id()
  );

drop policy if exists stores_admin_write on public.stores;
create policy stores_admin_write on public.stores
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- =========================================================
-- 공통 매크로 성격: store_id 기준 정책
-- =========================================================

-- store_members
drop policy if exists members_access on public.store_members;
create policy members_access on public.store_members
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- onboarding_applications : 관리자 전용
drop policy if exists applications_admin on public.onboarding_applications;
create policy applications_admin on public.onboarding_applications
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- store_documents
drop policy if exists documents_access on public.store_documents;
create policy documents_access on public.store_documents
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- reservation_links
drop policy if exists links_access on public.reservation_links;
create policy links_access on public.reservation_links
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- conversations
drop policy if exists conversations_access on public.conversations;
create policy conversations_access on public.conversations
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- messages : 소속 매장의 대화에 속한 메시지
drop policy if exists messages_access on public.messages;
create policy messages_access on public.messages
  for all using (
    public.is_super_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.store_id = public.current_store_id()
    )
  ) with check (
    public.is_super_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.store_id = public.current_store_id()
    )
  );

-- message_attachments : 메시지 -> 대화 -> 매장
drop policy if exists attachments_access on public.message_attachments;
create policy attachments_access on public.message_attachments
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

-- inquiries
drop policy if exists inquiries_access on public.inquiries;
create policy inquiries_access on public.inquiries
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- usage_monthly
drop policy if exists usage_access on public.usage_monthly;
create policy usage_access on public.usage_monthly
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- store_events
drop policy if exists events_access on public.store_events;
create policy events_access on public.store_events
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

-- consent_notices : 관리자만 쓰기 / 인증 사용자 읽기
drop policy if exists consent_select on public.consent_notices;
create policy consent_select on public.consent_notices
  for select using (auth.role() = 'authenticated');

drop policy if exists consent_admin on public.consent_notices;
create policy consent_admin on public.consent_notices
  for all using (public.is_super_admin()) with check (public.is_super_admin());
