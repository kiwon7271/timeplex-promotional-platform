import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { translateCustomerInbound } from "@/lib/chat-translation";

/** 고객 → 매장 인바운드 메시지 (웹훅·목업 공용) */
export const receiveCustomerMessage = async (params: {
  conversationId: string;
  body: string;
  externalMessageId?: string;
}) => {
  const supabase = createServiceClient();
  const trimmed = params.body.trim();
  if (!trimmed) return { ok: false as const, message: "메시지 내용이 없습니다." };

  if (params.externalMessageId) {
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("external_message_id", params.externalMessageId)
      .maybeSingle();

    if (existing) return { ok: true as const, duplicate: true };
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, customer_locale")
    .eq("id", params.conversationId)
    .single();

  if (convError || !conversation) {
    return { ok: false as const, message: "대화를 찾을 수 없습니다." };
  }

  const { customerLocale, body, translated_body } = await translateCustomerInbound(
    trimmed,
    conversation.customer_locale,
  );

  const updates: { last_message_at: string; customer_locale?: string } = {
    last_message_at: new Date().toISOString(),
  };

  if (!conversation.customer_locale) {
    updates.customer_locale = customerLocale;
  }

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: params.conversationId,
    sender: "CUSTOMER",
    body,
    translated_body,
    external_message_id: params.externalMessageId ?? null,
  });

  if (messageError) {
    return { ok: false as const, message: messageError.message };
  }

  await supabase
    .from("conversations")
    .update(updates)
    .eq("id", params.conversationId);

  return { ok: true as const };
};
