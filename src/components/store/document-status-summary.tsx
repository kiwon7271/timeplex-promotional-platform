"use client";

import StatCard from "@/components/ui/stat-card";

interface DocumentStatusSummaryProps {
  pending: number;
  approved: number;
  rejected: number;
}

/** 서류 상태 요약 StatCard 그리드 */
const DocumentStatusSummary = ({ pending, approved, rejected }: DocumentStatusSummaryProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-[15px] font-semibold leading-[22px] text-gray-900">카드사 심사 서류</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard label="대기" value={pending} />
        <StatCard label="승인" value={approved} motionDelay={0.05} />
        <StatCard label="반려" value={rejected} motionDelay={0.1} />
      </div>
    </section>
  );
};

export default DocumentStatusSummary;
