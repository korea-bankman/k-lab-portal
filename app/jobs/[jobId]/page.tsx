import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/data/repository";
import { getSupabaseJobById } from "@/lib/data/supabase-repository";
import { daysUntil, formatDate } from "@/lib/utils";

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getSupabaseJobById(jobId) ?? getJobById(jobId);
  if (!job) notFound();
  const dDay = daysUntil(job.deadline);

  return (
    <div className="container-page py-6">
      <div className="rounded-lg border bg-white">
        <div className="border-b p-5">
          <Link href="/jobs" className="text-sm font-bold text-brand-700">채용공고</Link>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-black">{job.hospitalName}</h1>
              <p className="mt-2 text-slate-600">{job.department} 임상병리사 모집</p>
            </div>
            <span className="w-fit rounded bg-brand-600 px-3 py-2 font-black text-white">{dDay >= 0 ? `D-${dDay}` : "마감"}</span>
          </div>
        </div>
        <dl className="grid gap-0 border-b md:grid-cols-2">
          {[
            ["모집분야", job.department],
            ["지역", job.region],
            ["경력조건", job.experience],
            ["고용형태", job.employmentType],
            ["마감일", formatDate(job.deadline)],
            ["출처 사이트", job.sourceName]
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[110px_1fr] border-b px-5 py-3 last:border-b-0 md:border-r">
              <dt className="font-bold text-slate-600">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="p-5">
          <h2 className="font-bold">공고 내용</h2>
          <p className="mt-3 leading-7 text-slate-700">{job.description}</p>
          <a href={job.originalUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white">
            원문 공고 보기
          </a>
        </div>
      </div>
    </div>
  );
}
