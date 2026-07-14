/** NPBのリーグ区分。 */
export type League = "central" | "pacific";

const CENTRAL_TEAMS = [
  "読売",
  "巨人",
  "阪神",
  "タイガース",
  "中日",
  "名古屋",
  "産業",
  "広島",
  "国鉄",
  "サンケイ",
  "アトムズ",
  "ヤクルト",
  "大洋",
  "横浜",
  "松竹",
  "西日本",
];

const PACIFIC_TEAMS = [
  "南海",
  "ダイエー",
  "福岡ソフトバンク",
  "阪急",
  "オリックス",
  "近鉄",
  "西鉄",
  "太平洋",
  "クラウン",
  "西武",
  "毎日",
  "大毎",
  "東京",
  "ロッテ",
  "東急",
  "急映",
  "東映",
  "日拓",
  "日本ハム",
  "楽天",
  "高橋",
  "トンボ",
  "大映",
];

function normalizeTeam(team: string | null): string {
  return team?.replace(/\s+/g, "") ?? "";
}

export function getLeague(team: string | null, season: number): League | null {
  if (season < 1950) {
    return null;
  }

  const normalized = normalizeTeam(team);
  if (CENTRAL_TEAMS.some((name) => normalized.includes(name))) {
    return "central";
  }
  if (PACIFIC_TEAMS.some((name) => normalized.includes(name))) {
    return "pacific";
  }
  return null;
}

export function formatLeague(league: League | null): string {
  if (league === "central") return "セ・リーグ";
  if (league === "pacific") return "パ・リーグ";
  return "リーグ区分なし";
}
