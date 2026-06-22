import { redirect } from "next/navigation";

/** 레거시 상세 → 목록 (모달로 대체) */
const AdminInquiryDetailRedirect = () => {
  redirect("/admin/store-inquiries");
};

export default AdminInquiryDetailRedirect;
