"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPendingApplicationCount } from "@/lib/pending-applications";

const POLL_INTERVAL_MS = 20_000;

/** 입점 신청 대기 건수 — Realtime + 폴링 + 탭 복귀 시 갱신 */
export const usePendingApplicationCount = () => {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchPendingApplicationCount();
      setCount(next);
    } catch {
      // 네트워크·RLS 오류 시 기존 값 유지
    }
  }, []);

  useEffect(() => {
    void refresh();

    const supabase = createClient();
    const channel = supabase
      .channel("pending-onboarding-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "onboarding_applications" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    const pollId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  return count;
};
