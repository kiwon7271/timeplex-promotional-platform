import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { translateCustomerInbound } from "@/lib/chat-translation";
import { incrementConversationUnread } from "@/lib/conversation-unread";
import { runTranslateMessageJob } from "@/jobs/translate-message";
import { log } from "@/lib/logger";
import { isTranslationConfigured } from "@/lib/translate";
import { STORE_LOCALE } from "@/lib/locale";
import type { MessageDeliveryStatus } from "@/types/database";

type ReceiveOk = {
  ok: true;
  duplicate?: boolean;
  messageId?: string;
  existingLocale?: string | null;
};

type ReceiveFail = { ok: false; message: string };

const isTranslatableBody = (body: string) =>
  body !== "(이미지)" && body !== "(예약링크)";

/** 고객 메시지 — 저장 전 번역 완료 (Realtime INSERT 1회에 번역문 포함) */
const prepareCustomerInboundTranslation = async (
  body: string,
  customerLocale: string | null,
) => {
  if (!isTranslationConfigured() || !isTranslatableBody(body)) {
    return {
      translatedBody: null as string | null,
      customerLocale,
      deliveryStatus: "PENDING" as MessageDeliveryStatus,
      failedReason: null as string | null,
    };
  }

  try {
    const translated = await translateCustomerInbound(body, customerLocale);
    const translatedBody = translated.translated_body?.trim() || null;
    const nextLocale = translated.customerLocale ?? customerLocale;

    if (!translatedBody) {
      return {
        translatedBody: null,
        customerLocale: nextLocale,
        deliveryStatus: "FAILED" as MessageDeliveryStatus,
        failedReason: "번역 결과가 비어 있습니다.",
      };
    }

    // 한국어 고객 — 원문 그대로 표시
    if (nextLocale === STORE_LOCALE && translatedBody === body) {
      return {
        translatedBody: null,
        customerLocale: nextLocale,
        deliveryStatus: "TRANSLATED" as MessageDeliveryStatus,
        failedReason: null,
      };
    }

    return {
      translatedBody,
      customerLocale: nextLocale,
      deliveryStatus: "TRANSLATED" as MessageDeliveryStatus,
      failedReason: null,
    };
  } catch (error) {
    log.error("Inbound translation failed", error);
    return {
      translatedBody: null,
      customerLocale,
      deliveryStatus: "FAILED" as MessageDeliveryStatus,
      failedReason: "번역 실패",
    };
  }
};

/** 고객 → 매장 인바운드 */
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

  const prepared = await prepareCustomerInboundTranslation(trimmed, conversation.customer_locale);
  const now = new Date().toISOString();

  const { data: inserted, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender: "CUSTOMER",
      body: trimmed,
      translated_body: prepared.translatedBody,
      external_message_id: params.externalMessageId ?? null,
      delivery_status: prepared.deliveryStatus,
      failed_reason: prepared.failedReason,
    })
    .select("id")
    .single();

  if (messageError || !inserted) {
    return { ok: false, message: messageError?.message ?? "메시지 저장 실패" };
  }

  const conversationPatch: {
    last_message_at: string;
    last_customer_message_at: string;
    customer_locale?: string;
  } = {
    last_message_at: now,
    last_customer_message_at: now,
  };

  if (
    prepared.customerLocale &&
    prepared.customerLocale !== conversation.customer_locale
  ) {
    conversationPatch.customer_locale = prepared.customerLocale;
  }

  await supabase.from("conversations").update(conversationPatch).eq("id", params.conversationId);

  await incrementConversationUnread(params.conversationId);

  return {
    ok: true,
    messageId: inserted.id,
    existingLocale: prepared.customerLocale ?? conversation.customer_locale,
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

  for (const row of rows.reverse()) {
    const body = row.body?.trim();
    if (!body || !isTranslatableBody(body)) continue;

    await runTranslateMessageJob({
      messageId: row.id,
      conversationId: params.conversationId,
    });
  }
};
