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

export type StatColumn<T> = {
  key: keyof T;
  label: string;
  type: "number" | "qualification" | "rate" | "text" | "year";
  digits?: number;
};

/** Columns that read as labels rather than quantities stay left-aligned. */
function isLabelColumn<T>(column: StatColumn<T>) {
  return column.type === "text" || column.type === "year";
}

function displayValue<T extends Record<string, string | number | null>>(
  row: T,
  column: StatColumn<T>,
) {
  const value = row[column.key];

  if (column.type === "qualification") {
    return value === 1 ? "到達" : "未到達";
  }

  // A season is a year, so it must not carry a thousands separator.
  if (column.type === "year") {
    return value === null || value === undefined ? "-" : String(value);
  }

  if (column.type === "rate") {
    return formatRate(value as number | null);
  }

  if (column.type === "number") {
    return formatNumber(value as number | null, column.digits);
  }

  return value || "-";
}

export function PlayerStatTable<
  T extends Record<string, string | number | null>,
>({
  columns,
  rows,
  summaryRow,
  title,
}: {
  columns: StatColumn<T>[];
  rows: T[];
  summaryRow?: T;
  title: string;
}) {
  const primaryColumn = columns[0];
  const secondaryColumn = columns[1];

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>抽出した全主要列を表示</CardDescription>
        </div>
        <Badge variant="secondary">{rows.length}件</Badge>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <>
            <div className="grid gap-3 md:hidden">
              {rows.map((row, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="font-medium">
                        {primaryColumn
                          ? String(row[primaryColumn.key] ?? "-")
                          : "-"}
                      </strong>
                      <span className="text-sm text-muted-foreground">
                        {secondaryColumn
                          ? String(row[secondaryColumn.key] ?? "-")
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {columns.slice(2, 10).map((column) => (
                        <span
                          className="rounded-lg border border-border px-2 py-1.5"
                          key={String(column.key)}
                        >
                          <span className="block text-xs text-muted-foreground">
                            {column.label}
                          </span>
                          <strong className="block font-medium tabular-nums">
                            {displayValue(row, column)}
                          </strong>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {summaryRow ? (
                <Card className="bg-muted">
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="font-medium">通算</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {columns.slice(2, 10).map((column) => (
                        <span
                          className="rounded-lg border border-border bg-card px-2 py-1.5"
                          key={String(column.key)}
                        >
                          <span className="block text-xs text-muted-foreground">
                            {column.label}
                          </span>
                          <strong className="block font-medium tabular-nums">
                            {displayValue(summaryRow, column)}
                          </strong>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        className={isLabelColumn(column) ? "" : "text-right"}
                        key={String(column.key)}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell
                          className={isLabelColumn(column) ? "" : "text-right"}
                          key={String(column.key)}
                        >
                          {displayValue(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {summaryRow ? (
                    <TableRow className="bg-muted font-medium hover:bg-muted">
                      {columns.map((column, index) => (
                        <TableCell
                          className={isLabelColumn(column) ? "" : "text-right"}
                          key={String(column.key)}
                        >
                          {index === 0
                            ? "通算"
                            : displayValue(summaryRow, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            成績行がありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
