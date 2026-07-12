import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayerProfileCard({ detailJson }: { detailJson: string }) {
  const details = Object.entries(
    JSON.parse(detailJson) as Record<string, string>,
  );

  return (
    <Card className="bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>プロフィール項目</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3">
          {details.map(([key, value]) => (
            <div
              className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-3"
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
