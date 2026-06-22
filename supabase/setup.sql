-- Timeplex Admin MVP: 전체 설정 (스키마 + RLS + 스토리지 + 기본 시드)
-- Supabase SQL Editor 에 이 파일 전체를 붙여넣고 실행하세요.

-- ============ 0001 SCHEMA ============
-- Timeplex Admin MVP: 코어 스키마
-- enum 대신 단순 text 필드 사용 (애플리케이션 레벨에서 값 제한)

-- 확장: gen_random_uuid 사용
create extension if not exists "pgcrypto";

-- =========================================================
-- profiles : auth.users 와 1:1, 역할/소속 매장 보관
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'STORE_STAFF', -- SUPER_ADMIN | STORE_OWNER | STORE_STAFF
  store_id uuid,
  created_at timestamptz not null default now()
);

-- =========================================================
-- plans : 요금제
-- =========================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,           -- Free | Starter | Business | Enterprise
  name text not null,
  staff_limit int not null default 1,
  price int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- stores : 매장
-- =========================================================
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'PENDING',   -- PENDING | ACTIVE | SUSPENDED | CLOSED
  plan_code text not null default 'Free',
  owner_id uuid references public.profiles(id) on delete set null,
  email text,
  phone text,
  address text,
  description text,
  created_at timestamptz not null default now()
);

-- profiles.store_id 외래키는 stores 생성 후 추가
alter table public.profiles
  drop constraint if exists profiles_store_id_fkey;
alter table public.profiles
  add constraint profiles_store_id_fkey
  foreign key (store_id) references public.stores(id) on delete set null;

-- =========================================================
-- store_members : 매장-사용자 연결
-- =========================================================
create table if not exists public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'STORE_STAFF',  -- STORE_OWNER | STORE_STAFF
  created_at timestamptz not null default now(),
  unique (store_id, profile_id)
);

-- =========================================================
-- onboarding_applications : 온보딩 신청
-- =========================================================
create table if not exists public.onboarding_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  store_name text not null,
  applicant_name text not null,
  email text not null,
  phone text,
  status text not null default 'PENDING',  -- PENDING | APPROVED | REJECTED
  note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_onboarding_applications_user
  on public.onboarding_applications(user_id);

