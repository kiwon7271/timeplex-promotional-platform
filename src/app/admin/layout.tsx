import { requireSuperAdmin } from "@/lib/auth";
import ShellProvider from "@/components/layout/shell-provider";
import SignOutButton from "@/components/layout/sign-out-button";
import { ADMIN_NAV } from "@/components/layout/nav-items";
import { ROLE_LABEL } from "@/lib/constants";

import type { LayoutChildrenProps } from "@/types/layout";

/** 통합관리자 영역 공통 레이아웃 */
const AdminLayout = async ({ children }: LayoutChildrenProps) => {
  const profile = await requireSuperAdmin();

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

export default AdminLayout;
