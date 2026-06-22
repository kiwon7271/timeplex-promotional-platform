import { redirect } from "next/navigation";

/** 레거시 경로 → 채팅사용량 */
const AdminUsageRedirect = () => {
  redirect("/admin/chat-usage");
};

export default AdminUsageRedirect;
