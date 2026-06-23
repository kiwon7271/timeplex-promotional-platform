"use client";

import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreInfoForm from "@/components/store/store-info-form";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { Store } from "@/types/database";

/** 매장 정보 — CSR */
const StoreInfoPage = () => {
  const { ready, storeId } = useStoreSession();
  const { data: store, loading, refresh } = useApiQuery<Store | null>(
    ready ? "/api/store/info" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="매장 정보" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="매장 정보" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="매장 정보" description="매장 기본 정보 수정" />
      <PageBody>
        {store ? <StoreInfoForm store={store} onMutated={refresh} /> : <EmptyState />}
      </PageBody>
    </>
  );
};

export default StoreInfoPage;
