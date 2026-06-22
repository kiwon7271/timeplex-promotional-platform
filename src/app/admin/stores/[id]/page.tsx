import { redirect } from "next/navigation";

/** 매장 상세 페이지 → 목록으로 리다이렉트 (상세는 모달) */
const AdminStoreDetailRedirect = () => {
  redirect("/admin/stores");
};

export default AdminStoreDetailRedirect;
