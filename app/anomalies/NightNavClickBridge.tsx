"use client";

import { useEffect } from "react";

export default function NightNavClickBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const onPointerUp = (event: PointerEvent) => {
      const light = document.querySelector<HTMLButtonElement>("[data-night-nav]");
      if (!light || document.querySelector("[data-nav-awakening]")) return;

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-night-nav]")) return;

      const rect = light.getBoundingClientRect();
      const pad = 10;
      const inside =
        event.clientX >= rect.left - pad &&
        event.clientX <= rect.right + pad &&
        event.clientY >= rect.top - pad &&
        event.clientY <= rect.bottom + pad;

      if (!inside) return;

      event.preventDefault();
      light.click();
    };

    document.addEventListener("pointerup", onPointerUp, true);
    return () => document.removeEventListener("pointerup", onPointerUp, true);
  }, []);

  return null;
}
