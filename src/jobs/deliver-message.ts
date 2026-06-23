import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { resolveCustomerLocale, translateStoreOutbound } from "@/lib/chat-translation";
import { dispatchOutboundMessage } from "@/lib/messenger/outbound-dispatch";
import { captureJobError, log } from "@/lib/logger";
import { isTranslationConfigured } from "@/lib/translate";
import type { MessageDeliveryStatus } from "@/types/database";

export type DeliverMessagePayload = {
  messageId: string;
  conversationId: string;
};

export type DeliverMessageResult = {
  ok: boolean;
  deliveryStatus: MessageDeliveryStatus | null;
  failedReason?: string;
};

const markDeliveryFailed = async (
  supabase: ReturnType<typeof createServiceClient>,
  messageId: string,
  reason: string,
): Promise<DeliverMessageResult> => {
  await supabase
    .from("messages")
    .update({
      delivery_status: "FAILED",
      failed_reason: reason,
    })
    .eq("id", messageId);

  return { ok: false, deliveryStatus: "FAILED", failedReason: reason };
};

/** 매장 발신 — 번역 후 SNS/웹 채널 전달 */
export const runDeliverMessageJob = async (
  payload: DeliverMessagePayload,
): Promise<DeliverMessageResult> => {
  log.info("Deliver message job start", payload);
  const supabase = createServiceClient();

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("id, body, sender, translated_body, delivery_status")
    .eq("id", payload.messageId)
    .single();

  if (messageError || !message) {
    const reason = messageError?.message ?? "메시지를 찾을 수 없습니다.";
    log.warn("Deliver failed: message not found", { ...payload, reason });
    return { ok: false, deliveryStatus: "FAILED", failedReason: reason };
  }

  if (message.sender !== "STORE") {
    return { ok: true, deliveryStatus: message.delivery_status };
  }

  if (message.delivery_status === "SENT") {
    return { ok: true, deliveryStatus: "SENT" };
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("store_id, channel, external_thread_id, customer_locale")
    .eq("id", payload.conversationId)
    .single();

  if (convError || !conversation) {
    const reason = convError?.message ?? "대화를 찾을 수 없습니다.";
    log.warn("Deliver failed: conversation not found", { ...payload, reason });
    return markDeliveryFailed(supabase, payload.messageId, reason);
  }

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

    if (conversation.channel === "WEB") {
      await supabase
        .from("messages")
        .update({
          delivery_status: "SENT",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", payload.messageId);
      return { ok: true, deliveryStatus: "SENT" };
    }

    if (!conversation.external_thread_id) {
      const reason =
        conversation.channel === "LINE"
          ? "LINE 고객 ID가 없어 Push할 수 없습니다."
          : `${conversation.channel} 채널 고객 ID가 없습니다.`;
      log.warn("Deliver failed: missing external thread id", {
        ...payload,
        channel: conversation.channel,
      });
      return markDeliveryFailed(supabase, payload.messageId, reason);
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
      const reason = dispatchResult.message ?? "외부 채널 전송 실패";
      await supabase
        .from("messages")
        .update({
          delivery_status: "FAILED",
          failed_reason: reason,
        })
        .eq("id", payload.messageId);
      log.warn("Deliver failed", { ...payload, reason });
      return { ok: false, deliveryStatus: "FAILED", failedReason: reason };
    }

    await supabase
      .from("messages")
      .update({
        delivery_status: "SENT",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", payload.messageId);

    log.info("Outbound delivery complete", { messageId: payload.messageId });
    return { ok: true, deliveryStatus: "SENT" };
  } catch (error) {
    captureJobError("deliver-message", error, payload);
    const reason = error instanceof Error ? error.message : "전송 실패";
    await supabase
      .from("messages")
      .update({
        delivery_status: "FAILED",
        failed_reason: reason,
      })
      .eq("id", payload.messageId);
    return { ok: false, deliveryStatus: "FAILED", failedReason: reason };
  }
};
