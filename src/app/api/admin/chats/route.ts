import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { CONVERSATION_COLUMNS } from "@/lib/supabase/query-columns";
import {
  getConversationListRange,
  getConversationTotalPages,
  parseConversationPage,
} from "@/lib/conversation-list";
import type { Conversation } from "@/types/database";
import type { MessageWithAttachments } from "@/types/chat";

export const runtime = "nodejs";

/** GET — 대화 로그 */
export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store") ?? undefined;
  const conversationId = searchParams.get("conversation") ?? undefined;
  const page = parseConversationPage(searchParams.get("page") ?? undefined);

  const supabase = createClient();
  const { data: stores } = await supabase.from("stores").select("id, name").order("name");

  let conversations: Conversation[] = [];
  let listPage = 1;
  let listTotalPages = 1;

  if (storeId) {
    const { count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId);

    const total = count ?? 0;
    listTotalPages = getConversationTotalPages(total);
    listPage = Math.min(page, listTotalPages);
    const { from, to } = getConversationListRange(listPage);

    const { data } = await supabase
      .from("conversations")
      .select(CONVERSATION_COLUMNS)
      .eq("store_id", storeId)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(from, to);

    conversations = data ?? [];
  }

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

  return NextResponse.json({
    ok: true,
    data: {
      stores: stores ?? [],
      conversations,
      messages,
      storeId,
      conversationId,
      listPage,
      listTotalPages,
    },
  });
}
