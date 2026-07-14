import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RankingFilterForm } from "@/components/rankings/ranking-filter-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatRate } from "@/lib/format";
import { formatLeague } from "@/lib/league";
import { getRankingSeasons, getRankings, getRankingTeams } from "@/lib/npb-db";
import {
  rankingMetrics,
  type RankingCategory,
  type RankingLeague,
  type RankingMetric,
  type RankingProfileFilters,
  type RankingScope,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

function optionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const seasons = getRankingSeasons();
  const category: RankingCategory =
    params.category === "pitching" ? "pitching" : "batting";
  const scope: RankingScope = params.scope === "career" ? "career" : "season";
  const league: RankingLeague =
    params.league === "central" || params.league === "pacific"
      ? params.league
      : "all";
  const availableMetrics = rankingMetrics[category];
  const metric = availableMetrics.some((item) => item.value === params.metric)
    ? (params.metric as RankingMetric)
    : availableMetrics[0]!.value;
  const season =
    Number(params.season) || seasons[0] || new Date().getFullYear();
  const teams = getRankingTeams({ category, league, scope, season });
  const team = teams.includes(params.team ?? "") ? params.team : undefined;
  const definition = availableMetrics.find((item) => item.value === metric)!;
  const filters: RankingProfileFilters = {
    name: params.name?.trim() || undefined,
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
  const hasDetailedFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );
  const rows = getRankings({
    category,
    league,
    metric,
    scope,
    season,
    team,
    filters,
  }).slice(0, 100);

  return (
    <AppShell label="Rankings">
      <Card className="relative bg-card/85">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-chart-2" />
        <CardContent className="px-3 py-4 sm:px-5 sm:py-6">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            League leaderboard
          </Badge>
          <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-3xl">
            ランキング
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardContent className="py-6">
          <RankingFilterForm
            category={category}
            filters={filters}
            league={league}
            metric={metric}
            scope={scope}
            season={season}
            seasons={seasons}
            team={team}
            teams={teams}
          />
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-black">
            {scope === "season" ? `${season}年度` : "通算"}・
            {team ?? (league === "all" ? "全リーグ" : formatLeague(league))}{" "}
            {definition.label}
          </CardTitle>
          <CardDescription>
            DB収録データを対象に上位100名を表示
            {hasDetailedFilters ? "（詳細条件で絞り込み中）" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">順位</TableHead>
                  <TableHead>選手</TableHead>
                  <TableHead className="text-right">
                    {definition.label}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.playerId}>
                    <TableCell className="font-heading text-lg font-black">
                      {row.rank}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="font-bold hover:text-primary"
                        href={`/players/${row.playerId}`}
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {definition.rate
                        ? formatRate(row.value)
                        : formatNumber(row.value, definition.digits)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
