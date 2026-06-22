import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import ReservationLinkManager from "@/components/store/reservation-link-manager";

/** 예약 링크 CRUD 페이지 */
const StoreReservationLinks = async () => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="예약 링크" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  /** Supabase: reservation_links — 예약 링크 목록 조회 */
  const supabase = createClient();
  const { data: links } = await supabase
    .from("reservation_links")
    .select("*")
    .eq("store_id", profile.store_id)
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="예약 링크" description="외부 예약 채널 링크 관리" />
      <PageBody>
        <ReservationLinkManager links={links ?? []} />
      </PageBody>
    </>
  );
};

export default StoreReservationLinks;
