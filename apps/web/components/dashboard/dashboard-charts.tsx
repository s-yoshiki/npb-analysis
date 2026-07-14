import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  SeasonTrend,
  TeamCount,
} from "@/modules/npb/domain/models/dashboard";
import { formatNumber } from "@/lib/format";

export function SeasonSparkline({ trends }: { trends: SeasonTrend[] }) {
  const recent = trends.slice(-24);
  const maxPlayers = Math.max(
    1,
    ...recent.map((trend) => trend.hitters + trend.pitchers),
  );
  const points = recent
    .map((trend, index) => {
      const x = recent.length === 1 ? 0 : (index / (recent.length - 1)) * 100;
      const y = 92 - ((trend.hitters + trend.pitchers) / maxPlayers) * 76;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="bg-card/85">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">
          年度別の登録推移
        </CardTitle>
        <CardDescription>
          打撃・投手成績が記録された選手数の合計
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length ? (
          <div className="h-64 overflow-hidden rounded-xl border border-border/70 bg-[linear-gradient(180deg,var(--muted)_0%,transparent_100%)]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="block h-52 w-full overflow-visible px-4 pt-5"
            >
              <polyline
                points={points}
                className="fill-none stroke-primary drop-shadow-sm [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3] [vector-effect:non-scaling-stroke]"
              />
            </svg>
            <div className="flex justify-between px-4 text-xs font-bold text-muted-foreground">
              <span>{recent[0]?.season}</span>
              <span>{recent[recent.length - 1]?.season}</span>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            DB作成後にチャートが表示されます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TeamDistribution({ teams }: { teams: TeamCount[] }) {
  const max = Math.max(1, ...teams.map((team) => team.players));

  return (
    <Card className="bg-card/85">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">
          球団別の選手数
        </CardTitle>
        <CardDescription>成績表に登場する球団名で集計</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {teams.map((team) => (
          <div
            className="grid min-h-7 grid-cols-[88px_1fr_48px] items-center gap-3 text-sm"
            key={team.team}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
              {team.team}
            </span>
            <span className="h-2.5 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                style={{ width: `${(team.players / max) * 100}%` }}
              />
            </span>
            <strong className="text-right tabular-nums">
              {formatNumber(team.players)}
            </strong>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
