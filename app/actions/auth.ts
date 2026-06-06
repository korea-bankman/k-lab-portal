"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/login", "Supabase 환경변수를 먼저 연결해야 로그인할 수 있습니다."));
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect(withMessage("/login", "이메일과 비밀번호를 입력해 주세요."));
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(withMessage("/login", "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요."));
  }

  redirect("/mypage");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/signup", "Supabase 환경변수를 먼저 연결해야 회원가입할 수 있습니다."));
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const nickname = getString(formData, "nickname");
  const department = getString(formData, "department");

  if (!email || !password || !nickname) {
    redirect(withMessage("/signup", "이메일, 닉네임, 비밀번호를 모두 입력해 주세요."));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        department
      }
    }
  });

  if (error) {
    redirect(withMessage("/signup", "회원가입에 실패했습니다. 이미 가입된 이메일인지 확인해 주세요."));
  }

  redirect(withMessage("/login", "회원가입 요청이 완료되었습니다. 이메일 확인 후 로그인해 주세요."));
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
