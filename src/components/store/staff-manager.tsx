"use client";

import { useState } from "react";
import {
  IconMail,
  IconPlus,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { apiDelete, apiPost } from "@/lib/api-client";
import type { StaffManagerProps } from "@/types/store";
import { getRoleLabel } from "@/lib/status-label";
import ListSection from "@/components/ui/list-section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import Modal from "@/components/ui/modal";
import Table from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import ActionButton from "@/components/ui/action-button";
import { getControlIconSize, ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

/** 직원 초대, 목록, 삭제 (요금제 인원 제한) */
const StaffManager = ({ members, planCode, limit, onMutated }: StaffManagerProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const reachedLimit = members.length >= limit;

  const onInvite = async (formData: FormData) => {
    const res = await apiPost("/api/store/staff/invite", formData);
    setMessage(res.message ?? (res.ok ? "초대 완료" : "초대 실패"));
    if (res.ok) {
      setOpen(false);
      onMutated?.();
    }
  };

  const onClickDeleteStaff = async (profileId: string) =>
    apiDelete(`/api/store/staff/${profileId}`);

  return (
    <div className="space-y-6">
      <ListSection title="직원 목록">
        {members.length > 0 ? (
          <Table headers={["이메일", "역할", "관리"]}>
            {members.map((m) => (
              <tr key={m.profile_id}>
                <td>{m.email}</td>
                <td>{getRoleLabel(m.role)}</td>
                <td>
                  {m.role === "STORE_OWNER" ? (
                    <Text.Body3 className="text-gray-500">소유자</Text.Body3>
                  ) : (
                    <ActionButton
                      variant="danger"
                      size="sm"
                      confirm="직원을 삭제하시겠습니까?"
                      onAction={async () => {
                        const res = await onClickDeleteStaff(m.profile_id);
                        if (res.ok) onMutated?.();
                        return res;
                      }}
                      icon={
                        <IconTrash size={getControlIconSize("sm")} stroke={ICON_STROKE} />
                      }
                      tooltip="삭제"
                      ariaLabel="직원 삭제"
                    />
                  )}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState plain message="직원이 없습니다." />
        )}
      </ListSection>

      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<IconUserPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          onClick={() => setOpen(true)}
          disabled={reachedLimit}
        >
          직원 초대
        </Button>
      </div>

      <Modal
        open={open}
        title={`직원 초대 (${members.length}/${limit} · ${planCode})`}
        onClose={() => setOpen(false)}
      >
        <form action={onInvite} className="space-y-4">
          <Field label="이메일">
            <Input
              name="email"
              type="email"
              required
              disabled={reachedLimit}
              leadingIcon={
                <IconMail size={ICON_SIZE.md} stroke={ICON_STROKE} />
              }
            />
          </Field>
          {reachedLimit ? (
            <Text.Body3 className="text-gray-600">
              요금제 인원 한도에 도달했습니다.
            </Text.Body3>
          ) : null}
          {message && !reachedLimit ? (
            <Text.Body3 className="text-gray-700">{message}</Text.Body3>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={reachedLimit}
            icon={<IconUserPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            초대
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManager;
