import type { H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PProps } from "@/types/ui";

/** 공통 타이포그래피 (Header1~6, Body1~3) — motion 미사용(hydration 안정) */
const Text = {
  /** 최상위 제목 (H1) */
  Header1: ({ children, className = "", ...props }: H1Props) => (
    <h1
      className={`text-[36px] font-bold leading-[44px] tracking-tight lg:text-[48px] lg:leading-[56px] ${className}`}
      {...props}
    >
      {children}
    </h1>
  ),
  /** 섹션 제목 (H2) */
  Header2: ({ children, className = "", ...props }: H2Props) => (
    <h2
      className={`text-[30px] font-bold leading-[40px] tracking-tight lg:text-[36px] lg:leading-[44px] ${className}`}
      {...props}
    >
      {children}
    </h2>
  ),
  /** 블록 제목 (H3) */
  Header3: ({ children, className = "", ...props }: H3Props) => (
    <h3
      className={`text-[24px] font-bold leading-[36px] tracking-tight lg:text-[30px] lg:leading-[40px] ${className}`}
      {...props}
    >
      {children}
    </h3>
  ),
  /** 카드/모달 제목 (H4) */
  Header4: ({ children, className = "", ...props }: H4Props) => (
    <h4
      className={`text-[20px] font-bold leading-[32px] tracking-tight lg:text-[24px] lg:leading-[36px] ${className}`}
      {...props}
    >
      {children}
    </h4>
  ),
  /** 소제목 (H5) */
  Header5: ({ children, className = "", ...props }: H5Props) => (
    <h5
      className={`text-[18px] font-bold leading-[30px] tracking-tight lg:text-[20px] lg:leading-[32px] ${className}`}
      {...props}
    >
      {children}
    </h5>
  ),
  /** 라벨/강조 텍스트 (H6) */
  Header6: ({ children, className = "", ...props }: H6Props) => (
    <h6
      className={`text-[16px] font-bold leading-[24px] tracking-tight lg:text-[18px] lg:leading-[30px] ${className}`}
      {...props}
    >
      {children}
    </h6>
  ),
  /** 본문 16px */
  Body1: ({ children, className = "", ...props }: PProps) => (
    <p className={`text-[16px] leading-[24px] ${className}`} {...props}>
      {children}
    </p>
  ),
  /** 본문 14px */
  Body2: ({ children, className = "", ...props }: PProps) => (
    <p className={`text-[14px] leading-[20px] ${className}`} {...props}>
      {children}
    </p>
  ),
  /** 보조 텍스트 12px */
  Body3: ({ children, className = "", ...props }: PProps) => (
    <p className={`text-[12px] leading-[16px] ${className}`} {...props}>
      {children}
    </p>
  ),
};

export default Text;
