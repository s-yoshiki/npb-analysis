"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function usePlayerSearch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submitSearch(formData: FormData) {
    const query = String(formData.get("q") ?? "").trim();
    const href = query ? `/?q=${encodeURIComponent(query)}` : "/";

    startTransition(() => {
      router.push(href);
    });
  }

  return {
    isPending,
    submitSearch,
  };
}
