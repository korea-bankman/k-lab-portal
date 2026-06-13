"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationsReadAction() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/mypage?message=Supabase 연결을 확인해 주세요.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=로그인 후 알림을 확인할 수 있습니다.");
  }

  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
  revalidatePath("/mypage");
  redirect("/mypage?message=알림을 모두 읽음 처리했습니다.");
}
