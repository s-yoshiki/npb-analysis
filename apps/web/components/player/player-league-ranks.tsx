import { formatLeague } from "@/modules/npb/domain/models/league";
import {
  leagueRankMetrics,
  type LeagueRankCategory,
  type PlayerLeagueRank,
} from "@/modules/npb/domain/services/league-ranking-service";
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

/**
 * Top-three finishes get a tint that scales with the placing. The rank number
 * is always spelled out in the cell, so colour is reinforcement, never the
 * only carrier of the information.
 */
function rankClass(rank: number | undefined) {
  if (rank === 1) return "bg-accent font-medium text-accent-foreground";
  if (rank === 2) return "bg-accent/60 font-medium";
  if (rank === 3) return "bg-accent/30 font-medium";
  return "";
}

function RankTable({
  category,
  rows,
}: {
  category: LeagueRankCategory;
  rows: PlayerLeagueRank[];
}) {
  const categoryRows = rows.filter((row) => row.category === category);
  const metrics = leagueRankMetrics[category];

  if (!categoryRows.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        リーグ順位を算出できる成績がありません。
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 z-20 min-w-20 bg-muted">
            年度
          </TableHead>
          <TableHead className="min-w-28">リーグ</TableHead>
          {metrics.map((metric) => (
            <TableHead className="min-w-20 text-right" key={metric.key}>
              {metric.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {categoryRows.map((row) => (
          <TableRow
            className="group/row"
            key={`${row.category}:${row.season}:${row.league}`}
          >
            <TableCell className="sticky left-0 z-10 bg-card font-medium group-hover/row:bg-muted">
              {row.season}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatLeague(row.league)}
            </TableCell>
            {metrics.map((metric) => (
              <TableCell
                className={cn("text-right", rankClass(row.metrics[metric.key]))}
                key={metric.key}
              >
                {row.metrics[metric.key] ? `${row.metrics[metric.key]}位` : "-"}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PlayerLeagueRanks({
  category,
  rows,
}: {
  category: LeagueRankCategory;
  rows: PlayerLeagueRank[];
}) {
  const count = rows.filter((row) => row.category === category).length;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>年度別リーグ順位</CardTitle>
          <CardDescription>
            DB収録選手内で集計。率系指標は規定到達者を対象
          </CardDescription>
        </div>
        <Badge variant="secondary">{count}件</Badge>
      </CardHeader>
      <CardContent>
        <RankTable category={category} rows={rows} />
      </CardContent>
    </Card>
  );
}
