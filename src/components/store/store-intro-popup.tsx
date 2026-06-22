"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ConsentNotice } from "@/types/database";
import IntroPopup from "@/components/ui/intro-popup";
import { dismissIntro, dismissIntroForToday, isIntroDismissed } from "@/lib/intro-popup-storage";

interface StoreIntroPopupProps {
  notices: ConsentNotice[];
}

/** 매장관리자 접속 시 활성 공지 표시 */
const StoreIntroPopup = ({ notices }: StoreIntroPopupProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visibleNotices, setVisibleNotices] = useState<ConsentNotice[]>([]);

  // 고객 대화 페이지는 필수 동의 게이트에서 동일 내용 표시
  const isChatPage = pathname.startsWith("/store/chats");

  useEffect(() => {
    if (isChatPage) {
      setOpen(false);
      return;
    }
    const undismissed = notices.filter((notice) => !isIntroDismissed(notice.id, notice.version));
    setVisibleNotices(undismissed);
    setOpen(undismissed.length > 0);
  }, [notices, isChatPage]);

  if (isChatPage || visibleNotices.length === 0) return null;

  const onClose = () => {
    visibleNotices.forEach((notice) => dismissIntro(notice.id, notice.version));
    setOpen(false);
  };

  const onDismissToday = () => {
    visibleNotices.forEach((notice) => dismissIntroForToday(notice.id, notice.version));
    setOpen(false);
  };

  return (
    <IntroPopup
      open={open}
      title="공지사항"
      notices={visibleNotices.map((notice) => ({
        title: notice.title,
        content: notice.content,
        version: notice.version,
      }))}
      onClose={onClose}
      onDismissToday={onDismissToday}
    />
  );
};

export default StoreIntroPopup;
