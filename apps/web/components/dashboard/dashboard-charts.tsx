import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import type {
  SeasonTrend,
  TeamCount,
} from "@/modules/npb/domain/models/dashboard";

export function SeasonSparkline({ trends }: { trends: SeasonTrend[] }) {
  const recent = trends.slice(-24);
  const totals = recent.map((trend) => trend.hitters + trend.pitchers);
  const maxPlayers = Math.max(1, ...totals);
  const points = recent
    .map((trend, index) => {
      const x = recent.length === 1 ? 0 : (index / (recent.length - 1)) * 100;
      const y = 92 - ((trend.hitters + trend.pitchers) / maxPlayers) * 76;
      return `${x},${y}`;
    })
    .join(" ");
  const firstSeason = recent[0]?.season;
  const lastSeason = recent[recent.length - 1]?.season;

  return (
    <Card>
      <CardHeader>
        <CardTitle>年度別の登録推移</CardTitle>
        <CardDescription>
          打撃・投手成績が記録された選手数の合計
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length ? (
          <figure className="m-0">
            <div className="rounded-lg border border-border bg-muted/40 pt-4">
              <svg
                aria-label={`${firstSeason}年から${lastSeason}年までの登録選手数の推移。最大は${formatNumber(maxPlayers)}人。`}
                className="block h-48 w-full overflow-visible px-4"
                preserveAspectRatio="none"
                role="img"
                viewBox="0 0 100 100"
              >
                <polyline
                  className="fill-none stroke-primary [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2] [vector-effect:non-scaling-stroke]"
                  points={points}
                />
              </svg>
              <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                <span>{firstSeason}年</span>
                <span>{lastSeason}年</span>
              </div>
            </div>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              最大 {formatNumber(maxPlayers)}人（
              {recent[totals.indexOf(maxPlayers)]?.season}年）
            </figcaption>
          </figure>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            データベース作成後にチャートが表示されます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TeamDistribution({ teams }: { teams: TeamCount[] }) {
  const max = Math.max(1, ...teams.map((team) => team.players));

  return (
    <Card>
      <CardHeader>
        <CardTitle>球団別の選手数</CardTitle>
        <CardDescription>成績表に登場する球団名で集計</CardDescription>
      </CardHeader>
      <CardContent>
        {teams.length ? (
          <dl className="grid gap-2.5">
            {teams.map((team) => (
              <div
                className="grid min-h-7 grid-cols-[6rem_1fr] items-center gap-3 text-sm"
                key={team.team}
              >
                <dt className="truncate">{team.team}</dt>
                <dd className="flex items-center gap-3">
                  {/* Decorative: the number beside it carries the value. */}
                  <span
                    aria-hidden="true"
                    className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(team.players / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right tabular-nums">
                    {formatNumber(team.players)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            データベース作成後に集計が表示されます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
