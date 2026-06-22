"use client";

import { useState } from "react";
import { IconFileText } from "@tabler/icons-react";
import type { AgreedConsentNotice } from "@/types/store";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import ConsentNoticeItem from "@/components/store/elements/consent-notice-item";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";

interface StoreAgreedConsentPanelProps {
  consents: AgreedConsentNotice[];
}

/** 고객 대화 헤더 — 동의한 약관 재열람 */
const StoreAgreedConsentPanel = ({
  consents,
}: StoreAgreedConsentPanelProps) => {
  const [open, setOpen] = useState(false);

  if (consents.length === 0) return null;

  const onClickOpenButton = () => {
    setOpen(true);
  };

  const onCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        icon={<IconFileText size={ICON_SIZE.md} stroke={ICON_STROKE} />}
        onClick={onClickOpenButton}
      >
        동의 약관 {consents.length}
      </Button>

      <Modal open={open} title="동의한 약관" onClose={onCloseModal} size="lg">
        <div className="space-y-4">
          <Text.Body3 className="text-gray-600">
            고객 대화 이용을 위해 아래 약관에 동의한 내역입니다.
          </Text.Body3>
          <div className="max-h-[min(50vh,360px)] space-y-3 overflow-y-auto">
            {consents.map((consent) => (
              <ConsentNoticeItem
                key={consent.id}
                title={consent.title}
                content={consent.content}
                version={consent.version}
                agreedAt={consent.agreed_at}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={onCloseModal}
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StoreAgreedConsentPanel;
