import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { backfillConversationTranslations } from "@/lib/chat-inbound";
import { resetConversationUnread } from "@/lib/conversation-unread";
import { syncLineCustomerProfile } from "@/lib/messenger/line/sync-customer-profile";

export const runtime = "nodejs";

/** POST — 대화 열람 (읽음 처리·보강, UI 블로킹 없음) */
export async function POST(
  _request: Request,
  { params }: { params: { conversationId: string } },
) {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const storeId = auth.profile.store_id!;
  const conversationId = params.conversationId;

  const supabase = createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ ok: false, message: "대화를 찾을 수 없습니다." }, { status: 404 });
  }

  await resetConversationUnread(conversationId, storeId);

  void Promise.all([
    backfillConversationTranslations({ conversationId, storeId }),
    syncLineCustomerProfile({ conversationId, storeId }),
  ]).catch(() => {
    // 보강 실패는 UI에 영향 없음
  });

  return NextResponse.json({ ok: true });
}
