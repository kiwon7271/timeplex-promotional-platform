"use client";

import { IconExternalLink } from "@tabler/icons-react";
import Modal from "@/components/ui/modal";
import Text from "@/components/ui/text";
import DocumentDownloadButton from "@/components/admin/elements/document-download-button";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

export interface DocumentPreviewModalProps {
  open: boolean;
  title: string;
  fileName: string;
  previewUrl: string;
  documentId?: string;
  onClose: () => void;
}

/** 서류 이미지 미리보기 모달 — 클릭 시 새 탭, 호버 시 오버레이 */
const DocumentPreviewModal = ({
  open,
  title,
  fileName,
  previewUrl,
  documentId,
  onClose,
}: DocumentPreviewModalProps) => {
  const onClickOpenInNewTab = () => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal open={open} title={title} onClose={onClose} size="xl">
      <div className="space-y-4">
        <Text.Body3 className="truncate text-gray-600" title={fileName}>
          {fileName}
        </Text.Body3>

        <button
          type="button"
          onClick={onClickOpenInNewTab}
          className="group relative block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
          aria-label={`${fileName} 새 탭에서 열기`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={fileName}
            className="mx-auto max-h-[min(70vh,640px)] w-full object-contain"
          />
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/45"
            aria-hidden
          >
            <IconExternalLink
              size={ICON_SIZE.xl}
              stroke={ICON_STROKE}
              className="scale-95 text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
            />
          </span>
        </button>

        {documentId ? (
          <div className="flex items-center justify-end">
            <DocumentDownloadButton documentId={documentId} fileName={fileName} iconOnly />
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
