import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import ConsentManager from "@/components/admin/consent-manager";

/** 동의/고지 문구 설정 페이지 */
const AdminSettings = async () => {
  /** Supabase: consent_notices 목록 조회 */
  const supabase = createClient();
  const { data: notices } = await supabase
    .from("consent_notices")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="설정" description="동의/고지 문구 관리" />
      <PageBody>
        <ConsentManager notices={notices ?? []} />
      </PageBody>
    </>
  );
};

export default AdminSettings;
