import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { translateCustomerInbound } from "@/lib/chat-translation";
import { isTranslationConfigured } from "@/lib/translate";

type ReceiveOk = {
  ok: true;
  duplicate?: boolean;
  messageId?: string;
  existingLocale?: string | null;
};

type ReceiveFail = { ok: false; message: string };

/** 고객 → 매장 인바운드 메시지 (웹훅·목업 공용) */
export const receiveCustomerMessage = async (params: {
  conversationId: string;
  body: string;
  externalMessageId?: string;
  /** Webhook — 메시지 먼저 저장, 번역은 enrichCustomerMessageTranslation */
  skipTranslation?: boolean;
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

  let customerLocale: string | undefined;
  let body: string;
  let translated_body: string | null;

  if (params.skipTranslation) {
    body = trimmed;
    translated_body = null;
  } else {
    const translated = await translateCustomerInbound(trimmed, conversation.customer_locale);
    customerLocale = translated.customerLocale;
    body = translated.body;
    translated_body = translated.translated_body;
  }

  const updates: { last_message_at: string; customer_locale?: string } = {
    last_message_at: new Date().toISOString(),
  };

  if (!params.skipTranslation && !conversation.customer_locale && customerLocale) {
    updates.customer_locale = customerLocale;
  }

  const { data: inserted, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender: "CUSTOMER",
      body,
      translated_body,
      external_message_id: params.externalMessageId ?? null,
    })
    .select("id")
    .single();

  if (messageError || !inserted) {
    return { ok: false, message: messageError?.message ?? "메시지 저장 실패" };
  }

  await supabase.from("conversations").update(updates).eq("id", params.conversationId);

  return {
    ok: true,
    messageId: inserted.id,
    existingLocale: conversation.customer_locale,
  };
};

/** Webhook fast-path 이후 — 번역·고객 언어 보강 */
export const enrichCustomerMessageTranslation = async (params: {
  messageId: string;
  conversationId: string;
  body: string;
  existingLocale: string | null;
}) => {
  if (!isTranslationConfigured()) return;

  try {
    const translated = await translateCustomerInbound(params.body, params.existingLocale);
    const supabase = createServiceClient();

    await supabase
      .from("messages")
      .update({ translated_body: translated.translated_body })
      .eq("id", params.messageId);

    const shouldSetLocale =
      !params.existingLocale ||
      (params.existingLocale === "ko" && translated.customerLocale !== "ko");

    if (shouldSetLocale) {
      await supabase
        .from("conversations")
        .update({ customer_locale: translated.customerLocale })
        .eq("id", params.conversationId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[chat-inbound] enrich translation failed:", message);
  }
};
