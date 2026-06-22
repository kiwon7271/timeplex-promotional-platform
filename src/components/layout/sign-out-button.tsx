"use client";

import { IconLogout } from "@tabler/icons-react";
import { onSignOut } from "@/actions/auth";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";

/** 로그아웃 — 아이콘 전용 */
const SignOutButton = () => {
  return (
    <form action={onSignOut}>
      <IconButton
        type="submit"
        variant="outline"
        size="sm"
        aria-label="로그아웃"
        icon={<IconLogout size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
      />
    </form>
  );
};

export default SignOutButton;
