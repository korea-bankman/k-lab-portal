import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-8">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black">회원가입</h1>
        <form className="mt-6 space-y-4">
          <input className="w-full rounded-md border px-4 py-3" type="email" placeholder="이메일" />
          <input className="w-full rounded-md border px-4 py-3" placeholder="닉네임" />
          <select className="w-full rounded-md border px-4 py-3" defaultValue="">
            <option value="" disabled>관심 분야</option>
            <option>진단혈액</option>
            <option>임상화학</option>
            <option>분자진단</option>
            <option>생리기능</option>
            <option>초음파</option>
          </select>
          <input className="w-full rounded-md border px-4 py-3" type="password" placeholder="비밀번호" />
          <button className="w-full rounded-md bg-brand-600 py-3 font-bold text-white">가입하기</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          이미 계정이 있나요? <Link className="font-bold text-brand-700" href="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
