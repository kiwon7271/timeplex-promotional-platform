import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeplex Admin",
  description: "Timeplex 통합 관리 플랫폼",
};

import type { RootLayoutProps } from "@/types/layout";

/** 앱 루트 레이아웃 (HTML, 글로벌 스타일) */
const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ko">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  );
};

export default RootLayout;
