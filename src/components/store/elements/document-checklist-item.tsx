"use client";

import { useRef, useState } from "react";
import {
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconUpload,
} from "@tabler/icons-react";
import { DOCUMENT_TYPE_HINT, DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import type { DocumentType } from "@/lib/constants";
import { normalizeUploadFileName } from "@/lib/upload";
import { getDocumentStatusLabel } from "@/lib/status-label";
import DocumentChecklistActionsMenu from "@/components/store/elements/document-checklist-actions-menu";
import DocumentPreviewModal from "@/components/documents/elements/document-preview-modal";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import Text from "@/components/ui/text";
import { getControlIconSize, ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { DocumentChecklistItemProps } from "@/types/store";

const statusIcon = (document: DocumentChecklistItemProps["document"]) => {
  if (!document) {
    return (
      <IconCircle
        size={ICON_SIZE.xl}
        stroke={ICON_STROKE}
        className="shrink-0 text-gray-300"
        aria-hidden
      />
    );
  }

  if (document.status === "APPROVED") {
    return (
      <IconCircleCheck
        size={ICON_SIZE.xl}
        stroke={ICON_STROKE}
        className="shrink-0 text-emerald-500"
        aria-hidden
      />
    );
  }

  if (document.status === "REJECTED") {
    return (
      <IconCircleX
        size={ICON_SIZE.xl}
        stroke={ICON_STROKE}
        className="shrink-0 text-red-500"
        aria-hidden
      />
    );
  }

  return (
    <IconClock
      size={ICON_SIZE.xl}
      stroke={ICON_STROKE}
      className="shrink-0 text-amber-500"
      aria-hidden
    />
  );
};

/** 서류 체크리스트 — 종류별 1슬롯 업로드 */
const DocumentChecklistItem = ({
  docType,
  document,
  index,
  uploading,
  onUploadFile,
  onMutated,
}: DocumentChecklistItemProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const label = DOCUMENT_TYPE_LABEL[docType];
  const hint = DOCUMENT_TYPE_HINT[docType];
  const attached = Boolean(document);
  const isRejected = document?.status === "REJECTED";
  const showSideAttach = !attached;

  const onClickUploadButton = () => {
    fileRef.current?.click();
  };

  const onChangeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void onUploadFile(docType, file);
  };

  const onClickPreviewMenuItem = () => {
    setPreviewOpen(true);
  };

  const onClosePreviewModal = () => {
    setPreviewOpen(false);
  };

  const fileName = document ? normalizeUploadFileName(document.file_name) : "";

  return (
    <li
      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 ${
        attached ? "bg-white" : "bg-gray-50/60"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {statusIcon(document)}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text.Body2 className="font-medium text-gray-900">
                <span className="mr-1.5 text-gray-400">{index + 1}.</span>
                {label}
              </Text.Body2>
              {document ? (
                <Badge value={document.status}>{getDocumentStatusLabel(document.status)}</Badge>
              ) : null}
            </div>

            {document ? (
              <DocumentChecklistActionsMenu
                documentId={document.id}
                filePath={document.file_path}
                fileName={fileName}
                label={label}
                previewUrl={document.previewUrl}
                onClickPreview={onClickPreviewMenuItem}
                onMutated={onMutated}
              />
            ) : null}
          </div>

          <Text.Body3 className="text-gray-500">{hint}</Text.Body3>

          {document ? (
            <Text.Body3 className="truncate text-gray-700" title={fileName}>
              {fileName}
            </Text.Body3>
          ) : null}

          {isRejected ? (
            <div className="rounded-md bg-red-50 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {document.rejection_reason ? (
                  <p className="min-w-0 flex-1 text-sm text-red-700 whitespace-pre-wrap break-words">
                    반려 사유: {document.rejection_reason}
                  </p>
                ) : (
                  <p className="min-w-0 flex-1 text-sm text-red-700">반려된 서류입니다.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-red-200 text-red-700 hover:bg-red-100/60"
                  disabled={uploading}
                  icon={<IconUpload size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
                  onClick={onClickUploadButton}
                >
                  {uploading ? "업로드 중..." : "재업로드"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={onChangeFileInput}
        disabled={uploading}
        aria-label={`${label} 파일 선택`}
      />

      {showSideAttach ? (
        <div className="flex shrink-0 justify-end sm:pt-0.5">
          <IconButton
            type="button"
            variant="outline"
            size="md"
            disabled={uploading}
            icon={<IconUpload size={getControlIconSize("md")} stroke={ICON_STROKE} />}
            tooltip={uploading ? "업로드 중" : "첨부하기"}
            aria-label={uploading ? "업로드 중" : `${label} 첨부하기`}
            onClick={onClickUploadButton}
          />
        </div>
      ) : null}

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

export default DocumentChecklistItem;
