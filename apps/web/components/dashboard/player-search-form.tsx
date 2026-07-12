"use client";

import { Button } from "@/components/ui/button";
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
    <form
      action={submitSearch}
      className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <Label className="text-muted-foreground" htmlFor="q">
        選手名検索
      </Label>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          id="q"
          name="q"
          placeholder="例: 王, 佐々木, おおたに"
          defaultValue={defaultValue}
        />
        <Button className="h-10 px-5" disabled={isPending} type="submit">
          {isPending ? "検索中" : "検索"}
        </Button>
      </div>
    </form>
  );
}
