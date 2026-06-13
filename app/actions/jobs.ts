"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedInProfile } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function createManualJobAction(formData: FormData) {
  const actor = await getSignedInProfile();
  if (actor?.role !== "admin") {
    redirect(withMessage("/admin", "관리자만 채용공고를 등록할 수 있습니다."));
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect(withMessage("/admin", "Supabase service role 환경변수를 확인해 주세요."));
  }

  const hospitalName = getString(formData, "hospitalName");
  const department = getString(formData, "department");
  const region = getString(formData, "region");
  const experience = getString(formData, "experience") || "경력무관";
  const employmentType = getString(formData, "employmentType") || "고용형태 미확인";
  const deadline = getString(formData, "deadline");
  const originalUrl = getString(formData, "originalUrl");
  const description = getString(formData, "description");

  if (!hospitalName || !department || !region || !deadline || !originalUrl) {
    redirect(withMessage("/admin", "병원명, 분야, 지역, 마감일, 원문 URL은 필수입니다."));
  }

  const { data: existingSource } = await admin
    .from("job_sources")
    .select("id")
    .eq("name", "관리자 수동 등록")
    .maybeSingle();

  const { data: source, error: sourceError } = existingSource?.id
    ? { data: existingSource, error: null }
    : await admin
        .from("job_sources")
        .insert({
          name: "관리자 수동 등록",
          base_url: "https://k-lab-portal.local",
          api_ready: false,
          last_synced_at: new Date().toISOString()
        })
        .select("id")
        .single();

  if (sourceError || !source?.id) {
    redirect(withMessage("/admin", `채용 소스 생성 실패: ${sourceError?.message ?? "알 수 없는 오류"}`));
  }

  const { error } = await admin.from("jobs").insert({
    hospital_name: hospitalName,
    department,
    region,
    experience,
    employment_type: employmentType,
    deadline,
    original_url: originalUrl,
    source_id: source.id,
    description: description || `${hospitalName} ${department} 채용공고입니다.`
  });

  if (error) {
    redirect(withMessage("/admin", `채용공고 등록 실패: ${error.message}`));
  }

  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/admin");
  redirect(withMessage("/admin", "채용공고를 등록했습니다."));
}
