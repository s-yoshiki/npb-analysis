import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
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
import {
  parseRankingParams,
  type RankingSearchParams,
} from "@/lib/ranking-params";
import { npbQueryService } from "@/modules/npb/composition";
import { formatLeague } from "@/modules/npb/domain/models/league";
import { rankingMetrics } from "@/modules/npb/domain/services/ranking-service";

const ROW_LIMIT = 100;

export const metadata: Metadata = {
  title: "ランキング",
  description:
    "年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。",
};

type PageProps = {
  searchParams: Promise<RankingSearchParams>;
};

export default async function RankingsPage({ searchParams }: PageProps) {
  const seasons = npbQueryService.getRankingSeasons();
  const params = parseRankingParams(await searchParams, seasons);
  const { category, filters, league, metric, scope, season, team } = params;
  const definition = rankingMetrics[category].find(
    (item) => item.value === metric,
  );

  if (!definition) return null;

  const teams = npbQueryService.getRankingTeams({
    category,
    league,
    scope,
    season,
  });
  const rows = npbQueryService
    .getRankings({
      category,
      filters,
      league,
      metric,
      scope,
      season,
      team,
    })
    .slice(0, ROW_LIMIT);

  const scopeLabel = scope === "career" ? "通算" : `${season}年度`;
  const leagueLabel = league === "all" ? "全リーグ" : formatLeague(league);

  return (
    <AppShell label="ランキング">
      <PageHeader
        description="年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。"
        kicker="League leaderboard"
        title="ランキング"
      />

      <Card>
        <CardContent>
          <Suspense fallback={null}>
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
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {scopeLabel}・{leagueLabel}
              {team ? `・${team}` : ""} {definition.label}
            </CardTitle>
            <CardDescription>
              上位{ROW_LIMIT}名まで表示します
              {definition.lowerIsBetter ? "（値が小さい順）" : ""}
            </CardDescription>
          </div>
          <Badge variant="secondary">{formatNumber(rows.length)}人</Badge>
        </CardHeader>
        <CardContent>
          {rows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-right">順位</TableHead>
                  <TableHead className="min-w-48">選手</TableHead>
                  {scope === "career" ? null : (
                    <TableHead className="min-w-28">リーグ</TableHead>
                  )}
                  <TableHead className="text-right">
                    {definition.label}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.playerId}:${row.season ?? "career"}`}>
                    <TableCell className="text-right font-medium">
                      {row.rank}
                    </TableCell>
                    <TableCell>
                      <a
                        className="font-medium transition-colors hover:text-primary"
                        href={`/players/${row.playerId}/`}
                      >
                        {row.name}
                      </a>
                    </TableCell>
                    {scope === "career" ? null : (
                      <TableCell className="text-muted-foreground">
                        {formatLeague(row.league)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {definition.rate
                        ? formatRate(row.value)
                        : formatNumber(row.value, definition.digits)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              条件に一致する記録がありません。条件を減らしてお試しください。
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
