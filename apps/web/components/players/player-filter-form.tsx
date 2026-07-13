import Link from "next/link";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PlayerFilters } from "@/lib/npb-db";

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

export function PlayerFilterForm({
  filters,
  query,
}: {
  filters: PlayerFilters;
  query: string;
}) {
  const currentYear = new Date().getFullYear();
  const activeCount = [query, ...Object.values(filters)].filter(
    (value) => value !== undefined && value !== "",
  ).length;

  return (
    <form action="/players" className="space-y-5" method="get">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <h2 className="font-heading text-xl font-black">選手の絞り込み</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            選手名やプロフィールを組み合わせて検索できます。
          </p>
        </div>
        <Link
          className={buttonVariants({
            className: activeCount ? "h-9 gap-2" : "h-9 gap-2 opacity-50",
            variant: "outline",
          })}
          href="/players"
        >
          <RotateCcw className="size-3.5" />
          条件をクリア
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-xs font-bold text-muted-foreground sm:col-span-2">
          選手名
          <input
            className="select-field"
            defaultValue={query}
            name="q"
            placeholder="漢字・かなで検索"
            type="search"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
          投げ腕
          <select
            className="select-field"
            defaultValue={filters.throws ?? ""}
            name="throws"
          >
            <option value="">指定なし</option>
            <option value="right">右投げ</option>
            <option value="left">左投げ</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
          打席
          <select
            className="select-field"
            defaultValue={filters.bats ?? ""}
            name="bats"
          >
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
          <select
            className="select-field"
            defaultValue={filters.draftRank ?? ""}
            name="draftRank"
          >
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

      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-5">
        <p className="text-xs text-muted-foreground">
          {activeCount
            ? `${activeCount}件の条件を指定中`
            : "条件は指定されていません"}
        </p>
        <button
          className={buttonVariants({ className: "h-10 gap-2 px-5" })}
          type="submit"
        >
          <Search className="size-4" />
          条件を適用
        </button>
      </div>
    </form>
  );
}
