"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReadingAtmosphere.module.css";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";
const PAGE_TURN_SRC = "/sfx/page-turn.mp3";

type VolumeMode = "quiet" | "medium";

function playPageTurn(volume: VolumeMode) {
  try {
    const audio = new Audio(PAGE_TURN_SRC);
    audio.preload = "auto";
    audio.volume = volume === "medium" ? 0.48 : 0.24;
    void audio.play().catch(() => undefined);
  } catch {
    // Звук не должен мешать навигации, если браузер запретил воспроизведение.
  }
}

export default function ReadingAtmosphere() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<VolumeMode>("quiet");

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem(ENABLED_KEY);
    const savedVolume = window.localStorage.getItem(VOLUME_KEY);
    if (savedEnabled === "off") setEnabled(false);
    if (savedEnabled === "on") setEnabled(true);
    if (savedVolume === "medium" || savedVolume === "quiet") setVolume(savedVolume);

    // Подготавливаем короткий звук заранее, чтобы он не запаздывал при переходе.
    const preload = new Audio();
    preload.preload = "auto";
    preload.src = PAGE_TURN_SRC;
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/chitat")) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      if (enabled) playPageTurn(volume);
      window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, enabled ? 90 : 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, volume, router]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(ENABLED_KEY, next ? "on" : "off");
  };

  const toggleVolume = () => {
    const next: VolumeMode = volume === "quiet" ? "medium" : "quiet";
    setVolume(next);
    window.localStorage.setItem(VOLUME_KEY, next);
    if (enabled) playPageTurn(next);
  };

  return (
    <aside className={styles.controls} aria-label="Настройки атмосферы чтения">
      <button
        type="button"
        className={styles.button}
        aria-pressed={enabled}
        onClick={toggleEnabled}
        title="Включить или выключить атмосферные звуки читальни"
      >
        Атмосфера: {enabled ? "вкл" : "выкл"}
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={toggleVolume}
        disabled={!enabled}
        title="Громкость атмосферных звуков"
      >
        Звук: {volume === "quiet" ? "тихо" : "средне"}
      </button>
    </aside>
  );
}
