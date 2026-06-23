"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import InquiryBoardList from "@/components/inquiries/inquiry-board-list";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { Inquiry, Store } from "@/types/database";
import type { InquiryCategory } from "@/lib/inquiry-category";

type StoreInquiriesData = {
  inquiries: Inquiry[];
  stores: Pick<Store, "id" | "name">[];
  total: number;
  page: number;
  totalPages: number;
  category?: InquiryCategory;
};

/** 매장문의 — CSR */
const AdminStoreInquiriesPage = () => {
  const { ready } = useAdminSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const params = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    if (page) params.set("page", page);
    if (category) params.set("category", category);
    const qs = params.toString();
    return `/api/admin/store-inquiries${qs ? `?${qs}` : ""}`;
  }, [ready, searchParams]);

  const { data, loading, refresh } = useApiQuery<StoreInquiriesData>(queryPath, ready);

  const storeNames = useMemo(
    () => Object.fromEntries((data?.stores ?? []).map((s) => [s.id, s.name])),
    [data?.stores],
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="매장문의" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="매장문의" description="전체 매장 문의 게시판" />
      <PageBody>
        <InquiryBoardList
          title="문의 목록"
          inquiries={data?.inquiries ?? []}
          total={data?.total ?? 0}
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 1}
          basePath="/admin/store-inquiries"
          category={data?.category}
          storeNames={storeNames}
          emptyMessage={
            data?.category ? "해당 구분의 문의가 없습니다." : "문의가 없습니다."
          }
          onMutated={refresh}
        />
      </PageBody>
    </>
  );
};

export default AdminStoreInquiriesPage;
