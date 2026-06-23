import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";

export const runtime = "nodejs";

/** GET — 매장 수요 랭킹 */
export async function GET() {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const [{ data: events }, { data: stores }] = await Promise.all([
    supabase.from("store_events").select("store_id"),
    supabase.from("stores").select("id, name"),
  ]);

  const nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));
  const counts = new Map<string, number>();
  for (const e of events ?? []) {
    counts.set(e.store_id, (counts.get(e.store_id) ?? 0) + 1);
  }
  const ranking = [...counts.entries()]
    .map(([storeId, count]) => ({ storeId, count, name: nameMap.get(storeId) ?? storeId }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ ok: true, data: ranking });
}
