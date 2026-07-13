import { formatLeague } from "@/lib/league";
import type { PlayerLeagueRank } from "@/lib/npb-db";
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

const metrics = [
  ["hits", "安打"],
  ["home_runs", "本塁打"],
  ["ops", "OPS"],
  ["wins", "勝利"],
  ["strikeouts", "奪三振"],
  ["era", "防御率"],
] as const;

export function PlayerLeagueRanks({ rows }: { rows: PlayerLeagueRank[] }) {
  return (
    <Card className="border-foreground/15 bg-card/80 shadow-none">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="font-heading text-2xl font-black">
            年度別リーグ順位
          </CardTitle>
          <CardDescription>
            DB収録選手内で集計。率系指標は規定到達者を対象
          </CardDescription>
        </div>
        <Badge variant="secondary">{rows.length} seasons</Badge>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="overflow-x-auto rounded-md border border-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>年度</TableHead>
                  <TableHead>リーグ</TableHead>
                  {metrics.map(([, label]) => (
                    <TableHead className="text-right" key={label}>
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={`${row.season}:${row.league}`}>
                    <TableCell className="font-bold">{row.season}</TableCell>
                    <TableCell>{formatLeague(row.league)}</TableCell>
                    {metrics.map(([key]) => (
                      <TableCell className="text-right tabular-nums" key={key}>
                        {row.metrics[key] ? `${row.metrics[key]}位` : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            リーグ順位を算出できる成績がありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
