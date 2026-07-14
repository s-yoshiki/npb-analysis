import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlayerProfileCard({ detailJson }: { detailJson: string }) {
  const details = Object.entries(
    JSON.parse(detailJson) as Record<string, string>,
  );

  return (
    <Card className="bg-card/85">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base font-black">
          プロフィール
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {details.map(([key, value]) => (
            <div className="rounded-lg bg-muted/45 px-3 py-2" key={key}>
              <dt className="text-[11px] font-bold text-muted-foreground">
                {key}
              </dt>
              <dd className="mt-0.5 text-sm leading-5">{value || "-"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
