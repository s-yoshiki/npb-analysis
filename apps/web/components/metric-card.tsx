import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="bg-card/95 shadow-sm">
      <CardContent className="grid gap-2.5 py-5">
        <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <strong className="text-3xl leading-none tracking-tight sm:text-4xl">
          {value}
        </strong>
        <small className="text-sm text-muted-foreground">{helper}</small>
      </CardContent>
    </Card>
  );
}
