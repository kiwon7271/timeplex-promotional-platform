import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import {
  STORE_COLUMNS,
  STORE_DOCUMENT_COLUMNS,
  STORE_MEMBER_WITH_PROFILE,
} from "@/lib/supabase/query-columns";
import { attachDocumentSignedUrls } from "@/lib/store-documents";
import {
  getStoreListRange,
  getStoreTotalPages,
  parseStoreNameQuery,
  parseStorePage,
} from "@/lib/store-list";
import type { StoreMemberRow } from "@/types/admin";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";

export const runtime = "nodejs";

/** GET — 매장 목록 */
export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const nameQuery = parseStoreNameQuery(searchParams.get("q") ?? undefined);
  const pageParam = parseStorePage(searchParams.get("page") ?? undefined);

  const supabase = createClient();

  let countQuery = supabase.from("stores").select("id", { count: "exact", head: true });
  if (nameQuery) countQuery = countQuery.ilike("name", `%${nameQuery}%`);
  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = getStoreTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getStoreListRange(page);

  let listQuery = supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (nameQuery) listQuery = listQuery.ilike("name", `%${nameQuery}%`);
  const { data: stores } = await listQuery;

  const storeIds = (stores ?? []).map((s) => s.id);
  const membersByStore: Record<string, StoreMemberRow[]> = {};
  const documentsByStore: Record<string, StoreDocumentWithUrl[]> = {};

  if (storeIds.length > 0) {
    const [{ data: members }, { data: documents }] = await Promise.all([
      supabase.from("store_members").select(STORE_MEMBER_WITH_PROFILE).in("store_id", storeIds),
      supabase
        .from("store_documents")
        .select(STORE_DOCUMENT_COLUMNS)
        .in("store_id", storeIds)
        .order("created_at", { ascending: false }),
    ]);

    const docsWithUrls = await attachDocumentSignedUrls(documents ?? []);
    for (const doc of docsWithUrls) {
      if (!documentsByStore[doc.store_id]) documentsByStore[doc.store_id] = [];
      documentsByStore[doc.store_id].push(doc);
    }

    for (const m of members ?? []) {
      const p = m.profiles as unknown as { email: string; role: string } | null;
      const row: StoreMemberRow = {
        id: m.id,
        email: p?.email ?? m.profile_id,
        role: m.role,
      };
      if (!membersByStore[m.store_id]) membersByStore[m.store_id] = [];
      membersByStore[m.store_id].push(row);
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      stores: stores ?? [],
      membersByStore,
      documentsByStore,
      total,
      page,
      totalPages,
      nameQuery,
    },
  });
}
