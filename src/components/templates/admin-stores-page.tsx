"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreListFilter from "@/components/admin/elements/store-list-filter";
import StoreListTable from "@/components/admin/store-list-table";
import ListSection from "@/components/ui/list-section";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { StoreMemberRow } from "@/types/admin";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import type { Store } from "@/types/database";

type StoresData = {
  stores: Store[];
  membersByStore: Record<string, StoreMemberRow[]>;
  documentsByStore: Record<string, StoreDocumentWithUrl[]>;
  total: number;
  page: number;
  totalPages: number;
  nameQuery: string;
};

/** 매장 관리 — CSR */
const AdminStoresPage = () => {
  const { ready } = useAdminSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const page = searchParams.get("page");
    if (q) params.set("q", q);
    if (page) params.set("page", page);
    const qs = params.toString();
    return `/api/admin/stores${qs ? `?${qs}` : ""}`;
  }, [ready, searchParams]);

  const { data, loading } = useApiQuery<StoresData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="매장 관리" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const total = data?.total ?? 0;
  const hasStores = total > 0;
  const hasResults = (data?.stores ?? []).length > 0;

  return (
    <>
      <PageHeader title="매장 관리" description="전체 매장 목록 및 카드사 심사 서류 검수" />
      <PageBody>
        {!hasStores ? (
          <EmptyState plain message="등록된 매장이 없습니다." />
        ) : !hasResults ? (
          <ListSection title="매장 목록" action={<StoreListFilter q={data?.nameQuery ?? ""} />} plain>
            <EmptyState plain message="검색 결과가 없습니다." />
          </ListSection>
        ) : (
          <StoreListTable
            stores={data?.stores ?? []}
            membersByStore={data?.membersByStore ?? {}}
            documentsByStore={data?.documentsByStore ?? {}}
            page={data?.page ?? 1}
            totalPages={data?.totalPages ?? 1}
            nameQuery={data?.nameQuery ?? ""}
          />
        )}
      </PageBody>
    </>
  );
};

export default AdminStoresPage;
