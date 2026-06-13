import Link from "next/link";
import { JobList } from "@/components/job-list";
import { PostList } from "@/components/post-list";
import { Section } from "@/components/section";
import { getJobs, getPosts } from "@/lib/data/repository";
import { getSupabaseJobs, getSupabasePosts } from "@/lib/data/supabase-repository";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const supabasePosts = query ? await getSupabasePosts({ query, limit: 20 }) : [];
  const posts = supabasePosts.length > 0 ? supabasePosts : query ? getPosts({ query, limit: 20 }) : [];
  const supabaseJobs = await getSupabaseJobs({ sort: "latest", limit: 50 });
  const jobPool = supabaseJobs.length > 0 ? supabaseJobs : getJobs({ sort: "latest", limit: 50 });
  const jobs = query
    ? jobPool.filter((job) => `${job.hospitalName} ${job.department} ${job.region} ${job.description}`.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <p className="text-sm font-bold text-brand-700">통합 검색</p>
        <h1 className="mt-1 text-2xl font-black">{query ? `"${query}" 검색 결과` : "검색어를 입력해 주세요"}</h1>
        <form action="/search" className="mt-4 flex">
          <input name="q" defaultValue={query} className="w-full rounded-l-md border border-r-0 px-4 py-2" placeholder="게시글, 태그, 채용공고 검색" />
          <button className="rounded-r-md bg-brand-600 px-5 py-2 font-bold text-white">검색</button>
        </form>
      </div>
      <div className="space-y-5">
        <Section title={`게시글 ${posts.length}건`} action={<Link href="/boards/free" className="text-sm font-bold text-brand-700">게시판으로</Link>}>
          <PostList posts={posts} />
        </Section>
        <Section title={`채용공고 ${jobs.length}건`} action={<Link href="/jobs" className="text-sm font-bold text-brand-700">채용으로</Link>}>
          <JobList jobs={jobs} />
        </Section>
      </div>
    </div>
  );
}
