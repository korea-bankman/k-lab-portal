"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedInProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

function isAssignableRole(role: string): role is Exclude<UserRole, "guest"> {
  return role === "member" || role === "manager" || role === "admin";
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await getSignedInProfile();
  if (actor?.role !== "admin") {
    redirect(withMessage("/admin", "관리자만 회원 권한을 변경할 수 있습니다."));
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/admin", "Supabase 연결을 확인해 주세요."));
  }

  const userId = getString(formData, "userId");
  const role = getString(formData, "role");

  if (!userId || !isAssignableRole(role)) {
    redirect(withMessage("/admin", "회원 또는 권한 값이 올바르지 않습니다."));
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) {
    redirect(withMessage("/admin", `권한 변경 실패: ${error.message}`));
  }

  revalidatePath("/admin");
  redirect(withMessage("/admin", "회원 권한을 변경했습니다."));
}

export async function assignManagerBoardAction(formData: FormData) {
  const actor = await getSignedInProfile();
  if (actor?.role !== "admin") {
    redirect(withMessage("/admin", "관리자만 매니저 게시판을 지정할 수 있습니다."));
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/admin", "Supabase 연결을 확인해 주세요."));
  }

  const managerId = getString(formData, "managerId");
  const boardId = getString(formData, "boardId");

  if (!managerId || !boardId) {
    redirect(withMessage("/admin", "매니저와 게시판을 모두 선택해 주세요."));
  }

  const { error } = await supabase.from("manager_board_permissions").upsert(
    {
      manager_id: managerId,
      board_id: boardId
    },
    { onConflict: "manager_id,board_id" }
  );

  if (error) {
    redirect(withMessage("/admin", `매니저 게시판 지정 실패: ${error.message}`));
  }

  revalidatePath("/admin");
  revalidatePath("/manager");
  redirect(withMessage("/admin", "매니저 담당 게시판을 지정했습니다."));
}

export async function removeManagerBoardAction(formData: FormData) {
  const actor = await getSignedInProfile();
  if (actor?.role !== "admin") {
    redirect(withMessage("/admin", "관리자만 매니저 게시판 권한을 해제할 수 있습니다."));
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/admin", "Supabase 연결을 확인해 주세요."));
  }

  const permissionId = getString(formData, "permissionId");
  if (!permissionId) {
    redirect(withMessage("/admin", "해제할 권한을 찾지 못했습니다."));
  }

  const { error } = await supabase.from("manager_board_permissions").delete().eq("id", permissionId);
  if (error) {
    redirect(withMessage("/admin", `매니저 게시판 권한 해제 실패: ${error.message}`));
  }

  revalidatePath("/admin");
  revalidatePath("/manager");
  redirect(withMessage("/admin", "매니저 게시판 권한을 해제했습니다."));
}
