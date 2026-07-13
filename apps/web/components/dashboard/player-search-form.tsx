"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayerSearch } from "@/hooks/use-player-search";

export function PlayerSearchForm({
  defaultValue,
  basePath = "/players",
}: {
  defaultValue: string;
  basePath?: string;
}) {
  const { isPending, submitSearch } = usePlayerSearch(basePath);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardContent className="p-3 sm:p-4">
        <form action={submitSearch} className="grid gap-4">
          <Label className="text-xs font-bold tracking-wide text-current opacity-65" htmlFor="q">
            選手名検索
          </Label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
              id="q"
              name="q"
              placeholder="例: 王, 佐々木, おおたに"
              defaultValue={defaultValue}
            />
            <Button className="h-11 px-6" disabled={isPending} type="submit">
              {isPending ? "検索中" : "検索"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
