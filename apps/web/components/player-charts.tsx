"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  [key: string]: number | null;
};

export type ChartMetric = {
  key: string;
  label: string;
};

export function PlayerMetricChart({
  data,
  metrics,
  title,
}: {
  data: ChartPoint[];
  metrics: ChartMetric[];
  title: string;
}) {
  const [metric, setMetric] = useState(metrics[0]?.key ?? "");
  const selected = metrics.find((item) => item.key === metric) ?? metrics[0];
  const rows = useMemo(
    () =>
      data
        .filter((point) => Number.isFinite(point.season))
        .map((point) => ({ season: point.season, value: point[metric] })),
    [data, metric],
  );

  return (
    <Card className="bg-card/85">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="font-heading text-xl font-black">
            {title}
          </CardTitle>
          <CardDescription>
            選択した指標を年度別の棒グラフで表示
          </CardDescription>
        </div>
        <label className="grid gap-1 text-xs font-bold text-muted-foreground">
          表示指標
          <select
            className="select-field h-9 font-semibold"
            onChange={(event) => setMetric(event.target.value)}
            value={metric}
          >
            {metrics.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </CardHeader>
      <CardContent>
        {rows.length && selected ? (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                data={rows}
                margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="season"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => [String(value ?? "-"), selected.label]}
                />
                <Bar
                  dataKey="value"
                  fill="var(--chart-1)"
                  name={selected.label}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            表示できる年度別データがありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
