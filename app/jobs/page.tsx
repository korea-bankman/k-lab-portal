import { JobList } from "@/components/job-list";
import { Section } from "@/components/section";
import { getJobs } from "@/lib/data/repository";
import { getSupabaseJobs } from "@/lib/data/supabase-repository";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ region?: string; department?: string; sort?: "latest" | "deadline" }> }) {
  const filters = await searchParams;
  const supabaseJobs = await getSupabaseJobs({
    region: filters.region,
    department: filters.department,
    sort: filters.sort ?? "latest"
  });
  const jobs = supabaseJobs.length > 0
    ? supabaseJobs
    : getJobs({
        region: filters.region,
        department: filters.department,
        sort: filters.sort ?? "latest"
      });
  const regions = ["서울", "경기", "부산", "대전", "광주", "인천", "대구", "울산", "강원", "제주"];
  const departments = ["진단혈액", "임상화학", "수혈", "진단미생물", "분자진단", "심전도", "폐기능", "진단면역", "초음파"];
  const quickFilters = [
    ["전체", "/jobs"],
    ["서울", "/jobs?region=서울"],
    ["경기", "/jobs?region=경기"],
    ["임상화학", "/jobs?department=임상화학"],
    ["진단혈액", "/jobs?department=진단혈액"],
    ["마감임박", "/jobs?sort=deadline"]
  ];

  return (
    <div className="container-page py-6">
      <div className="mb-5 rounded-lg border bg-white p-5">
        <h1 className="text-2xl font-black">채용공고</h1>
        <p className="mt-1 text-sm text-slate-500">지역과 분야만 빠르게 골라 보는 임상병리사 채용 목록입니다.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {quickFilters.map(([label, href]) => (
            <a key={label} href={href} className="shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold text-slate-700 hover:border-brand-500 hover:text-brand-700">
              {label}
            </a>
          ))}
        </div>
        <form className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select name="region" className="rounded-md border px-3 py-2" defaultValue={filters.region ?? ""}>
            <option value="">전체 지역</option>
            {regions.map((region) => <option key={region}>{region}</option>)}
          </select>
          <select name="department" className="rounded-md border px-3 py-2" defaultValue={filters.department ?? ""}>
            <option value="">전체 분야</option>
            {departments.map((department) => <option key={department}>{department}</option>)}
          </select>
          <select name="sort" className="rounded-md border px-3 py-2" defaultValue={filters.sort ?? "latest"}>
            <option value="latest">최신순</option>
            <option value="deadline">마감일순</option>
          </select>
          <button className="rounded-md bg-brand-600 px-5 py-2 font-bold text-white">필터 적용</button>
        </form>
      </div>
      <Section title={`채용공고 ${jobs.length}건`}>
        <JobList jobs={jobs} />
      </Section>
    </div>
  );
}
