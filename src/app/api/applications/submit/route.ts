import { actionJson } from "@/lib/api/action-json";
import { onSubmitApplication } from "@/actions/applications";

export const runtime = "nodejs";

/** POST — 입점 신청 (비로그인) */
export async function POST(request: Request) {
  return actionJson(await onSubmitApplication(await request.formData()));
}
