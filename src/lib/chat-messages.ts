import "server-only";

import { createClient } from "@/lib/supabase/server";
import { BUCKETS } from "@/lib/constants";
import type { MessageWithAttachments } from "@/types/chat";

/** 메시지 조회 select (첨부·예약링크 포함) */
export const MESSAGE_SELECT = `
  *,
  attachments:message_attachments(file_name, file_path),
  reservation_links:message_reservation_links(provider, url)
`;

/** 메시지 첨부 signed URL 부여 */
export const attachMessageSignedUrls = async (
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
