import { createClient } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/constants";
import type { MessageWithAttachments } from "@/types/chat";

const MESSAGE_SELECT = `
  *,
  attachments:message_attachments(file_name, file_path),
  reservation_links:message_reservation_links(provider, url)
`;

/** 클라이언트 — 첨부 signed URL */
const attachMessageSignedUrlsClient = async (
  messages: MessageWithAttachments[],
): Promise<MessageWithAttachments[]> => {
  const supabase = createClient();

  return Promise.all(
    messages.map(async (message) => {
      if (!message.attachments?.length) return message;

      const attachments = await Promise.all(
        message.attachments.map(async (attachment) => {
          if (!attachment.file_path) return attachment;

          const { data } = await supabase.storage
            .from(BUCKETS.CHAT_ATTACHMENTS)
            .createSignedUrl(attachment.file_path, 60 * 60);

          return { ...attachment, url: data?.signedUrl };
        }),
      );

      return { ...message, attachments };
    }),
  );
};

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

  return attachMessageSignedUrlsClient(data as MessageWithAttachments[]);
};
