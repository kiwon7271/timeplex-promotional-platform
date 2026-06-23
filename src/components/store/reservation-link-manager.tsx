"use client";

import { useState } from "react";
import { IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { apiDelete, apiPost } from "@/lib/api-client";
import { RESERVATION_PROVIDERS } from "@/lib/constants";
import type { ReservationLinkManagerProps } from "@/types/store";
import ListSection from "@/components/ui/list-section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import ActionButton from "@/components/ui/action-button";
import { getControlIconSize, ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import { useDialog } from "@/components/providers/dialog-provider";

/** 예약 링크 추가/목록/삭제 */
const ReservationLinkManager = ({ links, onMutated }: ReservationLinkManagerProps) => {
  const { openAlert } = useDialog();
  const [open, setOpen] = useState(false);

  const onDeleteLink = async (id: string) => {
    const res = await apiDelete("/api/store/reservation-links", { id });
    if (res.ok) onMutated?.();
    return res;
  };

  const onCreate = async (formData: FormData) => {
    const res = await apiPost("/api/store/reservation-links", formData);
    if (!res.ok) {
      await openAlert({
        title: "추가 실패",
        message: res.message ?? "추가 실패",
      });
      return;
    }
    setOpen(false);
    onMutated?.();
  };

  return (
    <div className="space-y-6">
      <ListSection title="링크 목록">
        {links.length > 0 ? (
          <Table headers={["제공처", "URL", "관리"]}>
            {links.map((link) => (
              <tr key={link.id}>
                <td>{link.provider}</td>
                <td>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-gray-900 underline underline-offset-2 hover:text-blue-600"
                  >
                    <IconLink
                      size={ICON_SIZE.md}
                      stroke={ICON_STROKE}
                      aria-hidden
                    />
                    {link.url}
                  </a>
                </td>
                <td>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    confirm="삭제하시겠습니까?"
                    onAction={() => onDeleteLink(link.id)}
                    icon={
                      <IconTrash size={getControlIconSize("sm")} stroke={ICON_STROKE} />
                    }
                    tooltip="삭제"
                    ariaLabel="링크 삭제"
                  />
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState plain message="등록된 링크가 없습니다." />
        )}
      </ListSection>

      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<IconPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          onClick={() => setOpen(true)}
        >
          링크 추가
        </Button>
      </div>

      <Modal open={open} title="링크 추가" onClose={() => setOpen(false)}>
        <form action={onCreate} className="space-y-4">
          <Field label="제공처">
            <Select name="provider" options={RESERVATION_PROVIDERS} />
          </Field>
          <Field label="URL">
            <Input name="url" type="url" placeholder="https://" required />
          </Field>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            icon={<IconPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            추가
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ReservationLinkManager;
