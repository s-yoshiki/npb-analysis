import axios from "axios";
import * as cheerio from "cheerio";
import { PlayerScrapeResult } from "./types";

function normalizeCellText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseStatTable(
  $: cheerio.CheerioAPI,
  selector: string,
): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const table = $(selector);
  const headers = table
    .children("thead")
    .find("th")
    .map((_, th) => normalizeCellText($(th).text() ?? ""))
    .get();

  if (!headers.length) {
    return rows;
  }

  table
    .children("tbody")
    .children("tr")
    .each((_, tr) => {
      const cells = $(tr)
        .children("td, th")
        .map((_, cell) => normalizeCellText($(cell).text() ?? ""))
        .get();

      if (!cells.length) {
        return;
      }

      const row: Record<string, string> = {};
      for (let i = 0; i < Math.min(headers.length, cells.length); i += 1) {
        const header = headers[i]!;
        let value = cells[i]!;
        if (header === "投球回") {
          value = value.replace(/\s+/g, "");
        }
        row[header] = value;
      }

      rows.push(row);
    });

  return rows;
}

export async function scrapePlayer(
  url: string,
  isActive: boolean,
): Promise<PlayerScrapeResult> {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    responseType: "text",
  });

  const $ = cheerio.load(data);

  const playerName = $("li#pc_v_name").first().text().trim();
  const kanaName = $("li#pc_v_kana").first().text().trim();

  const detailInfo: Record<string, string> = {};
  $("table")
    .not("#tablefix_p")
    .not("#tablefix_b")
    .not(".table_inning")
    .first()
    .find("tr")
    .each((_, tr) => {
      const key = normalizeCellText($(tr).find("th").text() ?? "");
      const value = normalizeCellText($(tr).find("td").text() ?? "");
      if (key) {
        detailInfo[key] = value;
      }
    });

  const pitchingStats = parseStatTable($, "#tablefix_p");
  const battingStats = parseStatTable($, "#tablefix_b");

  return {
    id: url.match(/\/players\/(\d+)\.html/)?.[1] || "",
    playerUrl: url,
    playerName,
    kanaName,
    isActive,
    detailInfo,
    pitchingStats,
    battingStats,
  };
}
