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
