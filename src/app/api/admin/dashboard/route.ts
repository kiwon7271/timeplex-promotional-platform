import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";

export const runtime = "nodejs";

/** GET — 통합관리자 대시보드 집계 */
export async function GET() {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const ym = new Date().toISOString().slice(0, 7);

  const [stores, applications, conversations, usage] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase
      .from("onboarding_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "OPEN"),
    supabase.from("usage_monthly").select("message_count").eq("year_month", ym),
  ]);

  const monthlyUsage = (usage.data ?? []).reduce((sum, r) => sum + (r.message_count ?? 0), 0);

  return NextResponse.json({
    ok: true,
    data: {
      storeCount: stores.count ?? 0,
      pendingApplications: applications.count ?? 0,
      openChats: conversations.count ?? 0,
      monthlyUsage,
      yearMonth: ym,
    },
  });
}
