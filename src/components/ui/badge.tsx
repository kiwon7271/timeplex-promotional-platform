import { cn } from "@/lib/cn";
import { resolveBadgeVariant } from "@/lib/badge-variant";
import { badgeBaseClass, badgeVariantClass } from "@/lib/ui-styles";
import type { BadgeProps } from "@/types/ui";

/** 상태 배지 — badgeBaseClass + variant + className */
const Badge = ({ children, value, variant, className }: BadgeProps) => {
  const resolvedVariant = variant ?? (value ? resolveBadgeVariant(value) : "default");
  const label = children ?? value;

  return (
    <span className={cn(badgeBaseClass, badgeVariantClass[resolvedVariant], className)}>
      {label}
    </span>
  );
};

export default Badge;
