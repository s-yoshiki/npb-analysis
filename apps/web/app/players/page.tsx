import { AppShell } from "@/components/app-shell";
import { PlayerResults } from "@/components/dashboard/player-results";
import { PlayerFilterForm } from "@/components/players/player-filter-form";
import { PlayerPagination } from "@/components/players/player-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPlayersPage, type PlayerFilters } from "@/lib/npb-db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

function optionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const requestedPage = parsePage(params.page);
  const filters: PlayerFilters = {
    throws:
      params.throws === "right" || params.throws === "left"
        ? params.throws
        : undefined,
    bats:
      params.bats === "right" ||
      params.bats === "left" ||
      params.bats === "both"
        ? params.bats
        : undefined,
    school: params.school?.trim() || undefined,
    draftYearMin: optionalNumber(params.draftYearMin),
    draftYearMax: optionalNumber(params.draftYearMax),
    draftRank: params.draftRank?.trim() || undefined,
    birthYearMin: optionalNumber(params.birthYearMin),
    birthYearMax: optionalNumber(params.birthYearMax),
    heightMin: optionalNumber(params.heightMin),
    heightMax: optionalNumber(params.heightMax),
  };
  const hasFilters =
    query || Object.values(filters).some((value) => value !== undefined);
  const result = getPlayersPage({
    filters,
    page: requestedPage,
    pageSize: PAGE_SIZE,
    query,
  });
  const paginationParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value?.trim()) paginationParams[key] = value;
  }

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
          <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-3xl">
            選手を探す
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            選手名・かなやプロフィール条件で絞り込み、通算成績の概要から各選手の詳細ページへ移動できます。
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardContent className="py-6">
          <PlayerFilterForm filters={filters} query={query} />
        </CardContent>
      </Card>

      <PlayerResults
        description={
          hasFilters
            ? `絞り込み結果 ${start}-${end} 件目`
            : `${start}-${end} 件目を表示`
        }
        pageSummary={
          <PlayerPagination
            page={result.page}
            searchParams={paginationParams}
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
