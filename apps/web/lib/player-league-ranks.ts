import { getLeague, type League } from "./league";

export type LeagueRankCategory = "batting" | "pitching";

export type LeagueRankMetric =
  | "games"
  | "plate_appearances"
  | "at_bats"
  | "runs"
  | "hits"
  | "doubles"
  | "triples"
  | "home_runs"
  | "total_bases"
  | "rbi"
  | "steals"
  | "caught_stealing"
  | "sacrifice_hits"
  | "sacrifice_flies"
  | "walks"
  | "hit_by_pitch"
  | "strikeouts"
  | "grounded_into_double_plays"
  | "batting_average"
  | "slugging_percentage"
  | "on_base_percentage"
  | "ops"
  | "wins"
  | "losses"
  | "saves"
  | "holds"
  | "hold_points"
  | "complete_games"
  | "shutouts"
  | "no_walk_complete_games"
  | "winning_percentage"
  | "batters_faced"
  | "innings"
  | "hits_allowed"
  | "home_runs_allowed"
  | "walks_allowed"
  | "wild_pitches"
  | "balks"
  | "runs_allowed"
  | "earned_runs"
  | "era"
  | "whip";

type MetricDefinition = {
  key: LeagueRankMetric;
  label: string;
  lowerIsBetter?: boolean;
  qualified?: boolean;
};

export const leagueRankMetrics: Record<LeagueRankCategory, MetricDefinition[]> =
  {
    batting: [
      { key: "games", label: "試合" },
      { key: "plate_appearances", label: "打席" },
      { key: "at_bats", label: "打数" },
      { key: "runs", label: "得点" },
      { key: "hits", label: "安打" },
      { key: "doubles", label: "二塁打" },
      { key: "triples", label: "三塁打" },
      { key: "home_runs", label: "本塁打" },
      { key: "total_bases", label: "塁打" },
      { key: "rbi", label: "打点" },
      { key: "steals", label: "盗塁" },
      { key: "caught_stealing", label: "盗塁刺" },
      { key: "sacrifice_hits", label: "犠打" },
      { key: "sacrifice_flies", label: "犠飛" },
      { key: "walks", label: "四球" },
      { key: "hit_by_pitch", label: "死球" },
      { key: "strikeouts", label: "三振" },
      { key: "grounded_into_double_plays", label: "併殺打" },
      { key: "batting_average", label: "打率", qualified: true },
      { key: "slugging_percentage", label: "長打率", qualified: true },
      { key: "on_base_percentage", label: "出塁率", qualified: true },
      { key: "ops", label: "OPS", qualified: true },
    ],
    pitching: [
      { key: "games", label: "登板" },
      { key: "wins", label: "勝利" },
      { key: "losses", label: "敗北" },
      { key: "saves", label: "セーブ" },
      { key: "holds", label: "H" },
      { key: "hold_points", label: "HP" },
      { key: "complete_games", label: "完投" },
      { key: "shutouts", label: "完封勝" },
      { key: "no_walk_complete_games", label: "無四球" },
      { key: "winning_percentage", label: "勝率", qualified: true },
      { key: "batters_faced", label: "打者" },
      { key: "innings", label: "投球回" },
      { key: "hits_allowed", label: "被安打" },
      { key: "home_runs_allowed", label: "被本塁打" },
      { key: "walks_allowed", label: "与四球" },
      { key: "hit_by_pitch", label: "与死球" },
      { key: "strikeouts", label: "奪三振" },
      { key: "wild_pitches", label: "暴投" },
      { key: "balks", label: "ボーク" },
      { key: "runs_allowed", label: "失点" },
      { key: "earned_runs", label: "自責点" },
      { key: "era", label: "防御率", lowerIsBetter: true, qualified: true },
      { key: "whip", label: "WHIP", lowerIsBetter: true, qualified: true },
    ],
  };

type DerivedMetric =
  | "batting_average"
  | "slugging_percentage"
  | "on_base_percentage"
  | "ops"
  | "winning_percentage"
  | "era"
  | "whip";

type RawMetric = Exclude<LeagueRankMetric, DerivedMetric>;

const rawMetrics: Record<LeagueRankCategory, RawMetric[]> = {
  batting: [
    "games",
    "plate_appearances",
    "at_bats",
    "runs",
    "hits",
    "doubles",
    "triples",
    "home_runs",
    "total_bases",
    "rbi",
    "steals",
    "caught_stealing",
    "sacrifice_hits",
    "sacrifice_flies",
    "walks",
    "hit_by_pitch",
    "strikeouts",
    "grounded_into_double_plays",
  ],
  pitching: [
    "games",
    "wins",
    "losses",
    "saves",
    "holds",
    "hold_points",
    "complete_games",
    "shutouts",
    "no_walk_complete_games",
    "batters_faced",
    "innings",
    "hits_allowed",
    "home_runs_allowed",
    "walks_allowed",
    "hit_by_pitch",
    "strikeouts",
    "wild_pitches",
    "balks",
    "runs_allowed",
    "earned_runs",
  ],
};

export type LeagueRankSourceRow = {
  player_id: string;
  season: number;
  team: string | null;
} & Partial<Record<RawMetric, number | null>>;