-- =========================================================
-- store_documents : 매장 서류
-- =========================================================
create table if not exists public.store_documents (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  file_name text not null,
  status text not null default 'PENDING',  -- PENDING | APPROVED | REJECTED
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- reservation_links : 예약 링크
-- =========================================================
create table if not exists public.reservation_links (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  provider text not null,  -- TIMEPLEX | GOOGLE_MAP | KLOOK | TRIPADVISOR | NAVER | OTHER
  url text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- conversations : 대화
-- =========================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  channel text not null default 'WEB',  -- WEB | WHATSAPP | LINE | INSTAGRAM
  customer_name text,
  customer_phone text,
  customer_email text,
  status text not null default 'OPEN',  -- OPEN | CLOSED
  last_message_at timestamptz,
  customer_locale text,  -- 고객 첫 메시지 언어 (ISO 639-1)
  external_thread_id text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- messages : 메시지
-- =========================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null default 'CUSTOMER',  -- CUSTOMER | STORE | SYSTEM
  body text not null,
  translated_body text,
  external_message_id text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- store_channel_connections : 매장별 메신저 연결
-- =========================================================
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
  credentials jsonb,
  last_webhook_at timestamptz,
  last_webhook_summary text,
  created_at timestamptz not null default now(),
  unique (store_id, channel)
);

create index if not exists idx_store_channel_connections_store
  on public.store_channel_connections(store_id);

create unique index if not exists idx_messages_external_message_id
  on public.messages(external_message_id)
  where external_message_id is not null;

create index if not exists idx_conversations_external_thread
  on public.conversations(store_id, channel, external_thread_id);

create index if not exists idx_store_channel_line_destination
  on public.store_channel_connections(external_account_id)
  where channel = 'LINE';

-- =========================================================
-- message_attachments : 메시지 첨부 이미지
-- =========================================================
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- message_reservation_links : 메시지 예약 링크 첨부
-- =========================================================
create table if not exists public.message_reservation_links (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reservation_link_id uuid references public.reservation_links(id) on delete set null,
  provider text not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- inquiries : 문의
-- =========================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'OTHER'
    check (category in ('SYSTEM_ERROR', 'SIGNUP', 'MESSENGER', 'CHAT', 'STORE_STAFF', 'OTHER')),
  answered_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- inquiry_messages : 문의 댓글
-- =========================================================
create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_role text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiry_messages_inquiry
  on public.inquiry_messages(inquiry_id);

-- =========================================================
-- usage_monthly : 월별 사용량
-- =========================================================
create table if not exists public.usage_monthly (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  year_month text not null,  -- YYYY-MM
  message_count int not null default 0,
  conversation_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (store_id, year_month)
);

-- =========================================================
-- store_events : 매장 이벤트 (수요/방문 분석용)
-- =========================================================
create table if not exists public.store_events (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  event_type text not null default 'VIEW',  -- VIEW | CLICK | RESERVE
  created_at timestamptz not null default now()
);

-- =========================================================
-- consent_notices : 동의/고지 문구
-- =========================================================
create table if not exists public.consent_notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  version text not null default 'v1',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- store_consent_agreements : 매장별 동의/고지 동의 이력
-- =========================================================
create table if not exists public.store_consent_agreements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  consent_notice_id uuid not null references public.consent_notices(id) on delete cascade,
  notice_version text not null,
  agreed_by uuid not null references public.profiles(id) on delete cascade,
  agreed_at timestamptz not null default now(),
  unique (store_id, consent_notice_id, notice_version)
);

create index if not exists idx_store_consent_agreements_store
  on public.store_consent_agreements(store_id);

-- 조회 성능용 인덱스
create index if not exists idx_conversations_store on public.conversations(store_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_message_reservation_links_message on public.message_reservation_links(message_id);
create index if not exists idx_documents_store on public.store_documents(store_id);
create index if not exists idx_links_store on public.reservation_links(store_id);
create index if not exists idx_inquiries_store on public.inquiries(store_id);
create index if not exists idx_inquiries_category on public.inquiries(category);
create index if not exists idx_usage_store on public.usage_monthly(store_id);
create index if not exists idx_events_store on public.store_events(store_id);
create index if not exists idx_members_store on public.store_members(store_id);

-- =========================================================
-- 신규 가입자 자동 프로필 생성 트리거
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'role', 'STORE_STAFF')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ 0002 RLS ============
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
alter table public.store_channel_connections enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.message_reservation_links enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.usage_monthly enable row level security;
alter table public.store_events enable row level security;
alter table public.consent_notices enable row level security;
alter table public.store_consent_agreements enable row level security;

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

-- onboarding_applications : 관리자 전용 + 본인 신청 조회
drop policy if exists applications_select_own on public.onboarding_applications;
create policy applications_select_own on public.onboarding_applications
  for select using (user_id = auth.uid());

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

-- store_channel_connections
drop policy if exists store_channel_connections_access on public.store_channel_connections;
create policy store_channel_connections_access on public.store_channel_connections
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

-- message_reservation_links : 메시지 -> 대화 -> 매장
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

-- inquiries
drop policy if exists inquiries_access on public.inquiries;
create policy inquiries_access on public.inquiries
  for all using (
    public.is_super_admin() or store_id = public.current_store_id()
  ) with check (
    public.is_super_admin() or store_id = public.current_store_id()
  );

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

-- store_consent_agreements : 매장 동의 이력 조회·등록
drop policy if exists store_consent_agreements_select on public.store_consent_agreements;
create policy store_consent_agreements_select on public.store_consent_agreements
  for select using (
    public.is_super_admin()
    or store_id = public.current_store_id()
  );

drop policy if exists store_consent_agreements_insert on public.store_consent_agreements;
create policy store_consent_agreements_insert on public.store_consent_agreements
  for insert with check (
    public.is_super_admin()
    or (
      store_id = public.current_store_id()
      and agreed_by = auth.uid()
    )
  );

-- ============ 0003 STORAGE ============
-- Timeplex Admin MVP: 스토리지 버킷 및 정책
-- 버킷: store-documents, chat-attachments
-- 허용: jpg/jpeg/png, 최대 5MB (애플리케이션에서 추가 검증)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('store-documents', 'store-documents', false, 5242880,
    array['image/jpeg', 'image/jpg', 'image/png']),
  ('chat-attachments', 'chat-attachments', false, 5242880,
    array['image/jpeg', 'image/jpg', 'image/png'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 경로 첫 세그먼트(store_id) 기준 접근 제어
-- store-documents/{store_id}/{doc_type}/{file_name}
-- chat-attachments/{store_id}/{conversation_id}/{file_name}

drop policy if exists store_documents_access on storage.objects;
create policy store_documents_access on storage.objects
  for all using (
    bucket_id = 'store-documents'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  ) with check (
    bucket_id = 'store-documents'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  );

drop policy if exists chat_attachments_access on storage.objects;
create policy chat_attachments_access on storage.objects
  for all using (
    bucket_id = 'chat-attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  ) with check (
    bucket_id = 'chat-attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_store_id()::text
    )
  );

-- ============ Realtime ============
-- 입점관리 대기 건수 구독 (0010)
-- 고객 대화·메시지 실시간 구독 (0014)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'onboarding_applications'
  ) then
    alter publication supabase_realtime add table public.onboarding_applications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ============ SEED (plans / consent) ============
-- Timeplex Admin MVP: 기본 시드 (auth 의존성 없는 데이터)
-- 인증 사용자 및 샘플 매장/대화는 scripts/seed.mjs 에서 생성한다.

-- 요금제
insert into public.plans (code, name, staff_limit, price) values
  ('Free',       'Free',       1,   0),
  ('Starter',    'Starter',    5,   29000),
  ('Business',   'Business',   10,  79000),
  ('Enterprise', 'Enterprise', 999, 199000)
on conflict (code) do update
  set name = excluded.name,
      staff_limit = excluded.staff_limit,
      price = excluded.price;

-- 동의/고지 문구
insert into public.consent_notices (title, content, version, is_active) values
  ('개인정보 수집 및 이용 동의', '서비스 제공을 위해 최소한의 개인정보를 수집합니다.', 'v1', true),
  ('마케팅 정보 수신 동의', '프로모션 및 이벤트 정보를 발송할 수 있습니다.', 'v1', true)
on conflict do nothing;
