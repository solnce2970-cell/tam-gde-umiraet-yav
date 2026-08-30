"use client";

import { useEffect } from "react";

const ORIGINAL = "Три мира, связанные одним законом";
const LEGACY_ANOMALY = "Три мира. Межа ослабла. Навь проникает в Явь.";
const ANOMALY = "А если Межа уже ....";

export default function BrokenBorderVisualPolish() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const heading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
    if (!heading) return;

    let active = false;
    let restoring = false;
    let restoreTimer: number | undefined;

    const restore = () => {
      restoring = true;
      active = false;
      heading.removeAttribute("data-broken-border-visual");
      heading.textContent = ORIGINAL;
      restoring = false;
      restoreTimer = undefined;
    };

    const activate = () => {
      if (active) return;
      active = true;
      heading.dataset.brokenBorderVisual = "true";
      heading.textContent = ANOMALY;
      restoreTimer = window.setTimeout(restore, 5200);
    };

    const observer = new MutationObserver(() => {
      if (restoring) return;
      const text = heading.textContent?.trim() ?? "";

      if (!active && text === LEGACY_ANOMALY) {
        activate();
        return;
      }

      // Старый механизм возвращает исходный заголовок раньше, чем должна
      // закончиться новая более медленная аномалия. Удерживаем её до своего таймера.
      if (active && text !== ANOMALY) {
        heading.textContent = ANOMALY;
      }
    });

    observer.observe(heading, { childList: true, characterData: true, subtree: true });

    return () => {
      observer.disconnect();
      if (restoreTimer) window.clearTimeout(restoreTimer);
      if (active) restore();
    };
  }, []);

  return null;
}
