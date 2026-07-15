import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
import { npbQueryService } from "@/modules/npb/composition";
import { rankingMetrics } from "@/modules/npb/domain/services/ranking-service";

export default function RankingsPage() {
  const seasons = npbQueryService.getRankingSeasons();
  const season = seasons[0] ?? new Date().getFullYear();
  const definition = rankingMetrics.batting[0];
  if (!definition) return null;
  const rows = npbQueryService
    .getRankings({
      category: "batting",
      league: "all",
      metric: definition.value,
      scope: "season",
      season,
    })
    .slice(0, 100);

  return (
    <AppShell label="Rankings">
      <Card className="relative bg-card/85">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-chart-2" />
        <CardContent className="px-3 py-4 sm:px-5 sm:py-6">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            League leaderboard
          </Badge>
          <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-3xl">
            ランキング
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            年度別・通算の各指標をリーグ単位で集計します。率系指標の年度別順位は規定到達者のみが対象です。
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-black">
            {season}年度・全リーグ {definition.label}
          </CardTitle>
          <CardDescription>
            DB収録データを対象に上位100名を表示（データ更新時に再生成）
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
                      <a
                        className="font-bold hover:text-primary"
                        href={`/players/${row.playerId}/`}
                      >
                        {row.name}
                      </a>
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums">
                      {definition.rate
                        ? formatRate(row.value)
                        : formatNumber(row.value, definition.digits)}
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
