import { createClient } from "@/lib/supabase/server";
import {
  getInquiryListRange,
  getInquiryTotalPages,
  parseInquiryPage,
} from "@/lib/inquiry-board";
import { parseInquiryCategory } from "@/lib/inquiry-category";
import PageHeader from "@/components/ui/page-header";
import PageBody from "@/components/ui/page-body";
import InquiryBoardList from "@/components/inquiries/inquiry-board-list";
import type { AdminInquiriesPageProps } from "@/types/pages";

/** 통합관리자 문의 게시판 — 목록 */
const AdminInquiries = async ({ searchParams }: AdminInquiriesPageProps) => {
  const pageParam = parseInquiryPage(searchParams.page);
  const category = parseInquiryCategory(searchParams.category);

  const supabase = createClient();
  let countQuery = supabase.from("inquiries").select("*", { count: "exact", head: true });
  if (category) countQuery = countQuery.eq("category", category);

  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = getInquiryTotalPages(total);
  const page = Math.min(pageParam, totalPages);
  const { from, to } = getInquiryListRange(page);

  let listQuery = supabase
    .from("inquiries")
    .select("*")
    .order("last_message_at", { ascending: false })
    .range(from, to);
  if (category) listQuery = listQuery.eq("category", category);

  const [{ data: inquiries }, { data: stores }] = await Promise.all([
    listQuery,
    supabase.from("stores").select("id, name"),
  ]);

  const storeNames = Object.fromEntries((stores ?? []).map((s) => [s.id, s.name]));

  return (
    <>
      <PageHeader title="매장문의" description="전체 매장 문의 게시판" />
      <PageBody>
        <InquiryBoardList
          title="문의 목록"
          inquiries={inquiries ?? []}
          total={total}
          page={page}
          totalPages={totalPages}
          basePath="/admin/store-inquiries"
          category={category}
          storeNames={storeNames}
          emptyMessage={category ? "해당 구분의 문의가 없습니다." : "문의가 없습니다."}
        />
      </PageBody>
    </>
  );
};

export default AdminInquiries;
