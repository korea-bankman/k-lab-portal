import Link from "next/link";
import { BoardNav } from "@/components/board-nav";
import { JobList } from "@/components/job-list";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { Sidebar } from "@/components/sidebar";
import { getJobs, getPopularPosts, getPosts } from "@/lib/data/repository";
import { getSupabaseJobs } from "@/lib/data/supabase-repository";

export default async function HomePage() {
  const supabaseJobs = await getSupabaseJobs({ sort: "latest", limit: 5 });
  const todayJobs = supabaseJobs.length > 0 ? supabaseJobs : getJobs({ sort: "latest", limit: 5 });
  const popularPosts = getPopularPosts(6);
  const latestPosts = getPosts({ limit: 7 });

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white px-5 py-4 shadow-soft">
        <p className="text-sm font-bold text-brand-700">대한민국 임상병리사 전문 포털</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">커뮤니티와 채용정보를 한 곳에서 확인하세요.</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_1fr_280px]">
        <BoardNav />
        <div className="space-y-5">
          <Section title="오늘의 채용공고" action={<Link className="text-sm font-semibold text-brand-700" href="/jobs">전체보기</Link>}>
            <JobList jobs={todayJobs} />
          </Section>
          <Section title="전체 인기글" action={<Link className="text-sm font-semibold text-brand-700" href="/boards/free">게시판 이동</Link>}>
            <PostList posts={popularPosts} />
          </Section>
          <Section title="최신글">
            <PostList posts={latestPosts} />
          </Section>
          <Section title="카테고리 바로가기">
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {["진단검사의학", "생리기능", "초음파", "취업상담"].map((label) => (
                <Link key={label} href={label === "취업상담" ? "/boards/career" : "/boards/hematology"} className="rounded-md border px-4 py-3 font-semibold hover:border-brand-500 hover:text-brand-700">
                  {label}
                </Link>
              ))}
            </div>
          </Section>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
