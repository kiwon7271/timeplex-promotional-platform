"use client";

import { useCallback, useEffect, useState } from "react";
import { getInquiryThread } from "@/actions/inquiries";
import type { InquiryThreadPayload } from "@/lib/inquiry-thread";
import { useDialog } from "@/components/providers/dialog-provider";
import Modal from "@/components/ui/modal";
import InquiryThreadLog from "@/components/inquiries/inquiry-thread-log";
import InquiryReplyForm from "@/components/inquiries/elements/inquiry-reply-form";

export interface InquiryThreadModalProps {
  inquiryId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

/** 문의 상세 — 게시판형 모달 */
const InquiryThreadModal = ({ inquiryId, onClose, onUpdated: onUpdatedProp }: InquiryThreadModalProps) => {
  const { openAlert } = useDialog();
  const [thread, setThread] = useState<InquiryThreadPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const loadThread = useCallback(async () => {
    if (!inquiryId) return;
    setLoading(true);
    const res = await getInquiryThread(inquiryId);
    setLoading(false);

    if (!res.ok || !res.data) {
      await openAlert({
        title: "불러오기 실패",
        message: res.message ?? "문의를 불러올 수 없습니다.",
      });
      onClose();
      return;
    }

    setThread(res.data);
  }, [inquiryId, onClose, openAlert]);

  useEffect(() => {
    if (!inquiryId) {
      setThread(null);
      return;
    }
    void loadThread();
  }, [inquiryId, loadThread]);

  const onUpdated = () => {
    void loadThread();
    onUpdatedProp?.();
  };

  return (
    <Modal
      open={!!inquiryId}
      title={thread?.inquiry.title ?? "문의 상세"}
      onClose={onClose}
      size="xl"
      footer={
        thread ? (
          <InquiryReplyForm
            inquiryId={thread.inquiry.id}
            isAdmin={thread.isAdmin}
            onPosted={onUpdated}
          />
        ) : undefined
      }
    >
      {loading && !thread ? (
        <p className="py-12 text-center text-[14px] text-gray-500">불러오는 중...</p>
      ) : thread ? (
        <InquiryThreadLog thread={thread} onUpdated={onUpdated} />
      ) : null}
    </Modal>
  );
};

export default InquiryThreadModal;
