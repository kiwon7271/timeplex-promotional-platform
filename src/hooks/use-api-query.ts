"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

/** CSR 페이지 — Route API 1회 조회 + refetch */
export const useApiQuery = <T>(path: string | null, enabled = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    const result = await apiGet<T>(path);
    if (result.ok) {
      setData(result.data ?? null);
    } else {
      setData(null);
      setError(result.message ?? "불러오기 실패");
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [enabled, path, refresh]);

  return { data, loading, error, refresh };
};
