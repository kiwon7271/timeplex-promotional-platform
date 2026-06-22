import { redirect } from "next/navigation";

/** 레거시 상세 → 목록 (모달로 대체) */
const StoreInquiryDetailRedirect = () => {
  redirect("/store/inquiries");
};

export default StoreInquiryDetailRedirect;
