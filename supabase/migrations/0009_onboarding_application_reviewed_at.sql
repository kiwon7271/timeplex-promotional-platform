-- 입점 신청 승인·반려 처리 일시
alter table public.onboarding_applications
  add column if not exists reviewed_at timestamptz;
