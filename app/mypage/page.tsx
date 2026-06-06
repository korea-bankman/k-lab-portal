import Link from "next/link";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { getCurrentUser, getPosts } from "@/lib/data/repository";
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const mockUser = getCurrentUser();
  const displayUser = authUser
    ? {
        email: authUser.email ?? "",
        nickname: String(authUser.user_metadata.nickname ?? authUser.email ?? "회원"),
        role: "member",
        department: String(authUser.user_metadata.department ?? "미설정"),
        region: "미설정"
      }
    : mockUser;
  const myPosts = getPosts().filter((post) => post.authorId === mockUser.id);

  return (
    <div className="container-page py-6">
      {supabase && !authUser && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          로그인하면 실제 계정 정보가 표시됩니다. 지금은 예시 프로필을 보여주고 있습니다.
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border bg-white p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-700">
            {displayUser.nickname.slice(0, 1)}
          </div>
          <h1 className="mt-4 text-xl font-black">{displayUser.nickname}</h1>
          <p className="mt-1 text-sm text-slate-500">{displayUser.email}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p>권한: {displayUser.role}</p>
            <p>분야: {displayUser.department}</p>
            <p>지역: {displayUser.region}</p>
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
