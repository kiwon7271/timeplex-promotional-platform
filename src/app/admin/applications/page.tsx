import { redirect } from "next/navigation";

/** 레거시 경로 → 입점관리 */
const AdminApplicationsRedirect = () => {
  redirect("/admin/store-admissions");
};

export default AdminApplicationsRedirect;
