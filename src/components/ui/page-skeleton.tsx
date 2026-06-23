"use client";

import { cn } from "@/lib/cn";

/** CSR 페이지 로딩 스켈레톤 */
const PageSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse space-y-4", className)}>
    <div className="h-8 w-48 rounded bg-gray-200" />
    <div className="h-4 w-72 max-w-full rounded bg-gray-100" />
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-24 rounded-lg bg-gray-100" />
      ))}
    </div>
    <div className="h-64 rounded-lg bg-gray-100" />
  </div>
);

export default PageSkeleton;
