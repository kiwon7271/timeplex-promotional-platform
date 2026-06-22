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
  store_name text not null,
  applicant_name text not null,
  email text not null,
  phone text,
  status text not null default 'PENDING',  -- PENDING | APPROVED | REJECTED
  note text,
  created_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now()
);

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
-- inquiries : 문의
-- =========================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  body text not null,
  answer text,
  status text not null default 'OPEN',  -- OPEN | ANSWERED | CLOSED
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

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

-- 조회 성능용 인덱스
create index if not exists idx_conversations_store on public.conversations(store_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_documents_store on public.store_documents(store_id);
create index if not exists idx_links_store on public.reservation_links(store_id);
create index if not exists idx_inquiries_store on public.inquiries(store_id);
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
