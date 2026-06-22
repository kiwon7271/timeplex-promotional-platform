"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { AlertOptions } from "@/types/dialog";

interface AlertModalProps extends AlertOptions {
  open: boolean;
  onClose: () => void;
}

/** 공통 알림 모달 */
const AlertModal = ({
  open,
  title = "알림",
  message,
  onClose,
}: AlertModalProps) => {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      <div className="space-y-5">
        <div className="flex gap-3">
          <IconInfoCircle
            size={ICON_SIZE.xl}
            stroke={ICON_STROKE}
            className="mt-0.5 shrink-0 text-blue-600"
            aria-hidden
          />
          <Text.Body2 className="whitespace-pre-wrap break-words text-gray-800">
            {message}
          </Text.Body2>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onClose}
        >
          확인
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
