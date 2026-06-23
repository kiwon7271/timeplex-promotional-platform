"use client";

import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import PageSkeleton from "@/components/ui/page-skeleton";

type VisitorStatsData = {
  dailyRows: { day: string; count: number }[];
  clickRows: { storeId: string; count: number; name: string }[];
};

/** 방문자 통계 — CSR */
const AdminVisitorStatsPage = () => {
  const { ready } = useAdminSession();
  const { data, loading } = useApiQuery<VisitorStatsData>(
    ready ? "/api/admin/visitor-stats" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="방문자 통계" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const dailyRows = data?.dailyRows ?? [];
  const clickRows = data?.clickRows ?? [];

  return (
    <>
      <PageHeader title="방문자 통계" description="일자별 이벤트 / 매장 클릭" />
      <PageBody>
        <ListSection title="일자별 이벤트 수">
          {dailyRows.length > 0 ? (
            <Table headers={["일자", "이벤트 수"]}>
              {dailyRows.map((row) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="이벤트가 없습니다." />
          )}
        </ListSection>

        <ListSection title="매장 클릭 수" motionDelay={0.05}>
          {clickRows.length > 0 ? (
            <Table headers={["매장명", "클릭 수"]}>
              {clickRows.map((row) => (
                <tr key={row.storeId}>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState plain message="클릭 데이터가 없습니다." />
          )}
        </ListSection>
      </PageBody>
    </>
  );
};

export default AdminVisitorStatsPage;
