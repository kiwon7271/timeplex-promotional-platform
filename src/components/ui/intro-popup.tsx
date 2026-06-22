"use client";

import { IconSpeakerphone } from "@tabler/icons-react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import Badge from "@/components/ui/badge";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icon-size";
import type { IntroPopupProps } from "@/types/dialog";

/** 매장관리자 공지·동의 팝업 */
const IntroPopup = ({
  open,
  title,
  notices,
  variant = "info",
  onClose,
  onDismissToday,
  onAgree,
  onDecline,
  loading = false,
}: IntroPopupProps) => {
  const isConsent = variant === "consent";
  const closable = !isConsent;

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose ?? (() => {})}
      size="lg"
      closeOnOverlay={false}
      closable={closable}
    >
      <div className="space-y-5">
        <div className="max-h-[min(50vh,360px)] space-y-3 overflow-y-auto">
          {notices.map((notice, index) => (
            <div
              key={`${notice.title}-${index}`}
              className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3"
            >
              <IconSpeakerphone
                size={ICON_SIZE.xl}
                stroke={ICON_STROKE}
                className="mt-0.5 shrink-0 text-blue-600"
                aria-hidden
              />
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Text.Body2 className="font-medium text-gray-900">
                    {notice.title}
                  </Text.Body2>
                  {notice.version ? (
                    <Badge variant="muted" className="shrink-0">
                      {notice.version}
                    </Badge>
                  ) : null}
                </div>
                <Text.Body2 className="whitespace-pre-wrap break-words text-gray-800">
                  {notice.content}
                </Text.Body2>
              </div>
            </div>
          ))}
        </div>

        {isConsent ? (
          <>
            <Text.Body3 className="text-gray-600">
              고객과의 채팅을 시작하려면 위 약관에 동의해야 합니다.
            </Text.Body3>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={loading}
                onClick={onDecline}
              >
                동의하지 않음
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={loading}
                onClick={onAgree}
              >
                {loading ? "처리 중…" : "동의합니다"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {onDismissToday ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onDismissToday}
              >
                오늘 하루 보지 않기
              </Button>
            ) : null}
            <Button type="button" variant="primary" onClick={onClose}>
              확인
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IntroPopup;
