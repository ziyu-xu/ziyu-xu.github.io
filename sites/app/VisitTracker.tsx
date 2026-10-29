"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === "/analytics") return;

    const key = `visit:${pathname}`;
    const now = Date.now();
    const previous = Number(sessionStorage.getItem(key) ?? 0);
    if (now - previous < 1500) return;
    sessionStorage.setItem(key, String(now));

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
