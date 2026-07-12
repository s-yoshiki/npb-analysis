import axios from "axios";
import * as cheerio from "cheerio";
import { PlayerScrapeResult } from "./types";

function normalizeCellText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseStatTable($: cheerio.Root, selector: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const headers = $(selector)
    .find("thead th")
    .map((_, th) => normalizeCellText($(th).text() ?? ""))
    .get();

  if (!headers.length) {
    return rows;
  }

  $(selector)
    .find("tbody tr")
    .each((_, tr) => {
      const cells = $(tr)
        .find("td, th")
        .map((_, cell) => normalizeCellText($(cell).text() ?? ""))
        .get();

      if (!cells.length) {
        return;
      }

      const row: Record<string, string> = {};
      for (let i = 0; i < Math.min(headers.length, cells.length); i += 1) {
        let value = cells[i];
        if (headers[i] === "投球回") {
          value = value.replace(/\s+/g, "");
        }
        row[headers[i]] = value;
      }

      rows.push(row);
    });

  return rows;
}

export async function scrapePlayer(url: string): Promise<PlayerScrapeResult> {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    responseType: "text",
  });

  const $ = cheerio.load(data);

  const playerName = $("#pc_v_name li").first().text().trim();
  const kanaName = $("#pc_v_name li").eq(1).text().trim();

  const detailInfo: Record<string, string> = {};
  $("#pc_v_name table tr").each((_, tr) => {
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
    detailInfo,
    pitchingStats,
    battingStats,
  };
}
