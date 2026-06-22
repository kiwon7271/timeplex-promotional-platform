import { cn } from "@/lib/cn";
import { getFileInputClass } from "@/lib/ui-control";
import type { FileInputProps } from "@/types/ui";

/** 파일 입력 */
const FileInput = ({ className, size = "md", ...props }: FileInputProps) => {
  return <input type="file" className={cn(getFileInputClass(size), className)} {...props} />;
};

export default FileInput;
