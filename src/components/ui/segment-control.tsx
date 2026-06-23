"use client";

import { cn } from "@/lib/cn";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  dotClassName?: string;
  activeClassName: string;
  inactiveClassName: string;
  statusLabel: string;
  statusClassName: string;
};

interface SegmentControlProps<T extends string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/** 세그먼트 탭 — 채널·필터 선택 */
const SegmentControl = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel = "항목 선택",
}: SegmentControlProps<T>) => (
  <div
    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    role="tablist"
    aria-label={ariaLabel}
  >
    {options.map((option) => {
      const isActive = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex min-h-[76px] flex-col items-start gap-2 rounded-xl px-3 py-3 text-left backdrop-blur-[2px] transition-all duration-200",
            isActive ? option.activeClassName : option.inactiveClassName,
          )}
        >
          <span className="flex w-full items-center gap-2">
            {option.dotClassName ? (
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", option.dotClassName)} />
            ) : null}
            <span className="truncate text-[13px] font-semibold sm:text-[14px]">
              {option.label}
            </span>
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
              option.statusClassName,
            )}
          >
            {option.statusLabel}
          </span>
        </button>
      );
    })}
  </div>
);

export default SegmentControl;
