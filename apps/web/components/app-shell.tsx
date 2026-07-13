import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { NavLinks } from "@/components/nav-links";

export function AppShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Link className="group flex items-center gap-3" href="/">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)]">
              <ChartNoAxesCombined className="size-4" strokeWidth={2.4} />
            </span>
            <span className="hidden leading-none md:block">
              <strong className="block font-heading text-sm tracking-[-0.02em]">
                NPB ANALYSIS
              </strong>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Player archive
              </span>
            </span>
          </Link>
          <NavLinks />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
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
