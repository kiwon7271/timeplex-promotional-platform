import Link from "next/link";
import { cn } from "@/lib/cn";
import { getLinkButtonSizeClass } from "@/lib/ui-control";
import { linkButtonBaseClass, linkButtonVariantClass } from "@/lib/ui-styles";
import type { LinkButtonProps } from "@/types/ui";

/** 링크형 버튼 */
const LinkButton = ({
  href,
  children,
  variant = "outline",
  size = "md",
  className,
  icon,
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(
        linkButtonBaseClass,
        "inline-flex items-center justify-center gap-1.5",
        getLinkButtonSizeClass(size),
        linkButtonVariantClass[variant],
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  );
};

export default LinkButton;
