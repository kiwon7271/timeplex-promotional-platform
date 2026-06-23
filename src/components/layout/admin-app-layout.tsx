"use client";

import { SessionProvider } from "@/providers/session-provider";
import ShellProvider from "@/components/layout/shell-provider";
import SignOutButton from "@/components/layout/sign-out-button";
import { ADMIN_NAV } from "@/components/layout/nav-items";
import { ROLE_LABEL } from "@/lib/constants";
import { useAdminSession } from "@/providers/session-provider";
import PageSkeleton from "@/components/ui/page-skeleton";
import type { LayoutChildrenProps } from "@/types/layout";

const AdminShellInner = ({ children }: LayoutChildrenProps) => {
  const { profile, loading } = useAdminSession();

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
      nav={ADMIN_NAV}
      signOutAction={<SignOutButton />}
    >
      {children}
    </ShellProvider>
  );
};

/** 통합관리자 CSR 레이아웃 */
const AdminAppLayout = ({ children }: LayoutChildrenProps) => (
  <SessionProvider>
    <AdminShellInner>{children}</AdminShellInner>
  </SessionProvider>
);

export default AdminAppLayout;
