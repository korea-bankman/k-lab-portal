import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "K-Lab Portal",
  description: "대한민국 임상병리사 및 검사실 종사자를 위한 전문 커뮤니티 및 채용 포털"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="mt-12 border-t bg-white">
          <div className="container-page flex flex-col gap-2 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© 2026 K-Lab Portal. Clinical laboratory community MVP.</p>
            <div className="flex gap-4">
              <Link href="/boards/notice">공지사항</Link>
              <Link href="/jobs">채용공고</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
