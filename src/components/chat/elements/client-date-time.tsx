"use client";

import { useEffect, useState } from "react";

const formatKoDateTime = (value: string) =>
  new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

interface ClientDateTimeProps {
  value: string;
  className?: string;
  fallback?: string;
}

/** SSR·CSR 시간대 불일치 hydration 오류 방지 */
const ClientDateTime = ({
  value,
  className,
  fallback = "-",
}: ClientDateTimeProps) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(formatKoDateTime(value));
  }, [value]);

  return (
    <span className={className} suppressHydrationWarning>
      {text ?? fallback}
    </span>
  );
};

export default ClientDateTime;
