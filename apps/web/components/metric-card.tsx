import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  helper,
  label,
  unit,
  value,
}: {
  helper: string;
  label: string;
  unit?: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="grid gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <strong className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </strong>
        <small className="border-t border-border pt-2 text-xs text-muted-foreground">
          {helper}
        </small>
      </CardContent>
    </Card>
  );
}
