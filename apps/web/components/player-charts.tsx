"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ChartPoint = {
  season: number;
  hits?: number | null;
  homeRuns?: number | null;
  rbi?: number | null;
  wins?: number | null;
  strikeouts?: number | null;
  era?: number | null;
};

function useChartRows(data: ChartPoint[]) {
  return useMemo(
    () => data.filter((point) => Number.isFinite(point.season)),
    [data],
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <Card className="border-foreground/15 bg-card/80 shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="py-12 text-center text-sm text-muted-foreground">
          表示できる年度別データがありません。
        </p>
      </CardContent>
    </Card>
  );
}

export function BattingTrendChart({ data }: { data: ChartPoint[] }) {
  const rows = useChartRows(data);

  if (!rows.length) {
    return <EmptyChart label="打撃推移" />;
  }

  return (
    <Card className="border-foreground/15 bg-card/80 shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">打撃推移</CardTitle>
        <CardDescription>安打・本塁打・打点の年度別推移</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rows}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid stroke="var(--border)" />
              <XAxis
                dataKey="season"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={42}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="hits"
                name="安打"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="homeRuns"
                name="本塁打"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rbi"
                name="打点"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PitchingTrendChart({ data }: { data: ChartPoint[] }) {
  const rows = useChartRows(data);

  if (!rows.length) {
    return <EmptyChart label="投手推移" />;
  }

  return (
    <Card className="border-foreground/15 bg-card/80 shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">投手推移</CardTitle>
        <CardDescription>勝利・奪三振・防御率の年度別推移</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rows}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid stroke="var(--border)" />
              <XAxis
                dataKey="season"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={42}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={42}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wins"
                name="勝利"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="strikeouts"
                name="奪三振"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="era"
                name="防御率"
                stroke="var(--chart-4)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
