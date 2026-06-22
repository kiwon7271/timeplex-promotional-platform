"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActionResult } from "@/types/action-result";
import { requireSuperAdmin, requireStoreUser } from "@/lib/auth";
import { PLAN_STAFF_LIMIT, type PlanCode } from "@/lib/constants";

/** Supabase: stores.status UPDATE — 관리자 매장 상태 변경 */
export const onUpdateStoreStatus = async (
  storeId: string,
  status: string
): Promise<ActionResult> => {
  await requireSuperAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("stores").update({ status }).eq("id", storeId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/stores");
  return { ok: true };
};

/** Supabase: stores.plan_code UPDATE — 관리자 매장 요금제 변경 */
export const onUpdateStorePlan = async (
  storeId: string,
  planCode: string
): Promise<ActionResult> => {
  await requireSuperAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("stores").update({ plan_code: planCode }).eq("id", storeId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/stores");
  return { ok: true };
};

/** Supabase: stores UPDATE — 매장 기본 정보 수정 (이메일 제외) */
export const onUpdateStoreInfo = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      description: String(formData.get("description") ?? ""),
    })
    .eq("id", profile.store_id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/store/info");
  return { ok: true };
};

/** Supabase(service): Auth createUser + profiles/store_members UPSERT — 직원 초대 (요금제 인원 제한) */
export const onInviteStaff = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "이메일을 입력하세요." };

  const service = createServiceClient();

  const { data: store } = await service
    .from("stores")
    .select("plan_code")
    .eq("id", profile.store_id)
    .single();

  const limit = PLAN_STAFF_LIMIT[(store?.plan_code as PlanCode) ?? "Free"] ?? 1;
  const { count } = await service
    .from("store_members")
    .select("*", { count: "exact", head: true })
    .eq("store_id", profile.store_id);

  if ((count ?? 0) >= limit) {
    return { ok: false, message: `현재 요금제(${store?.plan_code}) 직원 한도(${limit}명)를 초과했습니다.` };
  }

  const tempPassword = `Tp-${crypto.randomUUID().slice(0, 12)}`;
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role: "STORE_STAFF" },
  });

  if (createError || !created?.user) {
    return { ok: false, message: createError?.message ?? "사용자 생성 실패" };
  }

  await service.from("profiles").upsert({
    id: created.user.id,
    email,
    role: "STORE_STAFF",
    store_id: profile.store_id,
  });

  await service.from("store_members").upsert(
    { store_id: profile.store_id, profile_id: created.user.id, role: "STORE_STAFF" },
    { onConflict: "store_id,profile_id" }
  );

  revalidatePath("/store/staff");
  return { ok: true, message: `초대 완료. 임시 비밀번호: ${tempPassword}` };
};

/** Supabase(service): store_members DELETE — 매장 직원 연결 해제 */
export const onDeleteStaff = async (profileId: string): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const service = createServiceClient();
  await service
    .from("store_members")
    .delete()
    .eq("store_id", profile.store_id)
    .eq("profile_id", profileId);

  revalidatePath("/store/staff");
  return { ok: true };
};

/** Supabase: reservation_links INSERT — 예약 링크 추가 */
export const onCreateReservationLink = async (formData: FormData): Promise<ActionResult> => {
  const profile = await requireStoreUser();
  if (!profile.store_id) return { ok: false, message: "소속 매장이 없습니다." };

  const supabase = createClient();
  const { error } = await supabase.from("reservation_links").insert({
    store_id: profile.store_id,
    provider: String(formData.get("provider") ?? "OTHER"),
    url: String(formData.get("url") ?? ""),
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/store/reservation-links");
  return { ok: true };
};

/** Supabase: reservation_links DELETE — 예약 링크 삭제 */
export const onDeleteReservationLink = async (id: string): Promise<ActionResult> => {
  await requireStoreUser();
  const supabase = createClient();
  const { error } = await supabase.from("reservation_links").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/store/reservation-links");
  return { ok: true };
};
