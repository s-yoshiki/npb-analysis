import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlayerFilters } from "@/modules/npb/domain/models/player";

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
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <input
          aria-label={`${label}（下限）`}
          className="select-field min-w-0"
          defaultValue={fromValue}
          max={max}
          min={min}
          name={fromName}
          placeholder="下限"
          type="number"
        />
        <span aria-hidden="true" className="text-muted-foreground">
          〜
        </span>
        <input
          aria-label={`${label}（上限）`}
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
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-medium">選手の絞り込み</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            選手名やプロフィールを組み合わせて検索できます。
          </p>
        </div>
        {/* Rendered only when there is something to clear, so the control is
            never present in a permanently dimmed, still-clickable state. */}
        {activeCount ? (
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "self-start",
            )}
            href="/players"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            条件をクリア
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">
          選手区分
          <select
            className="select-field"
            defaultValue={filters.category ?? ""}
            name="category"
          >
            <option value="">指定なし</option>
            <option value="batting">野手</option>
            <option value="pitching">投手</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
          選手名
          <input
            className="select-field"
            defaultValue={query}
            name="q"
            placeholder="漢字・かなで検索"
            type="search"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
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
        <label className="grid gap-1.5 text-sm font-medium">
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
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
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
        <label className="grid gap-1.5 text-sm font-medium">
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

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground">
          {activeCount
            ? `${activeCount}件の条件を指定中`
            : "条件は指定されていません"}
        </p>
        <button className={buttonVariants({ size: "lg" })} type="submit">
          <Search aria-hidden="true" className="size-4" />
          条件を適用
        </button>
      </div>
    </form>
  );
}
