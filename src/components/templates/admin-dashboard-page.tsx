"use client";

import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import StatCard from "@/components/ui/stat-card";
import PageSkeleton from "@/components/ui/page-skeleton";

type DashboardData = {
  storeCount: number;
  pendingApplications: number;
  openChats: number;
  monthlyUsage: number;
  yearMonth: string;
};

/** 통합관리자 대시보드 — CSR */
const AdminDashboardPage = () => {
  const { ready } = useAdminSession();
  const { data, loading } = useApiQuery<DashboardData>(
    ready ? "/api/admin/dashboard" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="대시보드" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const ym = data?.yearMonth ?? new Date().toISOString().slice(0, 7);

  return (
    <>
      <PageHeader title="대시보드" description="Timeplex 통합 현황" />
      <PageBody>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="전체 매장" value={data?.storeCount ?? 0} motionDelay={0} />
          <StatCard label="대기 신청" value={data?.pendingApplications ?? 0} motionDelay={0.05} />
          <StatCard label="진행 중 대화" value={data?.openChats ?? 0} motionDelay={0.1} />
          <StatCard
            label={`이번 달 메시지 (${ym})`}
            value={data?.monthlyUsage ?? 0}
            motionDelay={0.15}
          />
        </div>
      </PageBody>
    </>
  );
};

export default AdminDashboardPage;
