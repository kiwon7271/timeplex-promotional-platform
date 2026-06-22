import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

/** 채널별 고객 대화 조회·생성 — LINE userId 기준 1개만 */
export const findOrCreateCustomerConversation = async (params: {
  storeId: string;
  channel: string;
  externalThreadId: string;
  customerName?: string | null;
}) => {
  const supabase = createServiceClient();
  const threadId = params.externalThreadId.trim();

  const { data: existingRows } = await supabase
    .from("conversations")
    .select("id")
    .eq("store_id", params.storeId)
    .eq("channel", params.channel)
    .eq("external_thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existingRows?.[0]) {
    return { ok: true as const, conversationId: existingRows[0].id };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      store_id: params.storeId,
      channel: params.channel,
      external_thread_id: threadId,
      customer_name: params.customerName?.trim() || "고객",
      status: "OPEN",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!error && created) {
    return { ok: true as const, conversationId: created.id };
  }

  // 동시 Webhook — unique 충돌 시 기존 방 재조회
  if (error?.code === "23505") {
    const { data: retryRows } = await supabase
      .from("conversations")
      .select("id")
      .eq("store_id", params.storeId)
      .eq("channel", params.channel)
      .eq("external_thread_id", threadId)
      .limit(1);

    if (retryRows?.[0]) {
      return { ok: true as const, conversationId: retryRows[0].id };
    }
  }

  return {
    ok: false as const,
    message: error?.message ?? "대화 생성 실패",
  };
};

/** 고객 표시명 갱신 (비어 있거나 기본값일 때) */
export const updateConversationCustomerName = async (
  conversationId: string,
  customerName: string,
) => {
  const trimmed = customerName.trim();
  if (!trimmed) return;

  const supabase = createServiceClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("customer_name")
    .eq("id", conversationId)
    .single();

  if (!conversation) return;

  const current = conversation.customer_name?.trim();
  if (current && current !== "고객" && current !== "LINE 고객") return;

  await supabase
    .from("conversations")
    .update({ customer_name: trimmed })
    .eq("id", conversationId);
};
