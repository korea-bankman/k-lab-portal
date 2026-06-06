import Link from "next/link";
import { getPopularTags, getPosts, getRecentComments } from "@/lib/data/repository";

export function Sidebar() {
  const notices = getPosts({ noticesOnly: true, limit: 3 });
  const comments = getRecentComments();
  const tags = getPopularTags();

  return (
    <aside className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-bold">공지사항</h2>
        <div className="mt-3 space-y-2">
          {notices.map((notice) => (
            <Link key={notice.id} href={`/posts/${notice.id}`} className="block truncate text-sm text-slate-600 hover:text-brand-700">
              {notice.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-bold">최근 댓글</h2>
        <div className="mt-3 space-y-2">
          {comments.map((comment) => (
            <Link key={comment.id} href={`/posts/${comment.postId}`} className="block text-sm text-slate-600 hover:text-brand-700">
              <span className="font-semibold">{comment.authorName}</span> · {comment.content}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-bold">인기 태그</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.name} className="rounded-full bg-brand-50 px-2.5 py-1 text-sm font-medium text-brand-700">
              #{tag.name} {tag.count}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
