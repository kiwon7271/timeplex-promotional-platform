import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";

export const runtime = "nodejs";

/** GET — 방문자 통계 */
export async function GET() {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const [{ data: events }, { data: stores }] = await Promise.all([
    supabase.from("store_events").select("store_id, event_type, created_at"),
    supabase.from("stores").select("id, name"),
  ]);

  const nameMap = new Map((stores ?? []).map((s) => [s.id, s.name]));
  const daily = new Map<string, number>();
  const clicks = new Map<string, number>();

  for (const e of events ?? []) {
    const day = (e.created_at ?? "").slice(0, 10);
    if (day) daily.set(day, (daily.get(day) ?? 0) + 1);
    if (e.event_type === "CLICK") clicks.set(e.store_id, (clicks.get(e.store_id) ?? 0) + 1);
  }

  const dailyRows = [...daily.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const clickRows = [...clicks.entries()].sort((a, b) => b[1] - a[1]);

  return NextResponse.json({
    ok: true,
    data: {
      dailyRows: dailyRows.map(([day, count]) => ({ day, count })),
      clickRows: clickRows.map(([storeId, count]) => ({
        storeId,
        count,
        name: nameMap.get(storeId) ?? storeId,
      })),
    },
  });
}
