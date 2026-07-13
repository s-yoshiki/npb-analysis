"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "概要" },
  { href: "/players", label: "選手一覧" },
  { href: "/rankings", label: "ランキング" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 shadow-sm"
      aria-label="メインナビゲーション"
    >
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
