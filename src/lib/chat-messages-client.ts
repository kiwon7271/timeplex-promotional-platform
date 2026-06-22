import { createClient } from "@/lib/supabase/client";
import type { MessageWithAttachments } from "@/types/chat";

const MESSAGE_SELECT = `
  *,
  attachments:message_attachments(file_name, file_path),
  reservation_links:message_reservation_links(provider, url)
`;

/** 클라이언트 — Realtime 갱신용 (Server Action 왕복 제거) */
export const fetchConversationMessagesClient = async (
  conversationId: string,
): Promise<MessageWithAttachments[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error || !data) return [];

  return data as MessageWithAttachments[];
};
