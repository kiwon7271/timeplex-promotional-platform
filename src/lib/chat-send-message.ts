import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { hasStoreChatConsent } from "@/lib/consent";
import { BUCKETS } from "@/lib/constants";
import { validateImageFile, safeFileName, resolveUploadFileName } from "@/lib/upload";
import type { MessageWithAttachments } from "@/types/chat";
import type { Profile } from "@/types/database";

export type SendStoreMessageInput = {
  supabase: SupabaseClient;
  profile: Profile;
  conversationId: string;
  body: string;
  file?: File | null;
  reservationLinkId?: string;
  formData?: FormData;
};

export type SendStoreMessageResult =
  | { ok: true; data: MessageWithAttachments }
  | { ok: false; message: string; status?: number };

/** 매장 → 고객 메시지 저장 (Server Action·Route API 공용) */
export const sendStoreMessage = async (
  input: SendStoreMessageInput,
): Promise<SendStoreMessageResult> => {
  const storeId = input.profile.store_id;
  if (!storeId) return { ok: false, message: "소속 매장이 없습니다.", status: 403 };

  const body = input.body.trim();
  const reservationLinkId = input.reservationLinkId?.trim() ?? "";
  const file = input.file ?? null;
  const hasFile = !!(file && file.size > 0);

  if (!input.conversationId) return { ok: false, message: "대화를 선택하세요.", status: 400 };
  if (!body && !hasFile && !reservationLinkId) {
    return { ok: false, message: "메시지, 이미지, 예약 링크 중 하나를 입력하세요.", status: 400 };
  }

  const [consented, { data: conversation, error: convError }] = await Promise.all([
    hasStoreChatConsent(storeId),
    input.supabase
      .from("conversations")
      .select("store_id, customer_locale, channel, external_thread_id")
      .eq("id", input.conversationId)
      .single(),
  ]);

  if (!consented) {
    return { ok: false, message: "동의/고지 약관에 동의한 후 메시지를 전송할 수 있습니다.", status: 403 };
  }

  if (convError || !conversation || conversation.store_id !== storeId) {
    return { ok: false, message: "대화를 찾을 수 없습니다.", status: 404 };
  }

  let messageBody = body;
  if (!messageBody) {
    if (hasFile) messageBody = "(이미지)";
    else if (reservationLinkId) messageBody = "(예약링크)";
  }

  const now = new Date().toISOString();

  const { data: message, error } = await input.supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender: "STORE",
      body: messageBody,
      translated_body: null,
      delivery_status: "PENDING",
    })
    .select("id")
    .single();

  if (error || !message) {
    return { ok: false, message: error?.message ?? "전송 실패", status: 500 };
  }

  if (hasFile && file) {
    const invalid = validateImageFile(file);
    if (invalid) return { ok: false, message: invalid, status: 400 };

    const displayName = input.formData
      ? resolveUploadFileName(input.formData, file)
      : normalizeFileName(file.name);
    const fileName = `${Date.now()}_${safeFileName(displayName)}`;
    const path = `${storeId}/${input.conversationId}/${fileName}`;

    const { error: uploadError } = await input.supabase.storage
      .from(BUCKETS.CHAT_ATTACHMENTS)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      return { ok: false, message: `이미지 업로드 실패: ${uploadError.message}`, status: 500 };
    }

    const { error: attachError } = await input.supabase.from("message_attachments").insert({
      message_id: message.id,
      file_path: path,
      file_name: displayName,
    });

    if (attachError) return { ok: false, message: attachError.message, status: 500 };
  }

  if (reservationLinkId) {
    const { data: link } = await input.supabase
      .from("reservation_links")
      .select("id, provider, url")
      .eq("id", reservationLinkId)
      .eq("store_id", storeId)
      .single();

    if (!link) return { ok: false, message: "예약 링크를 찾을 수 없습니다.", status: 404 };

    const { error: linkError } = await input.supabase.from("message_reservation_links").insert({
      message_id: message.id,
      reservation_link_id: link.id,
      provider: link.provider,
      url: link.url,
    });

    if (linkError) return { ok: false, message: linkError.message, status: 500 };
  }

  await input.supabase
    .from("conversations")
    .update({
      last_message_at: now,
      last_store_message_at: now,
    })
    .eq("id", input.conversationId);

  const { data: messageRow } = await input.supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("id", message.id)
    .single();

  if (!messageRow) {
    return { ok: false, message: "메시지 조회 실패", status: 500 };
  }

  const [withUrls] = await attachMessageSignedUrls(
    [messageRow as MessageWithAttachments],
    input.supabase,
  );

  return { ok: true, data: withUrls };
};

const normalizeFileName = (name: string) => name.replace(/[^\w.\-가-힣]/g, "_");
