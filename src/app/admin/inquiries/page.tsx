import { redirect } from "next/navigation";

/** 레거시 경로 → 매장문의 */
const AdminInquiriesRedirect = () => {
  redirect("/admin/store-inquiries");
};

export default AdminInquiriesRedirect;
