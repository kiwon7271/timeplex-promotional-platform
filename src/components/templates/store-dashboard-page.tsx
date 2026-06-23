"use client";

import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";
import DocumentStatusSummary from "@/components/store/document-status-summary";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { Store } from "@/types/database";

type DashboardData = {
  store: Store | null;
  staffCount: number;
  openChatCount: number;
  docSummary: { pending: number; approved: number; rejected: number };
};

/** 매장 대시보드 — CSR */
const StoreDashboardPage = () => {
  const { ready, storeId } = useStoreSession();
  const { data, loading } = useApiQuery<DashboardData>(
    ready ? "/api/store/dashboard" : null,
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

  if (!storeId) {
    return (
      <>
        <PageHeader title="대시보드" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다. 관리자에게 문의하세요." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="대시보드" description={data?.store?.name} />
      <PageBody>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="채팅 서비스"
            value={data?.store?.status === "ACTIVE" ? "운영중" : "중지"}
            motionDelay={0}
          />
          <StatCard label="요금제" value={data?.store?.plan_code ?? "-"} motionDelay={0.05} />
          <StatCard label="직원 수" value={data?.staffCount ?? 0} motionDelay={0.1} />
          <StatCard label="진행 중 대화" value={data?.openChatCount ?? 0} motionDelay={0.15} />
        </div>
        <DocumentStatusSummary
          pending={data?.docSummary.pending ?? 0}
          approved={data?.docSummary.approved ?? 0}
          rejected={data?.docSummary.rejected ?? 0}
        />
      </PageBody>
    </>
  );
};

export default StoreDashboardPage;
