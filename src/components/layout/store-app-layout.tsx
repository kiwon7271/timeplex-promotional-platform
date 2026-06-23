"use client";

import { SessionProvider } from "@/providers/session-provider";
import ShellProvider from "@/components/layout/shell-provider";
import SignOutButton from "@/components/layout/sign-out-button";
import StoreIntroPopupLoader from "@/components/store/store-intro-popup-loader";
import { STORE_NAV } from "@/components/layout/nav-items";
import { ROLE_LABEL } from "@/lib/constants";
import { useStoreSession } from "@/providers/session-provider";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { LayoutChildrenProps } from "@/types/layout";

const StoreShellInner = ({ children }: LayoutChildrenProps) => {
  const { profile, loading } = useStoreSession();

  if (loading || !profile) {
    return (
      <div className="p-6">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <ShellProvider
      brand="Timeplex"
      roleLabel={ROLE_LABEL[profile.role]}
      userEmail={profile.email}
      nav={STORE_NAV}
      signOutAction={<SignOutButton />}
    >
      <StoreIntroPopupLoader />
      {children}
    </ShellProvider>
  );
};

/** 매장 CSR 레이아웃 — 서버 auth/DB 조회 없음 */
const StoreAppLayout = ({ children }: LayoutChildrenProps) => (
  <SessionProvider>
    <StoreShellInner>{children}</StoreShellInner>
  </SessionProvider>
);

export default StoreAppLayout;
