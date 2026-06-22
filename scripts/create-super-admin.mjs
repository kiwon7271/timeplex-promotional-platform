// 통합관리자(SUPER_ADMIN) 계정 생성·비밀번호 설정
// 실행: npm run create-admin
// .env.local:
//   SUPER_ADMIN_EMAIL=
//   SUPER_ADMIN_PASSWORD=   (8자 이상, 1234 등 단순 비밀번호 불가)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* .env.local 없으면 셸 환경변수 사용 */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD ?? "";

const WEAK = new Set(["1234", "123456", "12345678", "password", "qwerty", "admin123"]);

const validatePassword = (pw) => {
  if (pw.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (WEAK.has(pw.toLowerCase())) return "너무 단순한 비밀번호는 사용할 수 없습니다.";
  return null;
};

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  process.exit(1);
}
if (!email || !password) {
  console.error("SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD 를 .env.local에 설정하세요.");
  process.exit(1);
}

const pwError = validatePassword(password);
if (pwError) {
  console.error(pwError);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const run = async () => {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Timeplex Admin", role: "SUPER_ADMIN" },
  });

  let userId = created?.user?.id;

  if (!userId) {
    if (!createError || !/already|registered|exists/i.test(createError.message)) {
      console.error(createError?.message ?? "계정 생성 실패");
      process.exit(1);
    }

    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list.users.find((u) => u.email?.toLowerCase() === email);
    if (!found) {
      console.error("기존 계정을 찾을 수 없습니다.");
      process.exit(1);
    }
    userId = found.id;

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      console.error(updateError.message);
      process.exit(1);
    }
    console.log("기존 통합관리자 비밀번호를 갱신했습니다.");
  } else {
    console.log("통합관리자 계정을 생성했습니다.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: "Timeplex Admin",
    role: "SUPER_ADMIN",
    store_id: null,
  });

  if (profileError) {
    console.error(profileError.message);
    process.exit(1);
  }

  console.log("완료:", email);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
