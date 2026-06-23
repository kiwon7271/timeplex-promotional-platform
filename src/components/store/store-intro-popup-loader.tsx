"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { ConsentNotice } from "@/types/database";
import StoreIntroPopup from "@/components/store/store-intro-popup";

/** 레이아웃 — 접속 팝업 공지 로드 */
const StoreIntroPopupLoader = () => {
  const [notices, setNotices] = useState<ConsentNotice[]>([]);

  useEffect(() => {
    void (async () => {
      const result = await apiGet<ConsentNotice[]>("/api/store/consent-notices/intro");
      if (result.ok) setNotices(result.data ?? []);
    })();
  }, []);

  return <StoreIntroPopup notices={notices} />;
};

export default StoreIntroPopupLoader;
