"use client";

import { motion } from "motion/react";
import { fadeUpInView } from "@/lib/ui-motion";
import type { StatCardProps } from "@/types/ui";

/** 대시보드 통계 카드 */
const StatCard = ({ label, value, motionDelay = 0 }: StatCardProps) => {
  return (
    <motion.div
      className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-5"
      {...fadeUpInView}
      transition={{ ...fadeUpInView.transition, delay: motionDelay }}
    >
      <p className="text-[12px] leading-[16px] text-gray-500">{label}</p>
      <p className="text-[24px] font-semibold leading-[32px] text-gray-900">{value}</p>
    </motion.div>
  );
};

export default StatCard;