export type PlayerLeagueRank = {
  category: LeagueRankCategory;
  season: number;
  league: League;
  metrics: Partial<Record<LeagueRankMetric, number>>;
};

type Aggregate = {
  category: LeagueRankCategory;
  playerId: string;
  season: number;
  league: League;
  totals: Partial<Record<RawMetric, number>>;
  present: Set<RawMetric>;
};

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function total(row: Aggregate, key: RawMetric): number {
  return row.totals[key] ?? 0;
}

function metricValue(row: Aggregate, metric: LeagueRankMetric): number | null {
  if (metric === "batting_average") {
    return ratio(total(row, "hits"), total(row, "at_bats"));
  }
  if (metric === "slugging_percentage") {
    return ratio(total(row, "total_bases"), total(row, "at_bats"));
  }
  if (metric === "on_base_percentage") {
    return ratio(
      total(row, "hits") + total(row, "walks") + total(row, "hit_by_pitch"),
      total(row, "at_bats") +
        total(row, "walks") +
        total(row, "hit_by_pitch") +
        total(row, "sacrifice_flies"),
    );
  }
  if (metric === "ops") {
    const onBase = metricValue(row, "on_base_percentage");
    const slugging = metricValue(row, "slugging_percentage");
    return onBase === null || slugging === null ? null : onBase + slugging;
  }
  if (metric === "winning_percentage") {
    return ratio(total(row, "wins"), total(row, "wins") + total(row, "losses"));
  }
  if (metric === "era") {
    return ratio(total(row, "earned_runs") * 9, total(row, "innings"));
  }
  if (metric === "whip") {
    return ratio(
      total(row, "hits_allowed") + total(row, "walks_allowed"),
      total(row, "innings"),
    );
  }

  return row.present.has(metric) ? total(row, metric) : null;
}

function groupKey(
  category: LeagueRankCategory,
  season: number,
  league: League,
): string {
  return `${category}:${season}:${league}`;
}

function aggregateRows(
  category: LeagueRankCategory,
  rows: LeagueRankSourceRow[],
): Aggregate[] {
  const aggregates = new Map<string, Aggregate>();
  for (const row of rows) {
    const league = getLeague(row.team, row.season);
    if (!league) continue;
    const key = `${groupKey(category, row.season, league)}:${row.player_id}`;
    const aggregate = aggregates.get(key) ?? {
      category,
      playerId: row.player_id,
      season: row.season,
      league,
      totals: {},
      present: new Set<RawMetric>(),
    };
    for (const metric of rawMetrics[category]) {
      const value = row[metric];
      if (typeof value !== "number") continue;
      aggregate.totals[metric] = total(aggregate, metric) + value;
      aggregate.present.add(metric);
    }
    aggregates.set(key, aggregate);
  }
  return [...aggregates.values()];
}

export function buildPlayerLeagueRanks({
  battingRows,
  pitchingRows,
  playerId,
}: {
  battingRows: LeagueRankSourceRow[];
  pitchingRows: LeagueRankSourceRow[];
  playerId: string;
}): PlayerLeagueRank[] {
  const aggregates = [
    ...aggregateRows("batting", battingRows),
    ...aggregateRows("pitching", pitchingRows),
  ];
  const groups = new Map<string, Aggregate[]>();
  const maxGames = new Map<string, number>();

  for (const aggregate of aggregates) {
    const key = groupKey(
      aggregate.category,
      aggregate.season,
      aggregate.league,
    );
    const group = groups.get(key);
    if (group) group.push(aggregate);
    else groups.set(key, [aggregate]);
    if (aggregate.category === "batting") {
      const seasonLeague = `${aggregate.season}:${aggregate.league}`;
      maxGames.set(
        seasonLeague,
        Math.max(maxGames.get(seasonLeague) ?? 0, total(aggregate, "games")),
      );
    }
  }

  const result: PlayerLeagueRank[] = [];
  for (const rows of groups.values()) {
    const player = rows.find((row) => row.playerId === playerId);
    if (!player) continue;
    const item: PlayerLeagueRank = {
      category: player.category,
      season: player.season,
      league: player.league,
      metrics: {},
    };
    const requiredGames =
      maxGames.get(`${player.season}:${player.league}`) ?? 0;

    for (const definition of leagueRankMetrics[player.category]) {
      const ranked = rows
        .map((row) => ({ row, value: metricValue(row, definition.key) }))
        .filter(
          (entry): entry is { row: Aggregate; value: number } =>
            entry.value !== null &&
            (!definition.qualified ||
              (entry.row.category === "batting"
                ? total(entry.row, "plate_appearances") >= requiredGames * 3.1
                : total(entry.row, "innings") >= requiredGames)),
        )
        .sort((a, b) =>
          definition.lowerIsBetter ? a.value - b.value : b.value - a.value,
        );
      const playerIndex = ranked.findIndex(
        (entry) => entry.row.playerId === playerId,
      );
      if (playerIndex < 0) continue;
      const value = ranked[playerIndex]!.value;
      const firstEqual = ranked.findIndex((entry) => entry.value === value);
      item.metrics[definition.key] = firstEqual + 1;
    }
    result.push(item);
  }

  return result.sort(
    (a, b) =>
      b.season - a.season ||
      a.category.localeCompare(b.category) ||
      a.league.localeCompare(b.league),
  );
}
