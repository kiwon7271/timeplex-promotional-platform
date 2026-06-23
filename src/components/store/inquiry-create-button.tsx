"use client";

import { useRef, useState } from "react";
import { IconMessagePlus, IconPlus } from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import { INQUIRY_CATEGORY_OPTIONS } from "@/lib/inquiry-category";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import { useDialog } from "@/components/providers/dialog-provider";

interface InquiryCreateButtonProps {
  onMutated?: () => void;
}

/** 매장 — 문의 작성 */
const InquiryCreateButton = ({ onMutated }: InquiryCreateButtonProps) => {
  const { openAlert } = useDialog();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const onCreate = async (formData: FormData) => {
    const res = await apiPost("/api/store/inquiries/create", formData);
    if (!res.ok) {
      await openAlert({
        title: "등록 실패",
        message: res.message ?? "등록 실패",
      });
      return;
    }
    formRef.current?.reset();
    setOpen(false);
    onMutated?.();
  };

  return (
    <>
      <Button
        variant="primary"
        icon={<IconMessagePlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
        onClick={() => setOpen(true)}
      >
        문의 작성
      </Button>

      <Modal open={open} title="문의 작성" onClose={() => setOpen(false)}>
        <form ref={formRef} action={onCreate} className="space-y-4">
          <Field label="구분">
            <Select name="category" required options={INQUIRY_CATEGORY_OPTIONS} />
          </Field>
          <Field label="제목">
            <Input name="title" required />
          </Field>
          <Field label="내용">
            <Textarea name="body" required rows={6} />
          </Field>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            icon={<IconPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            등록
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default InquiryCreateButton;
