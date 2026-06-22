"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import { onDeleteInquiry } from "@/actions/inquiries";
import type { Inquiry } from "@/types/database";
import { formatDateTime } from "@/lib/format-datetime";
import { getInquiryListQuery, getInquiryRowNumber } from "@/lib/inquiry-board";
import { getInquiryCategoryLabel, type InquiryCategory } from "@/lib/inquiry-category";
import { getInquiryStatusLabel, getInquiryStatusValue } from "@/lib/inquiry-thread";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import ActionButton from "@/components/ui/action-button";
import ListPagination from "@/components/ui/list-pagination";
import InquiryThreadModal from "@/components/inquiries/inquiry-thread-modal";
import InquiryCategoryFilter from "@/components/inquiries/elements/inquiry-category-filter";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";

export interface InquiryBoardListProps {
  title: string;
  inquiries: Inquiry[];
  total: number;
  page: number;
  totalPages: number;
  basePath: string;
  category?: InquiryCategory;
  storeNames?: Record<string, string>;
  emptyMessage?: string;
  /** 매장 목록 — 문의 전체 삭제 버튼 표시 */
  deletable?: boolean;
}

/** 문의 게시판 — 목록 + 스레드 모달 */
const InquiryBoardList = ({
  title,
  inquiries,
  total,
  page,
  totalPages,
  basePath,
  category,
  storeNames,
  emptyMessage = "문의가 없습니다.",
  deletable = false,
}: InquiryBoardListProps) => {
  const router = useRouter();
  const [openInquiryId, setOpenInquiryId] = useState<string | null>(null);
  const showStore = Boolean(storeNames);
  const listQuery = getInquiryListQuery(category);
  const headers = showStore
    ? (["번호", "매장", "구분", "제목", "상태", "문의일시", "답변 일시"] as const)
    : deletable
      ? (["번호", "구분", "제목", "상태", "문의일시", "답변 일시", "관리"] as const)
      : (["번호", "구분", "제목", "상태", "문의일시", "답변 일시"] as const);

  const onClickInquiryRow = (id: string) => {
    setOpenInquiryId(id);
  };

  const onCloseInquiryModal = () => {
    setOpenInquiryId(null);
    router.refresh();
  };

  const onUpdatedInquiryThread = () => {
    router.refresh();
  };

  const onDeleteInquiryAction = async (id: string) => {
    const res = await onDeleteInquiry(id);
    if (res.ok) {
      if (openInquiryId === id) setOpenInquiryId(null);
      router.refresh();
    }
    return res;
  };

  const onClickDeleteButton = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <ListSection title={title} plain>
        <InquiryCategoryFilter basePath={basePath} category={category} />
        {inquiries.length > 0 ? (
          <>
            <div className={deletable ? "[&_th:last-child]:text-center" : undefined}>
            <Table headers={[...headers]}>
              {inquiries.map((inq, index) => (
                <tr
                  key={inq.id}
                  className="cursor-pointer hover:bg-gray-50/80"
                  onClick={() => onClickInquiryRow(inq.id)}
                >
                  <td className="whitespace-nowrap text-gray-500">
                    {getInquiryRowNumber(total, page, index)}
                  </td>
                  {showStore ? (
                    <td className="whitespace-nowrap">{storeNames![inq.store_id] ?? "-"}</td>
                  ) : null}
                  <td className="whitespace-nowrap text-[13px] text-gray-600">
                    {getInquiryCategoryLabel(inq.category)}
                  </td>
                  <td>
                    <span className="block max-w-[280px] truncate font-medium text-gray-900 sm:max-w-md">
                      {inq.title}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <Badge value={getInquiryStatusValue(inq)}>{getInquiryStatusLabel(inq)}</Badge>
                  </td>
                  <td className="whitespace-nowrap text-[13px] text-gray-600">
                    {formatDateTime(inq.created_at)}
                  </td>
                  <td className="whitespace-nowrap text-[13px] text-gray-600">
                    {inq.answered_at ? formatDateTime(inq.answered_at) : "-"}
                  </td>
                  {deletable ? (
                    <td className="whitespace-nowrap text-center" onClick={onClickDeleteButton}>
                      <ActionButton
                        variant="danger"
                        size="sm"
                        iconOnly
                        tooltip="삭제"
                        tooltipPlacement="bottom"
                        ariaLabel="문의 삭제"
                        confirm="이 문의를 삭제할까요? 답변 내역도 함께 삭제됩니다."
                        icon={<IconTrash size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                        onAction={() => onDeleteInquiryAction(inq.id)}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </Table>
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              basePath={basePath}
              query={listQuery}
            />
          </>
        ) : (
          <EmptyState plain message={emptyMessage} />
        )}
      </ListSection>

      <InquiryThreadModal
        inquiryId={openInquiryId}
        onClose={onCloseInquiryModal}
        onUpdated={onUpdatedInquiryThread}
      />
    </>
  );
};

export default InquiryBoardList;
