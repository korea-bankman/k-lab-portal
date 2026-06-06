import Link from "next/link";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { getCurrentUser, getPosts } from "@/lib/data/repository";

export default function MyPage() {
  const user = getCurrentUser();
  const myPosts = getPosts().filter((post) => post.authorId === user.id);

  return (
    <div className="container-page py-6">
      <div className="grid gap-5 md:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border bg-white p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-700">
            {user.nickname.slice(0, 1)}
          </div>
          <h1 className="mt-4 text-xl font-black">{user.nickname}</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p>권한: {user.role}</p>
            <p>분야: {user.department}</p>
            <p>지역: {user.region}</p>
          </div>
          <Link className="mt-5 block rounded-md bg-brand-600 px-4 py-2 text-center font-bold text-white" href="/posts/new">
            글쓰기
          </Link>
        </aside>
        <Section title="내가 쓴 글">
          <PostList posts={myPosts} />
        </Section>
      </div>
    </div>
  );
}
