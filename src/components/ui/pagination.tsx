import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { buildListPath } from "@/lib/list-pagination";
import { getControlIconSize, ICON_STROKE } from "@/lib/icon-size";
import {
  getPaginationChevronClass,
  getPaginationItemClass,
  type ControlSize,
} from "@/lib/ui-control";
import type { PaginationProps } from "@/types/ui";

const pageActiveClass = "border-blue-600 bg-blue-600 font-semibold text-white";
const pageIdleClass = "border-gray-300 bg-white font-normal text-gray-700 hover:bg-gray-50";
const pageDisabledClass = "pointer-events-none cursor-not-allowed opacity-40";

/** 페이지네이션 — sm/md/lg 높이가 button·input과 동일 */
const Pagination = ({
  page,
  totalPages,
  basePath,
  query,
  className,
  size = "md",
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const href = (p: number) => buildListPath(basePath, { page: p, query });
  const itemClass = getPaginationItemClass(size);
  const chevronClass = getPaginationChevronClass(size);
  const iconSize = getControlIconSize(size);
  const pages = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
      aria-label="페이지"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={cn(chevronClass, pageIdleClass)}
          aria-label="이전 페이지"
        >
          <IconChevronLeft size={iconSize} stroke={ICON_STROKE} />
        </Link>
      ) : (
        <span className={cn(chevronClass, pageIdleClass, pageDisabledClass)} aria-hidden>
          <IconChevronLeft size={iconSize} stroke={ICON_STROKE} />
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={cn(itemClass, p === page ? pageActiveClass : pageIdleClass)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}

      {page < safeTotalPages ? (
        <Link
          href={href(page + 1)}
          className={cn(chevronClass, pageIdleClass)}
          aria-label="다음 페이지"
        >
          <IconChevronRight size={iconSize} stroke={ICON_STROKE} />
        </Link>
      ) : (
        <span className={cn(chevronClass, pageIdleClass, pageDisabledClass)} aria-hidden>
          <IconChevronRight size={iconSize} stroke={ICON_STROKE} />
        </span>
      )}
    </nav>
  );
};

export default Pagination;
