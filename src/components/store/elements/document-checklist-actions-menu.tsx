"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconDownload, IconEye, IconTrash } from "@tabler/icons-react";
import { onDeleteDocument, onDownloadDocument } from "@/actions/documents";
import { useDialog } from "@/components/providers/dialog-provider";
import DropdownMenu from "@/components/ui/dropdown-menu";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { DropdownMenuItem } from "@/types/ui";

export interface DocumentChecklistActionsMenuProps {
  documentId: string;
  filePath: string;
  fileName: string;
  label: string;
  previewUrl?: string;
  onClickPreview: () => void;
}

/** 매장 심사서류 — 미리보기·다운로드·삭제 메뉴 */
const DocumentChecklistActionsMenu = ({
  documentId,
  filePath,
  fileName,
  label,
  previewUrl,
  onClickPreview,
}: DocumentChecklistActionsMenuProps) => {
  const router = useRouter();
  const { openAlert, openConfirm } = useDialog();
  const [pending, startTransition] = useTransition();

  const onClickDownloadMenuItem = () => {
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

  const onClickDeleteMenuItem = async () => {
    const ok = await openConfirm({
      message: "삭제하시겠습니까?",
      variant: "danger",
      confirmLabel: "삭제",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await onDeleteDocument(documentId, filePath);
      if (!res.ok) {
        await openAlert({
          title: "삭제 실패",
          message: res.message ?? "서류를 삭제할 수 없습니다.",
        });
        return;
      }
      router.refresh();
    });
  };

  const items: DropdownMenuItem[] = [];

  if (previewUrl) {
    items.push({
      label: "미리보기",
      icon: <IconEye size={ICON_SIZE.md} stroke={ICON_STROKE} aria-hidden />,
      onClick: onClickPreview,
      disabled: pending,
    });
    items.push({
      label: "다운로드",
      icon: <IconDownload size={ICON_SIZE.md} stroke={ICON_STROKE} aria-hidden />,
      onClick: onClickDownloadMenuItem,
      disabled: pending,
    });
  }

  items.push({
    label: "서류 삭제",
    icon: <IconTrash size={ICON_SIZE.md} stroke={ICON_STROKE} aria-hidden />,
    onClick: onClickDeleteMenuItem,
    disabled: pending,
    variant: "danger",
  });

  return <DropdownMenu items={items} ariaLabel={`${label} 서류 메뉴`} />;
};

export default DocumentChecklistActionsMenu;
