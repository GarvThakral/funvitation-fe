import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function InfoPageLayout({
  title,
  subtitle,
  children,
}: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff6e6_0%,_#fef9d8_42%,_#f3ffd9_100%)] text-[var(--play-ink)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="rounded-full border border-[#e99497]/50 bg-white px-4 py-2 text-sm font-medium hover:bg-[#fff0f0]"
          >
            Back Home
          </Link>
          <Link
            to="/editor"
            className="rounded-full border border-[#b3e283] bg-[#f7ffe9] px-4 py-2 text-sm font-medium text-[#3f6630] hover:bg-[#edffd2]"
          >
            Open Editor
          </Link>
        </div>

        <div className="mt-10 rounded-[28px] border border-[#f3c583]/55 bg-white/95 p-8 shadow-xl shadow-[#f3c583]/15">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c86d75]">
            funvitation
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f2c28]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6a645a]">{subtitle}</p>
          <div className="mt-8 space-y-8 text-sm leading-7 text-[#4a453d]">{children}</div>
        </div>
      </div>
    </div>
  );
}
