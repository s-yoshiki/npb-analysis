import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayerProfileCard({ detailJson }: { detailJson: string }) {
  const details = Object.entries(
    JSON.parse(detailJson) as Record<string, string>,
  );

  return (
    <Card className="border-foreground/15 bg-card/80 shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-xl font-black">プロフィール</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3">
          {details.map(([key, value]) => (
            <div
              className="grid gap-1 border-b border-foreground/10 pb-3 last:border-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:gap-3"
              key={key}
            >
              <dt className="text-sm font-bold text-muted-foreground">{key}</dt>
              <dd className="text-sm leading-6">{value || "-"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
