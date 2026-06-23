"use client";

import { useAdminSession } from "@/providers/session-provider";
import { useApiQuery } from "@/hooks/use-api-query";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ConsentManager from "@/components/admin/consent-manager";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { ConsentNotice } from "@/types/database";

/** 동의/고지 설정 — CSR */
const AdminSettingsPage = () => {
  const { ready } = useAdminSession();
  const { data: notices, loading, refresh } = useApiQuery<ConsentNotice[]>(
    ready ? "/api/admin/settings" : null,
    ready,
  );

  if (!ready || loading) {
    return (
      <>
        <PageHeader title="설정" />
        <PageBody>
          <PageSkeleton />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="설정" description="동의/고지 문구 관리" />
      <PageBody>
        <ConsentManager notices={notices ?? []} onMutated={refresh} />
      </PageBody>
    </>
  );
};

export default AdminSettingsPage;
