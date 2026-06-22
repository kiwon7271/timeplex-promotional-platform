import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import StatCard from "@/components/ui/stat-card";
import EmptyState from "@/components/ui/empty-state";
import DocumentStatusSummary from "@/components/store/document-status-summary";

/** 매장 대시보드 (운영 상태, 요금제, 직원, 서류 요약) */
const StoreDashboard = async () => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="대시보드" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다. 관리자에게 문의하세요." />
        </PageBody>
      </>
    );
  }

  /** Supabase: stores·store_members·conversations·store_documents — 대시보드 집계 */
  const supabase = createClient();
  const [store, members, openChats, documents] = await Promise.all([
    supabase.from("stores").select("*").eq("id", profile.store_id).single(),
    supabase.from("store_members").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("store_id", profile.store_id)
      .eq("status", "OPEN"),
    supabase.from("store_documents").select("status").eq("store_id", profile.store_id),
  ]);

  const docSummary = (documents.data ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="대시보드" description={store.data?.name} />
      <PageBody>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="채팅 서비스" value={store.data?.status === "ACTIVE" ? "운영중" : "중지"} motionDelay={0} />
          <StatCard label="요금제" value={store.data?.plan_code ?? "-"} motionDelay={0.05} />
          <StatCard label="직원 수" value={members.count ?? 0} motionDelay={0.1} />
          <StatCard label="진행 중 대화" value={openChats.count ?? 0} motionDelay={0.15} />
        </div>

        <DocumentStatusSummary
          pending={docSummary.PENDING ?? 0}
          approved={docSummary.APPROVED ?? 0}
          rejected={docSummary.REJECTED ?? 0}
        />
      </PageBody>
    </>
  );
};

export default StoreDashboard;
