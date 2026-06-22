import { cn } from "@/lib/cn";
import { getInputClass } from "@/lib/ui-control";
import { inputBaseClass } from "@/lib/ui-styles";
import type { InputProps } from "@/types/ui";

const ICON_PAD = {
  leading: "pl-10",
  trailing: "pr-10",
};

/** 공통 텍스트 입력 — leadingIcon / trailingIcon */
const Input = ({ className, size = "md", leadingIcon, trailingIcon, ...props }: InputProps) => {
  const hasIcon = !!(leadingIcon || trailingIcon);
  const fieldClass = getInputClass(size);

  if (!hasIcon) {
    return <input className={cn(fieldClass, inputBaseClass, className)} {...props} />;
  }

  return (
    <div className="relative">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
          {leadingIcon}
        </span>
      ) : null}
      <input
        className={cn(
          fieldClass,
          inputBaseClass,
          leadingIcon ? ICON_PAD.leading : undefined,
          trailingIcon ? ICON_PAD.trailing : undefined,
          className,
        )}
        {...props}
      />
      {trailingIcon ? (
        <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
