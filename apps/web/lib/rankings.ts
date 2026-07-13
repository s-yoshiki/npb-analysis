import { getLeague, type League } from "./league";

export type RankingCategory = "batting" | "pitching";
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
  | "hits"
  | "home_runs"
  | "rbi"
  | "steals"
  | "batting_average"
  | "on_base_percentage"
  | "slugging_percentage"
  | "ops"
  | "wins"
  | "saves"
  | "holds"
  | "strikeouts"
  | "era"
  | "whip";

export const rankingMetrics: Record<
  RankingCategory,
  {
    value: RankingMetric;
    label: string;
    lowerIsBetter?: boolean;
    rate?: boolean;
  }[]
> = {
  batting: [
    { value: "hits", label: "安打" },
    { value: "home_runs", label: "本塁打" },
    { value: "rbi", label: "打点" },
    { value: "steals", label: "盗塁" },
    { value: "batting_average", label: "打率", rate: true },
    { value: "on_base_percentage", label: "出塁率", rate: true },
    { value: "slugging_percentage", label: "長打率", rate: true },
    { value: "ops", label: "OPS", rate: true },
  ],
  pitching: [
    { value: "wins", label: "勝利" },
    { value: "saves", label: "セーブ" },
    { value: "holds", label: "ホールド" },
    { value: "strikeouts", label: "奪三振" },
    { value: "era", label: "防御率", lowerIsBetter: true, rate: true },
    { value: "whip", label: "WHIP", lowerIsBetter: true, rate: true },
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
  games: number | null;
  plate_appearances?: number | null;
  at_bats?: number | null;
  hits?: number | null;
  home_runs?: number | null;
  total_bases?: number | null;
  rbi?: number | null;
  steals?: number | null;
  sacrifice_flies?: number | null;
  walks?: number | null;
  hit_by_pitch?: number | null;
  wins?: number | null;
  losses?: number | null;
  saves?: number | null;
  holds?: number | null;
  innings?: number | null;
  hits_allowed?: number | null;
  walks_allowed?: number | null;
  strikeouts?: number | null;
  earned_runs?: number | null;
};

export type RankingRow = {
  rank: number;
  playerId: string;
  name: string;
  league: League;
  season: number | null;
  value: number;
  qualified: boolean;
};

type Aggregate = Omit<RankingRow, "rank" | "value" | "qualified"> & {
  games: number;
  plateAppearances: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  totalBases: number;
  rbi: number;
  steals: number;
  sacrificeFlies: number;
  walks: number;
  hitByPitch: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  innings: number;
  hitsAllowed: number;
  walksAllowed: number;
  strikeouts: number;
  earnedRuns: number;
};

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function metricValue(row: Aggregate, metric: RankingMetric): number | null {
  if (metric === "hits") return row.hits;
  if (metric === "home_runs") return row.homeRuns;
  if (metric === "rbi") return row.rbi;
  if (metric === "steals") return row.steals;
  if (metric === "batting_average") return ratio(row.hits, row.atBats);
  if (metric === "on_base_percentage") {
    return ratio(
      row.hits + row.walks + row.hitByPitch,
      row.atBats + row.walks + row.hitByPitch + row.sacrificeFlies,
    );
  }
  if (metric === "slugging_percentage") {
    return ratio(row.totalBases, row.atBats);
  }
  if (metric === "ops") {
    const obp = metricValue(row, "on_base_percentage");
    const slg = metricValue(row, "slugging_percentage");
    return obp === null || slg === null ? null : obp + slg;
  }
  if (metric === "wins") return row.wins;
  if (metric === "saves") return row.saves;
  if (metric === "holds") return row.holds;
  if (metric === "strikeouts") return row.strikeouts;
  if (metric === "era") return ratio(row.earnedRuns * 9, row.innings);
  return ratio(row.hitsAllowed + row.walksAllowed, row.innings);
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
    ) {
      return false;
    }
  }
  if (filters.throws && !row.bats_throws?.includes(filters.throws === "right" ? "右投" : "左投")) {
    return false;
  }
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
    !row.career?.toLocaleLowerCase("ja").includes(filters.school.toLocaleLowerCase("ja"))
  ) {
    return false;
  }

  const year = draftYear(row.draft);
  if (filters.draftYearMin !== undefined && (year === null || year < filters.draftYearMin)) return false;
  if (filters.draftYearMax !== undefined && (year === null || year > filters.draftYearMax)) return false;
  if (filters.draftRank) {
    if (filters.draftRank === "outside") {
      if (!row.draft?.includes("ドラフト外")) return false;
    } else if (!row.draft?.match(new RegExp(`ドラフト.*${filters.draftRank}(?:位|巡目)`))) {
      return false;
    }
  }
  if (
    filters.birthYearMin !== undefined &&
    (row.birth_year === null || row.birth_year < filters.birthYearMin)
  ) return false;
  if (
    filters.birthYearMax !== undefined &&
    (row.birth_year === null || row.birth_year > filters.birthYearMax)
  ) return false;
  if (
    filters.heightMin !== undefined &&
    (row.height_cm === null || row.height_cm < filters.heightMin)
  ) return false;
  if (
    filters.heightMax !== undefined &&
    (row.height_cm === null || row.height_cm > filters.heightMax)
  ) return false;
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
  league: League;
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
      rowLeague !== league ||
      (scope === "season" && row.season !== season) ||
      (team && row.team !== team) ||
      !matchesProfile(row, filters)
    ) {
      continue;
    }
    const key = `${row.player_id}:${scope === "season" ? row.season : "career"}`;
    const current = aggregates.get(key) ?? {
      playerId: row.player_id,
      name: row.name,
      league: rowLeague,
      season: scope === "season" ? row.season : null,
      games: 0,
      plateAppearances: 0,
      atBats: 0,
      hits: 0,
      homeRuns: 0,
      totalBases: 0,
      rbi: 0,
      steals: 0,
      sacrificeFlies: 0,
      walks: 0,
      hitByPitch: 0,
      wins: 0,
      losses: 0,
      saves: 0,
      holds: 0,
      innings: 0,
      hitsAllowed: 0,
      walksAllowed: 0,
      strikeouts: 0,
      earnedRuns: 0,
    };
    current.games += row.games ?? 0;
    current.plateAppearances += row.plate_appearances ?? 0;
    current.atBats += row.at_bats ?? 0;
    current.hits += row.hits ?? 0;
    current.homeRuns += row.home_runs ?? 0;
    current.totalBases += row.total_bases ?? 0;
    current.rbi += row.rbi ?? 0;
    current.steals += row.steals ?? 0;
    current.sacrificeFlies += row.sacrifice_flies ?? 0;
    current.walks += row.walks ?? 0;
    current.hitByPitch += row.hit_by_pitch ?? 0;
    current.wins += row.wins ?? 0;
    current.losses += row.losses ?? 0;
    current.saves += row.saves ?? 0;
    current.holds += row.holds ?? 0;
    current.innings += row.innings ?? 0;
    current.hitsAllowed += row.hits_allowed ?? 0;
    current.walksAllowed += row.walks_allowed ?? 0;
    current.strikeouts += row.strikeouts ?? 0;
    current.earnedRuns += row.earned_runs ?? 0;
    aggregates.set(key, current);
  }

  const definition = [
    ...rankingMetrics.batting,
    ...rankingMetrics.pitching,
  ].find((item) => item.value === metric);
  const ranked = [...aggregates.values()]
    .map((row) => {
      const value = metricValue(row, metric);
      const games =
        row.season === null
          ? 0
          : (maxGames.get(`${row.season}:${row.league}`) ?? 0);
      const qualified =
        scope === "career" ||
        (category === "batting"
          ? row.plateAppearances >= games * 3.1
          : row.innings >= games);
      return value === null ? null : { row, value, qualified };
    })
    .filter(
      (item): item is { row: Aggregate; value: number; qualified: boolean } =>
        item !== null && (!definition?.rate || item.qualified),
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
