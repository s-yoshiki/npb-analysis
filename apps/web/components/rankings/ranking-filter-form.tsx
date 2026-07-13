"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  rankingMetrics,
  type RankingCategory,
  type RankingMetric,
  type RankingProfileFilters,
  type RankingScope,
} from "@/lib/rankings";
import type { League } from "@/lib/league";

type Props = {
  category: RankingCategory;
  filters: RankingProfileFilters;
  league: League;
  metric: RankingMetric;
  scope: RankingScope;
  season: number;
  seasons: number[];
  team?: string;
  teams: string[];
};

function RangeFields({
  fromName,
  fromValue,
  label,
  max,
  min,
  toName,
  toValue,
}: {
  fromName: string;
  fromValue?: number;
  label: string;
  max: number;
  min: number;
  toName: string;
  toValue?: number;
}) {
  return (
    <fieldset className="grid gap-1.5 text-xs font-bold text-muted-foreground">
      <legend className="mb-1">{label}</legend>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          className="select-field min-w-0"
          defaultValue={fromValue}
          max={max}
          min={min}
          name={fromName}
          placeholder="下限"
          type="number"
        />
        <span aria-hidden="true">〜</span>
        <input
          className="select-field min-w-0"
          defaultValue={toValue}
          max={max}
          min={min}
          name={toName}
          placeholder="上限"
          type="number"
        />
      </div>
    </fieldset>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  );
}

