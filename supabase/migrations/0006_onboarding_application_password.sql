-- 온보딩 신청 시 희망 비밀번호 (승인 후 계정 생성에 사용, 처리 완료 시 삭제)
alter table public.onboarding_applications
  add column if not exists password text;
