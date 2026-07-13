import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatRate } from "@/lib/format";
import { formatLeague, type League } from "@/lib/league";
import { getRankingSeasons, getRankings, getRankingTeams } from "@/lib/npb-db";
import {
  rankingMetrics,
  type RankingCategory,
  type RankingMetric,
  type RankingProfileFilters,
  type RankingScope,
} from "@/lib/rankings";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

function optionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function RangeFields({
  fromName,
  fromValue,
  label,
  max,
  min,
  toName,
  toValue,
}: {
  fromName: string;
  fromValue?: number;
  label: string;
  max: number;
  min: number;
  toName: string;
  toValue?: number;
}) {
  return (
    <fieldset className="grid gap-1 text-xs font-bold text-muted-foreground">
      <legend className="mb-1">{label}</legend>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          className="select-field min-w-0"
          defaultValue={fromValue}
          max={max}
          min={min}
          name={fromName}
          placeholder="下限"
          type="number"
        />
        <span>〜</span>
        <input
          className="select-field min-w-0"
          defaultValue={toValue}
          max={max}
          min={min}
          name={toName}
          placeholder="上限"
          type="number"
        />
      </div>
    </fieldset>
  );
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const seasons = getRankingSeasons();
  const category: RankingCategory =
    params.category === "pitching" ? "pitching" : "batting";
  const scope: RankingScope = params.scope === "career" ? "career" : "season";
  const league: League = params.league === "pacific" ? "pacific" : "central";
  const availableMetrics = rankingMetrics[category];
  const metric = availableMetrics.some((item) => item.value === params.metric)
    ? (params.metric as RankingMetric)
    : availableMetrics[0]!.value;
  const season = Number(params.season) || seasons[0];
  const teams = getRankingTeams({ category, league, scope, season });
  const team = teams.includes(params.team ?? "") ? params.team : undefined;
  const definition = availableMetrics.find((item) => item.value === metric)!;
  const filters: RankingProfileFilters = {
    name: params.name?.trim() || undefined,
    throws:
      params.throws === "right" || params.throws === "left"
        ? params.throws
        : undefined,
    bats:
      params.bats === "right" || params.bats === "left" || params.bats === "both"
        ? params.bats
        : undefined,
    school: params.school?.trim() || undefined,
    draftYearMin: optionalNumber(params.draftYearMin),
    draftYearMax: optionalNumber(params.draftYearMax),
    draftRank: params.draftRank?.trim() || undefined,
    birthYearMin: optionalNumber(params.birthYearMin),
    birthYearMax: optionalNumber(params.birthYearMax),
    heightMin: optionalNumber(params.heightMin),
    heightMax: optionalNumber(params.heightMax),
  };
  const hasDetailedFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );
  const rows = getRankings({
    category,
    league,
    metric,
    scope,
    season,
    team,
    filters,
  }).slice(0, 100);

  return (
    <AppShell label="Rankings">
      <Card className="relative bg-card/85">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-chart-2" />
        <CardContent className="px-6 py-8 sm:px-10 sm:py-12">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            League leaderboard
          </Badge>
          <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            ランキング
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardContent className="pt-6">
          <form className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              集計範囲
              <select
                className="select-field"
                defaultValue={scope}
                name="scope"
              >
                <option value="season">年度別</option>
                <option value="career">通算</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              球団
              <select
                className="select-field"
                defaultValue={team ?? ""}
                name="team"
              >
                <option value="">リーグ全体</option>
                {teams.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              年度
              <select
                className="select-field disabled:opacity-50"
                defaultValue={season}
                disabled={scope === "career"}
                name="season"
              >
                {seasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              リーグ
              <select
                className="select-field"
                defaultValue={league}
                name="league"
              >
                <option value="central">セ・リーグ</option>
                <option value="pacific">パ・リーグ</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              分類
              <select
                className="select-field"
                defaultValue={category}
                name="category"
              >
                <option value="batting">打撃</option>
                <option value="pitching">投手</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-muted-foreground">
              指標
              <select
                className="select-field"
                defaultValue={metric}
                name="metric"
              >
                {availableMetrics.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={buttonVariants({ className: "h-10 self-end" })}
              type="submit"
            >
              表示する
            </button>
            </div>
            <details
              className="group rounded-xl border border-border/80 bg-muted/30"
              open={hasDetailedFilters}
            >
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-foreground marker:hidden">
                詳細条件
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  名前・投打・学校・ドラフト・生年・身長
                </span>
              </summary>
              <div className="grid gap-4 border-t border-border/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid gap-1 text-xs font-bold text-muted-foreground sm:col-span-2">
                  選手名
                  <input
                    className="select-field"
                    defaultValue={filters.name ?? ""}
                    name="name"
                    placeholder="漢字・かなで検索"
                    type="search"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  投げ腕
                  <select className="select-field" defaultValue={filters.throws ?? ""} name="throws">
                    <option value="">指定なし</option>
                    <option value="right">右投げ</option>
                    <option value="left">左投げ</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  打席
                  <select className="select-field" defaultValue={filters.bats ?? ""} name="bats">
                    <option value="">指定なし</option>
                    <option value="right">右打ち</option>
                    <option value="left">左打ち</option>
                    <option value="both">両打ち</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground sm:col-span-2">
                  出身学校・経歴
                  <input
                    className="select-field"
                    defaultValue={filters.school ?? ""}
                    name="school"
                    placeholder="例: 早稲田大、大阪桐蔭高"
                    type="search"
                  />
                </label>
                <RangeFields
                  fromName="draftYearMin"
                  fromValue={filters.draftYearMin}
                  label="ドラフト年度"
                  max={new Date().getFullYear() + 1}
                  min={1965}
                  toName="draftYearMax"
                  toValue={filters.draftYearMax}
                />
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  ドラフト順位
                  <select className="select-field" defaultValue={filters.draftRank ?? ""} name="draftRank">
                    <option value="">指定なし</option>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => (
                      <option key={rank} value={rank}>{rank}位／{rank}巡目</option>
                    ))}
                    <option value="outside">ドラフト外</option>
                  </select>
                </label>
                <RangeFields
                  fromName="birthYearMin"
                  fromValue={filters.birthYearMin}
                  label="生年"
                  max={new Date().getFullYear()}
                  min={1900}
                  toName="birthYearMax"
                  toValue={filters.birthYearMax}
                />
                <RangeFields
                  fromName="heightMin"
                  fromValue={filters.heightMin}
                  label="身長 (cm)"
                  max={230}
                  min={140}
                  toName="heightMax"
                  toValue={filters.heightMax}
                />
              </div>
            </details>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-black">
            {scope === "season" ? `${season}年度` : "通算"}・
            {team ?? formatLeague(league)} {definition.label}
          </CardTitle>
          <CardDescription>
            DB収録データを対象に上位100名を表示
            {hasDetailedFilters ? "（詳細条件で絞り込み中）" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">順位</TableHead>
                  <TableHead>選手</TableHead>
                  <TableHead className="text-right">
                    {definition.label}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.playerId}>
                    <TableCell className="font-heading text-lg font-black">
                      {row.rank}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="font-bold hover:text-primary"
                        href={`/players/${row.playerId}`}
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {definition.rate
                        ? formatRate(row.value)
                        : formatNumber(row.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
