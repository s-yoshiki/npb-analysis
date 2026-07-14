export type DatabaseSummary = {
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
