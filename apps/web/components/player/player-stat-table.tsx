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
  type: "number" | "qualification" | "rate" | "text";
  digits?: number;
};

function displayValue<T extends Record<string, string | number | null>>(
  row: T,
  column: StatColumn<T>,
) {
  const value = row[column.key];

  if (column.type === "qualification") {
    return value === 1 ? "到達" : "未到達";
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
    <Card className="bg-card/85">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="font-heading text-2xl font-black">
            {title}
          </CardTitle>
          <CardDescription>抽出した全主要列を表示</CardDescription>
        </div>
        <Badge variant="secondary">{rows.length} rows</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        {rows.length ? (
          <>
            <div className="grid gap-3 md:hidden">
              {rows.map((row, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="text-lg">
                        {primaryColumn
                          ? String(row[primaryColumn.key] ?? "-")
                          : "-"}
                      </strong>
                      <span className="text-sm font-bold text-muted-foreground">
                        {secondaryColumn
                          ? String(row[secondaryColumn.key] ?? "-")
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {columns.slice(2, 10).map((column) => (
                        <span
                          className="rounded-md bg-muted px-2 py-2"
                          key={String(column.key)}
                        >
                          <span className="block text-[11px] font-bold text-muted-foreground">
                            {column.label}
                          </span>
                          <strong className="block text-base">
                            {displayValue(row, column)}
                          </strong>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {summaryRow ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="text-lg">通算</strong>
                      <Badge>Career</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {columns.slice(2, 10).map((column) => (
                        <span
                          className="rounded-md bg-background px-2 py-2"
                          key={String(column.key)}
                        >
                          <span className="block text-[11px] font-bold text-muted-foreground">
                            {column.label}
                          </span>
                          <strong className="block text-base">
                            {displayValue(summaryRow, column)}
                          </strong>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
            <div className="hidden overflow-x-auto rounded-xl border border-border/80 md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        className={column.type === "text" ? "" : "text-right"}
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
                          className={
                            column.type === "text"
                              ? ""
                              : "text-right tabular-nums"
                          }
                          key={String(column.key)}
                        >
                          {displayValue(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {summaryRow ? (
                    <TableRow className="border-primary/30 bg-primary/5 font-bold hover:bg-primary/10">
                      {columns.map((column, index) => (
                        <TableCell
                          className={
                            column.type === "text"
                              ? ""
                              : "text-right tabular-nums"
                          }
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
