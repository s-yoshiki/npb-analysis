import { createServer } from "node:http";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath =
  process.env.NPB_DB_PATH ?? path.join(import.meta.dirname, "data/npb.sqlite");
const db = new DatabaseSync(databasePath, { readOnly: true });
db.exec("PRAGMA query_only=ON; PRAGMA temp_store=MEMORY");

const hasActiveColumn = db
  .prepare("PRAGMA table_info(players)")
  .all()
  .some((column) => column.name === "is_active");

const playerCategorySql = `
  CASE
    WHEN p.position = '投手' THEN 'pitching'
    WHEN p.position IN ('捕手', '内野手', '外野手') THEN 'batting'
    WHEN COALESCE((SELECT SUM(pi2.innings) FROM pitching_stats pi2 WHERE pi2.player_id = p.id), 0)
      >= MAX(10, COALESCE((SELECT SUM(b2.plate_appearances) FROM batting_stats b2 WHERE b2.player_id = p.id), 0) * 0.5)
      THEN 'pitching'
    ELSE 'batting'
  END
`;

function likeQuery(value) {
  return `%${value.replace(/[%_]/g, "\\$&")}%`;
}

function optionalNumber(params, name) {
  const value = params.get(name);
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function buildWhere(params) {
  const conditions = [];
  const values = [];
  const query = (params.get("q") ?? "").trim().slice(0, 100);
  if (query) {
    conditions.push("(p.name LIKE ? ESCAPE '\\' OR p.kana LIKE ? ESCAPE '\\')");
    values.push(likeQuery(query), likeQuery(query));
  }

  const category = params.get("category");
  if (category === "batting" || category === "pitching") {
    conditions.push(`(${playerCategorySql}) = ?`);
    values.push(category);
  }
  const throwsValue = params.get("throws");
  if (throwsValue === "right" || throwsValue === "left") {
    conditions.push("p.bats_throws LIKE ?");
    values.push(`%${throwsValue === "right" ? "右投" : "左投"}%`);
  }
  const bats = params.get("bats");
  if (bats === "right" || bats === "left" || bats === "both") {
    conditions.push("p.bats_throws LIKE ?");
    values.push(
      `%${bats === "right" ? "右打" : bats === "left" ? "左打" : "両打"}%`,
    );
  }
  const school = (params.get("school") ?? "").trim().slice(0, 100);
  if (school) {
    conditions.push("p.career LIKE ? ESCAPE '\\'");
    values.push(likeQuery(school));
  }

  for (const [name, column, operator] of [
    ["draftYearMin", "CAST(substr(p.draft, 1, 4) AS INTEGER)", ">="],
    ["draftYearMax", "CAST(substr(p.draft, 1, 4) AS INTEGER)", "<="],
    ["birthYearMin", "p.birth_year", ">="],
    ["birthYearMax", "p.birth_year", "<="],
    ["heightMin", "p.height_cm", ">="],
    ["heightMax", "p.height_cm", "<="],
  ]) {
    const value = optionalNumber(params, name);
    if (value !== undefined) {
      conditions.push(`${column} ${operator} ?`);
      values.push(value);
    }
  }

  const draftRank = params.get("draftRank");
  if (draftRank === "outside") {
    conditions.push("p.draft LIKE '%ドラフト外%'");
  } else if (draftRank && /^\d{1,2}$/.test(draftRank)) {
    conditions.push("(p.draft LIKE ? OR p.draft LIKE ?)");
    values.push(`%ドラフト%${draftRank}位%`, `%ドラフト%${draftRank}巡目%`);
  }

  return {
    query,
    values,
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
  };
}

export function searchPlayers(params) {
  const requestedPage = Math.max(
    1,
    Number.parseInt(params.get("page") ?? "1", 10) || 1,
  );
  const pageSize = Math.max(
    1,
    Math.min(100, Number.parseInt(params.get("pageSize") ?? "40", 10) || 40),
  );
  const { query, values, where } = buildWhere(params);
  const total = db
    .prepare(`SELECT COUNT(*) AS total FROM players p ${where}`)
    .get(...values).total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;
  const activeSelect = hasActiveColumn ? "p.is_active" : "0 AS is_active";
  const players = db
    .prepare(`
    SELECT p.id, p.name, p.kana, p.player_url, ${activeSelect},
      ${playerCategorySql} AS category,
      COALESCE(b.batting_seasons, 0) AS batting_seasons,
      COALESCE(pi.pitching_seasons, 0) AS pitching_seasons,
      b.games, b.hits, b.home_runs, b.rbi, pi.wins, pi.era
    FROM players p
    LEFT JOIN (
      SELECT player_id, COUNT(DISTINCT season) AS batting_seasons,
        SUM(games) AS games, SUM(hits) AS hits, SUM(home_runs) AS home_runs, SUM(rbi) AS rbi
      FROM batting_stats GROUP BY player_id
    ) b ON b.player_id = p.id
    LEFT JOIN (
      SELECT player_id, COUNT(DISTINCT season) AS pitching_seasons,
        SUM(games) AS games, SUM(wins) AS wins,
        CASE WHEN SUM(innings) > 0 THEN ROUND(SUM(era * innings) / SUM(innings), 2) ELSE NULL END AS era
      FROM pitching_stats GROUP BY player_id
    ) pi ON pi.player_id = p.id
    ${where}
    ORDER BY COALESCE(b.games, 0) + COALESCE(pi.games, 0) DESC, p.kana ASC
    LIMIT ? OFFSET ?
  `)
    .all(...values, pageSize, offset);

  return { players, total, page, pageSize, totalPages, query };
}

export function getPlayerDetail(id) {
  const activeSelect = hasActiveColumn ? "is_active" : "0 AS is_active";
  const profile = db
    .prepare(`
    SELECT id, name, kana, player_url, ${activeSelect}, position, bats_throws,
      height_weight, height_cm, weight_kg, birth_date, birth_date_iso,
      birth_year, birth_month, birth_day, birth_place, career, draft, detail_json
    FROM players WHERE id = ?
  `)
    .get(id);
  if (!profile) return undefined;

  const batting = db
    .prepare(`
    SELECT season, team, games, plate_appearances, at_bats, runs, hits, doubles,
      triples, home_runs, total_bases, rbi, steals, caught_stealing,
      sacrifice_hits, sacrifice_flies, walks, hit_by_pitch, strikeouts,
      grounded_into_double_plays, batting_average, on_base_percentage,
      slugging_percentage,
      CASE WHEN on_base_percentage IS NOT NULL AND slugging_percentage IS NOT NULL
        THEN on_base_percentage + slugging_percentage ELSE NULL END AS ops,
      CASE WHEN season IS NOT NULL AND plate_appearances >= (
        SELECT COALESCE(MAX(b2.games), 0) * 3.1 FROM batting_stats b2
        WHERE b2.season = batting_stats.season
      ) THEN 1 ELSE 0 END AS is_qualified,
      stats_json
    FROM batting_stats WHERE player_id = ? ORDER BY season ASC
  `)
    .all(id);
  const pitching = db
    .prepare(`
    SELECT season, team, games, wins, losses, saves, holds, hold_points,
      complete_games, shutouts, no_walk_complete_games, winning_percentage,
      batters_faced, innings, hits_allowed, home_runs_allowed, walks_allowed,
      hit_by_pitch, strikeouts, wild_pitches, balks, runs_allowed, earned_runs,
      era, whip,
      CASE WHEN season IS NOT NULL AND innings >= (
        SELECT COALESCE(MAX(b2.games), 0) FROM batting_stats b2
        WHERE b2.season = pitching_stats.season
      ) THEN 1 ELSE 0 END AS is_qualified,
      stats_json
    FROM pitching_stats WHERE player_id = ? ORDER BY season ASC
  `)
    .all(id);
  return { profile, batting, pitching };
}

function sendJson(response, status, body, cacheControl = "no-store") {
  response.writeHead(status, {
    "cache-control": cacheControl,
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (request.method === "GET" && url.pathname === "/api/health") {
      return sendJson(response, 200, { status: "ok" }, "public, max-age=60");
    }
    if (request.method === "GET" && url.pathname === "/api/players") {
      return sendJson(response, 200, searchPlayers(url.searchParams));
    }
    const detailMatch = url.pathname.match(
      /^\/api\/players\/([A-Za-z0-9_-]+)$/,
    );
    if (request.method === "GET" && detailMatch) {
      const detail = getPlayerDetail(detailMatch[1]);
      return detail
        ? sendJson(response, 200, detail, "public, max-age=300")
        : sendJson(response, 404, { error: "Player not found" });
    }
    return sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: "Internal server error" });
  }
});

if (process.env.NPB_API_NO_LISTEN !== "1") {
  server.listen(Number(process.env.PORT ?? 8080), "0.0.0.0");
}
