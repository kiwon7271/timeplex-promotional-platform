import type { PageBodyProps } from "@/types/ui";

/** 페이지 본문 간격 래퍼 */
const PageBody = ({ children, className = "" }: PageBodyProps) => {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
};

export default PageBody;
