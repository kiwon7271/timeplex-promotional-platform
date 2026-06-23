import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { BUCKETS, RESERVATION_PROVIDER_LABEL, type ReservationProvider } from "@/lib/constants";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";
import { sendLinePushImage, sendLinePushText } from "@/lib/messenger/line/send-message";

const getProviderLabel = (provider: string) =>
  RESERVATION_PROVIDER_LABEL[provider as ReservationProvider] ?? provider;

/** 매장 발신 → 채널 API 전달 (텍스트·예약링크·이미지) */
export const dispatchOutboundMessage = async (params: {
  conversationId: string;
  messageId: string;
  body: string;
  translatedBody: string | null;
}) => {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id, channel, external_thread_id")
    .eq("id", params.conversationId)
    .single();

  if (!conversation) {
    return { ok: false as const, message: "대화를 찾을 수 없습니다." };
  }

  if (conversation.channel !== "LINE") {
    return { ok: true as const };
  }

  if (!conversation.external_thread_id) {
    return { ok: false as const, message: "LINE 고객 ID가 없습니다." };
  }

  const { data: connection } = await supabase
    .from("store_channel_connections")
    .select("credentials, status")
    .eq("store_id", conversation.store_id)
    .eq("channel", "LINE")
    .maybeSingle();

  if (!connection || connection.status !== "CONNECTED") {
    return { ok: false as const, message: "LINE 연결이 활성화되어 있지 않습니다." };
  }

  const credentials = parseLineCredentials(connection.credentials);
  if (!credentials) {
    return { ok: false as const, message: "LINE credential이 올바르지 않습니다." };
  }

  const pushParams = {
    accessToken: credentials.channel_access_token,
    lineUserId: conversation.external_thread_id,
  };

  let sentCount = 0;

  const textToSend = params.translatedBody?.trim() || params.body.trim();
  if (textToSend && textToSend !== "(이미지)" && textToSend !== "(예약링크)") {
    const textResult = await sendLinePushText({ ...pushParams, text: textToSend });
    if (!textResult.ok) return textResult;
    sentCount += 1;
  }

  const { data: reservationLinks } = await supabase
    .from("message_reservation_links")
    .select("provider, url")
    .eq("message_id", params.messageId);

  for (const link of reservationLinks ?? []) {
    const linkText = `${getProviderLabel(link.provider)} 예약: ${link.url}`;
    const linkResult = await sendLinePushText({ ...pushParams, text: linkText });
    if (!linkResult.ok) return linkResult;
    sentCount += 1;
  }

  const { data: attachments } = await supabase
    .from("message_attachments")
    .select("file_path")
    .eq("message_id", params.messageId);

  for (const attachment of attachments ?? []) {
    if (!attachment.file_path) continue;

    const { data: signed } = await supabase.storage
      .from(BUCKETS.CHAT_ATTACHMENTS)
      .createSignedUrl(attachment.file_path, 60 * 10);

    if (!signed?.signedUrl) {
      return { ok: false as const, message: "이미지 URL 생성에 실패했습니다." };
    }

    const imageResult = await sendLinePushImage({
      ...pushParams,
      imageUrl: signed.signedUrl,
    });
    if (!imageResult.ok) return imageResult;
    sentCount += 1;
  }

  if (sentCount === 0) {
    return { ok: false as const, message: "LINE으로 전송할 내용이 없습니다." };
  }

  return { ok: true as const };
};
