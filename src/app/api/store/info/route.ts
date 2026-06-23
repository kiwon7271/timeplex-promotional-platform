import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { STORE_COLUMNS } from "@/lib/supabase/query-columns";
import { actionJson } from "@/lib/api/action-json";
import { onUpdateStoreInfo } from "@/actions/stores";

export const runtime = "nodejs";

/** GET — 매장 기본 정보 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const { data: store } = await supabase
    .from("stores")
    .select(STORE_COLUMNS)
    .eq("id", auth.profile.store_id!)
    .single();

  return NextResponse.json({ ok: true, data: store });
}

/** POST — 매장 정보 수정 */
export async function POST(request: Request) {
  return actionJson(await onUpdateStoreInfo(await request.formData()));
}
