import AdminAppLayout from "@/components/layout/admin-app-layout";
import type { LayoutChildrenProps } from "@/types/layout";

/** 통합관리자 CSR 레이아웃 */
const AdminLayout = ({ children }: LayoutChildrenProps) => {
  return <AdminAppLayout>{children}</AdminAppLayout>;
};

export default AdminLayout;
