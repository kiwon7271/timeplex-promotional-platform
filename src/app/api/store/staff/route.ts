import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { PLAN_STAFF_LIMIT, type PlanCode } from "@/lib/constants";

export const runtime = "nodejs";

/** GET — 직원 목록 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const storeId = auth.profile.store_id!;
  const supabase = createClient();

  const [{ data: store }, { data: rows }] = await Promise.all([
    supabase.from("stores").select("plan_code").eq("id", storeId).single(),
    supabase
      .from("store_members")
      .select("profile_id, role, profiles(email)")
      .eq("store_id", storeId),
  ]);

  const members = (rows ?? []).map((r) => ({
    profile_id: r.profile_id,
    role: r.role,
    email: (r.profiles as unknown as { email: string } | null)?.email ?? r.profile_id,
  }));

  const planCode = (store?.plan_code as PlanCode) ?? "Free";

  return NextResponse.json({
    ok: true,
    data: { members, planCode, limit: PLAN_STAFF_LIMIT[planCode] ?? 1 },
  });
}
