"use client";

import { useState } from "react";
import { IconBuildingStore, IconFileText, IconUsers } from "@tabler/icons-react";
import type { StoreListTableProps } from "@/types/admin";
import StoreListFilter from "@/components/admin/elements/store-list-filter";
import ListSection from "@/components/ui/list-section";
import Table from "@/components/ui/table";
import Badge from "@/components/ui/badge";
import IconButton from "@/components/ui/icon-button";
import Modal from "@/components/ui/modal";
import ListPagination from "@/components/ui/list-pagination";
import StoreBasicInfoPanel from "@/components/admin/store-basic-info-panel";
import StoreMembersPanel from "@/components/admin/store-members-panel";
import StoreDocumentReviewPanel from "@/components/admin/store-document-review-panel";
import { summarizeStoreDocuments } from "@/lib/document-checklist";
import { getStoreStatusLabel } from "@/lib/status-label";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";

type StoreModalSection = "basic" | "members" | "documents";

const MODAL_TITLE: Record<StoreModalSection, string> = {
  basic: "기본 정보",
  members: "소속 직원",
  documents: "카드사 심사 서류",
};

const MODAL_SIZE: Record<StoreModalSection, "md" | "xl"> = {
  basic: "md",
  members: "md",
  documents: "xl",
};

/** 매장 목록 + 섹션별 상세 모달 */
const StoreListTable = ({
  stores,
  membersByStore,
  documentsByStore,
  page,
  totalPages,
  nameQuery,
}: StoreListTableProps) => {
  const [modal, setModal] = useState<{ storeId: string; section: StoreModalSection } | null>(null);

  const selectedStore = stores.find((s) => s.id === modal?.storeId) ?? null;
  const selectedMembers = modal ? (membersByStore[modal.storeId] ?? []) : [];
  const selectedDocuments = modal ? (documentsByStore[modal.storeId] ?? []) : [];

  const onOpenModal = (storeId: string, section: StoreModalSection) => {
    setModal({ storeId, section });
  };

  const onCloseModal = () => {
    setModal(null);
  };

  const paginationQuery = nameQuery ? { q: nameQuery } : undefined;

  return (
    <>
      <ListSection title="매장 목록" action={<StoreListFilter q={nameQuery} />}>
        <Table headers={["매장명", "상태", "요금제", "심사 서류", "이메일", "관리"]}>
          {stores.map((store) => {
            const docSummary = summarizeStoreDocuments(documentsByStore[store.id] ?? []);

            return (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>
                  <Badge value={store.status}>{getStoreStatusLabel(store.status)}</Badge>
                </td>
                <td>
                  <Badge value={store.plan_code} />
                </td>
                <td>
                  {docSummary.pending > 0 ? (
                    <Badge variant="warning">검수 대기 {docSummary.pending}</Badge>
                  ) : docSummary.attached > 0 ? (
                    <Badge variant="muted">{docSummary.attached}/8 제출</Badge>
                  ) : (
                    <span className="text-sm text-gray-400">미제출</span>
                  )}
                </td>
                <td>{store.email ?? "-"}</td>
                <td>
                  <div className="flex flex-wrap justify-end gap-1">
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      tooltip="기본정보"
                      aria-label={`${store.name} 기본정보`}
                      icon={<IconBuildingStore size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                      onClick={() => onOpenModal(store.id, "basic")}
                    />
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      tooltip="소속직원"
                      aria-label={`${store.name} 소속직원`}
                      icon={<IconUsers size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                      onClick={() => onOpenModal(store.id, "members")}
                    />
                    <IconButton
                      type="button"
                      variant="outline"
                      size="sm"
                      tooltip="심사서류"
                      aria-label={`${store.name} 심사서류`}
                      icon={<IconFileText size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
                      onClick={() => onOpenModal(store.id, "documents")}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>

        <ListPagination
          page={page}
          totalPages={totalPages}
          basePath="/admin/stores"
          query={paginationQuery}
        />
      </ListSection>

      <Modal
        open={!!selectedStore && !!modal}
        title={modal ? MODAL_TITLE[modal.section] : ""}
        size={modal ? MODAL_SIZE[modal.section] : "md"}
        onClose={onCloseModal}
      >
        {selectedStore && modal ? (
          <>
            {modal.section === "basic" ? <StoreBasicInfoPanel store={selectedStore} /> : null}
            {modal.section === "members" ? <StoreMembersPanel members={selectedMembers} /> : null}
            {modal.section === "documents" ? (
              <StoreDocumentReviewPanel documents={selectedDocuments} />
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default StoreListTable;
