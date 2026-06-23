"use client";

import { useState, useTransition } from "react";
import { apiPatch } from "@/lib/api-client";
import { DOCUMENT_STATUS_OPTIONS } from "@/lib/status-label";
import type { StoreDocumentWithUrl } from "@/lib/store-documents";
import { useDialog } from "@/components/providers/dialog-provider";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import Field from "@/components/ui/field";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

interface DocumentRowActionsProps {
  doc: StoreDocumentWithUrl;
  onMutated?: () => void;
}

/** 현재 상태에서 선택 가능한 옵션 — 승인 후 반려·반려 후 재승인 허용 */
const getDocumentStatusOptions = (current: string) => {
  if (current === "APPROVED") {
    return DOCUMENT_STATUS_OPTIONS.filter((o) => o.value === "APPROVED" || o.value === "REJECTED");
  }
  if (current === "REJECTED") {
    return DOCUMENT_STATUS_OPTIONS.filter((o) => o.value === "REJECTED" || o.value === "APPROVED");
  }
  return DOCUMENT_STATUS_OPTIONS;
};

/** 매장 서류 — 승인/반려 처리 (반려 시 사유 필수) */
const DocumentRowActions = ({ doc, onMutated }: DocumentRowActionsProps) => {
  const { openAlert, openConfirm } = useDialog();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const revertSelect = (select: HTMLSelectElement) => {
    select.value = doc.status;
  };

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === doc.status) return;

    if (next === "APPROVED") {
      void (async () => {
        const ok = await openConfirm({
          title: "서류 승인",
          message:
            doc.status === "REJECTED"
              ? "반려된 서류를 다시 승인할까요?"
              : "이 서류를 승인할까요?",
          confirmLabel: "승인",
        });
        if (!ok) {
          revertSelect(e.target);
          return;
        }
        startTransition(async () => {
          const res = await apiPatch(`/api/admin/documents/${doc.id}`, { status: "APPROVED" });
          if (!res.ok && res.message) {
            await openAlert({ title: "승인 실패", message: res.message });
            revertSelect(e.target);
            return;
          }
          onMutated?.();
        });
      })();
      return;
    }

    if (next === "REJECTED") {
      setRejectReason("");
      setRejectOpen(true);
      revertSelect(e.target);
    }
  };

  const onClickRejectConfirm = () => {
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      void openAlert({ title: "입력 필요", message: "반려 사유를 입력해 주세요." });
      return;
    }

    startTransition(async () => {
      const res = await apiPatch(`/api/admin/documents/${doc.id}`, {
        status: "REJECTED",
        rejectionReason: trimmed,
      });
      if (!res.ok && res.message) {
        await openAlert({ title: "반려 실패", message: res.message });
        return;
      }
      setRejectOpen(false);
      setRejectReason("");
      onMutated?.();
    });
  };

  const onClickRejectCancel = () => {
    setRejectOpen(false);
    setRejectReason("");
  };

  return (
    <>
      <Select
        size="sm"
        value={doc.status}
        disabled={pending}
        options={getDocumentStatusOptions(doc.status)}
        onChange={onStatusChange}
        aria-label="서류 처리"
      />

      <Modal open={rejectOpen} title="서류 반려" onClose={onClickRejectCancel} size="md" closeOnOverlay={false}>
        <div className="space-y-4">
          {doc.status === "APPROVED" ? (
            <p className="text-[14px] leading-[20px] text-gray-600">
              승인된 서류입니다. 반려 시 매장관리자에게 반려 사유가 전달됩니다.
            </p>
          ) : null}
          <Field label="반려 사유" hint="매장관리자에게 전달됩니다. 카드사 심사 보완 사유를 구체적으로 작성해 주세요. (500자 이내)">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="예: 사업자등록증 이미지가 흐릿합니다. 카드사 심사용으로 선명한 사진을 다시 제출해 주세요."
              autoFocus
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="md" onClick={onClickRejectCancel} disabled={pending}>
              취소
            </Button>
            <Button type="button" variant="danger" size="md" onClick={onClickRejectConfirm} disabled={pending}>
              {pending ? "처리 중..." : "반려"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DocumentRowActions;
