"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreUser } from "@/lib/auth";
import { hasStoreChatConsent } from "@/lib/consent";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { translateStoreOutbound } from "@/lib/chat-translation";
import { dispatchOutboundMessage } from "@/lib/messenger/outbound-dispatch";
import { BUCKETS } from "@/lib/constants";
import { validateImageFile, safeFileName, resolveUploadFileName } from "@/lib/upload";
import type { ActionResult } from "@/types/action-result";
import type { MessageWithAttachments } from "@/types/chat";

export type ConversationMessagesResult = ActionResult & {
  data?: MessageWithAttachments[];
};

/** 대화 메시지 조회 — Realtime 갱신용 */
export const getConversationMessages = async (
  conversationId: string,
): Promise<ConversationMessagesResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.store_id !== profile.store_id) {
    return { ok: false, message: "대화를 찾을 수 없습니다." };
  }

  const { data: messagesRaw, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) return { ok: false, message: error.message };

  const messages = await attachMessageSignedUrls(
    (messagesRaw ?? []) as MessageWithAttachments[],
  );

  return { ok: true, data: messages };
};

/** Supabase: messages INSERT + Storage upload + conversations UPDATE */
export const onSendMessage = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const consented = await hasStoreChatConsent(profile.store_id);
  if (!consented) return { ok: false, message: "동의/고지 약관에 동의한 후 메시지를 전송할 수 있습니다." };

  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const reservationLinkId = String(formData.get("reservation_link_id") ?? "").trim();
  const file = formData.get("file") as File | null;
  const hasFile = !!(file && file.size > 0);

  if (!conversationId) return { ok: false, message: "대화를 선택하세요." };
  if (!body && !hasFile && !reservationLinkId) {
    return { ok: false, message: "메시지, 이미지, 예약 링크 중 하나를 입력하세요." };
  }

  const supabase = createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id, customer_locale, channel, external_thread_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.store_id !== profile.store_id) {
    return { ok: false, message: "대화를 찾을 수 없습니다." };
  }

  let messageBody = body;
  if (!messageBody) {
    if (hasFile) messageBody = "(이미지)";
    else if (reservationLinkId) messageBody = "(예약링크)";
  }

  let translatedBody: string | null = null;
  if (body) {
    const translated = await translateStoreOutbound(body, conversation.customer_locale);
    translatedBody = translated.translated_body;
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender: "STORE",
      body: messageBody,
      translated_body: translatedBody,
    })
    .select()
    .single();

  if (error || !message) return { ok: false, message: error?.message ?? "전송 실패" };

  if (hasFile) {
    const invalid = validateImageFile(file!);
    if (invalid) return { ok: false, message: invalid };

    const displayName = resolveUploadFileName(formData, file);
    const fileName = `${Date.now()}_${safeFileName(displayName)}`;
    const path = `${profile.store_id}/${conversationId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.CHAT_ATTACHMENTS)
      .upload(path, file!, { contentType: file!.type });

    if (!uploadError) {
      await supabase.from("message_attachments").insert({
        message_id: message.id,
        file_path: path,
        file_name: displayName,
      });
    }
  }

  if (reservationLinkId) {
    const { data: link } = await supabase
      .from("reservation_links")
      .select("id, provider, url")
      .eq("id", reservationLinkId)
      .eq("store_id", profile.store_id)
      .single();

    if (!link) return { ok: false, message: "예약 링크를 찾을 수 없습니다." };

    const { error: linkError } = await supabase.from("message_reservation_links").insert({
      message_id: message.id,
      reservation_link_id: link.id,
      provider: link.provider,
      url: link.url,
    });

    if (linkError) return { ok: false, message: linkError.message };
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (conversation.channel === "LINE" && body) {
    const dispatchResult = await dispatchOutboundMessage({
      conversationId,
      body: messageBody,
      translatedBody: translatedBody,
    });

    if (!dispatchResult.ok) {
      return {
        ok: false,
        message: dispatchResult.message ?? "LINE 전송에 실패했습니다. 연결 설정을 확인하세요.",
      };
    }
  }

  revalidatePath("/store/chats");
  return { ok: true };
};
