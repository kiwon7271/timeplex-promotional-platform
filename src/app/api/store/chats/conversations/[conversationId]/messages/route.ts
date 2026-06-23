import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attachMessageSignedUrls, MESSAGE_SELECT } from "@/lib/chat-messages";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import type { MessageWithAttachments } from "@/types/chat";

export const runtime = "nodejs";

/** GET — 대화 메시지 */
export async function GET(
  _request: Request,
  { params }: { params: { conversationId: string } },
) {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const conversationId = params.conversationId;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("store_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.store_id !== auth.profile.store_id) {
    return NextResponse.json({ ok: false, message: "대화를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: messagesRaw, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at");

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const messages = await attachMessageSignedUrls(
    (messagesRaw ?? []) as MessageWithAttachments[],
  );

  return NextResponse.json({ ok: true, data: messages });
}
