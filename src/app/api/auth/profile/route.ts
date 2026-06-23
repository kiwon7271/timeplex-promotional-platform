import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS } from "@/lib/supabase/query-columns";

export const runtime = "nodejs";

/** GET — 현재 로그인 프로필 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ ok: false, message: "프로필을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: profile });
}
