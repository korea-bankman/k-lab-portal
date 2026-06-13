import Link from "next/link";
import type { Job } from "@/lib/types/domain";
import { daysUntil, formatDate } from "@/lib/utils";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid gap-2 p-3 md:gap-0 md:divide-y md:p-0">
      {jobs.map((job) => {
        const dDay = daysUntil(job.deadline);
        return (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-md border bg-white p-3 hover:border-brand-300 hover:bg-slate-50 md:rounded-none md:border-0 md:px-4 md:py-3">
            <div className="flex gap-3 md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 md:block">
                  <p className="line-clamp-2 font-bold text-slate-900 md:truncate">{job.hospitalName}</p>
                  <span className="shrink-0 rounded bg-brand-600 px-2 py-1 text-xs font-bold text-white md:hidden">{dDay >= 0 ? `D-${dDay}` : "마감"}</span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-brand-700">{job.department}</p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-600 md:mt-1 md:text-sm">
                  <span className="rounded bg-slate-100 px-2 py-1 md:bg-transparent md:px-0 md:py-0">{job.region}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 md:bg-transparent md:px-0 md:py-0">{job.experience}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 md:bg-transparent md:px-0 md:py-0">{job.employmentType}</span>
                </div>
              </div>
              <div className="hidden items-center gap-2 text-sm md:flex">
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{formatDate(job.deadline)}</span>
                <span className="rounded bg-brand-600 px-2 py-1 font-bold text-white">{dDay >= 0 ? `D-${dDay}` : "마감"}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500 md:hidden">마감 {formatDate(job.deadline)}</p>
          </Link>
        );
      })}
      {jobs.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">채용공고가 없습니다.</p>}
    </div>
  );
}
