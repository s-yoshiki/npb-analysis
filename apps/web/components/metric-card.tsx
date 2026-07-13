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
    <Card className="group relative bg-card/80 transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_45px_-28px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
      <div className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-primary/70 transition-all group-hover:inset-y-3" />
      <CardContent className="grid gap-3 px-6 py-6">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <strong className="font-heading text-3xl leading-none tracking-[-0.04em] sm:text-4xl">
          {value}
        </strong>
        <small className="border-t border-border/70 pt-3 text-xs font-medium text-muted-foreground">{helper}</small>
      </CardContent>
    </Card>
  );
}
