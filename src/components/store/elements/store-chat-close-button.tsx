"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import Button from "@/components/ui/button";
import { useDialog } from "@/components/providers/dialog-provider";

interface StoreChatCloseButtonProps {
  conversationId: string;
  customerName?: string | null;
  /** 종료 후 URL (쿼리 유지) */
  redirectPath: string;
}

/** 선택한 대화 종료 — 기록·첨부 삭제 */
const StoreChatCloseButton = ({
  conversationId,
  customerName,
  redirectPath,
}: StoreChatCloseButtonProps) => {
  const router = useRouter();
  const { openAlert, openConfirm } = useDialog();
  const [closing, setClosing] = useState(false);

  const onClickCloseButton = async () => {
    const label = customerName?.trim() || "고객";
    const confirmed = await openConfirm({
      title: "대화 종료",
      message: `「${label}」 대화를 종료할까요?\n\n대화 기록과 첨부 파일은 복구할 수 없습니다.`,
      confirmLabel: "종료",
      variant: "danger",
    });

    if (!confirmed) return;

    setClosing(true);
    try {
      const res = await apiPost(`/api/store/chats/conversations/${conversationId}/close`);
      if (!res.ok) {
        await openAlert({ title: "종료 실패", message: res.message ?? "대화를 종료하지 못했습니다." });
        return;
      }

      router.push(redirectPath);
    } finally {
      setClosing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      icon={<IconTrash size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
      onClick={onClickCloseButton}
      disabled={closing}
    >
      {closing ? "종료 중…" : "대화 종료"}
    </Button>
  );
};

export default StoreChatCloseButton;
