import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { NpbReadRepository } from "../../application/ports/npb-read-repository";
import { getLeague } from "../../domain/models/league";
import {
  buildRankings,
  type RankingCategory,
  type RankingLeague,
  type RankingMetric,
  type RankingProfileFilters,
  type RankingRow,
  type RankingScope,
  type RankingSourceRow,
} from "../../domain/services/ranking-service";
import {
  buildPlayerLeagueRanks,
  type LeagueRankSourceRow,
  type PlayerLeagueRank,
} from "../../domain/services/league-ranking-service";
import type {
  DatabaseSummary,
  SeasonTrend,
  TeamCount,
} from "../../domain/models/dashboard";
import type {
  BattingStat,
  PitchingStat,
  PlayerDetail,
  PlayerFilters,
  PlayerListItem,
  PlayerListPage,
  PlayerProfile,
} from "../../domain/models/player";

const DB_PATH = path.join(process.cwd(), "data", "npb.sqlite");

type ScalarRow = Record<string, number | null>;

function openDb(): DatabaseSync | null {
  if (!fs.existsSync(DB_PATH)) {
    return null;
  }

  return new DatabaseSync(DB_PATH, { readOnly: true });
}

function hasPlayerActiveColumn(db: DatabaseSync): boolean {
  const columns = db.prepare("PRAGMA table_info(players)").all() as {
    name: string;
  }[];
  return columns.some((column) => column.name === "is_active");
}

function likeQuery(value: string): string {
  return `%${value.replace(/[%_]/g, "\\$&")}%`;
}

const playerCategorySql = `
  CASE
    WHEN p.position = '投手' THEN 'pitching'
    WHEN p.position IN ('捕手', '内野手', '外野手') THEN 'batting'
    WHEN COALESCE((
      SELECT SUM(pi2.innings) FROM pitching_stats pi2 WHERE pi2.player_id = p.id
    ), 0) >= MAX(10, COALESCE((
      SELECT SUM(b2.plate_appearances) FROM batting_stats b2 WHERE b2.player_id = p.id
    ), 0) * 0.5) THEN 'pitching'
    ELSE 'batting'
  END
`;

function hasDatabase(): boolean {
  return fs.existsSync(DB_PATH);
}

function getSummary(): DatabaseSummary {
  const db = openDb();
  if (!db) {
    return {
      players: 0,
      battingRows: 0,
      pitchingRows: 0,
      firstSeason: null,
      lastSeason: null,
      hitters: 0,
      pitchers: 0,
    };
  }

  try {
    const row = db
      .prepare(
        `
        SELECT
          (SELECT COUNT(*) FROM players) AS players,
          (SELECT COUNT(*) FROM batting_stats) AS battingRows,
          (SELECT COUNT(*) FROM pitching_stats) AS pitchingRows,
          (
            SELECT MIN(season)
            FROM (
              SELECT season FROM batting_stats WHERE season IS NOT NULL
              UNION ALL
              SELECT season FROM pitching_stats WHERE season IS NOT NULL
            )
          ) AS firstSeason,
          (
            SELECT MAX(season)
            FROM (
              SELECT season FROM batting_stats WHERE season IS NOT NULL
              UNION ALL
              SELECT season FROM pitching_stats WHERE season IS NOT NULL
            )
          ) AS lastSeason,
          (SELECT COUNT(DISTINCT player_id) FROM batting_stats) AS hitters,
          (SELECT COUNT(DISTINCT player_id) FROM pitching_stats) AS pitchers
      `,
      )
      .get() as ScalarRow;

    return {
      players: row.players ?? 0,
      battingRows: row.battingRows ?? 0,
      pitchingRows: row.pitchingRows ?? 0,
      firstSeason: row.firstSeason ?? null,
      lastSeason: row.lastSeason ?? null,
      hitters: row.hitters ?? 0,
      pitchers: row.pitchers ?? 0,
    };
  } finally {
    db.close();
  }
}

