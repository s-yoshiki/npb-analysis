import { ChartNoAxesCombined } from "lucide-react";
import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

const footerLinks = {
  サイト: [
    { href: "/", label: "概要" },
    { href: "/players", label: "選手一覧" },
    { href: "/rankings", label: "ランキング" },
  ],
  データ出典: [
    {
      external: true,
      href: "https://npb.jp/bis/players/",
      label: "NPB 選手データ",
    },
  ],
};

export type Crumb = { href?: string; label: string };

function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            className="rounded transition-colors hover:text-foreground"
            href="/"
          >
            ホーム
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li className="flex items-center gap-2" key={crumb.label}>
            <span aria-hidden="true">/</span>
            {crumb.href && index < crumbs.length - 1 ? (
              <Link
                className="rounded transition-colors hover:text-foreground"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={index === crumbs.length - 1 ? "page" : undefined}
                className="text-foreground"
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AppShell({
  children,
  label,
}: {
  children: React.ReactNode;
  /** Trail below "ホーム". A bare string is the common single-crumb case. */
  label?: string | Crumb[];
}) {
  const crumbs = typeof label === "string" ? [{ label }] : (label ?? []);
  return (
    <div className="flex min-h-svh flex-col">
      {/* Keyboard users can jump the header nav on every page. */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
        href="#main"
      >
        本文へスキップ
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-(--header-height) w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            className="flex shrink-0 items-center gap-2.5 rounded-lg font-semibold tracking-tight"
            href="/"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ChartNoAxesCombined aria-hidden="true" className="size-4" />
            </span>
            <span className="hidden text-sm sm:inline">NPB Analysis</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <NavLinks />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
        id="main"
      >
        {crumbs.length ? <Breadcrumb crumbs={crumbs} /> : null}
        <div className="space-y-8">{children}</div>
      </main>

      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <div>
            <Link
              className="inline-flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
              href="/"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ChartNoAxesCombined aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm">NPB Analysis</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              NPBの公開情報をもとにした非公式のデータアーカイブです。
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, items]) => (
            <nav aria-label={heading} key={heading}>
              <h2 className="text-xs font-medium uppercase tracking-wider text-foreground">
                {heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {items.map((item) => (
                  <li key={item.href}>
                    {"external" in item && item.external ? (
                      <a
                        className="rounded transition-colors hover:text-foreground"
                        href={item.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {item.label}（新しいタブで開く）
                      </a>
                    ) : (
                      <Link
                        className="rounded transition-colors hover:text-foreground"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-border">
          <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
            © {new Date().getFullYear()} NPB Analysis
          </p>
        </div>
      </footer>
    </div>
  );
}
