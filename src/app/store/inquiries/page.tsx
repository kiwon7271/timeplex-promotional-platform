import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getInquiryListRange,
  getInquiryTotalPages,
  parseInquiryPage,
} from "@/lib/inquiry-board";
import { parseInquiryCategory } from "@/lib/inquiry-category";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import EmptyState from "@/components/ui/empty-state";
import InquiryBoardList from "@/components/inquiries/inquiry-board-list";
import InquiryCreateButton from "@/components/store/inquiry-create-button";
import type { StoreInquiriesPageProps } from "@/types/pages";

/** 매장 문의 게시판 — 목록 */
const StoreInquiries = async ({ searchParams }: StoreInquiriesPageProps) => {
  const profile = await requireStoreUser();
  if (!profile.store_id) {
    return (
      <>
        <PageHeader title="문의" />
        <PageBody>
          <EmptyState message="소속된 매장이 없습니다." />
        </PageBody>
      </>
    );
  }

  const pageParam = parseInquiryPage(searchParams.page);
  const category = parseInquiryCategory(searchParams.category);

  const supabase = createClient();
  let countQuery = supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("store_id", profile.store_id);
  if (category) countQuery = countQuery.eq("category", category);

  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = getInquiryTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getInquiryListRange(page);

  let listQuery = supabase
    .from("inquiries")
    .select("*")
    .eq("store_id", profile.store_id)
    .order("last_message_at", { ascending: false })
    .range(from, to);
  if (category) listQuery = listQuery.eq("category", category);

  const { data: inquiries } = await listQuery;

  return (
    <>
      <PageHeader
        title="문의"
        description="Timeplex 운영팀 문의 게시판"
        action={<InquiryCreateButton />}
      />
      <PageBody>
        <InquiryBoardList
          title="문의 목록"
          inquiries={inquiries ?? []}
          total={total}
          page={page}
          totalPages={totalPages}
          basePath="/store/inquiries"
          category={category}
          deletable
          emptyMessage={category ? "해당 구분의 문의가 없습니다." : "문의 내역이 없습니다."}
        />
      </PageBody>
    </>
  );
};

export default StoreInquiries;
