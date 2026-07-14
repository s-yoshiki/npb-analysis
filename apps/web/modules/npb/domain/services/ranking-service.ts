import { getLeague, type League } from "../models/league";

export type RankingCategory = "batting" | "pitching";
export type RankingLeague = League | "all";
export type RankingScope = "season" | "career";

export type RankingProfileFilters = {
  name?: string;
  throws?: "right" | "left";
  bats?: "right" | "left" | "both";
  school?: string;
  draftYearMin?: number;
  draftYearMax?: number;
  draftRank?: string;
  birthYearMin?: number;
  birthYearMax?: number;
  heightMin?: number;
  heightMax?: number;
};

export type RankingMetric =
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
  | "on_base_percentage"
  | "slugging_percentage"
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

export type RankingMetricDefinition = {
  value: RankingMetric;
  label: string;
  digits?: number;
  lowerIsBetter?: boolean;
  qualified?: boolean;
  rate?: boolean;
};

export const rankingMetrics: Record<
  RankingCategory,
  RankingMetricDefinition[]
> = {
  batting: [
    { value: "games", label: "試合" },
    { value: "plate_appearances", label: "打席" },
    { value: "at_bats", label: "打数" },
    { value: "runs", label: "得点" },
    { value: "hits", label: "安打" },
    { value: "doubles", label: "二塁打" },
    { value: "triples", label: "三塁打" },
    { value: "home_runs", label: "本塁打" },
    { value: "total_bases", label: "塁打" },
    { value: "rbi", label: "打点" },
    { value: "steals", label: "盗塁" },
    { value: "caught_stealing", label: "盗塁刺" },
    { value: "sacrifice_hits", label: "犠打" },
    { value: "sacrifice_flies", label: "犠飛" },
    { value: "walks", label: "四球" },
    { value: "hit_by_pitch", label: "死球" },
    { value: "strikeouts", label: "三振" },
    { value: "grounded_into_double_plays", label: "併殺打" },
    {
      value: "batting_average",
      label: "打率",
      qualified: true,
      rate: true,
    },
    {
      value: "on_base_percentage",
      label: "出塁率",
      qualified: true,
      rate: true,
    },
    {
      value: "slugging_percentage",
      label: "長打率",
      qualified: true,
      rate: true,
    },
    { value: "ops", label: "OPS", qualified: true, rate: true },
  ],
  pitching: [
    { value: "games", label: "登板" },
    { value: "wins", label: "勝利" },
    { value: "losses", label: "敗北" },
    { value: "saves", label: "セーブ" },
    { value: "holds", label: "ホールド" },
    { value: "hold_points", label: "ホールドポイント" },
    { value: "complete_games", label: "完投" },
    { value: "shutouts", label: "完封勝" },
    { value: "no_walk_complete_games", label: "無四球" },
    {
      value: "winning_percentage",
      label: "勝率",
      qualified: true,
      rate: true,
    },
    { value: "batters_faced", label: "対戦打者" },
    { value: "innings", label: "投球回", digits: 1 },
    { value: "hits_allowed", label: "被安打" },
    { value: "home_runs_allowed", label: "被本塁打" },
    { value: "walks_allowed", label: "与四球" },
    { value: "hit_by_pitch", label: "与死球" },
    { value: "strikeouts", label: "奪三振" },
    { value: "wild_pitches", label: "暴投" },
    { value: "balks", label: "ボーク" },
    { value: "runs_allowed", label: "失点" },
    { value: "earned_runs", label: "自責点" },
    {
      value: "era",
      label: "防御率",
      digits: 2,
      lowerIsBetter: true,
      qualified: true,
    },
    {
      value: "whip",
      label: "WHIP",
      digits: 2,
      lowerIsBetter: true,
      qualified: true,
    },
  ],
};

type DerivedMetric =
  | "batting_average"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops"
  | "winning_percentage"
  | "era"
  | "whip";
type RawMetric = Exclude<RankingMetric, DerivedMetric>;

