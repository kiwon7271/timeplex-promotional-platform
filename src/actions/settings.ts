"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import type { ActionResult } from "@/types/action-result";

/** Supabase: consent_notices INSERT — 동의/고지 문구 생성 */
export const onCreateConsentNotice = async (formData: FormData): Promise<ActionResult> => {
  await requireSuperAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("consent_notices").insert({
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    version: String(formData.get("version") ?? "v1"),
    is_active: formData.get("is_active") === "on",
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
};

/** Supabase: consent_notices UPDATE — 동의/고지 문구 수정 */
export const onUpdateConsentNotice = async (formData: FormData): Promise<ActionResult> => {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createClient();
  const { error } = await supabase
    .from("consent_notices")
    .update({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      version: String(formData.get("version") ?? "v1"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
};

/** Supabase: consent_notices DELETE — 동의/고지 문구 삭제 */
export const onDeleteConsentNotice = async (id: string): Promise<ActionResult> => {
  await requireSuperAdmin();
  const supabase = createClient();
  const { error } = await supabase.from("consent_notices").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
};
