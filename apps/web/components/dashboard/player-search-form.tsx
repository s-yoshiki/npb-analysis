"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div>
      <form action={submitSearch} className="grid gap-4">
        <div className="grid gap-1 sm:grid-cols-[1fr_auto]">
          <Input
            className="h-11 bg-background text-foreground placeholder:text-muted-foreground"
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
    </div>
  );
}
