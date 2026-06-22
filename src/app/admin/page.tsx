import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import StatCard from "@/components/ui/stat-card";

/** 통합관리자 대시보드 (전체 매장/신청/대화/사용량 집계) */
const AdminDashboard = async () => {
  /** Supabase: stores·onboarding_applications·conversations·usage_monthly 집계 조회 */
  const supabase = createClient();
  const ym = new Date().toISOString().slice(0, 7);

  const [stores, applications, conversations, usage] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase
      .from("onboarding_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("status", "OPEN"),
    supabase.from("usage_monthly").select("message_count").eq("year_month", ym),
  ]);

  const monthlyUsage = (usage.data ?? []).reduce((sum, r) => sum + (r.message_count ?? 0), 0);

  return (
    <>
      <PageHeader title="대시보드" description="Timeplex 통합 현황" />
      <PageBody>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="전체 매장" value={stores.count ?? 0} motionDelay={0} />
        <StatCard label="대기 신청" value={applications.count ?? 0} motionDelay={0.05} />
        <StatCard label="진행 중 대화" value={conversations.count ?? 0} motionDelay={0.1} />
        <StatCard label={`이번 달 메시지 (${ym})`} value={monthlyUsage} motionDelay={0.15} />
      </div>
      </PageBody>
    </>
  );
};

export default AdminDashboard;
