import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PLAN_STAFF_LIMIT, type PlanCode } from "@/lib/constants";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StaffManager from "@/components/store/staff-manager";

/** 직원 초대 및 관리 페이지 */
const StoreStaff = async () => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="직원 관리" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  /** Supabase: stores·store_members(+profiles) — 직원 목록 및 요금제 조회 */
  const supabase = createClient();
  const [{ data: store }, { data: rows }] = await Promise.all([
    supabase.from("stores").select("plan_code").eq("id", profile.store_id).single(),
    supabase
      .from("store_members")
      .select("profile_id, role, profiles(email)")
      .eq("store_id", profile.store_id),
  ]);

  const members = (rows ?? []).map((r) => ({
    profile_id: r.profile_id,
    role: r.role,
    email: (r.profiles as unknown as { email: string } | null)?.email ?? r.profile_id,
  }));

  const planCode = (store?.plan_code as PlanCode) ?? "Free";
  const limit = PLAN_STAFF_LIMIT[planCode] ?? 1;

  return (
    <>
      <PageHeader title="직원 관리" description="직원 초대 및 관리" />
      <PageBody>
        <StaffManager members={members} planCode={planCode} limit={limit} />
      </PageBody>
    </>
  );
};

export default StoreStaff;
