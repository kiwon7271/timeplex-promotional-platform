import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS } from "@/lib/supabase/query-columns";
import { ROLES } from "@/lib/constants";
import type { Profile } from "@/types/database";

type AuthOk = { profile: Profile };
type AuthFail = { response: NextResponse };

/** Route API — SUPER_ADMIN */
export const requireAdminApiUser = async (): Promise<AuthOk | AuthFail> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== ROLES.SUPER_ADMIN) {
    return {
      response: NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 }),
    };
  }

  return { profile };
};
