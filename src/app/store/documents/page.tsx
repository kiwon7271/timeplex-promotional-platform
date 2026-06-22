import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { attachDocumentSignedUrls } from "@/lib/store-documents";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import DocumentManager from "@/components/store/document-manager";

/** 매장 서류 업로드 및 관리 페이지 */
const StoreDocuments = async () => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="카드사 심사 서류" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  /** Supabase: store_documents — 매장 서류 목록 조회 */
  const supabase = createClient();
  const { data: documents } = await supabase
    .from("store_documents")
    .select("*")
    .eq("store_id", profile.store_id)
    .order("created_at", { ascending: false });

  const docsWithUrls = await attachDocumentSignedUrls(documents ?? []);

  return (
    <>
      <PageHeader
        title="카드사 심사 서류"
        description="카드 결제 가맹 심사를 위해 필요한 서류를 제출·관리합니다"
      />
      <PageBody>
        <DocumentManager documents={docsWithUrls} />
      </PageBody>
    </>
  );
};

export default StoreDocuments;
