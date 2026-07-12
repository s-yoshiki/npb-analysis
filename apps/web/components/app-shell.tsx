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
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
            href="/"
          >
            NPB Analysis
          </Link>
          {label ? (
            <Badge className="shrink-0" variant="secondary">
              {label}
            </Badge>
          ) : null}
        </div>
      </header>
      <div className="container mx-auto flex w-full max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="w-full space-y-10 sm:space-y-12">{children}</div>
      </div>
    </main>
  );
}
