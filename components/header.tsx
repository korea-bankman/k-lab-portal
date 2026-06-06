import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { getSignedInProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const user = supabase
    ? await supabase.auth
        .getUser()
        .then((result) => result.data.user)
        .catch(() => null)
    : null;
  const profile = user ? await getSignedInProfile() : null;

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="container-page flex flex-col gap-3 py-3 md:flex-row md:items-center">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight text-brand-700">
            K-Lab Portal
          </Link>
          {user ? (
            <Link className="rounded-md border px-3 py-1.5 text-sm font-semibold md:hidden" href="/mypage">
              마이페이지
            </Link>
          ) : (
            <div className="flex gap-2 md:hidden">
              <Link className="rounded-md border px-3 py-1.5 text-sm font-semibold" href="/login">
                로그인
              </Link>
              <Link className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white" href="/signup">
                가입
              </Link>
            </div>
          )}
        </div>
        <form action="/boards/free" className="flex flex-1">
          <input
            name="q"
            placeholder="게시글, 태그, 채용공고 통합 검색"
            className="w-full rounded-l-md border border-r-0 px-4 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button className="rounded-r-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">검색</button>
        </form>
        <nav className="hidden items-center gap-2 text-sm md:flex">
          <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/boards/free">
            게시판
          </Link>
          <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/jobs">
            채용
          </Link>
          {profile?.role === "manager" || profile?.role === "admin" ? (
            <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/manager">
              매니저
            </Link>
          ) : null}
          {profile?.role === "admin" ? (
            <Link className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/admin">
              관리자
            </Link>
          ) : null}
          {user ? (
            <>
              <Link className="rounded-md border px-3 py-2 font-semibold" href="/mypage">
                마이페이지
              </Link>
              <form action={signOutAction}>
                <button className="rounded-md bg-slate-800 px-3 py-2 font-semibold text-white">로그아웃</button>
              </form>
            </>
          ) : (
            <>
              <Link className="rounded-md border px-3 py-2 font-semibold" href="/login">
                로그인
              </Link>
              <Link className="rounded-md bg-brand-600 px-3 py-2 font-semibold text-white" href="/signup">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
