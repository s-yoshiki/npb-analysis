"use client";

import { formatLeague } from "@/lib/league";
import {
  leagueRankMetrics,
  type LeagueRankCategory,
  type PlayerLeagueRank,
} from "@/lib/player-league-ranks";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
    <div className="overflow-x-auto rounded-xl border border-border/80">
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
              <TableCell className="sticky left-0 z-10 bg-card font-bold group-hover/row:bg-muted">
                {row.season}
              </TableCell>
              <TableCell>{formatLeague(row.league)}</TableCell>
              {metrics.map((metric) => (
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    rankClass(row.metrics[metric.key]),
                  )}
                  key={metric.key}
                >
                  {row.metrics[metric.key]
                    ? `${row.metrics[metric.key]}位`
                    : "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PlayerLeagueRanks({ rows }: { rows: PlayerLeagueRank[] }) {
  const battingCount = rows.filter((row) => row.category === "batting").length;
  const pitchingCount = rows.filter(
    (row) => row.category === "pitching",
  ).length;
  const initialCategory = battingCount ? "batting" : "pitching";

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
        <Badge variant="secondary">{rows.length} records</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={initialCategory}>
          <TabsList className="mb-4 grid h-10 w-full max-w-sm grid-cols-2">
            <TabsTrigger value="batting">打撃成績 ({battingCount})</TabsTrigger>
            <TabsTrigger value="pitching">
              投手成績 ({pitchingCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="batting">
            <RankTable category="batting" rows={rows} />
          </TabsContent>
          <TabsContent value="pitching">
            <RankTable category="pitching" rows={rows} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
