"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReadingAtmosphere.module.css";
import { PAGE_TURN_SRC } from "./pageTurnAudio";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";

type VolumeMode = "quiet" | "medium";

export default function ReadingAtmosphere() {
  const router = useRouter();
  const pageTurnRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<VolumeMode>("quiet");

  const playPageTurn = (mode: VolumeMode) => {
    try {
      const audio = pageTurnRef.current ?? new Audio(PAGE_TURN_SRC);
      pageTurnRef.current = audio;
      audio.preload = "auto";
      audio.volume = mode === "medium" ? 0.58 : 0.34;
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    } catch {
      // Звук не должен блокировать навигацию.
    }
  };

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem(ENABLED_KEY);
    const savedVolume = window.localStorage.getItem(VOLUME_KEY);
    if (savedEnabled === "off") setEnabled(false);
    if (savedEnabled === "on") setEnabled(true);
    if (savedVolume === "medium" || savedVolume === "quiet") setVolume(savedVolume);

    const audio = new Audio(PAGE_TURN_SRC);
    audio.preload = "auto";
    pageTurnRef.current = audio;

    return () => {
      audio.pause();
      pageTurnRef.current = null;
    };
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
      }, enabled ? 140 : 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, volume, router]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(ENABLED_KEY, next ? "on" : "off");
    if (next) playPageTurn(volume);
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
