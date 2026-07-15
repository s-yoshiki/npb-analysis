import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PlayerSearch } from "@/components/players/player-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PlayersPage() {
  return (
    <AppShell label="Player Index">
      <Card className="relative bg-card/85">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary to-chart-2" />
        <CardContent className="px-3 py-4 sm:px-5 sm:py-6">
          <Badge
            className="mb-5 border-primary/25 bg-primary/8 text-primary"
            variant="outline"
          >
            Player archive
          </Badge>
          <h1 className="font-heading text-3xl font-black tracking-[-0.04em] sm:text-3xl">
            選手を探す
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            選手名・かなやプロフィール条件で絞り込み、通算成績の概要から各選手の詳細ページへ移動できます。
          </p>
        </CardContent>
      </Card>

      <Suspense fallback={<p className="text-sm text-muted-foreground">検索画面を読み込んでいます。</p>}>
        <PlayerSearch />
      </Suspense>
    </AppShell>
  );
}
