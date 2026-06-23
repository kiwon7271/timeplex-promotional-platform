"use client";

import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import DocumentManager from "@/components/store/document-manager";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";

/** 서류 관리 — CSR */
const StoreDocumentsPage = () => {
  const { ready, storeId } = useStoreSession();
  const { data: documents, loading, refresh } = useApiQuery<StoreDocumentWithUrl[]>(
    ready ? "/api/store/documents" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="카드사 심사 서류" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="카드사 심사 서류" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="카드사 심사 서류"
        description="카드 결제 가맹 심사를 위해 필요한 서류를 제출·관리합니다"
      />
      <PageBody>
        <DocumentManager documents={documents ?? []} onMutated={refresh} />
      </PageBody>
    </>
  );
};

export default StoreDocumentsPage;
