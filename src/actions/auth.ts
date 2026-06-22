"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Supabase Auth signOut — 세션 종료 후 /login 이동 */
export const onSignOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
