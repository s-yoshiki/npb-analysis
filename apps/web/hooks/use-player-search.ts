"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function usePlayerSearch(basePath = "/players") {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submitSearch(formData: FormData) {
    const query = String(formData.get("q") ?? "").trim();
    const href = query
      ? `${basePath}?q=${encodeURIComponent(query)}`
      : basePath;

    startTransition(() => {
      router.push(href);
    });
  }

  return {
    isPending,
    submitSearch,
  };
}
