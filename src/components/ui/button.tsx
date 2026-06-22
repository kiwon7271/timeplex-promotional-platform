"use client";

import { cn } from "@/lib/cn";
import { getButtonIconOnlyClass, getButtonTextClass } from "@/lib/ui-control";
import { motion } from "motion/react";
import type { ButtonProps } from "@/types/ui";

const VARIANT_CLASS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600",
  default: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  danger: "border border-red-300 bg-white text-red-600 hover:bg-red-50",
};

const BUTTON_BASE_CLASS =
  "inline-flex cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50";

/** 공통 motion 버튼 — icon / iconOnly 지원 */
const Button = ({
  variant = "default",
  size = "md",
  icon,
  iconPosition = "left",
  iconOnly = false,
  round = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  const showIconOnly = iconOnly || (icon && !children);

  return (
    <motion.button
      className={cn(
        BUTTON_BASE_CLASS,
        showIconOnly ? getButtonIconOnlyClass(size, round) : getButtonTextClass(size),
        VARIANT_CLASS[variant],
        className,
      )}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {icon && iconPosition === "left" ? icon : null}
      {showIconOnly ? null : children}
      {icon && iconPosition === "right" ? icon : null}
    </motion.button>
  );
};

export default Button;
