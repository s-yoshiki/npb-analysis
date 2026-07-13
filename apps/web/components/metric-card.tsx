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
    <Card className="group border-foreground/15 bg-card/75 shadow-none transition-colors hover:bg-card">
      <CardContent className="grid gap-3 px-5 py-6">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <strong className="font-heading text-3xl leading-none tracking-[-0.04em] sm:text-4xl">
          {value}
        </strong>
        <small className="border-t border-foreground/10 pt-3 text-xs text-muted-foreground">{helper}</small>
      </CardContent>
    </Card>
  );
}
