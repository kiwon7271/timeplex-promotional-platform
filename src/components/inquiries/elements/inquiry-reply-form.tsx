"use client";

import { useRef, useTransition } from "react";
import { IconSend } from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import { useDialog } from "@/components/providers/dialog-provider";
import Field from "@/components/ui/field";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

export interface InquiryReplyFormProps {
  inquiryId: string;
  isAdmin?: boolean;
  onPosted: () => void;
}

/** 문의 게시판 — 댓글 작성 */
const InquiryReplyForm = ({ inquiryId, isAdmin = false, onPosted }: InquiryReplyFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { openAlert } = useDialog();
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await apiPost(`/api/inquiries/${inquiryId}/messages`, formData);
      if (!res.ok) {
        await openAlert({
          title: "등록 실패",
          message: res.message ?? "등록 실패",
        });
        return;
      }
      formRef.current?.reset();
      onPosted();
    });
  };

  return (
    <form ref={formRef} action={onSubmit} className="space-y-3">
      <input type="hidden" name="inquiry_id" value={inquiryId} />

      <Field label={isAdmin ? "답변 작성" : "질문 작성"}>
        <Textarea
          name="body"
          required
          rows={4}
          disabled={pending}
          placeholder={isAdmin ? "답변을 입력하세요." : "질문을 입력하세요."}
        />
      </Field>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={pending}
          icon={<IconSend size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
        >
          {pending ? "등록 중..." : "등록"}
        </Button>
      </div>
    </form>
  );
};

export default InquiryReplyForm;
