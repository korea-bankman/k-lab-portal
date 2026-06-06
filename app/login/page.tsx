import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-8">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black">로그인</h1>
        <p className="mt-2 text-sm text-slate-500">Supabase Auth와 연결되면 실제 계정으로 로그인합니다.</p>
        {message && <p className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">{message}</p>}
        <form action={loginAction} className="mt-6 space-y-4">
          <input name="email" className="w-full rounded-md border px-4 py-3" type="email" placeholder="이메일" required />
          <input name="password" className="w-full rounded-md border px-4 py-3" type="password" placeholder="비밀번호" required />
          <button className="w-full rounded-md bg-brand-600 py-3 font-bold text-white">로그인</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          아직 계정이 없나요? <Link className="font-bold text-brand-700" href="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
