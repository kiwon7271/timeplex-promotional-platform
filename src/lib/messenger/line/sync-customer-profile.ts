import "server-only";

import { updateConversationCustomerName } from "@/lib/chat-conversation";
import { createServiceClient } from "@/lib/supabase/service";
import { parseLineCredentials } from "@/lib/messenger/line/credentials";
import { fetchLineUserProfile } from "@/lib/messenger/line/fetch-profile";

const DEFAULT_CUSTOMER_NAMES = new Set(["고객", "LINE 고객"]);

const isDefaultCustomerName = (name: string | null | undefined) => {
  const trimmed = name?.trim();
  return !trimmed || DEFAULT_CUSTOMER_NAMES.has(trimmed);
};

/** LINE displayName → conversations.customer_name */
export const syncLineCustomerProfile = async (params: {
  conversationId: string;
  storeId: string;
  lineUserId?: string;
  accessToken?: string;
}) => {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("customer_name, channel, external_thread_id, store_id")
    .eq("id", params.conversationId)
    .eq("store_id", params.storeId)
    .single();

  if (!conversation || conversation.channel !== "LINE") return;
  if (!isDefaultCustomerName(conversation.customer_name)) return;

  const lineUserId = params.lineUserId ?? conversation.external_thread_id;
  if (!lineUserId) return;

  let accessToken = params.accessToken;

  if (!accessToken) {
    const { data: connection } = await supabase
      .from("store_channel_connections")
      .select("credentials, status")
      .eq("store_id", params.storeId)
      .eq("channel", "LINE")
      .maybeSingle();

    if (!connection || connection.status !== "CONNECTED") return;

    const credentials = parseLineCredentials(connection.credentials);
    accessToken = credentials?.channel_access_token;
  }

  if (!accessToken) return;

  const profile = await fetchLineUserProfile(lineUserId, accessToken);
  if (!profile?.displayName) return;

  await updateConversationCustomerName(params.conversationId, profile.displayName);
};
