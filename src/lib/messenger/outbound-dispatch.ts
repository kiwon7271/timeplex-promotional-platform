import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";
import { sendLinePushText } from "@/lib/messenger/line/send-message";

/** 매장 발신 → 채널 API 전달 */
export const dispatchOutboundMessage = async (params: {
  conversationId: string;
  body: string;
  translatedBody: string | null;
}) => {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id, channel, external_thread_id")
    .eq("id", params.conversationId)
    .single();

  if (!conversation?.external_thread_id) return { ok: true as const };

  if (conversation.channel !== "LINE") return { ok: true as const };

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

  // 고객 전달문 우선 (번역본), 없으면 원문
  const textToSend = params.translatedBody?.trim() || params.body.trim();
  if (!textToSend || textToSend === "(이미지)" || textToSend === "(예약링크)") {
    return { ok: true as const };
  }

  return sendLinePushText({
    accessToken: credentials.channel_access_token,
    lineUserId: conversation.external_thread_id,
    text: textToSend,
  });
};
