import { AppShell } from "@/components/app-shell";
import { PlayerResults } from "@/components/dashboard/player-results";
import { PlayerSearchForm } from "@/components/dashboard/player-search-form";
import { PlayerPagination } from "@/components/players/player-pagination";
import { Badge } from "@/components/ui/badge";
import { getPlayersPage } from "@/lib/npb-db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const requestedPage = parsePage(params?.page);
  const result = getPlayersPage({
    page: requestedPage,
    pageSize: PAGE_SIZE,
    query,
  });

  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <AppShell label="Players">
      <section className="rounded-2xl border bg-card px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        <Badge className="mb-4" variant="outline">
          Player Search
        </Badge>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
              選手一覧・検索
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              選手名・かなで検索し、通算成績の概要から各選手の詳細ページへ移動できます。
            </p>
          </div>
          <PlayerSearchForm defaultValue={query} />
        </div>
      </section>

      <PlayerResults
        description={
          query
            ? `「${query}」の検索結果 ${start}-${end} 件目`
            : `${start}-${end} 件目を表示`
        }
        pageSummary={
          <PlayerPagination
            page={result.page}
            query={query}
            totalPages={result.totalPages}
          />
        }
        players={result.players}
        query={query}
        total={result.total}
      />
    </AppShell>
  );
}
