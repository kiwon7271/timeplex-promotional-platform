"use client";

import { motion } from "motion/react";
import { fadeUpInView } from "@/lib/ui-motion";
import type { EmptyStateProps } from "@/types/ui";

/** 빈 데이터 안내 프레임 */
const EmptyState = ({ message = "데이터가 없습니다.", plain = false }: EmptyStateProps) => {
  if (plain) {
    return <p className="px-5 py-10 text-center text-[13px] leading-[18px] text-gray-500">{message}</p>;
  }

  return (
    <motion.div
      className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center"
      {...fadeUpInView}
    >
      <p className="text-[13px] leading-[18px] text-gray-500">{message}</p>
    </motion.div>
  );
};

export default EmptyState;
