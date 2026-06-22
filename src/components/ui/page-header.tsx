"use client";

import type { PageHeaderProps } from "@/types/ui";

/** 콘텐츠 헤더 (제목, 부제, 액션) */
const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <header className="-mx-5 mb-6 border-b border-gray-200 px-5 pb-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold leading-[28px] text-gray-900">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-[18px] text-gray-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
};

export default PageHeader;
