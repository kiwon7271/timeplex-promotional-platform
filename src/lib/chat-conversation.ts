import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

/** 채널별 고객 대화 조회·생성 */
export const findOrCreateCustomerConversation = async (params: {
  storeId: string;
  channel: string;
  externalThreadId: string;
  customerName?: string | null;
}) => {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("store_id", params.storeId)
    .eq("channel", params.channel)
    .eq("external_thread_id", params.externalThreadId)
    .maybeSingle();

  if (existing) return { ok: true as const, conversationId: existing.id };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      store_id: params.storeId,
      channel: params.channel,
      external_thread_id: params.externalThreadId,
      customer_name: params.customerName?.trim() || "고객",
      status: "OPEN",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      ok: false as const,
      message: error?.message ?? "대화 생성 실패",
    };
  }

  return { ok: true as const, conversationId: created.id };
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
