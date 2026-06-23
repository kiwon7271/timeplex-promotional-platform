import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStoreApiUser } from "@/lib/api/store-auth";
import { getActiveConsentNotices } from "@/lib/consent";

export const runtime = "nodejs";

/** GET — 접속 팝업용 활성 공지 */
export async function GET() {
  const auth = await requireStoreApiUser();
  if ("response" in auth) return auth.response;

  const notices = await getActiveConsentNotices();
  return NextResponse.json({ ok: true, data: notices });
}
