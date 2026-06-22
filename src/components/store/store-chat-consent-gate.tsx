"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onAgreeConsentNotices } from "@/actions/consent";
import type { ConsentNotice } from "@/types/database";
import IntroPopup from "@/components/ui/intro-popup";
import { useDialog } from "@/components/providers/dialog-provider";

interface StoreChatConsentGateProps {
  notices: ConsentNotice[];
}

/** 고객 대화 진입 전 필수 동의/고지 */
const StoreChatConsentGate = ({ notices }: StoreChatConsentGateProps) => {
  const router = useRouter();
  const { openAlert } = useDialog();
  const [loading, setLoading] = useState(false);
  const [declined, setDeclined] = useState(false);

  const onClickAgree = async () => {
    setLoading(true);
    const res = await onAgreeConsentNotices();
    setLoading(false);

    if (!res.ok) {
      await openAlert({ title: "동의 처리 실패", message: res.message ?? "동의 처리에 실패했습니다." });
      return;
    }

    router.refresh();
  };

  const onClickDecline = () => {
    setDeclined(true);
  };

  if (declined) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-[13px] leading-[18px] text-gray-500">
          동의/고지 약관에 동의하지 않아 고객 대화를 이용할 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => router.push("/store")}
          className="mt-4 text-[14px] font-medium text-blue-600 hover:text-blue-700"
        >
          매장 홈으로 이동
        </button>
      </div>
    );
  }

  return (
    <IntroPopup
      open
      variant="consent"
      title="동의/고지 약관"
      notices={notices.map((notice) => ({
        title: notice.title,
        content: notice.content,
        version: notice.version,
      }))}
      loading={loading}
      onAgree={onClickAgree}
      onDecline={onClickDecline}
    />
  );
};

export default StoreChatConsentGate;
