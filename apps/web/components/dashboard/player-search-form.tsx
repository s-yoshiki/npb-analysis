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
    <form action={submitSearch} className="flex gap-2">
      {/* The placeholder is an example, not a label, so name the field. */}
      <label className="sr-only" htmlFor="player-search">
        選手名
      </label>
      <Input
        defaultValue={defaultValue}
        id="player-search"
        name="q"
        placeholder="例: 王, 佐々木, おおたに"
        type="search"
      />
      <Button
        aria-busy={isPending}
        disabled={isPending}
        size="lg"
        type="submit"
      >
        {isPending ? "検索中" : "検索"}
      </Button>
    </form>
  );
}
