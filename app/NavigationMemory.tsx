"use client";

import { useEffect } from "react";

const SCROLL_KEY = "yav-main-scroll-v1";
const RETURN_KEY = "yav-return-to-main-v1";

export default function NavigationMemory() {
  useEffect(() => {
    const isMain = window.location.pathname === "/";

    if (isMain && window.sessionStorage.getItem(RETURN_KEY) === "1") {
      const saved = Number(window.sessionStorage.getItem(SCROLL_KEY) || "0");
      window.sessionStorage.removeItem(RETURN_KEY);

      if (Number.isFinite(saved) && saved > 0) {
        const restore = () => window.scrollTo({ top: saved, left: 0, behavior: "auto" });
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(restore);
        });
        const timer = window.setTimeout(restore, 120);
        return () => window.clearTimeout(timer);
      }
    }

    if (!isMain) return;

    const rememberDeparture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      let destination: URL;
      try {
        destination = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === "/") return;

      window.sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      window.sessionStorage.setItem(RETURN_KEY, "1");
    };

    document.addEventListener("click", rememberDeparture, true);
    return () => document.removeEventListener("click", rememberDeparture, true);
  }, []);

  return null;
}
