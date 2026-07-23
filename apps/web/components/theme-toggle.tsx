"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/components/theme-script";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  // The applied theme is only known on the client, so the accessible label —
  // unlike the icons, which swap via CSS — waits for hydration.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private browsing modes can reject writes; the toggle still applies.
    }
  }

  return (
    <Button
      aria-label={
        mounted
          ? isDark
            ? "ライトテーマに切り替える"
            : "ダークテーマに切り替える"
          : "テーマを切り替える"
      }
      onClick={toggle}
      size="icon-lg"
      variant="ghost"
    >
      {/* Swapped by CSS rather than state, so the server-rendered markup
          already matches the theme applied by the pre-paint script. */}
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}
