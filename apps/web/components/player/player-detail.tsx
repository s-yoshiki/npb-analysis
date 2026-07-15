"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlayerPerformanceTabs } from "@/components/player/player-performance-tabs";
import { PlayerProfileCard } from "@/components/player/player-profile-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sumNumeric } from "@/lib/format";
import type {
  BattingStat,
  PitchingStat,
  PlayerDetail as PlayerDetailModel,
} from "@/modules/npb/domain/models/player";
import { getPrimaryPlayerCategory } from "@/modules/npb/domain/services/player-category";

function ratio(numerator: number, denominator: number) {
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

export function PlayerDetail() {
  const [detail, setDetail] = useState<PlayerDetailModel>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const id = window.location.pathname.split("/").filter(Boolean).at(-1);
    if (!id || id === "detail") {
      setError("選手IDが指定されていません。");
      return;
    }
    const controller = new AbortController();
    fetch(`/api/players/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<PlayerDetailModel>;
      })
      .then((value) => {
        setDetail(value);
        document.title = `${value.profile.name} | NPB Analysis`;
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError")
          return;
        setError(
          cause instanceof Error && cause.message === "not-found"
            ? "選手が見つかりません。"
            : "選手情報を取得できませんでした。",
        );
      });
    return () => controller.abort();
  }, []);

  if (error)
    return (
      <Card>
        <CardContent className="py-12 text-center">{error}</CardContent>
      </Card>
    );
  if (!detail)
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          選手情報を読み込んでいます。
        </CardContent>
      </Card>
    );

  const { profile, batting, pitching } = detail;
  const defaultCategory = getPrimaryPlayerCategory({
    battingPlateAppearances: sumNumeric(batting, "plate_appearances"),
    hasBatting: batting.length > 0,
    hasPitching: pitching.length > 0,
    pitchingInnings: sumNumeric(pitching, "innings"),
    position: profile.position,
  });

  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,var(--foreground)_0%,oklch(0.3_0.1_245)_100%)] text-background ring-1 ring-white/10">
        <div className="absolute -right-12 -top-20 size-72 rounded-full bg-primary/35 blur-3xl" />
        <CardContent className="relative px-6 py-8 sm:px-10 sm:py-12">
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
        batting={batting}
        battingCareer={batting.length ? getBattingCareer(batting) : undefined}
        battingYears={batting.filter((row) => row.season !== null).length}
        defaultCategory={defaultCategory}
        leagueRanks={[]}
        pitching={pitching}
        pitchingCareer={
          pitching.length ? getPitchingCareer(pitching) : undefined
        }
        pitchingYears={pitching.filter((row) => row.season !== null).length}
      />
    </>
  );
}
