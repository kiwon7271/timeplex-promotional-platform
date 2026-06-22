import { cn } from "@/lib/cn";
import { getCheckboxInputClass, getChoiceLabelClass, getChoiceTextClass } from "@/lib/ui-control";
import type { CheckboxProps } from "@/types/ui";

/** 체크박스 */
const Checkbox = ({ label, size = "md", className, ...props }: CheckboxProps) => {
  return (
    <label className={cn(getChoiceLabelClass(size), className)}>
      <input type="checkbox" className={getCheckboxInputClass(size)} {...props} />
      {label ? <span className={cn("text-gray-800", getChoiceTextClass(size))}>{label}</span> : null}
    </label>
  );
};

export default Checkbox;
