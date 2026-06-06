import Link from "next/link";
import { getBoards, getJobSources, getJobs, getPosts } from "@/lib/data/repository";
import { getSignedInProfile } from "@/lib/auth/profile";

export default async function AdminPage() {
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

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <h1 className="text-2xl font-black">관리자 페이지</h1>
        <p className="mt-1 text-sm text-slate-500">{profile.nickname} 관리자 계정으로 접속 중입니다.</p>
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
            {["게시글 신고 관리", "공지사항 작성", "채용공고 수동 등록", "회원 권한 관리"].map((item) => (
              <button key={item} className="rounded-md border px-4 py-3 text-left font-semibold hover:border-brand-500 hover:text-brand-700">{item}</button>
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
      <Link href="/" className="mt-5 inline-block text-sm font-bold text-brand-700">홈으로 돌아가기</Link>
    </div>
  );
}
