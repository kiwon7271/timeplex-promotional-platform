import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { translateCustomerInbound } from "@/lib/chat-translation";
import { captureJobError, log } from "@/lib/logger";
import { isTranslationConfigured } from "@/lib/translate";

export type TranslateMessagePayload = {
  messageId: string;
  conversationId: string;
};

/** 고객 인바운드 — 언어 감지 + 한국어 번역 */
export const runTranslateMessageJob = async (payload: TranslateMessagePayload) => {
  const supabase = createServiceClient();

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("id, body, sender, translated_body, delivery_status")
    .eq("id", payload.messageId)
    .single();

  if (messageError || !message) {
    log.warn("Translate skipped: message not found", { ...payload, reason: messageError?.message });
    return;
  }

  if (message.sender !== "CUSTOMER") return;
  if (message.translated_body) return;

  const body = message.body?.trim();
  if (!body || body === "(이미지)" || body === "(예약링크)") return;

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("customer_locale")
    .eq("id", payload.conversationId)
    .single();

  if (convError || !conversation) {
    log.warn("Translate skipped: conversation not found", { ...payload, reason: convError?.message });
    return;
  }

  if (!isTranslationConfigured()) return;

  await supabase
    .from("messages")
    .update({ delivery_status: "TRANSLATING" })
    .eq("id", payload.messageId);

  try {
    const translated = await translateCustomerInbound(body, conversation.customer_locale);

    if (!translated.translated_body?.trim()) {
      await supabase
        .from("messages")
        .update({
          delivery_status: "FAILED",
          failed_reason: "번역 결과가 비어 있습니다.",
        })
        .eq("id", payload.messageId);
      log.warn("Translate failed: empty result", { messageId: payload.messageId });
      return;
    }

    const convUpdates: { customer_locale?: string } = {};
    if (!conversation.customer_locale || conversation.customer_locale === "ko") {
      convUpdates.customer_locale = translated.customerLocale;
    }

    await supabase
      .from("messages")
      .update({
        translated_body: translated.translated_body,
        delivery_status: "TRANSLATED",
      })
      .eq("id", payload.messageId);

    if (Object.keys(convUpdates).length > 0) {
      await supabase.from("conversations").update(convUpdates).eq("id", payload.conversationId);
    }

    log.debug("Inbound translation complete", { messageId: payload.messageId });
  } catch (error) {
    captureJobError("translate-message", error, payload);
    await supabase
      .from("messages")
      .update({
        delivery_status: "FAILED",
        failed_reason: "번역 실패",
      })
      .eq("id", payload.messageId);
  }
};
