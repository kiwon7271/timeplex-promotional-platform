import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { translateCustomerInbound } from "@/lib/chat-translation";
import { incrementConversationUnread } from "@/lib/conversation-unread";
import { enqueueJob } from "@/jobs/queue";
import { log } from "@/lib/logger";
import { isTranslationConfigured } from "@/lib/translate";

type ReceiveOk = {
  ok: true;
  duplicate?: boolean;
  messageId?: string;
  existingLocale?: string | null;
};

type ReceiveFail = { ok: false; message: string };

/** 고객 → 매장 인바운드 — 원문 저장 후 번역은 백그라운드 */
export const receiveCustomerMessage = async (params: {
  conversationId: string;
  body: string;
  externalMessageId?: string;
}): Promise<ReceiveOk | ReceiveFail> => {
  const supabase = createServiceClient();
  const trimmed = params.body.trim();
  if (!trimmed) return { ok: false, message: "메시지 내용이 없습니다." };

  if (params.externalMessageId) {
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("external_message_id", params.externalMessageId)
      .maybeSingle();

    if (existing) return { ok: true, duplicate: true };
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, customer_locale")
    .eq("id", params.conversationId)
    .single();

  if (convError || !conversation) {
    return { ok: false, message: "대화를 찾을 수 없습니다." };
  }

  const now = new Date().toISOString();

  const { data: inserted, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender: "CUSTOMER",
      body: trimmed,
      translated_body: null,
      external_message_id: params.externalMessageId ?? null,
      delivery_status: "PENDING",
    })
    .select("id")
    .single();

  if (messageError || !inserted) {
    return { ok: false, message: messageError?.message ?? "메시지 저장 실패" };
  }

  await supabase
    .from("conversations")
    .update({
      last_message_at: now,
      last_customer_message_at: now,
    })
    .eq("id", params.conversationId);

  await incrementConversationUnread(params.conversationId);

  enqueueJob("translate-message", {
    messageId: inserted.id,
    conversationId: params.conversationId,
  });

  return {
    ok: true,
    messageId: inserted.id,
    existingLocale: conversation.customer_locale,
  };
};

/** 이미 저장된 고객 메시지 — 번역 누락분 보강 (화면 진입 시) */
export const backfillConversationTranslations = async (params: {
  conversationId: string;
  storeId: string;
}) => {
  if (!isTranslationConfigured()) return;

  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("customer_locale")
    .eq("id", params.conversationId)
    .eq("store_id", params.storeId)
    .single();

  if (!conversation) return;

  const { data: rows } = await supabase
    .from("messages")
    .select("id, body, translated_body")
    .eq("conversation_id", params.conversationId)
    .eq("sender", "CUSTOMER")
    .is("translated_body", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!rows?.length) return;

  let customerLocale = conversation.customer_locale;

  for (const row of rows.reverse()) {
    const body = row.body?.trim();
    if (!body || body === "(이미지)" || body === "(예약링크)") continue;

    try {
      const translated = await translateCustomerInbound(body, customerLocale);
      customerLocale = translated.customerLocale;

      await supabase
        .from("messages")
        .update({
          translated_body: translated.translated_body,
          delivery_status: "TRANSLATED",
        })
        .eq("id", row.id);
    } catch (error) {
      log.error("Backfill translation failed", error, { messageId: row.id });
    }
  }

  if (customerLocale && customerLocale !== conversation.customer_locale) {
    await supabase
      .from("conversations")
      .update({ customer_locale: customerLocale })
      .eq("id", params.conversationId);
  }
};
