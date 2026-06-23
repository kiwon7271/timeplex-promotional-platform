"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import { formatDateTime } from "@/lib/format-datetime";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import ListPagination from "@/components/ui/list-pagination";
import ApplicationRowActions from "@/components/admin/application-row-actions";
import { getApplicationStatusLabel } from "@/lib/status-label";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { OnboardingApplication } from "@/types/database";

type StoreAdmissionsData = {
  apps: OnboardingApplication[];
  total: number;
  page: number;
  totalPages: number;
};

/** 입점관리 — CSR */
const AdminStoreAdmissionsPage = () => {
  const { ready } = useAdminSession();
  const searchParams = useSearchParams();

  const queryPath = useMemo(() => {
    if (!ready) return null;
    const page = searchParams.get("page");
    return page ? `/api/admin/store-admissions?page=${page}` : "/api/admin/store-admissions";
  }, [ready, searchParams]);

  const { data, loading, refresh } = useApiQuery<StoreAdmissionsData>(queryPath, ready);

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="입점관리" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  const total = data?.total ?? 0;
  const rows = data?.apps ?? [];
  const hasApplications = total > 0;

  return (
    <>
      <PageHeader title="입점관리" description="신규 매장 신청 처리" />
      <PageBody>
        {!hasApplications ? (
          <EmptyState plain message="대기 중인 신청이 없습니다." />
        ) : (
          <ListSection title="신청 목록">
            {rows.length > 0 ? (
              <>
                <Table headers={["매장명", "신청자", "이메일", "신청일", "상태", "처리"]}>
                  {rows.map((app) => (
                    <tr key={app.id}>
                      <td>{app.store_name}</td>
                      <td>{app.applicant_name}</td>
                      <td>{app.email}</td>
                      <td className="whitespace-nowrap text-sm">{formatDateTime(app.created_at)}</td>
                      <td>
                        <Badge value={app.status}>{getApplicationStatusLabel(app.status)}</Badge>
                      </td>
                      <td>
                        <ApplicationRowActions app={app} onMutated={refresh} />
                      </td>
                    </tr>
                  ))}
                </Table>

                <ListPagination
                  page={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 1}
                  basePath="/admin/store-admissions"
                />
              </>
            ) : (
              <EmptyState plain message="대기 중인 신청이 없습니다." />
            )}
          </ListSection>
        )}
      </PageBody>
    </>
  );
};

export default AdminStoreAdmissionsPage;
