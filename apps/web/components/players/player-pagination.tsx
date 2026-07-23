import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageHref(page: number, searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/players?${qs}` : "/players";
}

function getVisiblePages(current: number, total: number) {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

export function PlayerPagination({
  page,
  searchParams,
  totalPages,
}: {
  page: number;
  searchParams: Record<string, string>;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="選手一覧ページネーション"
      className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        {page} / {totalPages} ページ
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
          href={pageHref(page - 1, searchParams)}
        >
          前へ
        </Link>
        {pages.map((visiblePage, index) => {
          const previous = pages[index - 1];
          const needsGap = previous !== undefined && visiblePage - previous > 1;

          return (
            <span className="flex items-center gap-2" key={visiblePage}>
              {needsGap ? (
                <span
                  aria-hidden="true"
                  className="px-1 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : null}
              <Link
                aria-current={visiblePage === page ? "page" : undefined}
                aria-label={`${visiblePage}ページ目`}
                className={buttonVariants({
                  size: "lg",
                  variant: visiblePage === page ? "default" : "outline",
                })}
                href={pageHref(visiblePage, searchParams)}
              >
                {visiblePage}
              </Link>
            </span>
          );
        })}
        <Link
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
          href={pageHref(page + 1, searchParams)}
        >
          次へ
        </Link>
      </div>
    </nav>
  );
}
