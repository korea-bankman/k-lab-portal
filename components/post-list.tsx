import Link from "next/link";
import type { Post } from "@/lib/types/domain";
import { formatDate } from "@/lib/utils";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="divide-y">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`} className="block px-4 py-3 hover:bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {post.isNotice && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700">공지</span>}
                <p className="truncate font-semibold text-slate-900">{post.title}</p>
                <span className="text-sm font-medium text-brand-600">[{post.commentCount}]</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{post.authorName}</span>
                <span>조회 {post.viewCount}</span>
                <span>좋아요 {post.likeCount}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
            <div className="hidden shrink-0 gap-1 md:flex">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
      {posts.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">게시글이 없습니다.</p>}
    </div>
  );
}
