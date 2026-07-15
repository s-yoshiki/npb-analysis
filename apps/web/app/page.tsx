import { ArrowRight, Database, Search, Sparkles } from "lucide-react";
import Link from "next/link";
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
import { npbQueryService } from "@/modules/npb/composition";

export const revalidate = 86400;

export default async function Home() {
  const { summary, teams, trends } = npbQueryService.getDashboard();
  const databaseReady = npbQueryService.isDatabaseReady();

  return (
    <AppShell label="Dashboard">
      <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,var(--foreground)_0%,oklch(0.29_0.09_245)_100%)] text-background shadow-[0_30px_70px_-35px_color-mix(in_oklab,var(--foreground)_80%,transparent)] ring-1 ring-white/10">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute -right-16 -top-24 size-80 rounded-full bg-primary/35 blur-3xl" />
        <div className="absolute bottom-0 right-10 hidden h-3/4 w-px bg-gradient-to-b from-transparent via-background/25 to-transparent lg:block" />
        <CardContent className="relative px-6 py-10 sm:px-10 sm:py-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-end lg:gap-16">
          <div>
            <Badge
              className="mb-6 h-7 border-background/20 bg-background/10 px-3 text-background backdrop-blur"
              variant="outline"
            >
              <Sparkles className="mr-1 size-3" />
              公式記録から読み解く選手データ
            </Badge>
            <h1 className="max-w-4xl font-heading text-3xl font-black leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              数字から辿る、
              <br />
              <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">
                日本野球の記憶。
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-background/65 sm:text-base">
              NPB歴代選手の打撃・投手成績を、検索・集計・グラフで横断できるデータアーカイブです。
            </p>
          </div>
          <div className="mt-10 rounded-2xl border border-background/15 bg-background/10 p-2 shadow-2xl backdrop-blur-md lg:mt-0">
            <PlayerSearchForm defaultValue="" />
            <Link
              className={buttonVariants({
                className:
                  "mt-2 w-full justify-between border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background",
                variant: "outline",
              })}
              href="/players"
            >
              すべての選手を見る <ArrowRight className="size-4" />
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
        <div className="mb-5 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="section-kicker">At a glance</p>
            <h2 className="mt-1 font-heading text-2xl font-black tracking-tight">
              データベース概要
            </h2>
          </div>
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Search className="size-4" />
          </span>
        </div>
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
