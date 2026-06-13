"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  const { data: board } = await supabase.from("boards").select("slug").eq("id", boardId).maybeSingle();
  const boardSlug = board?.slug ?? "free";

  revalidatePath("/");
  revalidatePath(`/boards/${boardSlug}`);
  redirect(`/boards/${boardSlug}`);
}

export async function updatePostAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    redirect(withMessage("/", "Supabase 연결을 먼저 확인해 주세요."));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withMessage("/login", "게시글 수정은 로그인 후 이용할 수 있습니다."));
  }

  const postId = getString(formData, "postId");
  const boardId = getString(formData, "boardId");
  const title = getString(formData, "title");
  const content = getString(formData, "content");

  if (!postId || !boardId || !title || !content) {
    redirect(withMessage(`/posts/${postId || ""}/edit`, "게시판, 제목, 내용을 모두 입력해 주세요."));
  }

  const profile = await getSignedInProfile();
  const admin = createAdminClient();
  const { data: post } = admin
    ? await admin.from("posts").select("author_id").eq("id", postId).maybeSingle()
    : { data: null };

  if (post?.author_id !== user.id && profile?.role !== "admin") {
    redirect(withMessage(`/posts/${postId}`, "작성자 또는 관리자만 수정할 수 있습니다."));
  }

  const { error } = await supabase
    .from("posts")
    .update({
      board_id: boardId,
      title,
      content,
      updated_at: new Date().toISOString()
    })
    .eq("id", postId);

  if (error) {
    redirect(withMessage(`/posts/${postId}/edit`, `게시글 수정 실패: ${error.message}`));
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function addCommentAction(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    redirect(withMessage("/", "Supabase 연결을 확인해 주세요."));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withMessage("/login", "댓글은 로그인 후 작성할 수 있습니다."));
  }

  const postId = getString(formData, "postId");
  const content = getString(formData, "content");
  if (!postId || !content) {
    redirect(withMessage(`/posts/${postId || ""}`, "댓글 내용을 입력해 주세요."));
  }

  const { error } = await admin.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content
  });

  if (error) {
    redirect(withMessage(`/posts/${postId}`, `댓글 저장에 실패했습니다: ${error.message}`));
  }

  await refreshPostCommentCount(postId);
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function togglePostLikeAction(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    redirect(withMessage("/", "Supabase 연결을 확인해 주세요."));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(withMessage("/login", "좋아요는 로그인 후 이용할 수 있습니다."));
  }

  const postId = getString(formData, "postId");
  if (!postId) {
    redirect(withMessage("/", "게시글을 찾지 못했습니다."));
  }

  const { data: existing } = await admin
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await admin.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await admin.from("post_likes").insert({ post_id: postId, user_id: user.id });
  }

  await refreshPostLikeCount(postId);
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function hidePostAction(formData: FormData) {
  const actor = await getSignedInProfile();
  const admin = createAdminClient();
  const postId = getString(formData, "postId");

  if (!actor || !admin || !postId) {
    redirect(withMessage(`/posts/${postId || ""}`, "관리 권한 또는 Supabase 연결을 확인해 주세요."));
  }

  if (!(await canModeratePost(actor.id, actor.role, postId))) {
    redirect(withMessage(`/posts/${postId}`, "담당 매니저 또는 관리자만 숨김 처리할 수 있습니다."));
  }

  const { error } = await admin
    .from("posts")
    .update({ hidden_at: new Date().toISOString(), hidden_by: actor.id })
    .eq("id", postId);

  if (error) {
    redirect(withMessage(`/posts/${postId}`, `게시글 숨김 실패: ${error.message}`));
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/manager");
  redirect(withMessage("/manager", "게시글을 숨김 처리했습니다."));
}

export async function hideCommentAction(formData: FormData) {
  const actor = await getSignedInProfile();
  const admin = createAdminClient();
  const postId = getString(formData, "postId");
  const commentId = getString(formData, "commentId");

  if (!actor || !admin || !postId || !commentId) {
    redirect(withMessage(`/posts/${postId || ""}`, "관리 권한 또는 Supabase 연결을 확인해 주세요."));
  }

  if (!(await canModeratePost(actor.id, actor.role, postId))) {
    redirect(withMessage(`/posts/${postId}`, "담당 매니저 또는 관리자만 댓글을 숨김 처리할 수 있습니다."));
  }

  const { error } = await admin
    .from("comments")
    .update({ hidden_at: new Date().toISOString(), hidden_by: actor.id })
    .eq("id", commentId);

  if (error) {
    redirect(withMessage(`/posts/${postId}`, `댓글 숨김 실패: ${error.message}`));
  }

  await refreshPostCommentCount(postId);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/manager");
  redirect(`/posts/${postId}`);
}

async function canModeratePost(actorId: string, role: "member" | "manager" | "admin", postId: string) {
  if (role === "admin") return true;
  if (role !== "manager") return false;

  const admin = createAdminClient();
  if (!admin) return false;

  const { data: post } = await admin.from("posts").select("board_id").eq("id", postId).maybeSingle();
  if (!post?.board_id) return false;

  const { data: permission } = await admin
    .from("manager_board_permissions")
    .select("id")
    .eq("manager_id", actorId)
    .eq("board_id", post.board_id)
    .maybeSingle();

  return Boolean(permission);
}

async function refreshPostCommentCount(postId: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const { count } = await admin
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("hidden_at", null)
    .is("deleted_at", null);

  await admin.from("posts").update({ comment_count: count ?? 0 }).eq("id", postId);
}

async function refreshPostLikeCount(postId: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const { count } = await admin
    .from("post_likes")
    .select("post_id", { count: "exact", head: true })
    .eq("post_id", postId);

  await admin.from("posts").update({ like_count: count ?? 0 }).eq("id", postId);
}
