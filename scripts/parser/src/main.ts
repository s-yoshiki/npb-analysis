import { fetchHtml } from "./fetch";
import { parseKanaIndexUrls, parsePlayerUrlsFromKanaPage } from "./parse";
import { scrapePlayer } from "./scrape";
import { ACTIVE_INDEX_ROOT_URL, INDEX_ROOT_URL } from "./constants";
import { createPlayerDatabaseWriter } from "./db";

type CliOptions = {
  dbPath?: string;
  debug: boolean;
  includeRetired: boolean;
  kanaLimit?: number;
  limit?: number;
  delayMs: number;
};

function readCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    debug: false,
    delayMs: 250,
    includeRetired: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === "--db" && next) {
      options.dbPath = next;
      i += 1;
      continue;
    }

    // Kept as a no-op for compatibility with older debug commands.
    if (arg === "--output-dir" && next) {
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
      options.includeRetired = next === "all";
      i += 1;
      continue;
    }

    if (arg === "--include-retired") {
      options.includeRetired = true;
      continue;
    }

    if (arg === "--active-only") {
      options.includeRetired = false;
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
  const urls = options.includeRetired
    ? await collectPlayerUrls(INDEX_ROOT_URL)
    : activeUrls;

  const sortedUrls = [...urls].sort();
  const urlsToScrape =
    options.limit === undefined
      ? sortedUrls
      : sortedUrls.slice(0, options.limit);
  const writer = createPlayerDatabaseWriter(options.dbPath);
  let savedCount = 0;

  try {
    for (const [index, url] of urlsToScrape.entries()) {
      console.log(`Fetching player ${index + 1}/${urlsToScrape.length} ${url}`);
      const playerData = await scrapePlayer(url, activeUrls.has(url));
      writer.upsertPlayer(playerData);
      savedCount += 1;
      if (options.debug) {
        console.log(
          `  [debug] id=${playerData.id} name=${playerData.playerName || "(empty)"} isActive=${playerData.isActive} battingRows=${playerData.battingStats.length} pitchingRows=${playerData.pitchingStats.length} detailKeys=${Object.keys(playerData.detailInfo).length}`,
        );
      }
      await sleep(options.delayMs);
    }
  } finally {
    writer.close();
  }

  console.log(`Saved ${savedCount} player records to ${writer.dbPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
