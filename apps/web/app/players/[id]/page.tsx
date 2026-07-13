import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import {
  BattingTrendChart,
  PitchingTrendChart,
  type ChartPoint,
} from "@/components/player-charts";
import { PlayerProfileCard } from "@/components/player/player-profile-card";
import {
  battingColumns,
  pitchingColumns,
} from "@/components/player/player-stat-columns";
import { PlayerStatTable } from "@/components/player/player-stat-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, sumNumeric } from "@/lib/format";
import {
  getPlayerDetail,
  type BattingStatRow,
  type PitchingStatRow,
} from "@/lib/npb-db";
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function weightedEra(rows: PitchingStatRow[]): number | null {
  const innings = sumNumeric(rows, "innings");
  if (!innings) {
    return null;
  }

  const weighted = rows.reduce(
    (total, row) => total + (row.era ?? 0) * (row.innings ?? 0),
    0,
  );
  return weighted / innings;
}

function toBattingChart(rows: BattingStatRow[]): ChartPoint[] {
  return rows
    .filter((row) => row.season !== null)
    .map((row) => ({
      season: row.season as number,
      hits: row.hits,
      homeRuns: row.home_runs,
      rbi: row.rbi,
    }));
}

function toPitchingChart(rows: PitchingStatRow[]): ChartPoint[] {
  return rows
    .filter((row) => row.season !== null)
    .map((row) => ({
      season: row.season as number,
      wins: row.wins,
      strikeouts: row.strikeouts,
      era: row.era,
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = getPlayerDetail(id);

  return {
    title: detail
      ? `${detail.profile.name} | NPB Analysis`
      : "Player | NPB Analysis",
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getPlayerDetail(id);

  if (!detail) {
    notFound();
  }

  const { profile, batting, pitching } = detail;
  const battingYears = batting.filter((row) => row.season !== null).length;
  const pitchingYears = pitching.filter((row) => row.season !== null).length;

  return (
    <AppShell label="Player File">
      <Card className="overflow-hidden border-foreground/15 bg-foreground text-background shadow-none">
        <CardContent className="px-6 py-8 sm:px-10 sm:py-12">
          <Link
            className={buttonVariants({ className: "mb-10 text-background/65 hover:bg-background/10 hover:text-background", variant: "ghost" })}
            href="/players"
          >
            一覧へ戻る
          </Link>
          <Button>AAA</Button>
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <Badge className="mb-5 border-background/20 bg-background/10 text-background" variant="outline">
                Player file / {profile.id}
              </Badge>
              <h1 className="font-heading text-5xl font-black leading-[0.96] tracking-[-0.05em] sm:text-7xl">
                {profile.name}
              </h1>
              <p className="mt-4 text-sm tracking-[.08em] text-background/55 sm:text-base">
                {profile.kana || profile.id}
              </p>
            </div>
            <a
              className={buttonVariants({
                variant: "outline",
                className: "w-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background md:w-auto",
              })}
              href={profile.player_url}
              target="_blank"
              rel="noreferrer"
            >
              NPB公式ページ
            </a>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="打撃年数"
          value={formatNumber(battingYears)}
          helper={`${formatNumber(sumNumeric(batting, "games"))} games`}
        />
        <MetricCard
          label="通算安打"
          value={formatNumber(sumNumeric(batting, "hits"))}
          helper={`${formatNumber(sumNumeric(batting, "home_runs"))} HR`}
        />
        <MetricCard
          label="投手年数"
          value={formatNumber(pitchingYears)}
          helper={`${formatNumber(sumNumeric(pitching, "games"))} games`}
        />
        <MetricCard
          label="通算勝利"
          value={formatNumber(sumNumeric(pitching, "wins"))}
          helper={`ERA ${formatNumber(weightedEra(pitching), 2)}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <PlayerProfileCard detailJson={profile.detail_json} />
        <div className="grid gap-4">
          <BattingTrendChart data={toBattingChart(batting)} />
          <PitchingTrendChart data={toPitchingChart(pitching)} />
        </div>
      </section>

      <Tabs className="space-y-4" defaultValue="batting">
        <TabsList>
          <TabsTrigger value="batting">打撃成績</TabsTrigger>
          <TabsTrigger value="pitching">投手成績</TabsTrigger>
        </TabsList>
        <TabsContent value="batting">
          <PlayerStatTable
            columns={battingColumns}
            rows={batting}
            title="打撃成績"
          />
        </TabsContent>
        <TabsContent value="pitching">
          <PlayerStatTable
            columns={pitchingColumns}
            rows={pitching}
            title="投手成績"
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
