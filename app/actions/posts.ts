"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function withMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function createPostAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/posts/new", "Supabase 연결을 먼저 확인해 주세요."));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withMessage("/login", "글쓰기는 로그인 후 이용할 수 있습니다."));
  }

  const boardId = getString(formData, "boardId");
  const title = getString(formData, "title");
  const content = getString(formData, "content");

  if (!boardId || !title || !content) {
    redirect(withMessage("/posts/new", "게시판, 제목, 내용을 모두 입력해 주세요."));
  }

  if (boardId.startsWith("board-")) {
    redirect(withMessage("/posts/new", "Supabase SQL Editor에서 docs/supabase-seed.sql을 먼저 실행해 게시판 초기 데이터를 넣어 주세요."));
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      board_id: boardId,
      author_id: user.id,
      title,
      content
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(withMessage("/posts/new", `게시글 저장에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}`));
  }

  revalidatePath("/");
  revalidatePath("/boards/[boardSlug]", "page");
  redirect(`/posts/${data.id}`);
}
