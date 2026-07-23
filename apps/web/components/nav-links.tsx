"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
      aria-label="メインナビゲーション"
      className="flex items-center gap-0.5"
    >
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              active && "bg-accent text-accent-foreground",
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
