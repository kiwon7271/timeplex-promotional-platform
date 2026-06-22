import { createClient } from "@/lib/supabase/server";
import {
  getApplicationListRange,
  getApplicationTotalPages,
  parseApplicationPage,
} from "@/lib/application-list";
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
import type { AdminStoreAdmissionsPageProps } from "@/types/pages";

/** 온보딩 신청 목록 — 검수 대기(PENDING)만 표시, 처리 후 삭제 */
const AdminApplications = async ({ searchParams }: AdminStoreAdmissionsPageProps) => {
  const pageParam = parseApplicationPage(searchParams.page);

  const supabase = createClient();
  const { count } = await supabase
    .from("onboarding_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  const total = count ?? 0;
  const totalPages = getApplicationTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getApplicationListRange(page);

  const { data: apps } = await supabase
    .from("onboarding_applications")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = apps ?? [];
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
                        <ApplicationRowActions app={app} />
                      </td>
                    </tr>
                  ))}
                </Table>

                <ListPagination
                  page={page}
                  totalPages={totalPages}
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

export default AdminApplications;
