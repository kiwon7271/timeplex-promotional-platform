// 샘플 비즈니스 데이터 시드 (Auth 계정 생성 없음)
// 실행: npm run seed
// 전제: DB에 매장(stores)이 1개 이상 있어야 샘플 대화 등이 추가됩니다.
// 통합관리자: npm run create-admin
// 매장 계정: 로그인 화면 회원가입 → 입점 승인

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

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const must = (result, label) => {
  if (result.error) {
    throw new Error(`[${label}] ${result.error.message}`);
  }
  return result.data;
};

const run = async () => {
  console.log("샘플 데이터 시드 시작...");

  const { data: store } = await supabase.from("stores").select("id").limit(1).maybeSingle();

  if (!store) {
    console.log("등록된 매장이 없습니다. 샘플 대화·문의 시드를 건너뜁니다.");
    console.log("  → 매장 회원가입 후 통합관리자 입점 승인을 먼저 진행하세요.");
    return;
  }

  const storeId = store.id;

  const { data: existingConv } = await supabase
    .from("conversations")
    .select("id")
    .eq("store_id", storeId)
    .limit(1)
    .maybeSingle();

  if (!existingConv) {
    const conv = must(
      await supabase
        .from("conversations")
        .insert({
          store_id: storeId,
          channel: "WEB",
          customer_name: "John Doe",
          customer_email: "john@example.com",
          customer_locale: "en",
          status: "OPEN",
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single(),
      "conversations insert",
    );

    must(
      await supabase.from("messages").insert([
        {
          conversation_id: conv.id,
          sender: "CUSTOMER",
          body: "Hello, is the store open?",
          translated_body: "안녕하세요, 매장 문 여셨나요?",
        },
        {
          conversation_id: conv.id,
          sender: "STORE",
          body: "네, 영업 중입니다.",
          translated_body: "Yes, we are open.",
        },
      ]),
      "messages insert",
    );
    console.log("  샘플 대화·메시지 추가");
  } else {
    console.log("  샘플 대화 이미 존재 — 생략");
  }

  const { count: channelConnCount } = await supabase
    .from("store_channel_connections")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (!channelConnCount) {
    must(
      await supabase.from("store_channel_connections").insert([
        { store_id: storeId, channel: "WEB", status: "CONNECTED", connected_at: new Date().toISOString() },
        { store_id: storeId, channel: "WHATSAPP", status: "DISCONNECTED" },
        { store_id: storeId, channel: "LINE", status: "DISCONNECTED" },
        { store_id: storeId, channel: "INSTAGRAM", status: "DISCONNECTED" },
      ]),
      "store_channel_connections insert",
    );
    console.log("  메신저 연결 골격 추가");
  }

  const { count: inquiryCount } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (!inquiryCount) {
    must(
      await supabase.from("inquiries").insert({
        store_id: storeId,
        title: "결제 문의",
        body: "요금제 변경은 어떻게 하나요?",
        category: "OTHER",
        last_message_at: new Date().toISOString(),
      }),
      "inquiries insert",
    );
    console.log("  샘플 문의 추가");
  }

  const ym = new Date().toISOString().slice(0, 7);
  must(
    await supabase.from("usage_monthly").upsert(
      { store_id: storeId, year_month: ym, message_count: 2, conversation_count: 1 },
      { onConflict: "store_id,year_month" },
    ),
    "usage_monthly upsert",
  );

  console.log("시드 완료 (store_id:", storeId, ")");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
