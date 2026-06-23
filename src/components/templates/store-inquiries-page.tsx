"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useStoreSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import InquiryBoardList from "@/components/inquiries/inquiry-board-list";
import InquiryCreateButton from "@/components/store/inquiry-create-button";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { Inquiry } from "@/types/database";
import type { InquiryCategory } from "@/lib/inquiry-category";

type InquiriesData = {
  inquiries: Inquiry[];
  total: number;
  page: number;
  totalPages: number;
  category?: InquiryCategory;
};

/** 매장 문의 — CSR */
const StoreInquiriesPage = () => {
  const { ready, storeId } = useStoreSession();
  const searchParams = useSearchParams();
  const queryPath = useMemo(() => {
    if (!ready) return null;
    const params = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    if (page) params.set("page", page);
    if (category) params.set("category", category);
    const qs = params.toString();
    return `/api/store/inquiries${qs ? `?${qs}` : ""}`;
  }, [ready, searchParams]);

  const { data, loading, refresh } = useApiQuery<InquiriesData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="문의" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  if (!storeId) {
    return (
      <>
        <PageHeader title="문의" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="문의"
        description="Timeplex 운영팀 문의 게시판"
        action={<InquiryCreateButton onMutated={refresh} />}
      />
      <PageBody>
        <InquiryBoardList
          title="문의 목록"
          inquiries={data?.inquiries ?? []}
          total={data?.total ?? 0}
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 1}
          basePath="/store/inquiries"
          category={data?.category}
          deletable
          onMutated={refresh}
          emptyMessage={
            data?.category ? "해당 구분의 문의가 없습니다." : "문의 내역이 없습니다."
          }
        />
      </PageBody>
    </>
  );
};

export default StoreInquiriesPage;
