import Link from "next/link";
import type { Job } from "@/lib/types/domain";
import { daysUntil, formatDate } from "@/lib/utils";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="divide-y">
      {jobs.map((job) => {
        const dDay = daysUntil(job.deadline);
        return (
          <Link key={job.id} href={`/jobs/${job.id}`} className="block px-4 py-3 hover:bg-slate-50">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-slate-900">{job.hospitalName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {job.department} · {job.region} · {job.experience} · {job.employmentType}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{formatDate(job.deadline)}</span>
                <span className="rounded bg-brand-600 px-2 py-1 font-bold text-white">{dDay >= 0 ? `D-${dDay}` : "마감"}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
