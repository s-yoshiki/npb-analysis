import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PlayerSearch } from "@/components/players/player-search";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "選手一覧",
  description:
    "選手名・かなやプロフィール条件で絞り込み、通算成績の概要から各選手の詳細ページへ移動できます。",
};

export default function PlayersPage() {
  return (
    <AppShell label="選手一覧">
      <PageHeader
        description="選手名・かなやプロフィール条件で絞り込み、通算成績の概要から各選手の詳細ページへ移動できます。"
        kicker="Player archive"
        title="選手を探す"
      />

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              検索画面を読み込んでいます。
            </CardContent>
          </Card>
        }
      >
        <PlayerSearch />
      </Suspense>
    </AppShell>
  );
}
