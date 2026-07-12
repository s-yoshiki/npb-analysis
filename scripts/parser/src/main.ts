import fs from "fs";
import path from "path";
import { fetchHtml } from "./fetch";
import { parseKanaIndexUrls, parsePlayerUrlsFromKanaPage } from "./parse";
import { scrapePlayer } from "./scrape";
import { PlayerScrapeResult } from "./types";
import { INDEX_ROOT_URL } from "./constants";

const OUTPUT_JSON = path.resolve(process.cwd(), "player_urls.json");
const OUTPUT_TXT = path.resolve(process.cwd(), "player_urls.txt");
const OUTPUT_PLAYERS_JSON = path.resolve(process.cwd(), "player_data.json");

async function main() {
  const rootHtml = await fetchHtml(INDEX_ROOT_URL);
  const kanaPages = parseKanaIndexUrls(rootHtml);

  if (!kanaPages.length) {
    throw new Error("Kana index pages not found from index.html");
  }

  const urls = new Set<string>();

  for (const pageUrl of kanaPages) {
    console.log(`Scraping ${pageUrl}`);
    const url = `https://npb.jp/bis/players/all/${pageUrl}`;
    const pageHtml = await fetchHtml(url);
    const pageUrls = parsePlayerUrlsFromKanaPage(pageHtml);
    pageUrls.forEach((playerUrl) => urls.add(playerUrl));
    console.log(`  found ${pageUrls.length} players (total ${urls.size})`);
  }

  const players: PlayerScrapeResult[] = [];
  let i = 0;
  for (const url of urls) {
    i++;
    console.log(`Fetching player ${url}`);
    const playerData = await scrapePlayer(url);
    players.push(playerData);
    if (i > 100) {
      break;
    }
  }

  const sortedUrls = [...urls].sort();
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(sortedUrls, null, 2), "utf-8");
  fs.writeFileSync(OUTPUT_TXT, sortedUrls.join("\n"), "utf-8");
  fs.writeFileSync(OUTPUT_PLAYERS_JSON, JSON.stringify(players, null, 2), "utf-8");

  console.log(`Saved ${players.length} player records to ${OUTPUT_PLAYERS_JSON}`);
  console.log(`Saved ${sortedUrls.length} player URLs to:`);
  console.log(`  ${OUTPUT_JSON}`);
  console.log(`  ${OUTPUT_TXT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
