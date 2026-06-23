import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { CONVERSATION_COLUMNS } from "@/lib/supabase/query-columns";
import {
  getConversationListRange,
  getConversationTotalPages,
  parseConversationPage,
} from "@/lib/conversation-list";

export const runtime = "nodejs";

/** GET — 매장 대화 목록 */
export async function GET(request: Request) {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const channel = searchParams.get("channel")?.trim() ?? "";
  const page = parseConversationPage(searchParams.get("page") ?? undefined);

  const supabase = createClient();
  const storeId = auth.profile.store_id!;

  let countQuery = supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (channel) countQuery = countQuery.eq("channel", channel);
  if (q) {
    countQuery = countQuery.or(
      `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`,
    );
  }

  const { count } = await countQuery;
  const total = count ?? 0;
  const totalPages = getConversationTotalPages(total);
  const safePage = Math.min(page, totalPages);
  const { from, to } = getConversationListRange(safePage);

  let listQuery = supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .eq("store_id", storeId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (channel) listQuery = listQuery.eq("channel", channel);
  if (q) {
    listQuery = listQuery.or(
      `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,customer_email.ilike.%${q}%`,
    );
  }

  const { data, error } = await listQuery;
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
