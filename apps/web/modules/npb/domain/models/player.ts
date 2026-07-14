export type PlayerCategory = "batting" | "pitching";

export type PlayerListItem = {
  id: string;
  name: string;
  kana: string | null;
  player_url: string;
  is_active: number;
  category: PlayerCategory;
  batting_seasons: number;
  pitching_seasons: number;
  games: number | null;
  hits: number | null;
  home_runs: number | null;
  rbi: number | null;
  wins: number | null;
  era: number | null;
};

export type PlayerListPage = {
  players: PlayerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PlayerFilters = {
  category?: PlayerCategory;
  name?: string;
  throws?: "right" | "left";
  bats?: "right" | "left" | "both";
  school?: string;
  draftYearMin?: number;
  draftYearMax?: number;
  draftRank?: string;
  birthYearMin?: number;
  birthYearMax?: number;
  heightMin?: number;
  heightMax?: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  kana: string | null;
  player_url: string;
  is_active: number;
  position: string | null;
  bats_throws: string | null;
  height_weight: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  birth_date_iso: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_place: string | null;
  career: string | null;
  draft: string | null;
  detail_json: string;
};

export type BattingStat = {
  season: number | null;
  team: string | null;
  games: number | null;
  plate_appearances: number | null;
  at_bats: number | null;
  runs: number | null;
  hits: number | null;
  doubles: number | null;
  triples: number | null;
  home_runs: number | null;
  total_bases: number | null;
  rbi: number | null;
  steals: number | null;
  caught_stealing: number | null;
  sacrifice_hits: number | null;
  sacrifice_flies: number | null;
  walks: number | null;
  hit_by_pitch: number | null;
  strikeouts: number | null;
  grounded_into_double_plays: number | null;
  batting_average: number | null;
  on_base_percentage: number | null;
  slugging_percentage: number | null;
  ops: number | null;
  is_qualified: number;
  stats_json: string;
};

export type PitchingStat = {
  season: number | null;
  team: string | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  saves: number | null;
  holds: number | null;
  hold_points: number | null;
  complete_games: number | null;
  shutouts: number | null;
  no_walk_complete_games: number | null;
  winning_percentage: number | null;
  batters_faced: number | null;
  innings: number | null;
  hits_allowed: number | null;
  home_runs_allowed: number | null;
  walks_allowed: number | null;
  hit_by_pitch: number | null;
  strikeouts: number | null;
  wild_pitches: number | null;
  balks: number | null;
  runs_allowed: number | null;
  earned_runs: number | null;
  era: number | null;
  whip: number | null;
  is_qualified: number;
  stats_json: string;
};

export type PlayerDetail = {
  profile: PlayerProfile;
  batting: BattingStat[];
  pitching: PitchingStat[];
};
