"use client";

import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StaffManager from "@/components/store/staff-manager";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { PlanCode } from "@/lib/constants";

type StaffData = {
  members: { profile_id: string; role: string; email: string }[];
  planCode: PlanCode;
  limit: number;
};

/** 직원 관리 — CSR */
const StoreStaffPage = () => {
  const { ready, storeId } = useStoreSession();
  const { data, loading, refresh } = useApiQuery<StaffData>(
    ready ? "/api/store/staff" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="직원 관리" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="직원 관리" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="직원 관리" description="직원 초대 및 관리" />
      <PageBody>
        <StaffManager
          members={data?.members ?? []}
          planCode={data?.planCode ?? "Free"}
          limit={data?.limit ?? 1}
          onMutated={refresh}
        />
      </PageBody>
    </>
  );
};

export default StoreStaffPage;
