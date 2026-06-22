"use client";

import { useState } from "react";
import {
  DOCUMENT_TYPE_HINT,
  DOCUMENT_TYPE_LABEL,
  DOCUMENT_TYPES,
  CARD_REVIEW_DOCUMENT_GUIDE_ADMIN,
} from "@/lib/constants";
import type { DocumentType } from "@/lib/constants";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import { groupLatestDocumentsByType, summarizeStoreDocuments } from "@/lib/document-checklist";
import { documentActionRowClass } from "@/lib/document-actions";
import { getDocumentStatusLabel } from "@/lib/status-label";
import { normalizeUploadFileName } from "@/lib/upload";
import DocumentRowActions from "@/components/admin/document-row-actions";
import DocumentPreviewButton from "@/components/documents/elements/document-preview-button";
import DocumentPreviewModal from "@/components/documents/elements/document-preview-modal";
import DocumentDownloadButton from "@/components/admin/elements/document-download-button";
import Badge from "@/components/ui/badge";
import Text from "@/components/ui/text";
import type { StoreDocumentReviewPanelProps } from "@/types/admin";

interface ReviewItemProps {
  docType: DocumentType;
  index: number;
  document?: StoreDocumentWithUrl;
}

/** 매장 서류 검수 — 종류별 1행 */
const AdminDocumentReviewItem = ({ docType, index, document }: ReviewItemProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const label = DOCUMENT_TYPE_LABEL[docType];
  const hint = DOCUMENT_TYPE_HINT[docType];
  const fileName = document ? normalizeUploadFileName(document.file_name) : "";

  const onClickPreviewButton = () => {
    setPreviewOpen(true);
  };

  const onClosePreviewModal = () => {
    setPreviewOpen(false);
  };

  return (
    <li
      className={`flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:gap-4 ${
        document ? "bg-white" : "bg-gray-50/60"
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text.Body2 className="font-medium text-gray-900">
            <span className="mr-1.5 text-gray-400">{index + 1}.</span>
            {label}
          </Text.Body2>
          {document ? (
            <Badge value={document.status}>{getDocumentStatusLabel(document.status)}</Badge>
          ) : (
            <Badge variant="muted">미제출</Badge>
          )}
        </div>
        <Text.Body3 className="text-gray-500">{hint}</Text.Body3>

        {document ? (
          <Text.Body3 className="truncate text-gray-700" title={fileName}>
            {fileName}
          </Text.Body3>
        ) : null}

        {document?.status === "REJECTED" && document.rejection_reason ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 whitespace-pre-wrap break-words">
            반려 사유: {document.rejection_reason}
          </p>
        ) : null}
      </div>

      <div className={documentActionRowClass}>
        {document?.previewUrl ? (
          <>
            <DocumentPreviewButton fileName={fileName} onClick={onClickPreviewButton} size="sm" />
            <DocumentDownloadButton documentId={document.id} fileName={fileName} iconOnly size="sm" />
          </>
        ) : null}

        {document ? <DocumentRowActions doc={document} /> : null}
      </div>

      {document?.previewUrl ? (
        <DocumentPreviewModal
          open={previewOpen}
          title={label}
          fileName={fileName}
          previewUrl={document.previewUrl}
          documentId={document.id}
          onClose={onClosePreviewModal}
        />
      ) : null}
    </li>
  );
};

/** 매장별 서류 검수·승인 패널 */
const StoreDocumentReviewPanel = ({ documents }: StoreDocumentReviewPanelProps) => {
  const documentsByType = groupLatestDocumentsByType(documents);
  const summary = summarizeStoreDocuments(documents);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-[22px] text-gray-900">카드사 심사 서류 검수</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="muted">{summary.attached}/{DOCUMENT_TYPES.length}종 제출</Badge>
            {summary.pending > 0 ? <Badge variant="warning">검수 대기 {summary.pending}</Badge> : null}
            {summary.approved > 0 ? <Badge variant="success">승인 {summary.approved}</Badge> : null}
            {summary.rejected > 0 ? <Badge variant="danger">반려 {summary.rejected}</Badge> : null}
          </div>
        </div>
        <Text.Body3 className="text-gray-600">{CARD_REVIEW_DOCUMENT_GUIDE_ADMIN}</Text.Body3>
      </div>

      <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {DOCUMENT_TYPES.map((docType, index) => (
          <AdminDocumentReviewItem
            key={docType}
            docType={docType}
            index={index}
            document={documentsByType[docType]}
          />
        ))}
      </ol>
    </div>
  );
};

export default StoreDocumentReviewPanel;
