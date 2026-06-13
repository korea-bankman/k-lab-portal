import Link from "next/link";
import { hidePostAction } from "@/app/actions/posts";
import { resolveReportAction } from "@/app/actions/reports";
import { getManagerBoardPermissions } from "@/lib/auth/admin-data";
import { getSignedInProfile } from "@/lib/auth/profile";
import { getOpenReports, getSupabasePosts } from "@/lib/data/supabase-repository";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const profile = await getSignedInProfile();

  if (!profile) {
    return (
      <div className="container-page py-10">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-black">매니저 로그인이 필요합니다</h1>
          <p className="mt-2 text-slate-600">매니저 콘솔은 로그인 후 이용할 수 있습니다.</p>
          <Link href="/login" className="mt-5 inline-block rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white">로그인하기</Link>
        </div>
      </div>
    );
  }

  if (profile.role !== "manager" && profile.role !== "admin") {
    return (
      <div className="container-page py-10">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-black">접근 권한이 없습니다</h1>
          <p className="mt-2 text-slate-600">매니저 또는 관리자 권한이 있는 계정만 이 페이지를 볼 수 있습니다.</p>
          <Link href="/" className="mt-5 inline-block rounded-md border px-5 py-2.5 font-bold">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const permissions = profile.role === "admin" ? await getManagerBoardPermissions() : await getManagerBoardPermissions(profile.id);
  const boardIds = [...new Set(permissions.map((permission) => permission.boardId))];
  const manageablePosts = (
    await Promise.all(boardIds.map((boardId) => getSupabasePosts({ boardId, limit: 8 })))
  )
    .flat()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 20);
  const openReports = await getOpenReports({
    boardIds: profile.role === "admin" ? undefined : boardIds,
    limit: 30
  });

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <p className="text-sm font-bold text-brand-700">Manager Console</p>
        <h1 className="mt-1 text-2xl font-black">매니저 콘솔</h1>
        <p className="mt-1 text-sm text-slate-500">{profile.nickname} 계정으로 접속 중입니다. 담당 게시판의 신고, 숨김, 댓글 관리 기능이 이곳에 붙습니다.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-md bg-brand-50 p-3">
            <p className="text-xs font-bold text-brand-700">담당 게시판</p>
            <p className="mt-1 text-2xl font-black">{permissions.length}</p>
          </div>
          <div className="rounded-md bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-700">열린 신고</p>
            <p className="mt-1 text-2xl font-black">{openReports.length}</p>
          </div>
          <div className="rounded-md bg-slate-100 p-3">
            <p className="text-xs font-bold text-slate-600">관리 대상 글</p>
            <p className="mt-1 text-2xl font-black">{manageablePosts.length}</p>
          </div>
        </div>
      </div>
      <section className="mb-5 rounded-lg border bg-white">
        <h2 className="border-b px-5 py-3 font-bold">신고 접수함</h2>
        <div className="divide-y">
          {openReports.map((report) => (
            <div key={report.id} className="grid gap-3 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded bg-amber-100 px-2 py-1 font-bold text-amber-800">신고</span>
                  <Link href={`/posts/${report.postId}`} className="font-bold hover:text-brand-700">{report.postTitle}</Link>
                  {report.commentId && <span className="text-slate-500">댓글 신고</span>}
                </div>
                <p className="mt-2 text-sm text-slate-700">{report.reason}</p>
                <p className="mt-1 text-xs text-slate-500">{report.reporterName} · {formatDate(report.createdAt)}</p>
              </div>
              <form action={resolveReportAction}>
                <input type="hidden" name="reportId" value={report.id} />
                <button className="rounded-md bg-slate-800 px-3 py-2 text-sm font-bold text-white">처리 완료</button>
              </form>
            </div>
          ))}
          {openReports.length === 0 && <p className="p-5 text-sm text-slate-500">열린 신고가 없습니다.</p>}
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border bg-white">
          <h2 className="border-b px-5 py-3 font-bold">담당 게시판</h2>
          <div className="divide-y">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-bold">{permission.boardName}</p>
                  <p className="text-sm text-slate-500">/{permission.boardSlug}</p>
                </div>
                <Link href={`/boards/${permission.boardSlug}`} className="rounded-md border px-3 py-2 text-sm font-bold">게시판 보기</Link>
              </div>
            ))}
            {permissions.length === 0 && <p className="p-5 text-sm text-slate-500">아직 담당 게시판이 없습니다. 관리자에게 게시판 권한을 요청하세요.</p>}
          </div>
        </section>
        <section className="rounded-lg border bg-white">
          <h2 className="border-b px-5 py-3 font-bold">최근 관리 대상 게시글</h2>
          <div className="divide-y">
            {manageablePosts.map((post) => (
              <div key={post.id} className="grid gap-3 p-5">
                <div>
                  <Link href={`/posts/${post.id}`} className="font-bold hover:text-brand-700">{post.title}</Link>
                  <p className="mt-1 text-xs text-slate-500">{post.authorName} · {formatDate(post.createdAt)} · 댓글 {post.commentCount}</p>
                </div>
                <form action={hidePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button className="rounded-md border px-3 py-2 text-sm font-bold text-red-600">게시글 숨김</button>
                </form>
              </div>
            ))}
            {manageablePosts.length === 0 && <p className="p-5 text-sm text-slate-500">관리할 Supabase 게시글이 아직 없습니다.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
