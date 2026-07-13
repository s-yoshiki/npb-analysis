import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";

export function AppShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="group flex items-center gap-3" href="/">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--background),0_0_0_5px_color-mix(in_oklab,var(--foreground)_12%,transparent)]">
              <ChartNoAxesCombined className="size-4" strokeWidth={2.4} />
            </span>
            <span className="leading-none">
              <strong className="block font-heading text-sm tracking-[-0.02em]">
                NPB ANALYSIS
              </strong>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Player archive
              </span>
            </span>
          </Link>
          <nav
            className="flex items-center gap-1"
            aria-label="メインナビゲーション"
          >
            <Link
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/"
            >
              概要
            </Link>
            <Link
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/players"
            >
              選手一覧
            </Link>
            <Link
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/rankings"
            >
              ランキング
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {label ? (
          <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span>NPB Archive</span>
            <ArrowUpRight className="size-3" />
            <span className="text-foreground">{label}</span>
          </div>
        ) : null}
        <div className="w-full space-y-8 sm:space-y-10">{children}</div>
      </div>
      <footer className="mt-16 border-t border-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>NPBの公開情報をもとにした非公式データアーカイブ</p>
          <p>NPB Analysis</p>
        </div>
      </footer>
    </main>
  );
}
