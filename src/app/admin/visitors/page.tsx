import { redirect } from "next/navigation";

/** 레거시 경로 → 방문자 통계 */
const AdminVisitorsRedirect = () => {
  redirect("/admin/visitor-stats");
};

export default AdminVisitorsRedirect;
