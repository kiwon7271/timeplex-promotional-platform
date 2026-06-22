"use client";

import { motion } from "motion/react";
import { fadeUpInView } from "@/lib/ui-motion";
import type { CardProps } from "@/types/ui";

/** 카드 프레임 */
const Card = ({ title, children, className = "", motionDelay = 0, flush = false }: CardProps) => {
  if (flush) {
    return (
      <motion.div
        className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
        {...fadeUpInView}
        transition={{ ...fadeUpInView.transition, delay: motionDelay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 ${className}`}
      {...fadeUpInView}
      transition={{ ...fadeUpInView.transition, delay: motionDelay }}
    >
      {title ? <h2 className="text-[15px] font-semibold leading-[22px] text-gray-900">{title}</h2> : null}
      {children}
    </motion.div>
  );
};

export default Card;
