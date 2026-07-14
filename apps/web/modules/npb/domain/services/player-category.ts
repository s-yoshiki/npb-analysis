import type { RankingCategory } from "./ranking-service";

export function getPrimaryPlayerCategory({
  battingPlateAppearances,
  hasBatting,
  hasPitching,
  pitchingInnings,
  position,
}: {
  battingPlateAppearances: number;
  hasBatting: boolean;
  hasPitching: boolean;
  pitchingInnings: number;
  position: string | null;
}): RankingCategory {
  if (position === "投手") return "pitching";
  if (["捕手", "内野手", "外野手"].includes(position ?? "")) {
    return "batting";
  }
  if (!hasBatting && hasPitching) return "pitching";
  if (hasBatting && !hasPitching) return "batting";

  return pitchingInnings >= Math.max(10, battingPlateAppearances * 0.5)
    ? "pitching"
    : "batting";
}
