"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { ConfirmOptions } from "@/types/dialog";

interface ConfirmModalProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 공통 확인 모달 */
const ConfirmModal = ({
  open,
  title = "확인",
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm" closeOnOverlay={false}>
      <div className="space-y-5">
        <div className="flex gap-3">
          <IconAlertTriangle
            size={ICON_SIZE.xl}
            stroke={ICON_STROKE}
            className={variant === "danger" ? "mt-0.5 shrink-0 text-red-500" : "mt-0.5 shrink-0 text-amber-500"}
            aria-hidden
          />
          <Text.Body2 className="whitespace-pre-wrap break-words text-gray-800">{message}</Text.Body2>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" size="md" className="sm:min-w-[5rem]" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            size="md"
            className="sm:min-w-[5rem]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