function getPlayerListWhere(query: string, filters: PlayerFilters = {}) {
  const conditions: string[] = [];
  const params: (number | string)[] = [];
  const name = query.trim() || filters.name?.trim();

  if (name) {
    conditions.push("(p.name LIKE ? ESCAPE '\\' OR p.kana LIKE ? ESCAPE '\\')");
    params.push(likeQuery(name), likeQuery(name));
  }
  if (filters.category) {
    conditions.push(`(${playerCategorySql}) = ?`);
    params.push(filters.category);
  }
  if (filters.throws) {
    conditions.push("p.bats_throws LIKE ?");
    params.push(`%${filters.throws === "right" ? "右投" : "左投"}%`);
  }
  if (filters.bats) {
    const label =
      filters.bats === "right"
        ? "右打"
        : filters.bats === "left"
          ? "左打"
          : "両打";
    conditions.push("p.bats_throws LIKE ?");
    params.push(`%${label}%`);
  }
  if (filters.school?.trim()) {
    conditions.push("p.career LIKE ? ESCAPE '\\'");
    params.push(likeQuery(filters.school.trim()));
  }
  if (filters.draftYearMin !== undefined) {
    conditions.push("CAST(substr(p.draft, 1, 4) AS INTEGER) >= ?");
    params.push(filters.draftYearMin);
  }
  if (filters.draftYearMax !== undefined) {
    conditions.push("CAST(substr(p.draft, 1, 4) AS INTEGER) <= ?");
    params.push(filters.draftYearMax);
  }
  if (filters.draftRank === "outside") {
    conditions.push("p.draft LIKE '%ドラフト外%'");
  } else if (filters.draftRank) {
    conditions.push("(p.draft LIKE ? OR p.draft LIKE ?)");
    params.push(
      `%ドラフト%${filters.draftRank}位%`,
      `%ドラフト%${filters.draftRank}巡目%`,
    );
  }
  if (filters.birthYearMin !== undefined) {
    conditions.push("p.birth_year >= ?");
    params.push(filters.birthYearMin);
  }
  if (filters.birthYearMax !== undefined) {
    conditions.push("p.birth_year <= ?");
    params.push(filters.birthYearMax);
  }
  if (filters.heightMin !== undefined) {
    conditions.push("p.height_cm >= ?");
    params.push(filters.heightMin);
  }
  if (filters.heightMax !== undefined) {
    conditions.push("p.height_cm <= ?");
    params.push(filters.heightMax);
  }

  return {
    params,
    whereSql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
  };
}

