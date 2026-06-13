import Link from "next/link";
import { assignManagerBoardAction, removeManagerBoardAction, updateUserRoleAction } from "@/app/actions/admin";
import { createManualJobAction } from "@/app/actions/jobs";
import { getAllProfiles, getManagerBoardPermissions } from "@/lib/auth/admin-data";
import { getBoards, getJobSources, getJobs, getPosts } from "@/lib/data/repository";
import { getSignedInProfile } from "@/lib/auth/profile";
import { getSupabaseBoards } from "@/lib/data/supabase-repository";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const profile = await getSignedInProfile();

  if (!profile) {
    return (
      <div className="container-page py-10">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-black">관리자 로그인이 필요합니다</h1>
          <p className="mt-2 text-slate-600">관리자 페이지는 로그인한 관리자만 접근할 수 있습니다.</p>
          <Link href="/login" className="mt-5 inline-block rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (profile.role !== "admin") {
    return (
      <div className="container-page py-10">
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-2xl font-black">접근 권한이 없습니다</h1>
          <p className="mt-2 text-slate-600">현재 계정은 {profile.role} 권한입니다. 관리자 권한이 있는 계정만 이 페이지를 볼 수 있습니다.</p>
          <Link href="/" className="mt-5 inline-block rounded-md border px-5 py-2.5 font-bold">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    ["게시판", getBoards().length],
    ["게시글", getPosts().length],
    ["채용공고", getJobs().length],
    ["채용 소스", getJobSources().length]
  ];
  const profiles = await getAllProfiles();
  const managers = profiles.filter((item) => item.role === "manager" || item.role === "admin");
  const supabaseBoards = await getSupabaseBoards();
  const boards = supabaseBoards.length > 0 ? supabaseBoards : getBoards();
  const permissions = await getManagerBoardPermissions();

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <h1 className="text-2xl font-black">관리자 페이지</h1>
        <p className="mt-1 text-sm text-slate-500">{profile.nickname} 관리자 계정으로 접속 중입니다.</p>
        {message && <p className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">{message}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-white p-5">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-brand-700">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border bg-white">
          <h2 className="border-b px-5 py-3 font-bold">관리 메뉴</h2>
          <div className="grid gap-2 p-5">
            <Link href="/manager" className="rounded-md border px-4 py-3 font-semibold hover:border-brand-500 hover:text-brand-700">매니저 콘솔</Link>
            {["게시글 신고 관리", "공지사항 작성"].map((item) => (
              <button key={item} className="rounded-md border px-4 py-3 text-left font-semibold text-slate-500">{item} 준비 중</button>
            ))}
          </div>
        </section>
        <section className="rounded-lg border bg-white">
          <h2 className="border-b px-5 py-3 font-bold">채용 데이터 소스</h2>
          <div className="divide-y">
            {getJobSources().map((source) => (
              <div key={source.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{source.name}</p>
                    <p className="text-sm text-slate-500">{source.baseUrl}</p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-1 text-sm">{source.apiReady ? "API 준비" : "수동/크롤링 후보"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-lg border bg-white">
        <h2 className="border-b px-5 py-3 font-bold">채용공고 수동 등록</h2>
        <form action={createManualJobAction} className="grid gap-3 p-5 md:grid-cols-2">
          <input name="hospitalName" className="rounded-md border px-3 py-2" placeholder="병원명" required />
          <input name="department" className="rounded-md border px-3 py-2" placeholder="모집분야 예: 임상병리사" required />
          <input name="region" className="rounded-md border px-3 py-2" placeholder="지역 예: 서울" required />
          <input name="experience" className="rounded-md border px-3 py-2" placeholder="경력조건 예: 경력무관" />
          <input name="employmentType" className="rounded-md border px-3 py-2" placeholder="고용형태 예: 정규직" />
          <input name="deadline" type="date" className="rounded-md border px-3 py-2" required />
          <input name="originalUrl" className="rounded-md border px-3 py-2 md:col-span-2" placeholder="원문 URL" required />
          <textarea name="description" className="h-24 rounded-md border p-3 md:col-span-2" placeholder="공고 내용 요약" />
          <button className="rounded-md bg-brand-600 px-4 py-2 font-bold text-white md:col-span-2">채용공고 등록</button>
        </form>
      </section>
      <section className="mt-5 rounded-lg border bg-white">
        <h2 className="border-b px-5 py-3 font-bold">회원 권한 관리</h2>
        <div className="divide-y">
          {profiles.map((item) => (
            <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-bold">{item.nickname}</p>
                <p className="text-sm text-slate-500">{item.email}</p>
              </div>
              <form action={updateUserRoleAction} className="flex gap-2">
                <input type="hidden" name="userId" value={item.id} />
                <select name="role" defaultValue={item.role} className="rounded-md border px-3 py-2 text-sm">
                  <option value="member">member</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
                <button className="rounded-md bg-brand-600 px-3 py-2 text-sm font-bold text-white">변경</button>
              </form>
            </div>
          ))}
          {profiles.length === 0 && <p className="p-5 text-sm text-slate-500">회원 목록을 불러오지 못했습니다. Supabase 권한 정책을 확인해 주세요.</p>}
        </div>
      </section>
      <section className="mt-5 rounded-lg border bg-white">
        <h2 className="border-b px-5 py-3 font-bold">매니저 담당 게시판</h2>
        <form action={assignManagerBoardAction} className="grid gap-2 border-b p-5 md:grid-cols-[1fr_1fr_auto]">
          <select name="managerId" className="rounded-md border px-3 py-2" defaultValue="">
            <option value="" disabled>매니저 선택</option>
            {managers.map((item) => (
              <option key={item.id} value={item.id}>{item.nickname} ({item.role})</option>
            ))}
          </select>
          <select name="boardId" className="rounded-md border px-3 py-2" defaultValue="">
            <option value="" disabled>게시판 선택</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
          <button className="rounded-md bg-brand-600 px-4 py-2 font-bold text-white">지정</button>
        </form>
        <div className="divide-y">
          {permissions.map((permission) => {
            const manager = profiles.find((item) => item.id === permission.managerId);
            return (
              <div key={permission.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm">
                  <span className="font-bold">{manager?.nickname ?? "매니저"}</span>
                  <span className="text-slate-500"> 담당 게시판 </span>
                  <span className="font-bold text-brand-700">{permission.boardName}</span>
                </p>
                <form action={removeManagerBoardAction}>
                  <input type="hidden" name="permissionId" value={permission.id} />
                  <button className="rounded-md border px-3 py-2 text-sm font-bold text-red-600">해제</button>
                </form>
              </div>
            );
          })}
          {permissions.length === 0 && <p className="p-5 text-sm text-slate-500">아직 지정된 매니저 게시판이 없습니다.</p>}
        </div>
      </section>
      <Link href="/" className="mt-5 inline-block text-sm font-bold text-brand-700">홈으로 돌아가기</Link>
    </div>
  );
}
