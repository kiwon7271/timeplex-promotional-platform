import { createClient } from "@/lib/supabase/client";

/** 검수 대기 입점 신청 건수 */
export const fetchPendingApplicationCount = async () => {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("onboarding_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  if (error) throw error;
  return count ?? 0;
};
