import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AppShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--primary),transparent_82%),transparent_36%),linear-gradient(180deg,color-mix(in_oklch,var(--card),transparent_4%),transparent)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <header className="mb-10 flex items-center justify-between gap-4 border-b pb-4">
          <Link
            className="text-sm font-black tracking-[0.12em] text-primary"
            href="/"
          >
            NPB ANALYSIS
          </Link>
          {label ? (
            <Badge variant="secondary" className="shrink-0">
              {label}
            </Badge>
          ) : null}
        </header>
        <div className="w-full space-y-6 sm:space-y-8">{children}</div>
      </div>
    </main>
  );
}
