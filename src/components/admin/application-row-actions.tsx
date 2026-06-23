"use client";

import { useTransition } from "react";
import { apiDelete, apiPost } from "@/lib/api-client";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/status-label";
import { useDialog } from "@/components/providers/dialog-provider";
import Select from "@/components/ui/select";
import type { OnboardingApplication } from "@/types/database";

interface ApplicationRowActionsProps {
  app: OnboardingApplication;
  onMutated?: () => void;
}

/** 온보딩 신청 — 처리 Select (승인/반려) */
const ApplicationRowActions = ({ app, onMutated }: ApplicationRowActionsProps) => {
  const { openAlert, openConfirm } = useDialog();
  const [pending, startTransition] = useTransition();

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === app.status) return;

    const revert = () => {
      e.target.value = app.status;
    };

    if (next === "APPROVED") {
      void (async () => {
        const ok = await openConfirm({
          title: "입점 승인",
          message: "승인하면 매장이 생성되고, 신청자가 로그인할 수 있습니다. 진행할까요?",
          confirmLabel: "승인",
        });
        if (!ok) {
          revert();
          return;
        }
        startTransition(async () => {
          const res = await apiPost(`/api/admin/applications/${app.id}`);
          if (!res.ok && res.message) {
            await openAlert({ title: "승인 실패", message: res.message });
            revert();
          }
          onMutated?.();
        });
      })();
      return;
    }

    if (next === "REJECTED") {
      void (async () => {
        const ok = await openConfirm({
          title: "입점 반려",
          message:
            "반려하면 신청 내역과 가입 계정이 삭제됩니다. 신청자는 동일 이메일로 다시 신청할 수 있습니다. 진행할까요?",
          confirmLabel: "반려",
          variant: "danger",
        });
        if (!ok) {
          revert();
          return;
        }
        startTransition(async () => {
          const res = await apiDelete(`/api/admin/applications/${app.id}`);
          if (!res.ok && res.message) {
            await openAlert({ title: "반려 실패", message: res.message });
            revert();
          }
          onMutated?.();
        });
      })();
    }
  };

  return (
    <Select
      size="sm"
      value={app.status}
      disabled={pending}
      options={APPLICATION_STATUS_OPTIONS}
      onChange={onStatusChange}
      aria-label="신청 처리"
    />
  );
};

export default ApplicationRowActions;
