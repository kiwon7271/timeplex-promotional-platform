"use client";

import { IconEye } from "@tabler/icons-react";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import type { ControlSize } from "@/lib/ui-control";

export interface DocumentPreviewButtonProps {
  fileName: string;
  onClick: () => void;
  disabled?: boolean;
  size?: ControlSize;
}

/** 서류 미리보기 — 아이콘 버튼 (삭제·다운로드와 동일 규격) */
const DocumentPreviewButton = ({
  fileName,
  onClick,
  disabled,
  size = "md",
}: DocumentPreviewButtonProps) => (
  <IconButton
    type="button"
    variant="outline"
    size={size}
    icon={<IconEye size={getControlIconSize(size)} stroke={ICON_STROKE} />}
    tooltip="미리보기"
    aria-label={`${fileName} 미리보기`}
    disabled={disabled}
    onClick={onClick}
  />
);

export default DocumentPreviewButton;
