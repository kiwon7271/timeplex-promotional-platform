import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { getTextareaClass } from "@/lib/ui-control";
import type { TextareaProps } from "@/types/ui";

/** 공통 textarea */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "md", ...props }, ref) => {
    return <textarea ref={ref} className={cn(getTextareaClass(size), className)} {...props} />;
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
