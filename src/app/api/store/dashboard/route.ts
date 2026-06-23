import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import {
  CONVERSATION_COUNT,
  STORE_COLUMNS,
  STORE_DOCUMENT_STATUS,
  STORE_MEMBER_COUNT,
} from "@/lib/supabase/query-columns";

export const runtime = "nodejs";

/** GET — 매장 대시보드 집계 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const storeId = auth.profile.store_id!;
  const supabase = createClient();

  const [store, members, openChats, documents] = await Promise.all([
    supabase.from("stores").select(STORE_COLUMNS).eq("id", storeId).single(),
    supabase
      .from("store_members")
      .select(STORE_MEMBER_COUNT, { count: "exact", head: true })
      .eq("store_id", storeId),
    supabase
      .from("conversations")
      .select(CONVERSATION_COUNT, { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "OPEN"),
    supabase.from("store_documents").select(STORE_DOCUMENT_STATUS).eq("store_id", storeId),
  ]);

  const docSummary = (documents.data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    ok: true,
    data: {
      store: store.data,
      staffCount: members.count ?? 0,
      openChatCount: openChats.count ?? 0,
      docSummary: {
        pending: docSummary.PENDING ?? 0,
        approved: docSummary.APPROVED ?? 0,
        rejected: docSummary.REJECTED ?? 0,
      },
    },
  });
}
