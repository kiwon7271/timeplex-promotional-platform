import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import { USAGE_MONTHLY_WITH_STORE } from "@/lib/supabase/query-columns";
import {
  ADMIN_LIST_PAGE_SIZE,
  getListRange,
  getListTotalPages,
  parseListPage,
} from "@/lib/list-pagination";

export const runtime = "nodejs";

/** GET — 채팅 사용량 */
export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = parseListPage(searchParams.get("page") ?? undefined);
  const supabase = createClient();

  const { count } = await supabase
    .from("usage_monthly")
    .select("id", { count: "exact", head: true });

  const total = count ?? 0;
  const totalPages = getListTotalPages(total, ADMIN_LIST_PAGE_SIZE);
  const safePage = Math.min(page, totalPages);
  const { from, to } = getListRange(safePage, ADMIN_LIST_PAGE_SIZE);

  const { data: usage } = await supabase
    .from("usage_monthly")
    .select(USAGE_MONTHLY_WITH_STORE)
    .order("year_month", { ascending: false })
    .range(from, to);

  return NextResponse.json({
    ok: true,
    data: { usage: usage ?? [], page: safePage, totalPages },
  });
}
