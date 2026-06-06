import { createClient } from "@/lib/supabase/server";

export type AuthProfile = {
  id: string;
  email: string;
  nickname: string;
  role: "member" | "manager" | "admin";
  department: string | null;
  region: string | null;
};

export async function getSignedInProfile() {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("id, email, nickname, role, department, region")
      .eq("id", user.id)
      .maybeSingle();

    if (!data) {
      return {
        id: user.id,
        email: user.email ?? "",
        nickname: String(user.user_metadata.nickname ?? user.email ?? "회원"),
        role: "member" as const,
        department: typeof user.user_metadata.department === "string" ? user.user_metadata.department : null,
        region: null
      };
    }

    return data as AuthProfile;
  } catch {
    return null;
  }
}

export function canManage(profile: AuthProfile | null) {
  return profile?.role === "admin" || profile?.role === "manager";
}
