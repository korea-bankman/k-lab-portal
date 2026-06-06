import Link from "next/link";
import { boardGroups, getBoards } from "@/lib/data/repository";
import { cx } from "@/lib/utils";

export function BoardNav({ activeSlug }: { activeSlug?: string }) {
  const boards = getBoards();
  return (
    <aside className="rounded-lg border bg-white">
      {Object.entries(boardGroups).map(([group, label]) => (
        <div key={group} className="border-b last:border-b-0">
          <div className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">{label}</div>
          <div className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
            {boards
              .filter((board) => board.group === group)
              .map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.slug}`}
                  className={cx(
                    "rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700",
                    activeSlug === board.slug && "bg-brand-50 font-bold text-brand-700"
                  )}
                >
                  {board.name}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
