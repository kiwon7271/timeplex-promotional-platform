"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActionResult } from "@/types/action-result";
import { requireSuperAdmin } from "@/lib/auth";
import { validatePassword } from "@/lib/password";

/** Supabase(service): Auth 계정 + onboarding_applications — 매장 회원가입(입점 신청) */
export const onSubmitApplication = async (formData: FormData): Promise<ActionResult> => {
  const storeName = String(formData.get("store_name") ?? "").trim();
  const applicantName = String(formData.get("applicant_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (!storeName || !applicantName || !email) {
    return { ok: false, message: "희망 매장명, 대표자명, 이메일은 필수입니다." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "올바른 이메일 형식이 아닙니다." };
  }
  const pwError = validatePassword(password);
  if (pwError) return { ok: false, message: pwError };
  if (password !== passwordConfirm) {
    return { ok: false, message: "비밀번호가 일치하지 않습니다." };
  }

  const service = createServiceClient();

  const { data: existingApp } = await service
    .from("onboarding_applications")
    .select("status")
    .eq("email", email)
    .eq("status", "PENDING")
    .maybeSingle();

  if (existingApp) {
    return { ok: false, message: "이미 접수된 입점 신청이 있습니다. 승인 후 로그인해 주세요." };
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: applicantName, role: "STORE_OWNER" },
  });

  if (!created?.user) {
    if (createError && /already|registered|exists/i.test(createError.message)) {
      return { ok: false, message: "이미 가입된 이메일입니다. 로그인해 주세요." };
    }
    return { ok: false, message: createError?.message ?? "회원가입에 실패했습니다." };
  }

  const userId = created.user.id;

  const { error: profileError } = await service.from("profiles").upsert({
    id: userId,
    email,
    full_name: applicantName,
    role: "STORE_OWNER",
    store_id: null,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(userId);
    return { ok: false, message: profileError.message };
  }

  const { error: appError } = await service.from("onboarding_applications").insert({
    user_id: userId,
    store_name: storeName,
    applicant_name: applicantName,
    email,
    phone: phone || null,
    status: "PENDING",
  });

  if (appError) {
    await service.auth.admin.deleteUser(userId);
    return { ok: false, message: appError.message };
  }

  return {
    ok: true,
    message: "회원가입 및 입점 신청이 완료되었습니다. 통합관리자 승인 후 로그인할 수 있습니다.",
  };
};

/** Supabase(service): stores/profiles 연결 — 온보딩 신청 승인 (계정은 가입 시 이미 생성됨) */
export const onApproveApplication = async (id: string): Promise<ActionResult> => {
  await requireSuperAdmin();
  const service = createServiceClient();

  const { data: app } = await service
    .from("onboarding_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!app) return { ok: false, message: "신청을 찾을 수 없습니다." };
  if (app.status !== "PENDING") return { ok: false, message: "이미 처리된 신청입니다." };

  let ownerId = app.user_id;

  // 구 데이터(user_id 없음) 호환
  if (!ownerId) {
    const { data: list } = await service.auth.admin.listUsers();
    const found = list.users.find((u) => u.email?.toLowerCase() === app.email.toLowerCase());
    if (!found) {
      return { ok: false, message: "연결된 계정이 없습니다. 신청자에게 회원가입을 다시 요청하세요." };
    }
    ownerId = found.id;
    await service.from("onboarding_applications").update({ user_id: ownerId }).eq("id", id);
  }

  const { data: store, error: storeError } = await service
    .from("stores")
    .insert({
      name: app.store_name,
      status: "ACTIVE",
      plan_code: "Free",
      owner_id: ownerId,
      email: app.email,
      phone: app.phone,
    })
    .select()
    .single();

  if (storeError || !store) {
    return { ok: false, message: storeError?.message ?? "매장 생성 실패" };
  }

  await service.from("profiles").upsert({
    id: ownerId,
    email: app.email,
    full_name: app.applicant_name,
    role: "STORE_OWNER",
    store_id: store.id,
  });

  await service.from("store_members").upsert(
    { store_id: store.id, profile_id: ownerId, role: "STORE_OWNER" },
    { onConflict: "store_id,profile_id" },
  );

  // 승인 후 신청 이력 삭제 — 매장관리(stores)에만 남김
  await service.from("onboarding_applications").delete().eq("id", id);

  revalidatePath("/admin/store-admissions");
  revalidatePath("/admin/stores");

  return { ok: true, message: "승인 완료. 신청자는 가입 시 설정한 비밀번호로 로그인할 수 있습니다." };
};

/** Supabase(service): 입점 신청 반려 — 신청·계정 삭제 (재신청 가능) */
export const onRejectApplication = async (id: string): Promise<ActionResult> => {
  await requireSuperAdmin();
  const service = createServiceClient();

  const { data: app } = await service
    .from("onboarding_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!app) return { ok: false, message: "신청을 찾을 수 없습니다." };
  if (app.status !== "PENDING") {
    return { ok: false, message: "이미 처리된 신청입니다." };
  }

  const { error: deleteError } = await service.from("onboarding_applications").delete().eq("id", id);
  if (deleteError) return { ok: false, message: deleteError.message };

  if (app.user_id) {
    await service.from("profiles").delete().eq("id", app.user_id);
    await service.auth.admin.deleteUser(app.user_id);
  }

  revalidatePath("/admin/store-admissions");
  return { ok: true, message: "반려 처리되었습니다." };
};
