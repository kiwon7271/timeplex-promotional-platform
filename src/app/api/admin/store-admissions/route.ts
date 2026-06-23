import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import { ONBOARDING_APPLICATION_COLUMNS } from "@/lib/supabase/query-columns";
import {
  getApplicationListRange,
  getApplicationTotalPages,
  parseApplicationPage,
} from "@/lib/application-list";

export const runtime = "nodejs";

/** GET — 입점 신청 목록 */
export async function GET(request: Request) {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const pageParam = parseApplicationPage(searchParams.get("page") ?? undefined);

  const supabase = createClient();
  const { count } = await supabase
    .from("onboarding_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING");

  const total = count ?? 0;
  const totalPages = getApplicationTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getApplicationListRange(page);

  const { data: apps } = await supabase
    .from("onboarding_applications")
    .select(ONBOARDING_APPLICATION_COLUMNS)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .range(from, to);

  return NextResponse.json({
    ok: true,
    data: { apps: apps ?? [], total, page, totalPages },
  });
}
