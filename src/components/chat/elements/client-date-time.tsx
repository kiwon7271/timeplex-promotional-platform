"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format-datetime";

interface ClientDateTimeProps {
  value: string;
  className?: string;
}

/** SSR·CSR 시간대 불일치 hydration 오류 방지 — 마운트 후에만 표시 */
const ClientDateTime = ({ value, className }: ClientDateTimeProps) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(formatDateTime(value));
  }, [value]);

  return (
    <time dateTime={value} className={className} suppressHydrationWarning>
      {text ?? "\u00a0"}
    </time>
  );
};

export default ClientDateTime;
