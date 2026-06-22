"use client";

import Card from "@/components/ui/card";
import type { ListSectionProps } from "@/types/ui";

/** 목록 섹션 — 제목은 테이블 카드 바깥 */
const ListSection = ({
  title,
  action,
  children,
  className = "",
  motionDelay = 0,
  plain = false,
}: ListSectionProps) => {
  return (
    <section className={`space-y-3 ${className}`}>
      <div
        className={
          action
            ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            : undefined
        }
      >
        <h2 className="shrink-0 text-[15px] font-semibold leading-[22px] text-gray-900">{title}</h2>
        {action ? <div className="min-w-0 w-full sm:w-auto sm:max-w-sm">{action}</div> : null}
      </div>
      {plain ? (
        <div className="rounded-lg bg-white">{children}</div>
      ) : (
        <Card flush motionDelay={motionDelay}>
          {children}
        </Card>
      )}
    </section>
  );
};

export default ListSection;
