import { AppShell } from "@/components/app-shell";
import { PlayerResults } from "@/components/dashboard/player-results";
import { PlayerSearchForm } from "@/components/dashboard/player-search-form";
import { PlayerPagination } from "@/components/players/player-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <AppShell label="Player Index">
      <Card className="relative bg-card/85">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-chart-2" />
        <CardContent className="px-3 py-4 sm:px-5 sm:py-6">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            Player archive
          </Badge>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-end">
            <div>
              <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-3xl">
                選手を探す
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                選手名・かなで検索し、通算成績の概要から各選手の詳細ページへ移動できます。
              </p>
            </div>
            <PlayerSearchForm defaultValue={query} />
          </div>
        </CardContent>
      </Card>

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
