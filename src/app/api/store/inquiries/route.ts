import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { INQUIRY_COLUMNS } from "@/lib/supabase/query-columns";
import {
  getInquiryListRange,
  getInquiryTotalPages,
  parseInquiryPage,
} from "@/lib/inquiry-board";
import { parseInquiryCategory } from "@/lib/inquiry-category";

export const runtime = "nodejs";

/** GET — 매장 문의 목록 */
export async function GET(request: Request) {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const pageParam = parseInquiryPage(searchParams.get("page") ?? undefined);
  const category = parseInquiryCategory(searchParams.get("category") ?? undefined);
  const storeId = auth.profile.store_id!;

  const supabase = createClient();
  let countQuery = supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);
  if (category) countQuery = countQuery.eq("category", category);

  const { count } = await countQuery;
  const total = count ?? 0;
  const totalPages = getInquiryTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getInquiryListRange(page);

  let listQuery = supabase
    .from("inquiries")
    .select(INQUIRY_COLUMNS)
    .eq("store_id", storeId)
    .order("last_message_at", { ascending: false })
    .range(from, to);
  if (category) listQuery = listQuery.eq("category", category);

  const { data: inquiries } = await listQuery;

  return NextResponse.json({
    ok: true,
    data: { inquiries: inquiries ?? [], total, page, totalPages, category },
  });
}
