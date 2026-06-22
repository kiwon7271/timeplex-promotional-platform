import { requireStoreUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ShellProvider from "@/components/layout/shell-provider";
import SignOutButton from "@/components/layout/sign-out-button";
import StoreIntroPopup from "@/components/store/store-intro-popup";
import { STORE_NAV } from "@/components/layout/nav-items";
import { ROLE_LABEL } from "@/lib/constants";

import type { LayoutChildrenProps } from "@/types/layout";

/** 매장관리자 영역 공통 레이아웃 */
const StoreLayout = async ({ children }: LayoutChildrenProps) => {
  const profile = await requireStoreUser();
  const supabase = createClient();

  const { data: introNotices } = await supabase
    .from("consent_notices")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <ShellProvider
      brand="Timeplex"
      roleLabel={ROLE_LABEL[profile.role]}
      userEmail={profile.email}
      nav={STORE_NAV}
      signOutAction={<SignOutButton />}
    >
      <StoreIntroPopup notices={introNotices ?? []} />
      {children}
    </ShellProvider>
  );
};

export default StoreLayout;
