import type { NpbReadRepository } from "./ports/npb-read-repository";
import type {
  PlayerPageQuery,
  RankingQuery,
  RankingTeamQuery,
} from "./ports/npb-read-repository";

/**
 * Server Componentsから利用する読み取りユースケース。
 * UIはこのクラスを境界として扱い、SQLiteの存在を意識しない。
 */
export class NpbQueryService {
  constructor(private readonly repository: NpbReadRepository) {}

  isDatabaseReady() {
    return this.repository.hasDatabase();
  }

  getDashboard() {
    return {
      summary: this.repository.getSummary(),
      trends: this.repository.getSeasonTrends(),
      teams: this.repository.getTopTeams(),
    };
  }

  getPlayersPage(query: PlayerPageQuery) {
    return this.repository.getPlayersPage(query);
  }

  getPlayerDetail(id: string) {
    return this.repository.getPlayerDetail(id);
  }

  getPlayer(id: string) {
    const detail = this.repository.getPlayerDetail(id);
    if (!detail) return null;

    return {
      detail,
      leagueRanks: this.repository.getPlayerLeagueRanks(id),
    };
  }

  getRankingSeasons() {
    return this.repository.getRankingSeasons();
  }

  getRankings(query: RankingQuery) {
    return this.repository.getRankings(query);
  }

  getRankingTeams(query: RankingTeamQuery) {
    return this.repository.getRankingTeams(query);
  }
}
