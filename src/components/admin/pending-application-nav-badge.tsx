"use client";

import { usePendingApplicationCount } from "@/hooks/use-pending-application-count";
import { cn } from "@/lib/cn";

interface PendingApplicationNavBadgeProps {
  className?: string;
}

/** 좌측 네비 — 검수 대기 입점 신청 건수 */
const PendingApplicationNavBadge = ({ className }: PendingApplicationNavBadgeProps) => {
  const count = usePendingApplicationCount();

  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-none text-white",
        className,
      )}
      aria-label={`대기 중인 입점 신청 ${count}건`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default PendingApplicationNavBadge;
