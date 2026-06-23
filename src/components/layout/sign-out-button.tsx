"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { apiPost } from "@/lib/api-client";
import IconButton from "@/components/ui/icon-button";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";

/** 로그아웃 — Route API */
const SignOutButton = () => {
  const router = useRouter();

  const onClickSignOut = async () => {
    await apiPost("/api/auth/sign-out");
    router.replace("/login");
    router.refresh();
  };

  return (
    <IconButton
      type="button"
      variant="outline"
      size="sm"
      aria-label="로그아웃"
      icon={<IconLogout size={getControlIconSize("sm")} stroke={ICON_STROKE} />}
      onClick={onClickSignOut}
    />
  );
};

export default SignOutButton;