export function RankingFilterForm({
  category: initialCategory,
  filters,
  league: initialLeague,
  metric: initialMetric,
  scope: initialScope,
  season: initialSeason,
  seasons,
  team: initialTeam,
  teams,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(initialCategory);
  const [league, setLeague] = useState(initialLeague);
  const [metric, setMetric] = useState(initialMetric);
  const [scope, setScope] = useState(initialScope);
  const [season, setSeason] = useState(initialSeason);
  const [team, setTeam] = useState(initialTeam ?? "");
  const metrics = rankingMetrics[category];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setCategory(initialCategory);
    setLeague(initialLeague);
    setMetric(initialMetric);
    setScope(initialScope);
    setSeason(initialSeason);
    setTeam(initialTeam ?? "");
  }, [
    initialCategory,
    initialLeague,
    initialMetric,
    initialScope,
    initialSeason,
    initialTeam,
  ]);

  const activeDetailCount = useMemo(
    () => Object.values(filters).filter((value) => value !== undefined).length,
    [filters],
  );
  const hasConditions = [...searchParams.values()].some(
    (value) => value.trim() !== "",
  );

  function formParams() {
    const params = new URLSearchParams(searchParams.toString());
    if (!formRef.current) return params;
    for (const [key, rawValue] of new FormData(formRef.current).entries()) {
      const value = String(rawValue).trim();
      if (value) params.set(key, value);
      else params.delete(key);
    }
    return params;
  }

  function navigate(changes: Record<string, string | undefined>) {
    const params = formParams();
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    const defaultSeason = seasons[0] ?? initialSeason;
    setCategory("batting");
    setLeague("central");
    setMetric(rankingMetrics.batting[0]!.value);
    setScope("season");
    setSeason(defaultSeason);
    setTeam("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <form className="space-y-5" ref={formRef}>
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <h2 className="font-heading text-xl font-black">ランキング条件</h2>
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin text-primary" />
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            基本条件は選択と同時に反映されます。選手条件は入力後に「条件を適用」を押してください。
          </p>
        </div>
        <button
          className={buttonVariants({
            className: "h-9 gap-2",
            variant: "outline",
          })}
          disabled={!hasConditions || isPending}
          onClick={clearAll}
          type="button"
        >
          <RotateCcw className="size-3.5" />
          条件をクリア
        </button>
      </div>

      <section className="grid gap-4 rounded-2xl border border-border/80 bg-muted/25 p-4 lg:grid-cols-2">
        <div>
          <p className="section-kicker">01 / Record</p>
          <h3 className="mt-1 font-bold">記録の種類</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            打撃・投手と集計する指標を選択
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <FieldLabel>分類</FieldLabel>
            <select
              className="select-field"
              name="category"
              onChange={(event) => {
                const next = event.target.value as RankingCategory;
                const nextMetric = rankingMetrics[next][0]!.value;
                setCategory(next);
                setMetric(nextMetric);
                setTeam("");
                navigate({ category: next, metric: nextMetric, team: undefined });
              }}
              value={category}
            >
              <option value="batting">打撃</option>
              <option value="pitching">投手</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <FieldLabel>指標</FieldLabel>
            <select
              className="select-field"
              name="metric"
              onChange={(event) => {
                const next = event.target.value as RankingMetric;
                setMetric(next);
                navigate({ metric: next });
              }}
              value={metric}
            >
              {metrics.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <FieldLabel>集計範囲</FieldLabel>
            <select
              className="select-field"
              name="scope"
              onChange={(event) => {
                const next = event.target.value as RankingScope;
                setScope(next);
                setTeam("");
                navigate({
                  scope: next,
                  season: next === "career" ? undefined : String(season),
                  team: undefined,
                });
              }}
              value={scope}
            >
              <option value="season">年度別</option>
              <option value="career">通算</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border/80 bg-muted/25 p-4 lg:grid-cols-2">
        <div>
          <p className="section-kicker">02 / Scope</p>
          <h3 className="mt-1 font-bold">対象範囲</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            年度・リーグ・球団を段階的に絞り込み
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <FieldLabel>年度</FieldLabel>
            <select
              className="select-field disabled:cursor-not-allowed disabled:opacity-45"
              disabled={scope === "career"}
              name="season"
              onChange={(event) => {
                const next = Number(event.target.value);
                setSeason(next);
                setTeam("");
                navigate({ season: String(next), team: undefined });
              }}
              value={season}
            >
              {seasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <FieldLabel>リーグ</FieldLabel>
            <select
              className="select-field"
              name="league"
              onChange={(event) => {
                const next = event.target.value as League;
                setLeague(next);
                setTeam("");
                navigate({ league: next, team: undefined });
              }}
              value={league}
            >
              <option value="central">セ・リーグ</option>
              <option value="pacific">パ・リーグ</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <FieldLabel>球団</FieldLabel>
            <select
              className="select-field"
              disabled={isPending}
              name="team"
              onChange={(event) => {
                setTeam(event.target.value);
                navigate({ team: event.target.value || undefined });
              }}
              value={team}
            >
              <option value="">リーグ全体</option>
              {teams.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <details
        className="group overflow-hidden rounded-2xl border border-border/80 bg-card"
        open={activeDetailCount > 0}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 marker:hidden">
          <span>
            <span className="section-kicker">03 / Player</span>
            <strong className="mt-1 block">選手の詳細条件</strong>
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {activeDetailCount ? `${activeDetailCount}件を適用中` : "任意"}
          </span>
        </summary>
        <div className="grid gap-4 border-t border-border/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground sm:col-span-2">
            選手名
            <input
              className="select-field"
              defaultValue={filters.name ?? ""}
              name="name"
              placeholder="漢字・かなで検索"
              type="search"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
            投げ腕
            <select className="select-field" defaultValue={filters.throws ?? ""} name="throws">
              <option value="">指定なし</option>
              <option value="right">右投げ</option>
              <option value="left">左投げ</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
            打席
            <select className="select-field" defaultValue={filters.bats ?? ""} name="bats">
              <option value="">指定なし</option>
              <option value="right">右打ち</option>
              <option value="left">左打ち</option>
              <option value="both">両打ち</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground sm:col-span-2">
            出身学校・経歴
            <input
              className="select-field"
              defaultValue={filters.school ?? ""}
              name="school"
              placeholder="例: 早稲田大、大阪桐蔭高"
              type="search"
            />
          </label>
          <RangeFields
            fromName="draftYearMin"
            fromValue={filters.draftYearMin}
            label="ドラフト年度"
            max={currentYear + 1}
            min={1965}
            toName="draftYearMax"
            toValue={filters.draftYearMax}
          />
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
            ドラフト順位
            <select className="select-field" defaultValue={filters.draftRank ?? ""} name="draftRank">
              <option value="">指定なし</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => (
                <option key={rank} value={rank}>
                  {rank}位／{rank}巡目
                </option>
              ))}
              <option value="outside">ドラフト外</option>
            </select>
          </label>
          <RangeFields
            fromName="birthYearMin"
            fromValue={filters.birthYearMin}
            label="生年"
            max={currentYear}
            min={1900}
            toName="birthYearMax"
            toValue={filters.birthYearMax}
          />
          <RangeFields
            fromName="heightMin"
            fromValue={filters.heightMin}
            label="身長 (cm)"
            max={230}
            min={140}
            toName="heightMax"
            toValue={filters.heightMax}
          />
        </div>
      </details>

      <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          基本条件の変更中は球団候補も自動的に更新されます。
        </p>
        <button
          className={cn(
            buttonVariants({ className: "h-10 gap-2 px-5" }),
            isPending && "opacity-70",
          )}
          disabled={isPending}
          type="submit"
        >
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          条件を適用
        </button>
      </div>
    </form>
  );
}
