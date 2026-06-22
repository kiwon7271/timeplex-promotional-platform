import { cn } from "@/lib/cn";
import { getInputClass, type ControlSize } from "@/lib/ui-control";
import { selectChevronClass, selectMdClass, selectSmClass } from "@/lib/ui-styles";
import type { SelectProps } from "@/types/ui";

const ICON_PAD_LEADING = "pl-10";

const WIDTH_CLASS: Record<ControlSize, string> = {
  sm: selectSmClass,
  md: selectMdClass,
  lg: selectMdClass,
};

/** 공통 셀렉트 — leadingIcon 옵션 */
const Select = ({ options, size = "md", className, leadingIcon, ...props }: SelectProps) => {
  const select = (
    <select
      className={cn(
        getInputClass(size),
        WIDTH_CLASS[size],
        selectChevronClass,
        leadingIcon ? ICON_PAD_LEADING : undefined,
        className,
      )}
      {...props}
    >
      {options.map((opt) => {
        const value = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );

  if (!leadingIcon) return select;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
        {leadingIcon}
      </span>
      {select}
    </div>
  );
};

export default Select;
