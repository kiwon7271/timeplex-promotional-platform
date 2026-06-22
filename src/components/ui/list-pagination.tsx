import { cn } from "@/lib/cn";
import Pagination from "@/components/ui/pagination";
import type { PaginationProps } from "@/types/ui";

/** 목록 하단 공통 페이지네이션 */
const ListPagination = ({ className, size = "md", ...props }: PaginationProps) => {
  return (
    <Pagination
      {...props}
      size={size}
      className={cn("border-t border-gray-100 px-4 py-4", className)}
    />
  );
};

export default ListPagination;
