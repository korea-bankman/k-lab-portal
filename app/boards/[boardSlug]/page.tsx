import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardNav } from "@/components/board-nav";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { Sidebar } from "@/components/sidebar";
import { getBoardBySlug, getPosts } from "@/lib/data/repository";
import { getSupabaseBoardBySlug, getSupabasePosts } from "@/lib/data/supabase-repository";

export default async function BoardPage({ params, searchParams }: { params: Promise<{ boardSlug: string }>; searchParams: Promise<{ q?: string }> }) {
  const { boardSlug } = await params;
  const { q } = await searchParams;
  const supabaseBoard = await getSupabaseBoardBySlug(boardSlug);
  const board = supabaseBoard ?? getBoardBySlug(boardSlug);
  if (!board) notFound();
  const supabasePosts = supabaseBoard ? await getSupabasePosts({ boardId: supabaseBoard.id, query: q }) : [];
  const boardPosts = supabaseBoard ? supabasePosts : getPosts({ boardId: board.id, query: q });

  return (
    <div className="container-page py-6">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr_280px]">
        <BoardNav activeSlug={board.slug} />
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-black">{board.name}</h1>
                <p className="mt-1 text-sm text-slate-500">{board.description}</p>
              </div>
              <Link href="/posts/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white">
                글쓰기
              </Link>
            </div>
          </div>
          <Section title={q ? `"${q}" 검색 결과` : "게시글 목록"}>
            <PostList posts={boardPosts} />
          </Section>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
