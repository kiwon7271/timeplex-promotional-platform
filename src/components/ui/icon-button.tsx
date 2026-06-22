"use client";

import Button from "@/components/ui/button";
import Tooltip from "@/components/ui/tooltip";
import type { IconButtonProps } from "@/types/ui";

/** 아이콘 전용 버튼 — sm/md/lg 높이가 input·select·button과 동일 */
const IconButton = ({
  icon,
  size = "md",
  tooltip,
  tooltipPlacement,
  round,
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps) => {
  const label = ariaLabel ?? tooltip ?? "";

  const button = (
    <Button {...props} size={size} icon={icon} iconOnly round={round} aria-label={label} />
  );

  if (!tooltip) return button;

  return (
    <Tooltip label={tooltip} placement={tooltipPlacement}>
      {button}
    </Tooltip>
  );
};

export default IconButton;
