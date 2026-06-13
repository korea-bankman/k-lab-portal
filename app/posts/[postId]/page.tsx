import Link from "next/link";
import { notFound } from "next/navigation";
import { addCommentAction, hideCommentAction, hidePostAction, togglePostLikeAction } from "@/app/actions/posts";
import { getSignedInProfile } from "@/lib/auth/profile";
import { getBoardBySlug, getBoards, getCommentsByPostId, getPostById } from "@/lib/data/repository";
import { getSupabaseBoards, getSupabaseCommentsByPostId, getSupabasePostById } from "@/lib/data/supabase-repository";
import { formatDate } from "@/lib/utils";

export default async function PostDetailPage({ params, searchParams }: { params: Promise<{ postId: string }>; searchParams: Promise<{ message?: string }> }) {
  const { postId } = await params;
  const { message } = await searchParams;
  const supabasePost = await getSupabasePostById(postId);
  const post = supabasePost ?? getPostById(postId);
  if (!post) notFound();
  const supabaseBoards = supabasePost ? await getSupabaseBoards() : [];
  const board = [...supabaseBoards, ...getBoards()].find((item) => item.id === post.boardId) ?? getBoardBySlug("free");
  const comments = supabasePost ? await getSupabaseCommentsByPostId(post.id) : getCommentsByPostId(post.id);
  const profile = await getSignedInProfile();
  const canModerate = profile?.role === "admin" || profile?.role === "manager";
  const canEdit = profile?.id === post.authorId || profile?.role === "admin";

  return (
    <div className="container-page py-6">
      {message && <p className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{message}</p>}
      <article className="rounded-lg border bg-white">
        <div className="border-b p-5">
          <Link className="text-sm font-bold text-brand-700" href={`/boards/${board?.slug ?? "free"}`}>
            {board?.name}
          </Link>
          <h1 className="mt-2 text-2xl font-black">{post.title}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>{post.authorName}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
            <span>좋아요 {post.likeCount}</span>
          </div>
        </div>
        <div className="min-h-64 whitespace-pre-line p-5 leading-7 text-slate-800">{post.content}</div>
        <div className="flex flex-wrap gap-2 border-t p-5">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">#{tag}</span>
          ))}
        </div>
        <div className="flex gap-2 border-t p-5">
          <form action={togglePostLikeAction}>
            <input type="hidden" name="postId" value={post.id} />
            <button className="rounded-md border px-4 py-2 text-sm font-bold">좋아요 {post.likeCount}</button>
          </form>
          {canEdit && <Link href={`/posts/${post.id}/edit`} className="rounded-md border px-4 py-2 text-sm font-bold">수정</Link>}
          {canModerate && (
            <form action={hidePostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <button className="rounded-md border px-4 py-2 text-sm font-bold text-red-600">숨김 처리</button>
            </form>
          )}
        </div>
      </article>
      <section className="mt-5 rounded-lg border bg-white">
        <h2 className="border-b px-5 py-3 font-bold">댓글 {comments.length}</h2>
        <div className="divide-y">
          {comments.map((comment) => (
            <div key={comment.id} className="p-5">
              <div className="flex justify-between text-sm">
                <strong>{comment.authorName}</strong>
                <span className="text-slate-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 text-slate-700">{comment.content}</p>
              {canModerate && supabasePost && (
                <form action={hideCommentAction} className="mt-3">
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="commentId" value={comment.id} />
                  <button className="text-xs font-bold text-red-600">댓글 숨김</button>
                </form>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="p-5 text-sm text-slate-500">아직 댓글이 없습니다.</p>}
        </div>
        <form action={addCommentAction} className="border-t p-5">
          <input type="hidden" name="postId" value={post.id} />
          <textarea name="content" className="h-24 w-full rounded-md border p-3" placeholder={profile ? "댓글을 입력하세요." : "로그인 후 댓글을 작성할 수 있습니다."} disabled={!profile} required />
          <button className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white">댓글 등록</button>
        </form>
      </section>
    </div>
  );
}
