import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { RESERVATION_LINK_COLUMNS } from "@/lib/supabase/query-columns";
import { actionJson } from "@/lib/api/action-json";
import { onCreateReservationLink, onDeleteReservationLink } from "@/actions/stores";

export const runtime = "nodejs";

/** GET — 예약 링크 목록 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const { data: links } = await supabase
    .from("reservation_links")
    .select(RESERVATION_LINK_COLUMNS)
    .eq("store_id", auth.profile.store_id!)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, data: links ?? [] });
}

/** POST — 예약 링크 추가 */
export async function POST(request: Request) {
  return actionJson(await onCreateReservationLink(await request.formData()));
}

/** DELETE — 예약 링크 삭제 */
export async function DELETE(request: Request) {
  const { id } = (await request.json()) as { id: string };
  return actionJson(await onDeleteReservationLink(id));
}
