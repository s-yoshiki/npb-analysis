import * as cheerio from "cheerio";
import { BASE_URL } from "./constants";

function resolveUrl(href: string, basePath: string): string {
  return new URL(href, `${BASE_URL}${basePath}`).toString();
}

export function parseKanaIndexUrls(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href) return;
    if (
      /^(?:index_[a-z]+\.html|\/bis\/players\/all\/index_[a-z]+\.html)$/.test(
        href,
      )
    ) {
      urls.add(resolveUrl(href, "/bis/players/all/"));
    }
  });

  return [...urls].sort();
}

export function parsePlayerUrlsFromKanaPage(html: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();
    if (!href) return;
    if (
      /^(?:\.\.\/\d+\.html|\/bis\/players\/\d+\.html|https?:\/\/npb\.jp\/bis\/players\/\d+\.html)$/.test(
        href,
      )
    ) {
      urls.add(resolveUrl(href, "/bis/players/all/"));
    }
  });

  return [...urls].sort();
}
