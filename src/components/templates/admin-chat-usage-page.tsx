"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import ListPagination from "@/components/ui/list-pagination";
import PageSkeleton from "@/components/ui/page-skeleton";

type UsageRow = {
  id: string;
  store_id: string;
  year_month: string;
  message_count: number;
  conversation_count: number;
  stores: { id: string; name: string } | { id: string; name: string }[] | null;
};

type ChatUsageData = {
  usage: UsageRow[];
  page: number;
  totalPages: number;
};

/** 채팅사용량 — CSR */
const AdminChatUsagePage = () => {
  const { ready } = useAdminSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const page = searchParams.get("page");
    return page ? `/api/admin/chat-usage?page=${page}` : "/api/admin/chat-usage";
  }, [ready, searchParams]);

  const { data, loading } = useApiQuery<ChatUsageData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="채팅사용량" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const usage = data?.usage ?? [];
  const totalPages = data?.totalPages ?? 1;
  const page = data?.page ?? 1;

  return (
    <>
      <PageHeader title="채팅사용량" description="매장별 월간 채팅 사용량" />
      <PageBody>
        <ListSection title="월간 사용량">
          {usage.length > 0 ? (
            <>
              <Table headers={["매장명", "월", "메시지 수", "대화 수"]}>
                {usage.map((u) => {
                  const storeRaw = u.stores as unknown;
                  const store = (Array.isArray(storeRaw) ? storeRaw[0] : storeRaw) as
                    | { id: string; name: string }
                    | null
                    | undefined;
                  return (
                    <tr key={u.id}>
                      <td>{store?.name ?? u.store_id}</td>
                      <td>{u.year_month}</td>
                      <td>{u.message_count}</td>
                      <td>{u.conversation_count}</td>
                    </tr>
                  );
                })}
              </Table>
              {totalPages > 1 ? (
                <ListPagination
                  className="mt-4"
                  basePath="/admin/chat-usage"
                  page={page}
                  totalPages={totalPages}
                />
              ) : null}
            </>
          ) : (
            <EmptyState plain message="사용량 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminChatUsagePage;
