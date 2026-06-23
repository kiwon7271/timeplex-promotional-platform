import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS } from "@/lib/supabase/query-columns";
import { ROLES } from "@/lib/constants";
import type { Profile } from "@/types/database";

type StoreAuthOk = { profile: Profile };
type StoreAuthFail = { response: NextResponse };

/** Route API — 매장 사용자 인증 */
export const requireStoreApiUser = async (): Promise<StoreAuthOk | StoreAuthFail> => {
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

  if (!profile?.store_id) {
    return {
      response: NextResponse.json({ ok: false, message: "소속 매장이 없습니다." }, { status: 403 }),
    };
  }

  if (profile.role !== ROLES.STORE_OWNER && profile.role !== ROLES.STORE_STAFF) {
    return {
      response: NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 }),
    };
  }

  return { profile };
};
