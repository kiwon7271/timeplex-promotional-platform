"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreUser } from "@/lib/auth";
import { hasStoreChatConsent } from "@/lib/consent";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { sendStoreMessage } from "@/lib/chat-send-message";
import { BUCKETS } from "@/lib/constants";
import type { ActionResult } from "@/types/action-result";
import type { MessageWithAttachments } from "@/types/chat";
import { backfillConversationTranslations } from "@/lib/chat-inbound";
import { syncLineCustomerProfile } from "@/lib/messenger/line/sync-customer-profile";
import { resetConversationUnread } from "@/lib/conversation-unread";

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

/** 화면 진입 시 — 번역 누락된 고객 메시지 보강 */
export const onBackfillConversationTranslations = async (
  conversationId: string,
): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  await backfillConversationTranslations({
    conversationId,
    storeId: profile.store_id,
  });

  return { ok: true };
};

/** LINE displayName — 기본값(고객)일 때 프로필 동기화 */
export const onSyncLineCustomerProfile = async (
  conversationId: string,
): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  await syncLineCustomerProfile({
    conversationId,
    storeId: profile.store_id,
  });

  return { ok: true };
};

/** 대화 열람 — unread_count 초기화 */
export const onMarkConversationRead = async (conversationId: string): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };
  if (!conversationId) return { ok: false, message: "대화를 선택하세요." };

  await resetConversationUnread(conversationId, profile.store_id);
  return { ok: true };
};

/** Supabase: messages INSERT + Storage upload + conversations UPDATE */
export const onSendMessage = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "");
  const file = formData.get("file") as File | null;
  const reservationLinkId = String(formData.get("reservation_link_id") ?? "");

  const result = await sendStoreMessage({
    supabase,
    profile,
    conversationId,
    body,
    file: file && file.size > 0 ? file : null,
    reservationLinkId,
    formData,
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true };
};

/** 대화 종료 — 메시지·첨부·Storage 삭제 (복구 불가) */
export const onCloseConversation = async (conversationId: string): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const consented = await hasStoreChatConsent(profile.store_id);
  if (!consented) return { ok: false, message: "동의/고지 약관에 동의한 후 이용할 수 있습니다." };

  if (!conversationId) return { ok: false, message: "대화를 선택하세요." };

  const supabase = createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, store_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.store_id !== profile.store_id) {
    return { ok: false, message: "대화를 찾을 수 없습니다." };
  }

  const { data: attachmentRows } = await supabase
    .from("messages")
    .select("message_attachments(file_path)")
    .eq("conversation_id", conversationId);

  const filePaths =
    attachmentRows?.flatMap((row) => {
      const attachments = row.message_attachments as { file_path: string }[] | null;
      return attachments?.map((item) => item.file_path).filter(Boolean) ?? [];
    }) ?? [];

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKETS.CHAT_ATTACHMENTS)
      .remove(filePaths);

    if (storageError) {
      console.error("[close conversation] storage remove failed:", storageError.message);
    }
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("store_id", profile.store_id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/store/chats");
  return { ok: true };
};
