import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { formatLeague, type League } from "@/lib/league";
import { getRankingSeasons, getRankings, getRankingTeams } from "@/lib/npb-db";
import {
  rankingMetrics,
  type RankingCategory,
  type RankingMetric,
  type RankingScope,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function RankingsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const seasons = getRankingSeasons();
  const category: RankingCategory =
    params.category === "pitching" ? "pitching" : "batting";
  const scope: RankingScope = params.scope === "career" ? "career" : "season";
  const league: League = params.league === "pacific" ? "pacific" : "central";
  const availableMetrics = rankingMetrics[category];
  const metric = availableMetrics.some((item) => item.value === params.metric)
    ? (params.metric as RankingMetric)
    : availableMetrics[0]!.value;
  const season = Number(params.season) || seasons[0];
  const teams = getRankingTeams({ category, league, scope, season });
  const team = teams.includes(params.team ?? "") ? params.team : undefined;
  const definition = availableMetrics.find((item) => item.value === metric)!;
  const rows = getRankings({
    category,
    league,
    metric,
    scope,
    season,
    team,
  }).slice(0, 100);

  return (
    <AppShell label="Rankings">
      <Card className="border-foreground/15 bg-card/80 shadow-none">
        <CardContent className="px-6 py-8 sm:px-10 sm:py-12">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            League leaderboard
          </Badge>
          <h1 className="font-heading text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            ランキング
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。
          </p>
        </CardContent>
      </Card>

      <Card className="border-foreground/15 bg-card/80 shadow-none">
        <CardContent className="pt-6">
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              集計範囲
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
                defaultValue={scope}
                name="scope"
              >
                <option value="season">年度別</option>
                <option value="career">通算</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              球団
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
                defaultValue={team ?? ""}
                name="team"
              >
                <option value="">リーグ全体</option>
                {teams.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              年度
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground disabled:opacity-50"
                defaultValue={season}
                disabled={scope === "career"}
                name="season"
              >
                {seasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              リーグ
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
                defaultValue={league}
                name="league"
              >
                <option value="central">セ・リーグ</option>
                <option value="pacific">パ・リーグ</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              分類
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
                defaultValue={category}
                name="category"
              >
                <option value="batting">打撃</option>
                <option value="pitching">投手</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              指標
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"
                defaultValue={metric}
                name="metric"
              >
                {availableMetrics.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={buttonVariants({ className: "self-end" })}
              type="submit"
            >
              表示する
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-foreground/15 bg-card/80 shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-black">
            {scope === "season" ? `${season}年度` : "通算"}・
            {team ?? formatLeague(league)} {definition.label}
          </CardTitle>
          <CardDescription>DB収録データを対象に上位100名を表示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-foreground/10">
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
                        : formatNumber(row.value)}
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
