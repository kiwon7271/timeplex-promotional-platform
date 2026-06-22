import { createClient } from "@/lib/supabase/server";
import { attachDocumentSignedUrls } from "@/lib/store-documents";
import {
  getStoreListRange,
  getStoreTotalPages,
  parseStoreNameQuery,
  parseStorePage,
} from "@/lib/store-list";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import StoreListFilter from "@/components/admin/elements/store-list-filter";
import StoreListTable from "@/components/admin/store-list-table";
import ListSection from "@/components/ui/list-section";
import type { StoreMemberRow } from "@/types/admin";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import type { AdminStoresPageProps } from "@/types/pages";

/** 매장 목록 — 페이징·매장명 필터·섹션별 상세 모달 */
const AdminStores = async ({ searchParams }: AdminStoresPageProps) => {
  const nameQuery = parseStoreNameQuery(searchParams.q);
  const pageParam = parseStorePage(searchParams.page);

  const supabase = createClient();

  let countQuery = supabase.from("stores").select("*", { count: "exact", head: true });
  if (nameQuery) countQuery = countQuery.ilike("name", `%${nameQuery}%`);
  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = getStoreTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getStoreListRange(page);

  let listQuery = supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);
  if (nameQuery) listQuery = listQuery.ilike("name", `%${nameQuery}%`);
  const { data: stores } = await listQuery;

  const storeIds = (stores ?? []).map((s) => s.id);

  const membersByStore: Record<string, StoreMemberRow[]> = {};
  const documentsByStore: Record<string, StoreDocumentWithUrl[]> = {};

  if (storeIds.length > 0) {
    const [{ data: members }, { data: documents }] = await Promise.all([
      supabase.from("store_members").select("*, profiles(email, full_name, role)").in("store_id", storeIds),
      supabase
        .from("store_documents")
        .select("*")
        .in("store_id", storeIds)
        .order("created_at", { ascending: false }),
    ]);

    const docsWithUrls = await attachDocumentSignedUrls(documents ?? []);
    for (const doc of docsWithUrls) {
      if (!documentsByStore[doc.store_id]) documentsByStore[doc.store_id] = [];
      documentsByStore[doc.store_id].push(doc);
    }

    for (const m of members ?? []) {
      const p = m.profiles as unknown as { email: string; role: string } | null;
      const row: StoreMemberRow = {
        id: m.id,
        email: p?.email ?? m.profile_id,
        role: m.role,
      };
      if (!membersByStore[m.store_id]) membersByStore[m.store_id] = [];
      membersByStore[m.store_id].push(row);
    }
  }

  const hasStores = total > 0;
  const hasResults = (stores ?? []).length > 0;

  return (
    <>
      <PageHeader title="매장 관리" description="전체 매장 목록 및 카드사 심사 서류 검수" />
      <PageBody>
        {!hasStores ? (
          <EmptyState plain message="등록된 매장이 없습니다." />
        ) : !hasResults ? (
          <ListSection title="매장 목록" action={<StoreListFilter q={nameQuery} />} plain>
            <EmptyState plain message="검색 결과가 없습니다." />
          </ListSection>
        ) : (
          <StoreListTable
            stores={stores ?? []}
            membersByStore={membersByStore}
            documentsByStore={documentsByStore}
            page={page}
            totalPages={totalPages}
            nameQuery={nameQuery}
          />
        )}
      </PageBody>
    </>
  );
};

export default AdminStores;
