import type {
  DatabaseSummary,
  SeasonTrend,
  TeamCount,
} from "../../domain/models/dashboard";
import type {
  PlayerDetail,
  PlayerFilters,
  PlayerListPage,
} from "../../domain/models/player";
import type { PlayerLeagueRank } from "../../domain/services/league-ranking-service";
import type {
  RankingCategory,
  RankingLeague,
  RankingMetric,
  RankingProfileFilters,
  RankingRow,
  RankingScope,
} from "../../domain/services/ranking-service";

export type PlayerPageQuery = {
  page: number;
  pageSize: number;
  query: string;
  filters?: PlayerFilters;
};

export type RankingQuery = {
  category: RankingCategory;
  league: RankingLeague;
  metric: RankingMetric;
  scope: RankingScope;
  season?: number;
  team?: string;
  filters?: RankingProfileFilters;
};

export type RankingTeamQuery = Pick<
  RankingQuery,
  "category" | "league" | "scope" | "season"
>;

export interface DatabaseStatusRepository {
  hasDatabase(): boolean;
}

export interface DashboardReadRepository {
  getSummary(): DatabaseSummary;
  getSeasonTrends(): SeasonTrend[];
  getTopTeams(): TeamCount[];
}

export interface PlayerReadRepository {
  getPlayersPage(query: PlayerPageQuery): PlayerListPage;
  getPlayerDetail(id: string): PlayerDetail | null;
  getPlayerLeagueRanks(playerId: string): PlayerLeagueRank[];
}

export interface RankingReadRepository {
  getRankingSeasons(): number[];
  getRankings(query: RankingQuery): RankingRow[];
  getRankingTeams(query: RankingTeamQuery): string[];
}

/** Application層が必要とする読み取りポートの集合。DB技術には依存しない。 */
export type NpbReadRepository = DatabaseStatusRepository &
  DashboardReadRepository &
  PlayerReadRepository &
  RankingReadRepository;
