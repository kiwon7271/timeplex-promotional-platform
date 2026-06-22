import { cn } from "@/lib/cn";
import type { TooltipProps } from "@/types/ui";

const placementClass = {
  top: "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
} as const;

/** 호버·포커스 시 툴팁 */
const Tooltip = ({ label, children, className, placement = "top" }: TooltipProps) => {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[12px] font-medium leading-[16px] text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          placementClass[placement],
        )}
      >
        {label}
      </span>
    </span>
  );
};

export default Tooltip;
