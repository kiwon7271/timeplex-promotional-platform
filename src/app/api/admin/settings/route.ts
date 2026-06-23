import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApiUser } from "@/lib/api/admin-auth";
import { CONSENT_NOTICE_COLUMNS } from "@/lib/supabase/query-columns";

export const runtime = "nodejs";

/** GET — 동의/고지 설정 */
export async function GET() {
  const auth = await requireAdminApiUser();
  if ("response" in auth) return auth.response;

  const supabase = createClient();
  const { data: notices } = await supabase
    .from("consent_notices")
    .select(CONSENT_NOTICE_COLUMNS)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, data: notices ?? [] });
}
