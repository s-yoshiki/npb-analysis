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
import { cn } from "@/lib/utils";

const metrics = [
  ["hits", "安打"],
  ["home_runs", "本塁打"],
  ["ops", "OPS"],
  ["wins", "勝利"],
  ["strikeouts", "奪三振"],
  ["era", "防御率"],
] as const;

function rankClass(rank: number | undefined) {
  if (rank === 1) {
    return "bg-amber-300/70 font-black text-amber-950 hover:bg-amber-300/85";
  }
  if (rank === 2) {
    return "bg-slate-300/80 font-black text-slate-800 hover:bg-slate-300";
  }
  if (rank === 3) {
    return "bg-amber-800/80 font-black text-white hover:bg-amber-800/90";
  }
  return "";
}

export function PlayerLeagueRanks({ rows }: { rows: PlayerLeagueRank[] }) {
  return (
    <Card className="bg-card/85">
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
          <div className="overflow-x-auto rounded-xl border border-border/80">
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
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          rankClass(row.metrics[key]),
                        )}
                        key={key}
                      >
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
