import { ArrowRight, Database } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  SeasonSparkline,
  TeamDistribution,
} from "@/components/dashboard/dashboard-charts";
import { PlayerSearchForm } from "@/components/dashboard/player-search-form";
import { MetricCard } from "@/components/metric-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { npbQueryService } from "@/modules/npb/composition";

export const revalidate = 86400;

export default async function Home() {
  const { summary, teams, trends } = npbQueryService.getDashboard();
  const databaseReady = npbQueryService.isDatabaseReady();

  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,26rem)] lg:items-start">
        <div>
          <p className="section-kicker">NPB player archive</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            数字から辿る、日本野球の記憶。
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            NPB公式記録をもとに、歴代選手の打撃・投手成績を検索・集計・可視化するデータアーカイブです。
          </p>
        </div>

        <Card>
          <CardContent className="grid gap-3">
            <h2 className="text-sm font-medium">選手を検索する</h2>
            <PlayerSearchForm defaultValue="" />
            <Link
              className={buttonVariants({
                className: "w-full justify-between",
                size: "lg",
                variant: "outline",
              })}
              href="/players"
            >
              すべての選手を見る
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {databaseReady ? null : (
        <Card className="border-warning/40">
          <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Database aria-hidden="true" className="size-4 text-warning" />
            <strong className="font-medium">
              データベースがまだ作成されていません。
            </strong>
            <span className="text-muted-foreground">
              次のコマンドで取り込みを実行してください。
            </span>
            <code className="rounded-md bg-muted px-2 py-1 text-xs">
              pnpm --filter npb-analysis run scrape -- --delay 300
            </code>
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="summary-heading">
        <div className="mb-4 border-b border-border pb-3">
          <p className="section-kicker">At a glance</p>
          <h2
            className="mt-1 text-xl font-semibold tracking-tight"
            id="summary-heading"
          >
            データベース概要
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            helper={`${summary.firstSeason}〜${summary.lastSeason}年`}
            label="選手数"
            unit="人"
            value={formatNumber(summary.players)}
          />
          <MetricCard
            helper={`対象 ${formatNumber(summary.hitters)}人`}
            label="打撃成績"
            unit="件"
            value={formatNumber(summary.battingRows)}
          />
          <MetricCard
            helper={`対象 ${formatNumber(summary.pitchers)}人`}
            label="投手成績"
            unit="件"
            value={formatNumber(summary.pitchingRows)}
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
