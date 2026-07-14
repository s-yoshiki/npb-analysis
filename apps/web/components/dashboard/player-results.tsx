import Link from "next/link";
import type { ReactNode } from "react";
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
import { formatNumber } from "@/lib/format";
import type { PlayerListRow } from "@/lib/npb-db";

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-border/70 bg-muted/55 px-2 py-2">
      <span className="block text-[11px] font-bold text-muted-foreground">
        {label}
      </span>
      <strong className="block text-base">{value}</strong>
    </span>
  );
}

function PlayerMobileCards({ players }: { players: PlayerListRow[] }) {
  return (
    <div className="grid gap-3 md:hidden">
      {players.map((player) => (
        <Link href={`/players/${player.id}`} key={player.id}>
          <Card className="bg-card/85 transition-all hover:-translate-y-0.5 hover:border-primary/30">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="block text-lg">{player.name}</strong>
                    <Badge variant="secondary">
                      {player.category === "pitching" ? "投手" : "野手"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {player.kana || player.id}
                  </span>
                </div>
                <Badge variant="outline">
                  {player.batting_seasons + player.pitching_seasons}年
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MobileMetric label="試合" value={formatNumber(player.games)} />
                <MobileMetric label="安打" value={formatNumber(player.hits)} />
                <MobileMetric
                  label="本塁打"
                  value={formatNumber(player.home_runs)}
                />
                <MobileMetric label="打点" value={formatNumber(player.rbi)} />
                <MobileMetric label="勝利" value={formatNumber(player.wins)} />
                <MobileMetric
                  label="防御率"
                  value={player.era === null ? "-" : player.era.toFixed(2)}
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function PlayerDesktopTable({ players }: { players: PlayerListRow[] }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border/80 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {[
              "選手",
              "打撃年数",
              "投手年数",
              "試合",
              "安打",
              "本塁打",
              "打点",
              "勝利",
              "防御率",
            ].map((header, index) => (
              <TableHead
                className={index === 0 ? "min-w-48" : "text-right"}
                key={header}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <Link
                  className="grid gap-0.5 transition-colors hover:text-primary"
                  href={`/players/${player.id}`}
                >
                  <strong>{player.name}</strong>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {player.kana || player.id}
                    <Badge
                      className="px-1.5 py-0 text-[10px]"
                      variant="secondary"
                    >
                      {player.category === "pitching" ? "投手" : "野手"}
                    </Badge>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.batting_seasons)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.pitching_seasons)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.games)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.hits)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.home_runs)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.rbi)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(player.wins)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {player.era === null ? "-" : player.era.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PlayerResults({
  description,
  pageSummary,
  players,
  query,
  total,
}: {
  description?: string;
  pageSummary?: ReactNode;
  players: PlayerListRow[];
  query: string;
  total?: number;
}) {
  return (
    <Card className="bg-card/85">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="font-heading text-2xl font-black">
            選手一覧
          </CardTitle>
          <CardDescription>
            {description ??
              (query ? `「${query}」の検索結果` : "出場数順に表示")}
          </CardDescription>
        </div>
        <Badge variant="secondary">
          {formatNumber(total ?? players.length)} players
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        {players.length ? (
          <>
            <PlayerMobileCards players={players} />
            <PlayerDesktopTable players={players} />
          </>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            該当する選手が見つかりません。
          </p>
        )}
        {pageSummary ? <div className="mt-5">{pageSummary}</div> : null}
      </CardContent>
    </Card>
  );
}
