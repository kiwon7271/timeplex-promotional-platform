"use client";

import { useTransition } from "react";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import { useDialog } from "@/components/providers/dialog-provider";
import type { ActionButtonProps } from "@/types/ui";

/** 서버 액션 호출 버튼 (확인·알림 모달·아이콘·툴팁 지원) */
const ActionButton = ({
  onAction,
  children,
  icon,
  ariaLabel,
  tooltip,
  tooltipPlacement,
  confirm,
  confirmVariant = "danger",
  variant = "outline",
  disabled = false,
  iconOnly,
  size = "md",
  className,
}: ActionButtonProps) => {
  const { openAlert, openConfirm } = useDialog();
  const [pending, startTransition] = useTransition();
  const label =
    ariaLabel ?? tooltip ?? (typeof children === "string" ? children : undefined);
  const showIconOnly = iconOnly ?? (!!icon && !children);
  const buttonVariant = variant === "danger" ? "danger" : "outline";

  const onClick = async () => {
    if (confirm) {
      const ok = await openConfirm({
        message: confirm,
        variant: confirmVariant,
        confirmLabel: confirmVariant === "danger" ? "삭제" : "확인",
      });
      if (!ok) return;
    }

    startTransition(() => {
      void (async () => {
        const res = await onAction();
        if (res.message) {
          await openAlert({
            title: res.ok ? "완료" : "안내",
            message: res.message,
          });
        }
      })();
    });
  };

  if (showIconOnly && icon) {
    return (
      <IconButton
        type="button"
        variant={buttonVariant}
        size={size}
        className={className}
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
        aria-label={label}
        icon={icon}
        onClick={onClick}
        disabled={pending || disabled}
      />
    );
  }

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size={size}
      icon={icon}
      className={className}
      aria-label={label}
      onClick={onClick}
      disabled={pending || disabled}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
