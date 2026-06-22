"use client";

import { useState, useTransition } from "react";
import { IconDownload } from "@tabler/icons-react";
import { onDownloadDocument } from "@/actions/documents";
import { useDialog } from "@/components/providers/dialog-provider";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import type { ControlSize } from "@/lib/ui-control";

export interface DocumentDownloadButtonProps {
  documentId: string;
  fileName: string;
  iconOnly?: boolean;
  size?: ControlSize;
  className?: string;
}

/** 통합관리자 — 서류 다운로드 */
const DocumentDownloadButton = ({
  documentId,
  fileName,
  iconOnly = false,
  size = "md",
  className,
}: DocumentDownloadButtonProps) => {
  const { openAlert } = useDialog();
  const [pending, startTransition] = useTransition();

  const onClickDownloadButton = () => {
    startTransition(async () => {
      const res = await onDownloadDocument(documentId);
      if (!res.ok || !res.url) {
        await openAlert({
          title: "다운로드 실패",
          message: res.message ?? "파일을 다운로드할 수 없습니다.",
        });
        return;
      }

      const link = document.createElement("a");
      link.href = res.url;
      link.download = fileName;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  const icon = <IconDownload size={getControlIconSize(size)} stroke={ICON_STROKE} />;

  if (iconOnly) {
    return (
      <IconButton
        type="button"
        variant="outline"
        size={size}
        className={className}
        disabled={pending}
        icon={icon}
        tooltip="다운로드"
        aria-label={`${fileName} 다운로드`}
        onClick={onClickDownloadButton}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={className}
      disabled={pending}
      icon={icon}
      onClick={onClickDownloadButton}
    >
      {pending ? "다운로드 중..." : "다운로드"}
    </Button>
  );
};

export default DocumentDownloadButton;
