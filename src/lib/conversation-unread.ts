import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { log } from "@/lib/logger";

/** 고객 메시지 수신 — unread +1 */
export const incrementConversationUnread = async (conversationId: string) => {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("increment_conversation_unread", {
    p_conversation_id: conversationId,
  });

  if (error) {
    log.warn("increment_conversation_unread failed", { conversationId, error: error.message });
  }
};

/** 매장이 대화 열람 — unread 0 */
export const resetConversationUnread = async (conversationId: string, storeId: string) => {
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!conversation) return;

  const { error } = await supabase.rpc("reset_conversation_unread", {
    p_conversation_id: conversationId,
  });

  if (error) {
    log.warn("reset_conversation_unread failed", { conversationId, error: error.message });
  }
};
