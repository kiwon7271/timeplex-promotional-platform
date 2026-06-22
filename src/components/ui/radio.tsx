import { cn } from "@/lib/cn";
import { getChoiceLabelClass, getChoiceTextClass, getRadioInputClass } from "@/lib/ui-control";
import type { RadioProps } from "@/types/ui";

/** 라디오 */
const Radio = ({ label, size = "md", className, ...props }: RadioProps) => {
  return (
    <label className={cn(getChoiceLabelClass(size), className)}>
      <input type="radio" className={getRadioInputClass(size)} {...props} />
      {label ? <span className={cn("text-gray-800", getChoiceTextClass(size))}>{label}</span> : null}
    </label>
  );
};

export default Radio;
