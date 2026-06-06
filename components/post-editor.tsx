import Link from "next/link";
import { getBoards } from "@/lib/data/repository";
import type { Post } from "@/lib/types/domain";

export function PostEditor({ mode, post }: { mode: "new" | "edit"; post?: Post }) {
  const boards = getBoards();

  return (
    <div className="container-page py-6">
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-2xl font-black">{mode === "new" ? "게시글 작성" : "게시글 수정"}</h1>
        <form className="mt-5 space-y-4">
          <select className="w-full rounded-md border px-4 py-3" defaultValue={post?.boardId ?? "board-free"}>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
          <input className="w-full rounded-md border px-4 py-3" placeholder="제목" defaultValue={post?.title} />
          <textarea className="h-80 w-full rounded-md border p-4" placeholder="내용" defaultValue={post?.content} />
          <input className="w-full rounded-md border px-4 py-3" placeholder="태그: 쉼표로 구분" defaultValue={post?.tags.join(", ")} />
          <div className="flex gap-2">
            <button className="rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white">{mode === "new" ? "등록" : "저장"}</button>
            <Link href={post ? `/posts/${post.id}` : "/boards/free"} className="rounded-md border px-5 py-2.5 font-bold">취소</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
