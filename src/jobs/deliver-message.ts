import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { resolveCustomerLocale, translateStoreOutbound } from "@/lib/chat-translation";
import { dispatchOutboundMessage } from "@/lib/messenger/outbound-dispatch";
import { captureJobError, log } from "@/lib/logger";
import { isTranslationConfigured } from "@/lib/translate";

export type DeliverMessagePayload = {
  messageId: string;
  conversationId: string;
};

/** 매장 발신 — 번역 후 SNS/웹 채널 전달 */
export const runDeliverMessageJob = async (payload: DeliverMessagePayload) => {
  const supabase = createServiceClient();

  const { data: message } = await supabase
    .from("messages")
    .select("id, body, sender, translated_body, delivery_status")
    .eq("id", payload.messageId)
    .single();

  if (!message || message.sender !== "STORE") return;
  if (message.delivery_status === "SENT") return;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id, channel, external_thread_id, customer_locale")
    .eq("id", payload.conversationId)
    .single();

  if (!conversation) return;

  const body = message.body?.trim();
  const isPlaceholder = body === "(이미지)" || body === "(예약링크)";

  try {
    let translatedBody = message.translated_body;

    if (body && !isPlaceholder && !translatedBody && isTranslationConfigured()) {
      await supabase
        .from("messages")
        .update({ delivery_status: "TRANSLATING" })
        .eq("id", payload.messageId);

      const customerLocale =
        conversation.customer_locale && conversation.customer_locale !== "ko"
          ? conversation.customer_locale
          : await resolveCustomerLocale(supabase, payload.conversationId, conversation.customer_locale);

      const translated = await translateStoreOutbound(body, customerLocale);
      translatedBody = translated.translated_body;

      await supabase
        .from("messages")
        .update({
          translated_body: translatedBody,
          delivery_status: "TRANSLATED",
        })
        .eq("id", payload.messageId);
    }

    if (!conversation.external_thread_id || conversation.channel === "WEB") {
      await supabase
        .from("messages")
        .update({
          delivery_status: "SENT",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", payload.messageId);
      return;
    }

    await supabase
      .from("messages")
      .update({ delivery_status: "SENDING" })
      .eq("id", payload.messageId);

    const dispatchResult = await dispatchOutboundMessage({
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      body: message.body,
      translatedBody,
    });

    if (!dispatchResult.ok) {
      await supabase
        .from("messages")
        .update({
          delivery_status: "FAILED",
          failed_reason: dispatchResult.message ?? "외부 채널 전송 실패",
        })
        .eq("id", payload.messageId);
      return;
    }

    await supabase
      .from("messages")
      .update({
        delivery_status: "SENT",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", payload.messageId);

    log.debug("Outbound delivery complete", { messageId: payload.messageId });
  } catch (error) {
    captureJobError("deliver-message", error, payload);
    await supabase
      .from("messages")
      .update({
        delivery_status: "FAILED",
        failed_reason: error instanceof Error ? error.message : "전송 실패",
      })
      .eq("id", payload.messageId);
  }
};
