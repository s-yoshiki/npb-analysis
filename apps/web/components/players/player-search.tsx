"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlayerResults } from "@/components/dashboard/player-results";
import { PlayerFilterForm } from "@/components/players/player-filter-form";
import { PlayerPagination } from "@/components/players/player-pagination";
import { Card, CardContent } from "@/components/ui/card";
import type {
  PlayerFilters,
  PlayerListPage,
} from "@/modules/npb/domain/models/player";

const emptyResult: PlayerListPage = {
  players: [],
  total: 0,
  page: 1,
  pageSize: 40,
  totalPages: 1,
};

function optionalNumber(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function PlayerSearch() {
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();
  const query = searchParams.get("q")?.trim() ?? "";
  const filters: PlayerFilters = {
    category:
      searchParams.get("category") === "batting" ||
      searchParams.get("category") === "pitching"
        ? (searchParams.get("category") as "batting" | "pitching")
        : undefined,
    throws:
      searchParams.get("throws") === "right" || searchParams.get("throws") === "left"
        ? (searchParams.get("throws") as "right" | "left")
        : undefined,
    bats:
      searchParams.get("bats") === "right" ||
      searchParams.get("bats") === "left" ||
      searchParams.get("bats") === "both"
        ? (searchParams.get("bats") as "right" | "left" | "both")
        : undefined,
    school: searchParams.get("school")?.trim() || undefined,
    draftYearMin: optionalNumber(searchParams.get("draftYearMin")),
    draftYearMax: optionalNumber(searchParams.get("draftYearMax")),
    draftRank: searchParams.get("draftRank")?.trim() || undefined,
    birthYearMin: optionalNumber(searchParams.get("birthYearMin")),
    birthYearMax: optionalNumber(searchParams.get("birthYearMax")),
    heightMin: optionalNumber(searchParams.get("heightMin")),
    heightMax: optionalNumber(searchParams.get("heightMax")),
  };
  const [result, setResult] = useState<PlayerListPage>(emptyResult);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    const params = new URLSearchParams(serializedParams);
    params.set("pageSize", "40");

    fetch(`/api/players?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Search API returned ${response.status}`);
        return response.json() as Promise<PlayerListPage>;
      })
      .then(setResult)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError("検索結果を取得できませんでした。時間をおいて再度お試しください。");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [serializedParams]);

  const paginationParams = Object.fromEntries(
    [...searchParams.entries()].filter(([key, value]) => key !== "page" && value.trim()),
  );
  const start = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <>
      <Card className="bg-card/85">
        <CardContent className="py-6">
          <PlayerFilterForm filters={filters} query={query} />
        </CardContent>
      </Card>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <Card className="bg-card/85">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            検索しています。
          </CardContent>
        </Card>
      ) : (
        <PlayerResults
          description={`${start}-${end} 件目を表示`}
          pageSummary={
            <PlayerPagination
              page={result.page}
              searchParams={paginationParams}
              totalPages={result.totalPages}
            />
          }
          players={result.players}
          query={query}
          total={result.total}
        />
      )}
    </>
  );
}
