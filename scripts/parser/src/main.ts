import fs from "fs";
import path from "path";
import { fetchHtml } from "./fetch";
import { parseKanaIndexUrls, parsePlayerUrlsFromKanaPage } from "./parse";
import { scrapePlayer } from "./scrape";
import { PlayerScrapeResult } from "./types";
import { ACTIVE_INDEX_ROOT_URL, INDEX_ROOT_URL } from "./constants";
import { writePlayersToSqlite } from "./db";

type CliOptions = {
  dbPath?: string;
  debug: boolean;
  fromJson?: string;
  kanaLimit?: number;
  limit?: number;
  scope: "active" | "all";
  outputDir: string;
  delayMs: number;
};

function readCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    debug: false,
    delayMs: 250,
    outputDir: process.cwd(),
    scope: "active",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === "--db" && next) {
      options.dbPath = next;
      i += 1;
      continue;
    }

    if (arg === "--from-json" && next) {
      options.fromJson = next;
      i += 1;
      continue;
    }

    if (arg === "--output-dir" && next) {
      options.outputDir = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === "--limit" && next) {
      options.limit = next === "all" ? undefined : Number(next);
      i += 1;
      continue;
    }

    if (arg === "--scope" && next) {
      if (next !== "active" && next !== "all") {
        throw new Error("--scope must be either active or all");
      }
      options.scope = next;
      i += 1;
      continue;
    }

    if (arg === "--kana-limit" && next) {
      options.kanaLimit = next === "all" ? undefined : Number(next);
      i += 1;
      continue;
    }

    if (arg === "--delay" && next) {
      options.delayMs = Number(next);
      i += 1;
      continue;
    }

    if (arg === "--debug") {
      options.debug = true;
    }
  }

  return options;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const options = readCliOptions();
  const outputJson = path.resolve(options.outputDir, "player_urls.json");
  const outputTxt = path.resolve(options.outputDir, "player_urls.txt");
  const outputPlayersJson = path.resolve(options.outputDir, "player_data.json");

  if (options.fromJson) {
    const jsonPath = path.resolve(process.cwd(), options.fromJson);
    const importedPlayers = JSON.parse(
      fs.readFileSync(jsonPath, "utf-8"),
    ) as (Omit<PlayerScrapeResult, "isActive"> & { isActive?: boolean })[];
    const missingStatusCount = importedPlayers.filter(
      (player) => player.isActive === undefined,
    ).length;
    if (missingStatusCount > 0) {
      console.warn(
        `Warning: ${missingStatusCount} imported records have no isActive flag; treating them as retired`,
      );
    }
    const players: PlayerScrapeResult[] = importedPlayers.map((player) => ({
      ...player,
      isActive: player.isActive ?? false,
    }));
    const dbPath = writePlayersToSqlite(players, options.dbPath);
    console.log(`Imported ${players.length} player records to ${dbPath}`);
    return;
  }

  const collectPlayerUrls = async (indexRootUrl: string) => {
    const rootHtml = await fetchHtml(indexRootUrl);
    const allKanaPages = parseKanaIndexUrls(rootHtml, indexRootUrl);
    const kanaPages =
      options.kanaLimit === undefined
        ? allKanaPages
        : allKanaPages.slice(0, options.kanaLimit);
    if (options.debug) {
      console.log(`[debug] index=${indexRootUrl}`);
      console.log(
        `[debug] kanaPages=${kanaPages.length}/${allKanaPages.length}`,
      );
      console.log(`[debug] kanaSample=${kanaPages.slice(0, 5).join(", ")}`);
    }

    if (!kanaPages.length) {
      throw new Error(`Kana index pages not found from ${indexRootUrl}`);
    }

    const urls = new Set<string>();
    for (const pageUrl of kanaPages) {
      console.log(`Scraping ${pageUrl}`);
      const pageHtml = await fetchHtml(pageUrl);
      const pageUrls = parsePlayerUrlsFromKanaPage(pageHtml, pageUrl);
      pageUrls.forEach((playerUrl) => urls.add(playerUrl));
      console.log(`  found ${pageUrls.length} players (total ${urls.size})`);
      if (options.debug) {
        console.log(`  [debug] sample=${pageUrls.slice(0, 3).join(", ")}`);
      }
      await sleep(options.delayMs);
    }
    return urls;
  };

  const activeUrls = await collectPlayerUrls(ACTIVE_INDEX_ROOT_URL);
  const urls =
    options.scope === "active"
      ? activeUrls
      : await collectPlayerUrls(INDEX_ROOT_URL);

  const players: PlayerScrapeResult[] = [];
  let i = 0;
  for (const url of [...urls].sort()) {
    i++;
    if (options.limit !== undefined && i > options.limit) {
      break;
    }

    console.log(`Fetching player ${i}/${urls.size} ${url}`);
    const playerData = await scrapePlayer(url, activeUrls.has(url));
    players.push(playerData);
    if (options.debug) {
      console.log(
        `  [debug] id=${playerData.id} name=${playerData.playerName || "(empty)"} isActive=${playerData.isActive} battingRows=${playerData.battingStats.length} pitchingRows=${playerData.pitchingStats.length} detailKeys=${Object.keys(playerData.detailInfo).length}`,
      );
    }
    await sleep(options.delayMs);
  }

  const sortedUrls = [...urls].sort();
  fs.mkdirSync(options.outputDir, { recursive: true });
  fs.writeFileSync(outputJson, JSON.stringify(sortedUrls, null, 2), "utf-8");
  fs.writeFileSync(outputTxt, sortedUrls.join("\n"), "utf-8");
  fs.writeFileSync(
    outputPlayersJson,
    JSON.stringify(players, null, 2),
    "utf-8",
  );
  const dbPath = writePlayersToSqlite(players, options.dbPath);

  console.log(`Saved ${players.length} player records to ${dbPath}`);
  console.log(`Saved ${players.length} player records to ${outputPlayersJson}`);
  console.log(`Saved ${sortedUrls.length} player URLs to:`);
  console.log(`  ${outputJson}`);
  console.log(`  ${outputTxt}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
