import Link from "next/link";
import { boardGroups, getBoards } from "@/lib/data/repository";
import { cx } from "@/lib/utils";

export function BoardNav({ activeSlug }: { activeSlug?: string }) {
  const boards = getBoards();
  const primarySlugs = ["free", "qna", "career", "overseas", "graduate-research", "crc-cra-cro", "pathology", "notice"];
  const primaryBoards = boards.filter((board) => primarySlugs.includes(board.slug));
  const detailBoards = boards.filter((board) => !primarySlugs.includes(board.slug));

  return (
    <aside className="rounded-lg border bg-white">
      <div className="border-b">
        <div className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">주요 커뮤니티</div>
        <div className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
          {primaryBoards.map((board) => (
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
      <details className="group">
        <summary className="cursor-pointer list-none bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
          세부 분야 보기
        </summary>
        {Object.entries(boardGroups)
          .filter(([group]) => group !== "general")
          .map(([group, label]) => (
            <div key={group} className="border-t">
              <div className="px-4 py-2 text-xs font-bold text-slate-500">{label}</div>
              <div className="grid grid-cols-2 gap-1 p-2 md:grid-cols-1">
                {detailBoards
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
      </details>
    </aside>
  );
}
