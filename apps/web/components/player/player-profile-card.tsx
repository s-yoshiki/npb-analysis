import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayerProfileCard({ detailJson }: { detailJson: string }) {
  const details = Object.entries(
    JSON.parse(detailJson) as Record<string, string>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {details.map(([key, value]) => (
            <div
              className="rounded-lg border border-border px-3 py-2"
              key={key}
            >
              <dt className="text-xs text-muted-foreground">{key}</dt>
              <dd className="mt-0.5 text-sm leading-5">{value || "-"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
