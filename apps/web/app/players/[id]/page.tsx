import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PlayerPerformanceTabs } from "@/components/player/player-performance-tabs";
import { PlayerProfileCard } from "@/components/player/player-profile-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sumNumeric } from "@/lib/format";
import { npbQueryService } from "@/modules/npb/composition";
import type {
  BattingStat,
  PitchingStat,
} from "@/modules/npb/domain/models/player";
import { getPrimaryPlayerCategory } from "@/modules/npb/domain/services/player-category";

export const dynamicParams = true;
export const revalidate = 604800;

export function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function getBattingCareer(rows: BattingStat[]): BattingStat {
  const total = (key: keyof BattingStat) => sumNumeric(rows, key);
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

function getPitchingCareer(rows: PitchingStat[]): PitchingStat {
  const total = (key: keyof PitchingStat) => sumNumeric(rows, key);
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = npbQueryService.getPlayerDetail(id);

  return {
    title: detail
      ? `${detail.profile.name} | NPB Analysis`
      : "Player | NPB Analysis",
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const result = npbQueryService.getPlayer(id);

  if (!result) {
    notFound();
  }

  const { detail, leagueRanks } = result;
  const { profile, batting, pitching } = detail;
  const battingYears = batting.filter((row) => row.season !== null).length;
  const pitchingYears = pitching.filter((row) => row.season !== null).length;
  const battingCareer = batting.length ? getBattingCareer(batting) : undefined;
  const pitchingCareer = pitching.length
    ? getPitchingCareer(pitching)
    : undefined;
  const defaultCategory = getPrimaryPlayerCategory({
    battingPlateAppearances: sumNumeric(batting, "plate_appearances"),
    hasBatting: batting.length > 0,
    hasPitching: pitching.length > 0,
    pitchingInnings: sumNumeric(pitching, "innings"),
    position: profile.position,
  });
  const serializableBatting = batting.map((row) => ({ ...row }));
  const serializablePitching = pitching.map((row) => ({ ...row }));
  const serializableLeagueRanks = leagueRanks.map((row) => ({
    ...row,
    metrics: { ...row.metrics },
  }));

  return (
    <AppShell label="Player File">
      <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,var(--foreground)_0%,oklch(0.3_0.1_245)_100%)] text-background ring-1 ring-white/10">
        <div className="absolute -right-12 -top-20 size-72 rounded-full bg-primary/35 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:40px_40px]" />
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
              <Badge
                className="mb-5 ml-2 border-background/20 bg-background/10 text-background"
                variant="outline"
              >
                {defaultCategory === "pitching" ? "投手" : "野手"}
              </Badge>
              <h1 className="font-heading text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-6xl">
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

      <PlayerProfileCard detailJson={profile.detail_json} />

      <PlayerPerformanceTabs
        batting={serializableBatting}
        battingCareer={battingCareer}
        battingYears={battingYears}
        defaultCategory={defaultCategory}
        leagueRanks={serializableLeagueRanks}
        pitching={serializablePitching}
        pitchingCareer={pitchingCareer}
        pitchingYears={pitchingYears}
      />
    </AppShell>
  );
}
