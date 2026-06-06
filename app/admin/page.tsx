import Link from "next/link";
import { getBoards, getJobSources, getJobs, getPosts } from "@/lib/data/repository";

export default function AdminPage() {
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
        <p className="mt-1 text-sm text-slate-500">Mock 관리자 대시보드입니다. Supabase RLS와 role 기반 권한으로 확장하세요.</p>
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
