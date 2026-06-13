"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedInProfile } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function createReportAction(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    redirect(withMessage("/", "Supabase 연결을 확인해 주세요."));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withMessage("/login", "신고는 로그인 후 이용할 수 있습니다."));
  }

  const postId = getString(formData, "postId");
  const commentId = getString(formData, "commentId");
  const reason = getString(formData, "reason");

  if (!postId || !reason) {
    redirect(withMessage(`/posts/${postId || ""}`, "신고 사유를 입력해 주세요."));
  }

  const { error } = await admin.from("reports").insert({
    reporter_id: user.id,
    post_id: postId,
    comment_id: commentId || null,
    reason
  });

  if (error) {
    redirect(withMessage(`/posts/${postId}`, `신고 접수 실패: ${error.message}`));
  }

  revalidatePath("/manager");
  redirect(withMessage(`/posts/${postId}`, "신고가 접수되었습니다. 운영진이 확인하겠습니다."));
}

export async function resolveReportAction(formData: FormData) {
  const actor = await getSignedInProfile();
  if (!actor || (actor.role !== "admin" && actor.role !== "manager")) {
    redirect(withMessage("/manager", "매니저 또는 관리자만 신고를 처리할 수 있습니다."));
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(withMessage("/manager", "Supabase service role 환경변수를 확인해 주세요."));
  }

  const reportId = getString(formData, "reportId");
  if (!reportId) {
    redirect(withMessage("/manager", "처리할 신고를 찾지 못했습니다."));
  }

  const { data: report } = await admin
    .from("reports")
    .select("reporter_id, post_id")
    .eq("id", reportId)
    .maybeSingle();

  const { error } = await admin
    .from("reports")
    .update({
      status: "resolved",
      handled_by: actor.id,
      handled_at: new Date().toISOString()
    })
    .eq("id", reportId);

  if (error) {
    redirect(withMessage("/manager", `신고 처리 실패: ${error.message}`));
  }

  if (report?.reporter_id) {
    await admin.from("notifications").insert({
      user_id: report.reporter_id,
      title: "접수한 신고가 처리되었습니다.",
      link_url: report.post_id ? `/posts/${report.post_id}` : "/mypage"
    });
  }

  revalidatePath("/manager");
  revalidatePath("/mypage");
  redirect(withMessage("/manager", "신고를 처리 완료로 변경했습니다."));
}
