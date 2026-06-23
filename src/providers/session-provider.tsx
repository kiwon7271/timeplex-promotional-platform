"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { ROLES } from "@/lib/constants";
import type { Profile } from "@/types/database";

type SessionContextValue = {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/** 클라이언트 세션 — layout 1회 조회, 페이지 전환 시 재조회 없음 */
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await apiGet<Profile>("/api/auth/profile");
    if (!result.ok) {
      setProfile(null);
      return;
    }
    setProfile(result.data ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      const result = await apiGet<Profile>("/api/auth/profile");
      if (cancelled) return;

      if (!result.ok) {
        setProfile(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      setProfile(result.data ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const value = useMemo(() => ({ profile, loading, refresh }), [profile, loading, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession은 SessionProvider 내부에서 사용하세요.");
  return ctx;
};

/** 매장 영역 — STORE_OWNER / STORE_STAFF */
export const useStoreSession = () => {
  const { profile, loading, refresh } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading || !profile) return;
    if (profile.role === ROLES.SUPER_ADMIN) {
      router.replace("/admin");
      return;
    }
    if (profile.role !== ROLES.STORE_OWNER && profile.role !== ROLES.STORE_STAFF) {
      router.replace("/login");
    }
  }, [profile, loading, router]);

  return {
    profile,
    loading,
    refresh,
    storeId: profile?.store_id ?? null,
    ready: !loading && !!profile?.store_id,
  };
};

/** 통합관리자 영역 */
export const useAdminSession = () => {
  const { profile, loading, refresh } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading || !profile) return;
    if (profile.role !== ROLES.SUPER_ADMIN) {
      router.replace(profile.store_id ? "/store" : "/login");
    }
  }, [profile, loading, router]);

  return {
    profile,
    loading,
    refresh,
    ready: !loading && profile?.role === ROLES.SUPER_ADMIN,
  };
};