function getPlayersPage({
  page,
  pageSize,
  query,
  filters,
}: {
  page: number;
  pageSize: number;
  query: string;
  filters?: PlayerFilters;
}): PlayerListPage {
  const db = openDb();
  if (!db) {
    return {
      players: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const { params, whereSql } = getPlayerListWhere(query, filters);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const requestedPage = Math.max(1, page);

  try {
    const activeSelect = hasPlayerActiveColumn(db)
      ? "p.is_active"
      : "0 AS is_active";
    const totalRow = db
      .prepare(
        `
        SELECT COUNT(*) AS total
        FROM players p
        ${whereSql}
      `,
      )
      .get(...params) as { total: number } | undefined;
    const total = totalRow?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const currentPage = Math.min(requestedPage, totalPages);
    const offset = (currentPage - 1) * safePageSize;
    const players = db
      .prepare(
        `
        SELECT
          p.id,
          p.name,
          p.kana,
          p.player_url,
          ${activeSelect},
          ${playerCategorySql} AS category,
          COALESCE(b.batting_seasons, 0) AS batting_seasons,
          COALESCE(pi.pitching_seasons, 0) AS pitching_seasons,
          b.games,
          b.hits,
          b.home_runs,
          b.rbi,
          pi.wins,
          pi.era
        FROM players p
        LEFT JOIN (
          SELECT
            player_id,
            COUNT(DISTINCT season) AS batting_seasons,
            SUM(games) AS games,
            SUM(hits) AS hits,
            SUM(home_runs) AS home_runs,
            SUM(rbi) AS rbi
          FROM batting_stats
          GROUP BY player_id
        ) b ON b.player_id = p.id
        LEFT JOIN (
          SELECT
            player_id,
            COUNT(DISTINCT season) AS pitching_seasons,
            SUM(games) AS games,
            SUM(wins) AS wins,
            CASE
              WHEN SUM(innings) > 0
              THEN ROUND(SUM(era * innings) / SUM(innings), 2)
              ELSE NULL
            END AS era
          FROM pitching_stats
          GROUP BY player_id
        ) pi ON pi.player_id = p.id
        ${whereSql}
        ORDER BY COALESCE(b.games, 0) + COALESCE(pi.games, 0) DESC, p.kana ASC
        LIMIT ? OFFSET ?
      `,
      )
      .all(...params, safePageSize, offset) as PlayerListItem[];

    return {
      players,
      total,
      page: currentPage,
      pageSize: safePageSize,
      totalPages,
    };
  } finally {
    db.close();
  }
}

function getSeasonTrends(): SeasonTrend[] {
  const db = openDb();
  if (!db) {
    return [];
  }

  try {
    return db
      .prepare(
        `
        WITH seasons AS (
          SELECT season FROM batting_stats WHERE season IS NOT NULL
          UNION
          SELECT season FROM pitching_stats WHERE season IS NOT NULL
        ),
        batting_by_season AS (
          SELECT
            season,
            COUNT(DISTINCT player_id) AS hitters,
            SUM(home_runs) AS homeRuns
          FROM batting_stats
          WHERE season IS NOT NULL
          GROUP BY season
        ),
        pitching_by_season AS (
          SELECT
            season,
            COUNT(DISTINCT player_id) AS pitchers,
            SUM(wins) AS wins
          FROM pitching_stats
          WHERE season IS NOT NULL
          GROUP BY season
        )
        SELECT
          s.season,
          COALESCE(b.hitters, 0) AS hitters,
          COALESCE(pi.pitchers, 0) AS pitchers,
          COALESCE(b.homeRuns, 0) AS homeRuns,
          COALESCE(pi.wins, 0) AS wins
        FROM seasons s
        LEFT JOIN batting_by_season b ON b.season = s.season
        LEFT JOIN pitching_by_season pi ON pi.season = s.season
        ORDER BY s.season ASC
      `,
      )
      .all() as SeasonTrend[];
  } finally {
    db.close();
  }
}

function getTopTeams(): TeamCount[] {
  const db = openDb();
  if (!db) {
    return [];
  }

  try {
    return db
      .prepare(
        `
        SELECT team, COUNT(DISTINCT player_id) AS players
        FROM (
          SELECT team, player_id FROM batting_stats WHERE team IS NOT NULL AND team != ''
          UNION ALL
          SELECT team, player_id FROM pitching_stats WHERE team IS NOT NULL AND team != ''
        )
        GROUP BY team
        ORDER BY players DESC, team ASC
        LIMIT 12
      `,
      )
      .all() as TeamCount[];
  } finally {
    db.close();
  }
}

function getPlayerDetail(id: string): PlayerDetail | null {
  const db = openDb();
  if (!db) {
    return null;
  }

  try {
    const activeSelect = hasPlayerActiveColumn(db)
      ? "is_active"
      : "0 AS is_active";
    const profile = db
      .prepare(
        `
        SELECT
          id,
          name,
          kana,
          player_url,
          ${activeSelect},
          position,
          bats_throws,
          height_weight,
          height_cm,
          weight_kg,
          birth_date,
          birth_date_iso,
          birth_year,
          birth_month,
          birth_day,
          birth_place,
          career,
          draft,
          detail_json
        FROM players
        WHERE id = ?
      `,
      )
      .get(id) as PlayerProfile | undefined;

    if (!profile) {
      return null;
    }

    const batting = db
      .prepare(
        `
        SELECT
          season,
          team,
          games,
          plate_appearances,
          at_bats,
          runs,
          hits,
          doubles,
          triples,
          home_runs,
          total_bases,
          rbi,
          steals,
          caught_stealing,
          sacrifice_hits,
          sacrifice_flies,
          walks,
          hit_by_pitch,
          strikeouts,
          grounded_into_double_plays,
          batting_average,
          on_base_percentage,
          slugging_percentage,
          CASE
            WHEN on_base_percentage IS NOT NULL AND slugging_percentage IS NOT NULL
            THEN on_base_percentage + slugging_percentage
            ELSE NULL
          END AS ops,
          CASE
            WHEN season IS NOT NULL AND plate_appearances >= (
              SELECT COALESCE(MAX(b2.games), 0) * 3.1
              FROM batting_stats b2
              WHERE b2.season = batting_stats.season
            )
            THEN 1 ELSE 0
          END AS is_qualified,
          stats_json
        FROM batting_stats
        WHERE player_id = ?
        ORDER BY season ASC
      `,
      )
      .all(id) as BattingStat[];

    const pitching = db
      .prepare(
        `
        SELECT
          season,
          team,
          games,
          wins,
          losses,
          saves,
          holds,
          hold_points,
          complete_games,
          shutouts,
          no_walk_complete_games,
          winning_percentage,
          batters_faced,
          innings,
          hits_allowed,
          home_runs_allowed,
          walks_allowed,
          hit_by_pitch,
          strikeouts,
          wild_pitches,
          balks,
          runs_allowed,
          earned_runs,
          era,
          whip,
          CASE
            WHEN season IS NOT NULL AND innings >= (
              SELECT COALESCE(MAX(b2.games), 0)
              FROM batting_stats b2
              WHERE b2.season = pitching_stats.season
            )
            THEN 1 ELSE 0
          END AS is_qualified,
          stats_json
        FROM pitching_stats
        WHERE player_id = ?
        ORDER BY season ASC
      `,
      )
      .all(id) as PitchingStat[];

    return {
      profile,
      batting,
      pitching,
    };
  } finally {
    db.close();
  }
}

function getRankingSources(db: DatabaseSync): {
  battingRows: RankingSourceRow[];
  pitchingRows: RankingSourceRow[];
} {
  const battingRows = db
    .prepare(
      `
      SELECT
        b.player_id, p.name, p.kana, b.season, b.team, b.games,
        p.bats_throws, p.career, p.draft, p.birth_year, p.height_cm,
        b.plate_appearances, b.at_bats, b.runs, b.hits, b.doubles, b.triples,
        b.home_runs, b.total_bases, b.rbi, b.steals, b.caught_stealing,
        b.sacrifice_hits, b.sacrifice_flies, b.walks, b.hit_by_pitch,
        b.strikeouts, b.grounded_into_double_plays
      FROM batting_stats b
      JOIN players p ON p.id = b.player_id
      WHERE b.season IS NOT NULL
    `,
    )
    .all() as RankingSourceRow[];
  const pitchingRows = db
    .prepare(
      `
      SELECT
        pi.player_id, p.name, p.kana, pi.season, pi.team, pi.games,
        p.bats_throws, p.career, p.draft, p.birth_year, p.height_cm,
        pi.wins, pi.losses, pi.saves, pi.holds, pi.hold_points,
        pi.complete_games, pi.shutouts, pi.no_walk_complete_games,
        pi.batters_faced, pi.innings, pi.hits_allowed, pi.home_runs_allowed,
        pi.walks_allowed, pi.hit_by_pitch, pi.strikeouts, pi.wild_pitches,
        pi.balks, pi.runs_allowed, pi.earned_runs
      FROM pitching_stats pi
      JOIN players p ON p.id = pi.player_id
      WHERE pi.season IS NOT NULL
    `,
    )
    .all() as RankingSourceRow[];
  return { battingRows, pitchingRows };
}

function getRankingSeasons(): number[] {
  const db = openDb();
  if (!db) return [];
  try {
    return (
      db
        .prepare(
          `
          SELECT DISTINCT season FROM (
            SELECT season FROM batting_stats
            UNION SELECT season FROM pitching_stats
          )
          WHERE season IS NOT NULL AND season >= 1950
          ORDER BY season DESC
        `,
        )
        .all() as { season: number }[]
    ).map((row) => row.season);
  } finally {
    db.close();
  }
}

function getRankings(options: {
  category: RankingCategory;
  league: RankingLeague;
  metric: RankingMetric;
  scope: RankingScope;
  season?: number;
  team?: string;
  filters?: RankingProfileFilters;
}): RankingRow[] {
  const db = openDb();
  if (!db) return [];
  try {
    const sources = getRankingSources(db);
    return buildRankings({ ...sources, ...options });
  } finally {
    db.close();
  }
}

function getRankingTeams(options: {
  category: RankingCategory;
  league: RankingLeague;
  scope: RankingScope;
  season?: number;
}): string[] {
  const db = openDb();
  if (!db) return [];
  try {
    const sources = getRankingSources(db);
    const rows =
      options.category === "batting"
        ? sources.battingRows
        : sources.pitchingRows;
    return [
      ...new Set(
        rows
          .filter(
            (row) =>
              row.team &&
              (options.league === "all" ||
                getLeague(row.team, row.season) === options.league) &&
              (options.scope === "career" || row.season === options.season),
          )
          .map((row) => row.team as string),
      ),
    ].sort((a, b) => a.localeCompare(b, "ja"));
  } finally {
    db.close();
  }
}

function getPlayerLeagueRanks(playerId: string): PlayerLeagueRank[] {
  const db = openDb();
  if (!db) return [];
  try {
    const sources = getRankingSources(db);
    return buildPlayerLeagueRanks({
      battingRows: sources.battingRows as LeagueRankSourceRow[],
      pitchingRows: sources.pitchingRows as LeagueRankSourceRow[],
      playerId,
    });
  } finally {
    db.close();
  }
}

export const sqliteNpbReadRepository = {
  hasDatabase,
  getSummary,
  getSeasonTrends,
  getTopTeams,
  getPlayersPage,
  getPlayerDetail,
  getRankingSeasons,
  getRankings,
  getRankingTeams,
  getPlayerLeagueRanks,
} satisfies NpbReadRepository;
