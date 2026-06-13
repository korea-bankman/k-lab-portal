import Link from "next/link";
import { markNotificationsReadAction } from "@/app/actions/notifications";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { getSignedInProfile } from "@/lib/auth/profile";
import { getCurrentUser, getPosts } from "@/lib/data/repository";
import { getSupabaseNotifications } from "@/lib/data/supabase-repository";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user: authUser }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const authProfile = await getSignedInProfile();
  const mockUser = getCurrentUser();
  const displayUser = authUser
    ? {
        email: authProfile?.email ?? authUser.email ?? "",
        nickname: authProfile?.nickname ?? String(authUser.user_metadata.nickname ?? authUser.email ?? "회원"),
        role: authProfile?.role ?? "member",
        department: authProfile?.department ?? String(authUser.user_metadata.department ?? "미설정"),
        region: authProfile?.region ?? "미설정"
      }
    : mockUser;
  const myPosts = getPosts().filter((post) => post.authorId === mockUser.id);
  const notifications = authUser ? await getSupabaseNotifications(authUser.id, 12) : [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="container-page py-6">
      {message && <p className="mb-5 rounded-md bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">{message}</p>}
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
          {displayUser.role === "manager" || displayUser.role === "admin" ? (
            <Link className="mt-2 block rounded-md border px-4 py-2 text-center font-bold" href="/manager">
              매니저 콘솔
            </Link>
          ) : null}
          {displayUser.role === "admin" ? (
            <Link className="mt-2 block rounded-md border px-4 py-2 text-center font-bold" href="/admin">
              관리자 페이지
            </Link>
          ) : null}
        </aside>
        <div className="space-y-5">
          <Section
            title={`알림 ${unreadCount > 0 ? `${unreadCount}개 안 읽음` : ""}`}
            action={
              authUser && notifications.length > 0 ? (
                <form action={markNotificationsReadAction}>
                  <button className="text-sm font-bold text-brand-700">모두 읽음</button>
                </form>
              ) : null
            }
          >
            <div className="divide-y">
              {notifications.map((notification) => {
                const content = (
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <div>
                      <p className={`text-sm ${notification.isRead ? "text-slate-500" : "font-bold text-slate-900"}`}>{notification.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && <span className="mt-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">NEW</span>}
                  </div>
                );

                return notification.linkUrl ? (
                  <Link key={notification.id} href={notification.linkUrl} className="block hover:bg-slate-50">
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
              {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">아직 알림이 없습니다.</p>}
            </div>
          </Section>
          <Section title="내가 쓴 글">
            <PostList posts={myPosts} />
          </Section>
        </div>
      </div>
    </div>
  );
}
