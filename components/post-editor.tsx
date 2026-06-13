import Link from "next/link";
import { createPostAction, updatePostAction } from "@/app/actions/posts";
import { getBoards } from "@/lib/data/repository";
import { getSupabaseBoards } from "@/lib/data/supabase-repository";
import type { Post } from "@/lib/types/domain";

export async function PostEditor({ mode, post, message }: { mode: "new" | "edit"; post?: Post; message?: string }) {
  const supabaseBoards = await getSupabaseBoards();
  const boards = supabaseBoards.length > 0 ? supabaseBoards : getBoards();

  return (
    <div className="container-page py-6">
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-2xl font-black">{mode === "new" ? "게시글 작성" : "게시글 수정"}</h1>
        {message && <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{message}</p>}
        {supabaseBoards.length === 0 && (
          <p className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-700">
            현재 게시판 목록은 Mock 데이터입니다. 실제 글 저장 전 Supabase SQL Editor에서 <strong>docs/supabase-seed.sql</strong>을 실행해 주세요.
          </p>
        )}
        <form action={mode === "new" ? createPostAction : updatePostAction} className="mt-5 space-y-4">
          {post && <input type="hidden" name="postId" value={post.id} />}
          <select name="boardId" className="w-full rounded-md border px-4 py-3" defaultValue={post?.boardId ?? boards[0]?.id}>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
          <input name="title" className="w-full rounded-md border px-4 py-3" placeholder="제목" defaultValue={post?.title} required />
          <textarea name="content" className="h-80 w-full rounded-md border p-4" placeholder="내용" defaultValue={post?.content} required />
          <input name="tags" className="w-full rounded-md border px-4 py-3" placeholder="태그: 쉼표로 구분" defaultValue={post?.tags.join(", ")} />
          <div className="flex gap-2">
            <button className="rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white">{mode === "new" ? "등록" : "저장"}</button>
            <Link href={post ? `/posts/${post.id}` : "/boards/free"} className="rounded-md border px-5 py-2.5 font-bold">취소</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
