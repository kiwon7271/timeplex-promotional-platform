import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/lib/constants";
import type { Profile } from "@/types/database";

/** Supabase Auth + profiles 조회 — 현재 로그인 사용자 프로필 (없으면 null) */
export const getProfile = async (): Promise<Profile | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return data;
};

/** 로그인 필수 — 미인증 시 /login 리다이렉트 */
export const requireProfile = async (): Promise<Profile> => {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
};

/** 역할 검증 — profiles.role 확인 후 권한 없으면 본인 홈으로 이동 */
export const requireRole = async (allowed: Role[]): Promise<Profile> => {
  const profile = await requireProfile();
  if (!allowed.includes(profile.role)) {
    redirect(profile.role === ROLES.SUPER_ADMIN ? "/admin" : "/store");
  }
  return profile;
};

/** SUPER_ADMIN 역할 전용 가드 */
export const requireSuperAdmin = () => requireRole([ROLES.SUPER_ADMIN]);

/** STORE_OWNER / STORE_STAFF 역할 전용 가드 */
export const requireStoreUser = () => requireRole([ROLES.STORE_OWNER, ROLES.STORE_STAFF]);
