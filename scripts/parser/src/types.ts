export type PlayerScrapeResult = {
  id: string;
  playerUrl: string;
  playerName: string;
  kanaName: string;
  detailInfo: Record<string, string>;
  pitchingStats: Record<string, string>[];
  battingStats: Record<string, string>[];
};
