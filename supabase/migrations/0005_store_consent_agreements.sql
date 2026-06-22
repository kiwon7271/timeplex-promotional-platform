-- 매장별 동의/고지 약관 동의 이력
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

alter table public.store_consent_agreements enable row level security;

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
