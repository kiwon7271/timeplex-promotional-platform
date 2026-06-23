"use client";

import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import ReservationLinkManager from "@/components/store/reservation-link-manager";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { ReservationLink } from "@/types/database";

/** 예약 링크 — CSR */
const StoreReservationLinksPage = () => {
  const { ready, storeId } = useStoreSession();
  const { data: links, loading, refresh } = useApiQuery<ReservationLink[]>(
    ready ? "/api/store/reservation-links" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="예약 링크" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="예약 링크" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="예약 링크" description="외부 예약 채널 링크 관리" />
      <PageBody>
        <ReservationLinkManager links={links ?? []} onMutated={refresh} />
      </PageBody>
    </>
  );
};

export default StoreReservationLinksPage;
