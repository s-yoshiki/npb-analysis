"use client";

import { Activity, BarChart3 } from "lucide-react";
import {
  PlayerMetricChart,
  type ChartMetric,
  type ChartPoint,
} from "@/components/player-charts";
import { PlayerLeagueRanks } from "@/components/player/player-league-ranks";
import {
  battingColumns,
  pitchingColumns,
} from "@/components/player/player-stat-columns";
import { PlayerStatTable } from "@/components/player/player-stat-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, formatRate } from "@/lib/format";
import type {
  BattingStat,
  PitchingStat,
} from "@/modules/npb/domain/models/player";
import type { PlayerLeagueRank } from "@/modules/npb/domain/services/league-ranking-service";
import type { RankingCategory } from "@/modules/npb/domain/services/ranking-service";

const battingMetrics: ChartMetric[] = [
  { key: "hits", label: "安打" },
  { key: "homeRuns", label: "本塁打" },
  { key: "rbi", label: "打点" },
  { key: "steals", label: "盗塁" },
  { key: "battingAverage", label: "打率" },
  { key: "onBasePercentage", label: "出塁率" },
  { key: "sluggingPercentage", label: "長打率" },
  { key: "ops", label: "OPS" },
];

const pitchingMetrics: ChartMetric[] = [
  { key: "wins", label: "勝利" },
  { key: "losses", label: "敗北" },
  { key: "saves", label: "セーブ" },
  { key: "holds", label: "ホールド" },
  { key: "strikeouts", label: "奪三振" },
  { key: "era", label: "防御率" },
  { key: "whip", label: "WHIP" },
];

function toBattingChart(rows: BattingStat[]): ChartPoint[] {
  return rows
    .filter((row) => row.season !== null)
    .map((row) => ({
      season: row.season as number,
      hits: row.hits,
      homeRuns: row.home_runs,
      rbi: row.rbi,
      steals: row.steals,
      battingAverage: row.batting_average,
      onBasePercentage: row.on_base_percentage,
      sluggingPercentage: row.slugging_percentage,
      ops: row.ops,
    }));
}

function toPitchingChart(rows: PitchingStat[]): ChartPoint[] {
  return rows
    .filter((row) => row.season !== null)
    .map((row) => ({
      season: row.season as number,
      wins: row.wins,
      losses: row.losses,
      saves: row.saves,
      holds: row.holds,
      strikeouts: row.strikeouts,
      era: row.era,
      whip: row.whip,
    }));
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="whitespace-nowrap">
      <strong className="font-heading text-xl font-black tracking-tight sm:text-2xl">
        {value}
      </strong>
      <span className="ml-1 text-xs font-bold text-muted-foreground sm:text-sm">
        {label}
      </span>
    </span>
  );
}

function CareerSummary({
  batting,
  category,
  pitching,
  years,
}: {
  batting?: BattingStat;
  category: RankingCategory;
  pitching?: PitchingStat;
  years: number;
}) {
  const items =
    category === "batting" && batting
      ? [
          { label: "年", value: formatNumber(years) },
          { label: "試合", value: formatNumber(batting.games) },
          { label: "打率", value: formatRate(batting.batting_average) },
          { label: "安打", value: formatNumber(batting.hits) },
          { label: "本", value: formatNumber(batting.home_runs) },
          { label: "打点", value: formatNumber(batting.rbi) },
          { label: "盗塁", value: formatNumber(batting.steals) },
          { label: "OPS", value: formatRate(batting.ops) },
        ]
      : pitching
        ? [
            { label: "年", value: formatNumber(years) },
            { label: "登板", value: formatNumber(pitching.games) },
            { label: "勝", value: formatNumber(pitching.wins) },
            { label: "敗", value: formatNumber(pitching.losses) },
            { label: "H", value: formatNumber(pitching.holds) },
            { label: "S", value: formatNumber(pitching.saves) },
            { label: "奪三振", value: formatNumber(pitching.strikeouts) },
            { label: "防御率", value: formatNumber(pitching.era, 2) },
          ]
        : [];

  return (
    <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(120deg,var(--card),color-mix(in_oklab,var(--primary)_10%,var(--card)))]">
      <CardContent className="relative p-5 sm:p-7">
        <BarChart3 className="absolute -right-3 -top-4 size-24 text-primary/8" />
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline">Career overview</Badge>
          <span className="text-xs font-bold text-muted-foreground">
            通算成績
          </span>
        </div>
        {items.length ? (
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
            {items.map((item) => (
              <SummaryItem key={item.label} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            通算成績がありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PlayerPerformanceTabs({
  batting,
  battingCareer,
  battingYears,
  defaultCategory,
  leagueRanks,
  pitching,
  pitchingCareer,
  pitchingYears,
}: {
  batting: BattingStat[];
  battingCareer?: BattingStat;
  battingYears: number;
  defaultCategory: RankingCategory;
  leagueRanks: PlayerLeagueRank[];
  pitching: PitchingStat[];
  pitchingCareer?: PitchingStat;
  pitchingYears: number;
}) {
  const initialCategory =
    defaultCategory === "pitching" && pitching.length
      ? "pitching"
      : batting.length
        ? "batting"
        : "pitching";

  return (
    <Tabs className="gap-5" defaultValue={initialCategory}>
      <div className="sticky top-3 z-30 flex justify-center">
        <TabsList className="grid h-12 w-full max-w-md grid-cols-2 border border-border/80 bg-card/95 p-1 shadow-lg backdrop-blur">
          <TabsTrigger disabled={!batting.length} value="batting">
            <Activity /> 野手成績
          </TabsTrigger>
          <TabsTrigger disabled={!pitching.length} value="pitching">
            <Activity /> 投手成績
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent className="grid gap-5" value="batting">
        <CareerSummary
          batting={battingCareer}
          category="batting"
          years={battingYears}
        />
        <PlayerMetricChart
          data={toBattingChart(batting)}
          metrics={battingMetrics}
          title="年度別打撃推移"
        />
        <PlayerStatTable
          columns={battingColumns}
          rows={batting}
          summaryRow={battingCareer}
          title="打撃成績"
        />
        <PlayerLeagueRanks category="batting" rows={leagueRanks} />
      </TabsContent>
      <TabsContent className="grid gap-5" value="pitching">
        <CareerSummary
          category="pitching"
          pitching={pitchingCareer}
          years={pitchingYears}
        />
        <PlayerMetricChart
          data={toPitchingChart(pitching)}
          metrics={pitchingMetrics}
          title="年度別投手推移"
        />
        <PlayerStatTable
          columns={pitchingColumns}
          rows={pitching}
          summaryRow={pitchingCareer}
          title="投手成績"
        />
        <PlayerLeagueRanks category="pitching" rows={leagueRanks} />
      </TabsContent>
    </Tabs>
  );
}
