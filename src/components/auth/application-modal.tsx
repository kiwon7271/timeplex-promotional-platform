"use client";

import { useState } from "react";
import { IconCheck, IconLock, IconUserPlus } from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import Modal from "@/components/ui/modal";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { ApplicationModalProps } from "@/types/auth";

/** 매장 회원가입(입점 신청) 모달 */
const ApplicationModal = ({ open, onClose }: ApplicationModalProps) => {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const res = await apiPost("/api/applications/submit", formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.message ?? "회원가입에 실패했습니다.");
      return;
    }
    const successMessage =
      "message" in res && typeof res.message === "string"
        ? res.message
        : "회원가입이 완료되었습니다.";
    setDone(successMessage);
  };

  const onCloseReset = () => {
    setDone(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} title="매장 회원가입" onClose={onCloseReset}>
      {done ? (
        <div className="space-y-4">
          <Text.Body2 className="text-gray-800">{done}</Text.Body2>
          <Button
            variant="primary"
            className="w-full"
            icon={<IconCheck size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
            onClick={onCloseReset}
          >
            확인
          </Button>
        </div>
      ) : (
        <form action={onSubmit} className="space-y-4">
          <Text.Body3 className="text-gray-600">
            이메일·비밀번호로 계정을 만들고 입점 신청이 함께 접수됩니다. 승인 전까지는 로그인할 수 없습니다.
          </Text.Body3>
          <Field label="희망 매장명">
            <Input name="store_name" required />
          </Field>
          <Field label="대표자명">
            <Input name="applicant_name" required autoComplete="name" />
          </Field>
          <Field label="이메일 (로그인 ID)">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="비밀번호" hint="8자 이상">
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              leadingIcon={<IconLock size={ICON_SIZE.md} stroke={ICON_STROKE} />}
            />
          </Field>
          <Field label="비밀번호 확인">
            <Input
              name="password_confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              leadingIcon={<IconLock size={ICON_SIZE.md} stroke={ICON_STROKE} />}
            />
          </Field>
          <Field label="전화번호">
            <Input name="phone" type="tel" autoComplete="tel" />
          </Field>
          {error ? <Text.Body2 className="text-red-600">{error}</Text.Body2> : null}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
            icon={<IconUserPlus size={ICON_SIZE.sm} stroke={ICON_STROKE} />}
          >
            {loading ? "가입 중..." : "회원가입 · 입점 신청"}
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default ApplicationModal;
