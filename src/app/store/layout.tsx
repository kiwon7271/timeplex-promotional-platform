import StoreAppLayout from "@/components/layout/store-app-layout";
import type { LayoutChildrenProps } from "@/types/layout";

/** 매장 CSR 레이아웃 */
const StoreLayout = ({ children }: LayoutChildrenProps) => {
  return <StoreAppLayout>{children}</StoreAppLayout>;
};

export default StoreLayout;
