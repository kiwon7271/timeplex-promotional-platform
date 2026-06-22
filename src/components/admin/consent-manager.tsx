"use client";

import { useState } from "react";
import {
  IconDeviceFloppy,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  onCreateConsentNotice,
  onUpdateConsentNotice,
  onDeleteConsentNotice,
} from "@/actions/settings";
import type { ConsentNotice } from "@/types/database";
import type { ConsentManagerProps } from "@/types/admin";
import ListSection from "@/components/ui/list-section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import IconButton from "@/components/ui/icon-button";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import Checkbox from "@/components/ui/checkbox";
import Modal from "@/components/ui/modal";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";
import ActionButton from "@/components/ui/action-button";
import { fadeUpInView } from "@/lib/ui-motion";
import { getControlIconSize, ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import { useDialog } from "@/components/providers/dialog-provider";

/** 동의/고지 문구 목록 및 생성/수정 모달 */
const ConsentManager = ({ notices }: ConsentManagerProps) => {
  const router = useRouter();
  const { openAlert } = useDialog();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConsentNotice | null>(null);

  const onOpenCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onOpenEdit = (notice: ConsentNotice) => {
    setEditing(notice);
    setOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    const res = editing
      ? await onUpdateConsentNotice(formData)
      : await onCreateConsentNotice(formData);
    if (!res.ok) {
      await openAlert({
        title: "처리 실패",
        message: res.message ?? "처리 실패",
      });
      return;
    }
    setOpen(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <ListSection title="문구 목록" plain>
        {notices.length > 0 ? (
          <ul className="space-y-3">
            {notices.map((n, idx) => (
              <motion.li
                key={n.id}
                className="rounded-[12px] bg-gray-100 p-4"
                {...fadeUpInView}
                transition={{ ...fadeUpInView.transition, delay: idx * 0.05 }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Text.Header6 className="text-gray-900">
                      {n.title}
                    </Text.Header6>
                    <Badge
                      variant={n.is_active ? "success" : "muted"}
                      className="shrink-0"
                    >
                      {n.is_active ? "활성" : "비활성"}
                    </Badge>
                    <Badge variant="muted" className="shrink-0">
                      {n.version}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <IconButton
                      type="button"
                      variant="outline"
                      size="md"
                      icon={
                        <IconPencil size={getControlIconSize("md")} stroke={ICON_STROKE} />
                      }
                      tooltip="문구 편집"
                      aria-label="문구 편집"
                      onClick={() => onOpenEdit(n)}
                    />
                    <ActionButton
                      variant="danger"
                      size="md"
                      confirm="삭제하시겠습니까?"
                      onAction={onDeleteConsentNotice.bind(null, n.id)}
                      icon={
                        <IconTrash size={getControlIconSize("md")} stroke={ICON_STROKE} />
                      }
                      tooltip="삭제"
                      ariaLabel="문구 삭제"
                    />
                  </div>
                </div>
                <Text.Body2 className="mt-2 text-gray-700">
                  {n.content}
                </Text.Body2>
              </motion.li>
            ))}
          </ul>
        ) : (
          <EmptyState plain message="등록된 문구가 없습니다." />
        )}
      </ListSection>

      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<IconPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          onClick={onOpenCreate}
        >
          문구 생성
        </Button>
      </div>

      <Modal
        open={open}
        title={editing ? "문구 수정" : "문구 생성"}
        onClose={() => setOpen(false)}
      >
        <form
          action={onSubmit}
          className="space-y-4"
          key={editing?.id ?? "new"}
        >
          {editing ? (
            <input type="hidden" name="id" value={editing.id} />
          ) : null}
          <Field label="제목">
            <Input name="title" defaultValue={editing?.title ?? ""} required />
          </Field>
          <Field label="내용">
            <Textarea
              name="content"
              defaultValue={editing?.content ?? ""}
              required
              rows={4}
            />
          </Field>
          <Field label="버전">
            <Input name="version" defaultValue={editing?.version ?? "v1"} />
          </Field>
          <Checkbox
            name="is_active"
            label="활성화"
            defaultChecked={editing?.is_active ?? true}
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            icon={<IconDeviceFloppy size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            {editing ? "수정" : "생성"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ConsentManager;
