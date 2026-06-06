import Link from "next/link";
import { getManagerBoardPermissions } from "@/lib/auth/admin-data";
import { getSignedInProfile } from "@/lib/auth/profile";

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

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <p className="text-sm font-bold text-brand-700">Manager Console</p>
        <h1 className="mt-1 text-2xl font-black">매니저 콘솔</h1>
        <p className="mt-1 text-sm text-slate-500">{profile.nickname} 계정으로 접속 중입니다. 담당 게시판의 신고, 숨김, 댓글 관리 기능이 이곳에 붙습니다.</p>
      </div>
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
          <h2 className="border-b px-5 py-3 font-bold">다음 관리 기능</h2>
          <div className="grid gap-2 p-5">
            {["신고된 게시글 처리", "댓글 숨김/복구", "게시글 숨김/복구", "공지글 작성", "인기글 고정"].map((item) => (
              <button key={item} className="rounded-md border px-4 py-3 text-left font-semibold text-slate-500">{item} 준비 중</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