const rawMetrics: Record<RankingCategory, RawMetric[]> = {
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

export type RankingSourceRow = {
  player_id: string;
  name: string;
  kana: string | null;
  season: number;
  team: string | null;
  bats_throws: string | null;
  career: string | null;
  draft: string | null;
  birth_year: number | null;
  height_cm: number | null;
} & Partial<Record<RawMetric, number | null>>;

export type RankingRow = {
  rank: number;
  playerId: string;
  name: string;
  league: League | null;
  season: number | null;
  value: number;
  qualified: boolean;
};

type Aggregate = Omit<RankingRow, "rank" | "value" | "qualified"> & {
  requiredGames: number;
  totals: Partial<Record<RawMetric, number>>;
  present: Set<RawMetric>;
};

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function total(row: Aggregate, key: RawMetric): number {
  return row.totals[key] ?? 0;
}

function metricValue(row: Aggregate, metric: RankingMetric): number | null {
  if (metric === "batting_average") {
    return ratio(total(row, "hits"), total(row, "at_bats"));
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
  if (metric === "slugging_percentage") {
    return ratio(total(row, "total_bases"), total(row, "at_bats"));
  }
  if (metric === "ops") {
    const obp = metricValue(row, "on_base_percentage");
    const slg = metricValue(row, "slugging_percentage");
    return obp === null || slg === null ? null : obp + slg;
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

function draftYear(value: string | null): number | null {
  const match = value?.match(/(\d{4})年/);
  return match ? Number(match[1]) : null;
}

function matchesProfile(
  row: RankingSourceRow,
  filters: RankingProfileFilters | undefined,
): boolean {
  if (!filters) return true;
  if (filters.name) {
    const query = filters.name.toLocaleLowerCase("ja");
    if (
      !row.name.toLocaleLowerCase("ja").includes(query) &&
      !row.kana?.toLocaleLowerCase("ja").includes(query)
    )
      return false;
  }
  if (
    filters.throws &&
    !row.bats_throws?.includes(filters.throws === "right" ? "右投" : "左投")
  )
    return false;
  const battingLabel =
    filters.bats === "right"
      ? "右打"
      : filters.bats === "left"
        ? "左打"
        : filters.bats === "both"
          ? "両打"
          : undefined;
  if (battingLabel && !row.bats_throws?.includes(battingLabel)) return false;
  if (
    filters.school &&
    !row.career
      ?.toLocaleLowerCase("ja")
      .includes(filters.school.toLocaleLowerCase("ja"))
  )
    return false;

  const year = draftYear(row.draft);
  if (
    filters.draftYearMin !== undefined &&
    (year === null || year < filters.draftYearMin)
  )
    return false;
  if (
    filters.draftYearMax !== undefined &&
    (year === null || year > filters.draftYearMax)
  )
    return false;
  if (filters.draftRank === "outside") {
    if (!row.draft?.includes("ドラフト外")) return false;
  } else if (
    filters.draftRank &&
    !row.draft?.match(new RegExp(`ドラフト.*${filters.draftRank}(?:位|巡目)`))
  )
    return false;
  if (
    filters.birthYearMin !== undefined &&
    (row.birth_year === null || row.birth_year < filters.birthYearMin)
  )
    return false;
  if (
    filters.birthYearMax !== undefined &&
    (row.birth_year === null || row.birth_year > filters.birthYearMax)
  )
    return false;
  if (
    filters.heightMin !== undefined &&
    (row.height_cm === null || row.height_cm < filters.heightMin)
  )
    return false;
  if (
    filters.heightMax !== undefined &&
    (row.height_cm === null || row.height_cm > filters.heightMax)
  )
    return false;
  return true;
}

export function buildRankings({
  battingRows,
  category,
  league,
  metric,
  pitchingRows,
  scope,
  season,
  team,
  filters,
}: {
  battingRows: RankingSourceRow[];
  pitchingRows: RankingSourceRow[];
  category: RankingCategory;
  league: RankingLeague;
  metric: RankingMetric;
  scope: RankingScope;
  season?: number;
  team?: string;
  filters?: RankingProfileFilters;
}): RankingRow[] {
  const source = category === "batting" ? battingRows : pitchingRows;
  const maxGames = new Map<string, number>();
  for (const row of battingRows) {
    const rowLeague = getLeague(row.team, row.season);
    if (!rowLeague) continue;
    const key = `${row.season}:${rowLeague}`;
    maxGames.set(key, Math.max(maxGames.get(key) ?? 0, row.games ?? 0));
  }

  const aggregates = new Map<string, Aggregate>();
  for (const row of source) {
    const rowLeague = getLeague(row.team, row.season);
    if (
      !rowLeague ||
      (league !== "all" && rowLeague !== league) ||
      (scope === "season" && row.season !== season) ||
      (team && row.team !== team) ||
      !matchesProfile(row, filters)
    )
      continue;

    const key = `${row.player_id}:${scope === "season" ? row.season : "career"}`;
    const current = aggregates.get(key) ?? {
      playerId: row.player_id,
      name: row.name,
      league: rowLeague,
      season: scope === "season" ? row.season : null,
      requiredGames: 0,
      totals: {},
      present: new Set<RawMetric>(),
    };
    if (current.league !== rowLeague) current.league = null;
    current.requiredGames = Math.max(
      current.requiredGames,
      maxGames.get(`${row.season}:${rowLeague}`) ?? 0,
    );
    for (const rawMetric of rawMetrics[category]) {
      const value = row[rawMetric];
      if (typeof value !== "number") continue;
      current.totals[rawMetric] = total(current, rawMetric) + value;
      current.present.add(rawMetric);
    }
    aggregates.set(key, current);
  }

  const definition = rankingMetrics[category].find(
    (item) => item.value === metric,
  );
  const ranked = [...aggregates.values()]
    .map((row) => {
      const value = metricValue(row, metric);
      const qualified =
        scope === "career" ||
        (category === "batting"
          ? total(row, "plate_appearances") >= row.requiredGames * 3.1
          : total(row, "innings") >= row.requiredGames);
      return value === null ? null : { row, value, qualified };
    })
    .filter(
      (item): item is { row: Aggregate; value: number; qualified: boolean } =>
        item !== null && (!definition?.qualified || item.qualified),
    )
    .sort((a, b) =>
      definition?.lowerIsBetter ? a.value - b.value : b.value - a.value,
    );

  let previous: number | null = null;
  let rank = 0;
  return ranked.map((item, index) => {
    if (previous === null || item.value !== previous) rank = index + 1;
    previous = item.value;
    return {
      rank,
      playerId: item.row.playerId,
      name: item.row.name,
      league: item.row.league,
      season: item.row.season,
      value: item.value,
      qualified: item.qualified,
    };
  });
}
