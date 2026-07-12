import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { PlayerScrapeResult } from "./types";

type StatRow = Record<string, string>;

const DEFAULT_DB_PATH = path.resolve(
  process.cwd(),
  "../../apps/web/data/npb.sqlite",
);

function toNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  if (!normalized || normalized === "-" || normalized === "----") {
    return null;
  }

  const numeric = Number(
    normalized.startsWith(".") ? `0${normalized}` : normalized,
  );
  return Number.isFinite(numeric) ? numeric : null;
}

function parseSeason(row: StatRow): number | null {
  const season = toNumber(row["年度"]);
  return season === null ? null : Math.trunc(season);
}

function parseInnings(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s/g, "");
  const [whole, fraction] = normalized.split(".");
  const base = Number(whole);

  if (!Number.isFinite(base)) {
    return null;
  }

  if (fraction === "1") {
    return base + 1 / 3;
  }

  if (fraction === "2") {
    return base + 2 / 3;
  }

  return base;
}

function parseJapaneseBirthDate(value: string | null): {
  birthDateIso: string | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
} {
  const match = value?.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) {
    return {
      birthDateIso: null,
      birthYear: null,
      birthMonth: null,
      birthDay: null,
    };
  }

  const [, year, month, day] = match;
  return {
    birthDateIso: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    birthYear: Number(year),
    birthMonth: Number(month),
    birthDay: Number(day),
  };
}

function parseHeightWeight(value: string | null): {
  heightCm: number | null;
  weightKg: number | null;
} {
  const match = value?.match(/(\d+)cm／(\d+)kg/);
  if (!match) {
    return {
      heightCm: null,
      weightKg: null,
    };
  }

  return {
    heightCm: Number(match[1]),
    weightKg: Number(match[2]),
  };
}

function calcWhip(row: StatRow): number | null {
  const innings = parseInnings(row["投球回"]);
  if (!innings) {
    return null;
  }

  const walks = toNumber(row["四球"]) ?? 0;
  const hits = toNumber(row["安打"]) ?? 0;
  return Number(((walks + hits) / innings).toFixed(2));
}

function pickDetail(
  detailInfo: Record<string, string>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = detailInfo[key]?.trim();
    if (value) {
      return value;
    }
  }
  return null;
}

