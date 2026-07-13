import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PlayerMetricChart, type ChartPoint } from "@/components/player-charts";
import { PlayerLeagueRanks } from "@/components/player/player-league-ranks";
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
  getPlayerLeagueRanks,
  type BattingStatRow,
  type PitchingStatRow,
} from "@/lib/npb-db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function getBattingCareer(rows: BattingStatRow[]): BattingStatRow {
  const total = (key: keyof BattingStatRow) => sumNumeric(rows, key);
  const atBats = total("at_bats");
  const hits = total("hits");
  const walks = total("walks");
  const hitByPitch = total("hit_by_pitch");
  const sacrificeFlies = total("sacrifice_flies");
  const onBasePercentage = ratio(
    hits + walks + hitByPitch,
    atBats + walks + hitByPitch + sacrificeFlies,
  );
  const sluggingPercentage = ratio(total("total_bases"), atBats);

  return {
    season: null,
    team: "全所属",
    games: total("games"),
    plate_appearances: total("plate_appearances"),
    at_bats: atBats,
    runs: total("runs"),
    hits,
    doubles: total("doubles"),
    triples: total("triples"),
    home_runs: total("home_runs"),
    total_bases: total("total_bases"),
    rbi: total("rbi"),
    steals: total("steals"),
    caught_stealing: total("caught_stealing"),
    sacrifice_hits: total("sacrifice_hits"),
    sacrifice_flies: sacrificeFlies,
    walks,
    hit_by_pitch: hitByPitch,
    strikeouts: total("strikeouts"),
    grounded_into_double_plays: total("grounded_into_double_plays"),
    batting_average: ratio(hits, atBats),
    on_base_percentage: onBasePercentage,
    slugging_percentage: sluggingPercentage,
    ops:
      onBasePercentage === null || sluggingPercentage === null
        ? null
        : onBasePercentage + sluggingPercentage,
    is_qualified: 1,
    stats_json: "{}",
  };
}

function getPitchingCareer(rows: PitchingStatRow[]): PitchingStatRow {
  const total = (key: keyof PitchingStatRow) => sumNumeric(rows, key);
  const wins = total("wins");
  const losses = total("losses");
  const innings = total("innings");
  const hitsAllowed = total("hits_allowed");
  const walksAllowed = total("walks_allowed");

  return {
    season: null,
    team: "全所属",
    games: total("games"),
    wins,
    losses,
    saves: total("saves"),
    holds: total("holds"),
    hold_points: total("hold_points"),
    complete_games: total("complete_games"),
    shutouts: total("shutouts"),
    no_walk_complete_games: total("no_walk_complete_games"),
    winning_percentage: ratio(wins, wins + losses),
    batters_faced: total("batters_faced"),
    innings,
    hits_allowed: hitsAllowed,
    home_runs_allowed: total("home_runs_allowed"),
    walks_allowed: walksAllowed,
    hit_by_pitch: total("hit_by_pitch"),
    strikeouts: total("strikeouts"),
    wild_pitches: total("wild_pitches"),
    balks: total("balks"),
    runs_allowed: total("runs_allowed"),
    earned_runs: total("earned_runs"),
    era: ratio(total("earned_runs") * 9, innings),
    whip: ratio(hitsAllowed + walksAllowed, innings),
    is_qualified: 1,
    stats_json: "{}",
  };
}

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
      steals: row.steals,
      battingAverage: row.batting_average,
      onBasePercentage: row.on_base_percentage,
      sluggingPercentage: row.slugging_percentage,
      ops: row.ops,
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
      losses: row.losses,
      saves: row.saves,
      holds: row.holds,
      whip: row.whip,
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
  const leagueRanks = getPlayerLeagueRanks(id);

  if (!detail) {
    notFound();
  }

  const { profile, batting, pitching } = detail;
  const battingYears = batting.filter((row) => row.season !== null).length;
  const pitchingYears = pitching.filter((row) => row.season !== null).length;
  const battingCareer = batting.length ? getBattingCareer(batting) : undefined;
  const pitchingCareer = pitching.length
    ? getPitchingCareer(pitching)
    : undefined;

  return (
    <AppShell label="Player File">
      <Card className="overflow-hidden border-foreground/15 bg-foreground text-background shadow-none">
        <CardContent className="px-6 py-8 sm:px-10 sm:py-12">
          <Link
            className={buttonVariants({
              className:
                "mb-10 text-background/65 hover:bg-background/10 hover:text-background",
              variant: "ghost",
            })}
            href="/players"
          >
            一覧へ戻る
          </Link>
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <Badge
                className="mb-5 border-background/20 bg-background/10 text-background"
                variant="outline"
              >
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
                className:
                  "w-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background md:w-auto",
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
          <PlayerMetricChart
            data={toBattingChart(batting)}
            metrics={[
              { key: "hits", label: "安打" },
              { key: "homeRuns", label: "本塁打" },
              { key: "rbi", label: "打点" },
              { key: "steals", label: "盗塁" },
              { key: "battingAverage", label: "打率" },
              { key: "onBasePercentage", label: "出塁率" },
              { key: "sluggingPercentage", label: "長打率" },
              { key: "ops", label: "OPS" },
            ]}
            title="打撃成績"
          />
          <PlayerMetricChart
            data={toPitchingChart(pitching)}
            metrics={[
              { key: "wins", label: "勝利" },
              { key: "losses", label: "敗北" },
              { key: "saves", label: "セーブ" },
              { key: "holds", label: "ホールド" },
              { key: "strikeouts", label: "奪三振" },
              { key: "era", label: "防御率" },
              { key: "whip", label: "WHIP" },
            ]}
            title="投手成績"
          />
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
            summaryRow={battingCareer}
            title="打撃成績"
          />
        </TabsContent>
        <TabsContent value="pitching">
          <PlayerStatTable
            columns={pitchingColumns}
            rows={pitching}
            summaryRow={pitchingCareer}
            title="投手成績"
          />
        </TabsContent>
      </Tabs>

      <PlayerLeagueRanks rows={leagueRanks} />
    </AppShell>
  );
}
