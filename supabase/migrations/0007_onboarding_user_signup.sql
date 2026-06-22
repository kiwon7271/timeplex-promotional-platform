-- 온보딩 신청 ↔ Auth 사용자 연결 (회원가입 시 즉시 계정 생성)
alter table public.onboarding_applications
  add column if not exists user_id uuid references public.profiles(id) on delete cascade;

create index if not exists idx_onboarding_applications_user
  on public.onboarding_applications(user_id);

-- 본인 신청 상태 조회 (로그인 시 승인 여부 확인)
drop policy if exists applications_select_own on public.onboarding_applications;
create policy applications_select_own on public.onboarding_applications
  for select using (user_id = auth.uid());

-- password 컬럼은 더 이상 사용하지 않음 (Auth가 비밀번호 관리)
alter table public.onboarding_applications drop column if exists password;
