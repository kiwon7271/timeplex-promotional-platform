"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { buildListPath } from "@/lib/list-pagination";
import {
  INQUIRY_CATEGORY_FILTER_OPTIONS,
  type InquiryCategory,
} from "@/lib/inquiry-category";

export interface InquiryCategoryFilterProps {
  basePath: string;
  category?: InquiryCategory;
}

/** 문의 목록 — 구분 필터 */
const InquiryCategoryFilter = ({ basePath, category }: InquiryCategoryFilterProps) => {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-4">
      <div className="flex min-w-max flex-wrap gap-2 sm:flex-nowrap">
        {INQUIRY_CATEGORY_FILTER_OPTIONS.map(({ value, label }) => {
          const active = (value ?? undefined) === (category ?? undefined);
          const href = buildListPath(basePath, {
            query: value ? { category: value } : undefined,
          });

          return (
            <Link
              key={value ?? "all"}
              href={href}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-md border px-3 text-[13px] font-medium leading-none transition-colors",
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default InquiryCategoryFilter;
