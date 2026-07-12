import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = path.join(process.cwd(), "data", "npb.sqlite");

export type PlayerListRow = {
  id: string;
  name: string;
  kana: string | null;
  player_url: string;
  batting_seasons: number;
  pitching_seasons: number;
  games: number | null;
  hits: number | null;
  home_runs: number | null;
  rbi: number | null;
  wins: number | null;
  era: number | null;
};

export type PlayersPage = {
  players: PlayerListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type Summary = {
  players: number;
  battingRows: number;
  pitchingRows: number;
  firstSeason: number | null;
  lastSeason: number | null;
  hitters: number;
  pitchers: number;
};

export type SeasonTrend = {
  season: number;
  hitters: number;
  pitchers: number;
  homeRuns: number;
  wins: number;
};

export type TeamCount = {
  team: string;
  players: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  kana: string | null;
  player_url: string;
  bats_throws: string | null;
  height_weight: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  birth_date_iso: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_place: string | null;
  career: string | null;
  draft: string | null;
  detail_json: string;
};

export type BattingStatRow = {
  season: number | null;
  team: string | null;
  games: number | null;
  plate_appearances: number | null;
  at_bats: number | null;
  runs: number | null;
  hits: number | null;
  doubles: number | null;
  triples: number | null;
  home_runs: number | null;
  total_bases: number | null;
  rbi: number | null;
  steals: number | null;
  caught_stealing: number | null;
  sacrifice_hits: number | null;
  sacrifice_flies: number | null;
  walks: number | null;
  hit_by_pitch: number | null;
  strikeouts: number | null;
  grounded_into_double_plays: number | null;
  batting_average: number | null;
  on_base_percentage: number | null;
  slugging_percentage: number | null;
  stats_json: string;
};

export type PitchingStatRow = {
  season: number | null;
  team: string | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  saves: number | null;
  holds: number | null;
  hold_points: number | null;
  complete_games: number | null;
  shutouts: number | null;
  no_walk_complete_games: number | null;
  winning_percentage: number | null;
  batters_faced: number | null;
  innings: number | null;
  hits_allowed: number | null;
  home_runs_allowed: number | null;
  walks_allowed: number | null;
  hit_by_pitch: number | null;
  strikeouts: number | null;
  wild_pitches: number | null;
  balks: number | null;
  runs_allowed: number | null;
  earned_runs: number | null;
  era: number | null;
  whip: number | null;
  stats_json: string;
};

export type PlayerDetail = {
  profile: PlayerProfile;
  batting: BattingStatRow[];
  pitching: PitchingStatRow[];
};

type ScalarRow = Record<string, number | null>;

function openDb(): DatabaseSync | null {
  if (!fs.existsSync(DB_PATH)) {
    return null;
  }

  return new DatabaseSync(DB_PATH, { readOnly: true });
}

function likeQuery(value: string): string {
  return `%${value.replace(/[%_]/g, "\\$&")}%`;
}

export function hasDatabase(): boolean {
  return fs.existsSync(DB_PATH);
}

export function getSummary(): Summary {
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

function getPlayerListWhere(query: string) {
  const normalizedQuery = query.trim();

  return {
    normalizedQuery,
    params: normalizedQuery
      ? [likeQuery(normalizedQuery), likeQuery(normalizedQuery)]
      : [],
    whereSql: normalizedQuery
      ? "WHERE p.name LIKE ? ESCAPE '\\' OR p.kana LIKE ? ESCAPE '\\'"
      : "",
  };
}

export function getPlayersPage({
  page,
  pageSize,
  query,
}: {
  page: number;
  pageSize: number;
  query: string;
}): PlayersPage {
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

  const { params, whereSql } = getPlayerListWhere(query);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const requestedPage = Math.max(1, page);

  try {
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
      .all(...params, safePageSize, offset) as PlayerListRow[];

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

export function getPlayers(query: string): PlayerListRow[] {
  return getPlayersPage({ page: 1, pageSize: 80, query }).players;
}

export function getSeasonTrends(): SeasonTrend[] {
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

export function getTopTeams(): TeamCount[] {
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

export function getPlayerDetail(id: string): PlayerDetail | null {
  const db = openDb();
  if (!db) {
    return null;
  }

  try {
    const profile = db
      .prepare(
        `
        SELECT
          id,
          name,
          kana,
          player_url,
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
          stats_json
        FROM batting_stats
        WHERE player_id = ?
        ORDER BY season ASC
      `,
      )
      .all(id) as BattingStatRow[];

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
          stats_json
        FROM pitching_stats
        WHERE player_id = ?
        ORDER BY season ASC
      `,
      )
      .all(id) as PitchingStatRow[];

    return {
      profile,
      batting,
      pitching,
    };
  } finally {
    db.close();
  }
}
