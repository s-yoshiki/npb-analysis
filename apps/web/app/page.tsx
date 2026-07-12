import { AppShell } from "@/components/app-shell";
import {
  SeasonSparkline,
  TeamDistribution,
} from "@/components/dashboard/dashboard-charts";
import { PlayerResults } from "@/components/dashboard/player-results";
import { PlayerSearchForm } from "@/components/dashboard/player-search-form";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import {
  getPlayers,
  getSeasonTrends,
  getSummary,
  getTopTeams,
  hasDatabase,
} from "@/lib/npb-db";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const summary = getSummary();
  const players = getPlayers(query);
  const trends = getSeasonTrends();
  const teams = getTopTeams();
  const databaseReady = hasDatabase();

  return (
    <AppShell label="SQLite / Recharts / shadcn/ui">
      <section className="rounded-2xl border bg-card px-5 py-8 shadow-sm sm:px-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-end lg:gap-10">
        <div>
          <Badge className="mb-4" variant="outline">
            NPB Player Database
          </Badge>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            NPB全選手データを検索・集計・可視化
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            npb.jp
            の選手ページをSQLiteへ取り込み、歴代選手の打撃・投手成績を一覧とチャートで確認できます。
          </p>
        </div>
        <div className="mt-8 lg:mt-0">
          <PlayerSearchForm defaultValue={query} />
        </div>
      </section>

      {!databaseReady ? (
        <Card className="border-chart-3/30 bg-chart-3/10">
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            <strong>DBがまだ作成されていません。</strong>
            <code className="rounded-md bg-background px-2 py-1 font-mono text-xs">
              pnpm --filter npb-analysis run import-json
            </code>
            <span>または全件取得なら</span>
            <code className="rounded-md bg-background px-2 py-1 font-mono text-xs">
              pnpm --filter npb-analysis run scrape -- --delay 300
            </code>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="選手数"
          value={formatNumber(summary.players)}
          helper={`${formatNumber(summary.firstSeason)} - ${formatNumber(summary.lastSeason)}`}
        />
        <MetricCard
          label="打撃成績"
          value={formatNumber(summary.battingRows)}
          helper={`${formatNumber(summary.hitters)} players`}
        />
        <MetricCard
          label="投手成績"
          value={formatNumber(summary.pitchingRows)}
          helper={`${formatNumber(summary.pitchers)} players`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SeasonSparkline trends={trends} />
        <TeamDistribution teams={teams} />
      </section>

      <PlayerResults players={players} query={query} />
    </AppShell>
  );
}
