import type { ReactNode } from "react";

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
