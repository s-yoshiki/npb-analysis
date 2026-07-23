import {
  rankingMetrics,
  type RankingCategory,
  type RankingLeague,
  type RankingMetric,
  type RankingProfileFilters,
  type RankingScope,
} from "@/modules/npb/domain/services/ranking-service";

export type RankingSearchParams = Record<string, string | string[] | undefined>;

export type ParsedRankingParams = {
  category: RankingCategory;
  filters: RankingProfileFilters;
  league: RankingLeague;
  metric: RankingMetric;
  scope: RankingScope;
  season: number;
  team?: string;
};

function first(params: RankingSearchParams, key: string): string | undefined {
  const value = params[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single?.trim() || undefined;
}

function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Turns the ranking page's query string into a validated query. Unknown or
 * mismatched values fall back to the defaults rather than reaching the
 * repository, so a hand-edited URL can never render an empty leaderboard.
 */
export function parseRankingParams(
  params: RankingSearchParams,
  seasons: number[],
): ParsedRankingParams {
  const category = oneOf(
    first(params, "category"),
    ["batting", "pitching"] as const,
    "batting",
  );
  const metrics = rankingMetrics[category];
  const requestedMetric = first(params, "metric");
  const metric =
    metrics.find((item) => item.value === requestedMetric)?.value ??
    (metrics[0]?.value as RankingMetric);
  const scope = oneOf(
    first(params, "scope"),
    ["season", "career"] as const,
    "season",
  );
  const requestedSeason = optionalNumber(first(params, "season"));
  const season =
    requestedSeason !== undefined && seasons.includes(requestedSeason)
      ? requestedSeason
      : (seasons[0] ?? new Date().getFullYear());

  return {
    category,
    filters: {
      bats: params.bats
        ? oneOf(
            first(params, "bats"),
            ["right", "left", "both"] as const,
            "right",
          )
        : undefined,
      birthYearMax: optionalNumber(first(params, "birthYearMax")),
      birthYearMin: optionalNumber(first(params, "birthYearMin")),
      draftRank: first(params, "draftRank"),
      draftYearMax: optionalNumber(first(params, "draftYearMax")),
      draftYearMin: optionalNumber(first(params, "draftYearMin")),
      heightMax: optionalNumber(first(params, "heightMax")),
      heightMin: optionalNumber(first(params, "heightMin")),
      name: first(params, "name"),
      school: first(params, "school"),
      throws: params.throws
        ? oneOf(first(params, "throws"), ["right", "left"] as const, "right")
        : undefined,
    },
    league: oneOf(
      first(params, "league"),
      ["all", "central", "pacific"] as const,
      "all",
    ),
    metric,
    scope,
    season,
    team: first(params, "team"),
  };
}
