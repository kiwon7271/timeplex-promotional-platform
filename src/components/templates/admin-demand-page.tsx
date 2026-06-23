"use client";

import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import PageSkeleton from "@/components/ui/page-skeleton";

type DemandRow = {
  storeId: string;
  count: number;
  name: string;
};

/** 매장 수요 — CSR */
const AdminDemandPage = () => {
  const { ready } = useAdminSession();
  const { data: ranking, loading } = useApiQuery<DemandRow[]>(
    ready ? "/api/admin/demand" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="매장 수요" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const rows = ranking ?? [];

  return (
    <>
      <PageHeader title="매장 수요" description="이벤트 기준 매장 수요 랭킹" />
      <PageBody>
        <ListSection title="수요 랭킹">
          {rows.length > 0 ? (
            <Table headers={["순위", "매장명", "이벤트 수"]}>
              {rows.map((row, idx) => (
                <tr key={row.storeId}>
                  <td>{idx + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="이벤트 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminDemandPage;