function createSchema(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    DROP TABLE IF EXISTS batting_stats;
    DROP TABLE IF EXISTS pitching_stats;
    DROP TABLE IF EXISTS players;

    CREATE TABLE players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kana TEXT,
      player_url TEXT NOT NULL,
      team TEXT,
      position TEXT,
      bats_throws TEXT,
      height_weight TEXT,
      height_cm INTEGER,
      weight_kg INTEGER,
      birth_date TEXT,
      birth_date_iso TEXT,
      birth_year INTEGER,
      birth_month INTEGER,
      birth_day INTEGER,
      birth_place TEXT,
      career TEXT,
      draft TEXT,
      detail_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE batting_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      season INTEGER,
      team TEXT,
      games INTEGER,
      plate_appearances INTEGER,
      at_bats INTEGER,
      runs INTEGER,
      hits INTEGER,
      doubles INTEGER,
      triples INTEGER,
      home_runs INTEGER,
      total_bases INTEGER,
      rbi INTEGER,
      steals INTEGER,
      caught_stealing INTEGER,
      sacrifice_hits INTEGER,
      sacrifice_flies INTEGER,
      walks INTEGER,
      hit_by_pitch INTEGER,
      strikeouts INTEGER,
      grounded_into_double_plays INTEGER,
      batting_average REAL,
      on_base_percentage REAL,
      slugging_percentage REAL,
      stats_json TEXT NOT NULL
    );

    CREATE TABLE pitching_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      season INTEGER,
      team TEXT,
      games INTEGER,
      wins INTEGER,
      losses INTEGER,
      saves INTEGER,
      holds INTEGER,
      hold_points INTEGER,
      complete_games INTEGER,
      shutouts INTEGER,
      no_walk_complete_games INTEGER,
      winning_percentage REAL,
      batters_faced INTEGER,
      innings REAL,
      hits_allowed INTEGER,
      home_runs_allowed INTEGER,
      walks_allowed INTEGER,
      hit_by_pitch INTEGER,
      strikeouts INTEGER,
      wild_pitches INTEGER,
      balks INTEGER,
      runs_allowed INTEGER,
      earned_runs INTEGER,
      era REAL,
      whip REAL,
      stats_json TEXT NOT NULL
    );

    CREATE INDEX idx_players_name ON players(name);
    CREATE INDEX idx_players_kana ON players(kana);
    CREATE INDEX idx_batting_player ON batting_stats(player_id);
    CREATE INDEX idx_batting_season ON batting_stats(season);
    CREATE INDEX idx_pitching_player ON pitching_stats(player_id);
    CREATE INDEX idx_pitching_season ON pitching_stats(season);
  `);
}

export function resolveDbPath(dbPath?: string): string {
  return path.resolve(process.cwd(), dbPath ?? DEFAULT_DB_PATH);
}

export function writePlayersToSqlite(
  players: PlayerScrapeResult[],
  dbPath?: string,
): string {
  const outputPath = resolveDbPath(dbPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const db = new DatabaseSync(outputPath);
  createSchema(db);

  const insertPlayer = db.prepare(`
    INSERT INTO players (
      id, name, kana, player_url, team, position, bats_throws,
      height_weight, height_cm, weight_kg, birth_date, birth_date_iso,
      birth_year, birth_month, birth_day, birth_place, career, draft,
      detail_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBatting = db.prepare(`
    INSERT INTO batting_stats (
      player_id, season, team, games, plate_appearances, at_bats, runs, hits,
      doubles, triples, home_runs, total_bases, rbi, steals, caught_stealing,
      sacrifice_hits, sacrifice_flies, walks, hit_by_pitch, strikeouts,
      grounded_into_double_plays, batting_average, on_base_percentage,
      slugging_percentage, stats_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPitching = db.prepare(`
    INSERT INTO pitching_stats (
      player_id, season, team, games, wins, losses, saves, holds, hold_points,
      complete_games, shutouts, no_walk_complete_games, winning_percentage,
      batters_faced, innings, hits_allowed, home_runs_allowed, walks_allowed,
      hit_by_pitch, strikeouts, wild_pitches, balks, runs_allowed, earned_runs,
      era, whip, stats_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    for (const player of players) {
      const heightWeight = pickDetail(player.detailInfo, [
        "身長/体重",
        "身長／体重",
        "身長・体重",
      ]);
      const { heightCm, weightKg } = parseHeightWeight(heightWeight);
      const birthDate = pickDetail(player.detailInfo, ["生年月日"]);
      const { birthDateIso, birthYear, birthMonth, birthDay } =
        parseJapaneseBirthDate(birthDate);

      insertPlayer.run(
        player.id,
        player.playerName,
        player.kanaName,
        player.playerUrl,
        pickDetail(player.detailInfo, ["所属球団", "球団"]),
        pickDetail(player.detailInfo, ["守備位置", "ポジション"]),
        pickDetail(player.detailInfo, ["投打", "投・打"]),
        heightWeight,
        heightCm,
        weightKg,
        birthDate,
        birthDateIso,
        birthYear,
        birthMonth,
        birthDay,
        pickDetail(player.detailInfo, ["出身地"]),
        pickDetail(player.detailInfo, ["経歴"]),
        pickDetail(player.detailInfo, ["ドラフト"]),
        JSON.stringify(player.detailInfo),
      );

      for (const row of player.battingStats) {
        insertBatting.run(
          player.id,
          parseSeason(row),
          row["所属球団"] || null,
          toNumber(row["試合"]),
          toNumber(row["打席"]),
          toNumber(row["打数"]),
          toNumber(row["得点"]),
          toNumber(row["安打"]),
          toNumber(row["二塁打"]),
          toNumber(row["三塁打"]),
          toNumber(row["本塁打"]),
          toNumber(row["塁打"]),
          toNumber(row["打点"]),
          toNumber(row["盗塁"]),
          toNumber(row["盗塁刺"]),
          toNumber(row["犠打"]),
          toNumber(row["犠飛"]),
          toNumber(row["四球"]),
          toNumber(row["死球"]),
          toNumber(row["三振"]),
          toNumber(row["併殺打"]),
          toNumber(row["打率"]),
          toNumber(row["出塁率"]),
          toNumber(row["長打率"]),
          JSON.stringify(row),
        );
      }

      for (const row of player.pitchingStats) {
        insertPitching.run(
          player.id,
          parseSeason(row),
          row["所属球団"] || null,
          toNumber(row["登板"]),
          toNumber(row["勝利"]),
          toNumber(row["敗北"]),
          toNumber(row["セーブ"]),
          toNumber(row["ホールド"] ?? row["H"]),
          toNumber(row["HP"]),
          toNumber(row["完投"]),
          toNumber(row["完封勝"]),
          toNumber(row["無四球"]),
          toNumber(row["勝率"]),
          toNumber(row["打者"]),
          parseInnings(row["投球回"]),
          toNumber(row["安打"]),
          toNumber(row["本塁打"]),
          toNumber(row["四球"]),
          toNumber(row["死球"]),
          toNumber(row["奪三振"]),
          toNumber(row["暴投"]),
          toNumber(row["ボーク"]),
          toNumber(row["失点"]),
          toNumber(row["自責点"]),
          toNumber(row["防御率"]),
          calcWhip(row),
          JSON.stringify(row),
        );
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  db.close();

  return outputPath;
}
