import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import {
  findOrCreateCustomerConversation,
  updateConversationCustomerName,
} from "@/lib/chat-conversation";
import { receiveCustomerMessage } from "@/lib/chat-inbound";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";
import { fetchLineUserProfile } from "@/lib/messenger/line/fetch-profile";
import { getLineInboundBody, getLineUserId } from "@/lib/messenger/line/parse-event";
import type { LineWebhookBody } from "@/lib/messenger/line/types";

/** destination(LINE 채널 ID) → 매장 연결 조회 */
const findLineStoreConnection = async (destination: string) => {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("store_channel_connections")
    .select("store_id, credentials, display_name, status")
    .eq("channel", "LINE")
    .eq("external_account_id", destination)
    .eq("status", "CONNECTED")
    .maybeSingle();

  if (!data) return null;

  const credentials = parseLineCredentials(data.credentials);
  if (!credentials) return null;

  return {
    storeId: data.store_id,
    credentials,
    displayName: data.display_name,
  };
};

/** LINE Webhook 이벤트 처리 */
export const handleLineWebhook = async (payload: LineWebhookBody) => {
  const destination = payload.destination?.trim();
  if (!destination) {
    return { ok: false as const, message: "destination 없음" };
  }

  const connection = await findLineStoreConnection(destination);
  if (!connection) {
    return { ok: false as const, message: "연결된 매장 없음" };
  }

  for (const event of payload.events ?? []) {
    const lineUserId = getLineUserId(event);
    if (!lineUserId) continue;

    const parsed = getLineInboundBody(event);
    if (!parsed) continue;

    const conversationResult = await findOrCreateCustomerConversation({
      storeId: connection.storeId,
      channel: "LINE",
      externalThreadId: lineUserId,
    });

    if (!conversationResult.ok) continue;

    const profile = await fetchLineUserProfile(
      lineUserId,
      connection.credentials.channel_access_token,
    );

    if (profile?.displayName) {
      await updateConversationCustomerName(
        conversationResult.conversationId,
        profile.displayName,
      );
    }

    await receiveCustomerMessage({
      conversationId: conversationResult.conversationId,
      body: parsed.body,
      externalMessageId: parsed.externalMessageId,
    });
  }

  return { ok: true as const };
};

/** Webhook 서명 검증용 channel secret */
export const getLineChannelSecretByDestination = async (destination: string) => {
  const connection = await findLineStoreConnection(destination);
  return connection?.credentials.channel_secret ?? null;
};
