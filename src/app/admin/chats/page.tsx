import { createClient } from "@/lib/supabase/server";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import AdminChatLogLayout from "@/components/admin/admin-chat-log-layout";

import type { MessageWithAttachments } from "@/types/chat";
import type { AdminChatsPageProps } from "@/types/pages";

/** 매장별 대화 로그 조회 (읽기 전용) */
const AdminChats = async ({ searchParams }: AdminChatsPageProps) => {
  /** Supabase: stores·conversations·messages — 대화/메시지 로그 조회 */
  const supabase = createClient();
  const { data: stores } = await supabase.from("stores").select("id, name").order("name");

  const storeId = searchParams.store;
  const conversationId = searchParams.conversation;

  const { data: conversations } = storeId
    ? await supabase
        .from("conversations")
        .select("*")
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
    : { data: null };

  const { data: messagesRaw } = conversationId
    ? await supabase
        .from("messages")
        .select(MESSAGE_SELECT)
        .eq("conversation_id", conversationId)
        .order("created_at")
    : { data: null };

  const messages = messagesRaw
    ? await attachMessageSignedUrls(messagesRaw as MessageWithAttachments[])
    : [];

  return (
    <>
      <PageHeader title="대화 로그" description="매장 대화 조회 (읽기 전용)" />
      <PageBody>
        <AdminChatLogLayout
          stores={stores ?? []}
          conversations={conversations ?? []}
          messages={messages}
          storeId={storeId}
          conversationId={conversationId}
        />
      </PageBody>
    </>
  );
};

export default AdminChats;
