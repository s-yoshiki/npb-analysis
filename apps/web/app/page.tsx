import { AppShell } from "@/components/app-shell";
import {
  SeasonSparkline,
  TeamDistribution,
} from "@/components/dashboard/dashboard-charts";
import { PlayerSearchForm } from "@/components/dashboard/player-search-form";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import {
  getSeasonTrends,
  getSummary,
  getTopTeams,
  hasDatabase,
} from "@/lib/npb-db";
import Link from "next/link";
import { ArrowRight, Database, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const summary = getSummary();
  const trends = getSeasonTrends();
  const teams = getTopTeams();
  const databaseReady = hasDatabase();

  return (
    <AppShell label="Dashboard">
      <Card className="relative overflow-hidden border-foreground/15 bg-foreground text-background shadow-[0_20px_60px_-35px_color-mix(in_oklab,var(--foreground)_70%,transparent)]">
        <div className="absolute -right-28 -top-36 size-80 rounded-full border-[52px] border-primary/60" />
        <CardContent className="relative px-6 py-10 sm:px-10 sm:py-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-end lg:gap-16">
          <div>
            <Badge className="mb-6 border-background/20 bg-background/10 text-background" variant="outline">
              公式記録から読み解く選手データ
            </Badge>
            <h1 className="max-w-4xl font-heading text-4xl font-black leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              数字から辿る、<br/><span className="text-primary">日本野球の記憶。</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-background/65 sm:text-base">
              NPB歴代選手の打撃・投手成績を、検索・集計・グラフで横断できるデータアーカイブです。
            </p>
          </div>
          <div className="mt-10 rounded-xl border border-background/15 bg-background/8 p-2 backdrop-blur lg:mt-0">
            <PlayerSearchForm defaultValue="" />
            <Link
              className={buttonVariants({
                className: "mt-2 w-full justify-between border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background",
                variant: "outline",
              })}
              href="/players"
            >
              すべての選手を見る <ArrowRight className="size-4"/>
            </Link>
          </div>
        </CardContent>
      </Card>

      {!databaseReady ? (
        <Card className="border-primary/25 bg-primary/8">
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            <Database className="size-4 text-primary" />
            <strong>DBがまだ作成されていません。</strong>
            <code className="rounded-md bg-background px-2 py-1 font-mono text-xs">
              pnpm --filter npb-analysis run scrape -- --delay 300
            </code>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <div className="mb-5 flex items-end justify-between border-b border-foreground/15 pb-3"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">At a glance</p><h2 className="mt-1 font-heading text-2xl font-black">データベース概要</h2></div><Search className="hidden size-5 text-muted-foreground sm:block"/></div>
        <div className="grid gap-3 sm:grid-cols-3">
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
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SeasonSparkline trends={trends} />
        <TeamDistribution teams={teams} />
      </section>
    </AppShell>
  );
}
