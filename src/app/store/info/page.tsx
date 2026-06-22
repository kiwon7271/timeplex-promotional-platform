import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreInfoForm from "@/components/store/store-info-form";

/** 매장 기본 정보 수정 페이지 */
const StoreInfo = async () => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="매장 정보" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  /** Supabase: stores — 소속 매장 정보 조회 */
  const supabase = createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", profile.store_id)
    .single();

  return (
    <>
      <PageHeader title="매장 정보" description="매장 기본 정보 수정" />
      <PageBody>{store ? <StoreInfoForm store={store} /> : <EmptyState />}</PageBody>
    </>
  );
};

export default StoreInfo;
