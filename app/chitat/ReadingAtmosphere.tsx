"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./ReadingAtmosphere.module.css";
import { PAGE_TURN_SRC } from "./pageTurnAudio";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";
const AMBIENT_COOLDOWN = 36000;

type VolumeMode = "quiet" | "medium";

type Cue = {
  id: string;
  src: string;
  test: (text: string) => boolean;
  gain?: number;
};

const cues: Cue[] = [
  {
    id: "auk-call",
    src: "/sfx/auk-au.mp3",
    test: (text) => /\bаук(?:а|у|ом|е)?\b/i.test(text),
    gain: 0.8,
  },
  {
    id: "morana-breath",
    src: "/sfx/morana-frost.mp3",
    test: (text) => /морана|мороз|иней|холод/i.test(text),
    gain: 0.5,
  },
  {
    id: "nav-whisper",
    src: "/sfx/nav-whisper.mp3",
    test: (text) => /\bнав(?:ь|и|ью)\b|пограничье яви и нави/i.test(text),
    gain: 0.42,
  },
  {
    id: "mavki-whisper",
    src: "/sfx/mavki-whisper.mp3",
    test: (text) => /мавк/i.test(text),
    gain: 0.42,
  },
];

export default function ReadingAtmosphere() {
  const router = useRouter();
  const pathname = usePathname();
  const pageTurnRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<Set<HTMLAudioElement>>(new Set());
  const playedCuesRef = useRef<Set<string>>(new Set());
  const lastAmbientAtRef = useRef(0);
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
      // Атмосфера не должна блокировать навигацию.
    }
  };

  const stopAmbient = () => {
    ambientRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    ambientRef.current.clear();
  };

  const playAmbient = (src: string, gain = 1) => {
    try {
      const audio = new Audio(src);
      const base = volume === "medium" ? 0.3 : 0.15;
      audio.volume = Math.min(0.45, base * gain);
      audio.preload = "auto";
      ambientRef.current.add(audio);
      const release = () => ambientRef.current.delete(audio);
      audio.addEventListener("ended", release, { once: true });
      audio.addEventListener("error", release, { once: true });
      void audio.play().catch(release);
    } catch {
      // Атмосферный звук не должен влиять на чтение.
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
      stopAmbient();
    };
  }, []);

  useEffect(() => {
    playedCuesRef.current = new Set();
    lastAmbientAtRef.current = 0;
    stopAmbient();
  }, [pathname]);

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

  useEffect(() => {
    if (!enabled || pathname === "/chitat") return;

    const article = document.querySelector("article");
    if (!article) return;

    const elements = Array.from(article.querySelectorAll("p, h2"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const text = entry.target.textContent?.trim() ?? "";
          if (!text) continue;

          const cue = cues.find((item) => !playedCuesRef.current.has(item.id) && item.test(text));
          if (!cue) continue;

          const now = Date.now();
          if (lastAmbientAtRef.current && now - lastAmbientAtRef.current < AMBIENT_COOLDOWN) continue;

          playedCuesRef.current.add(cue.id);
          lastAmbientAtRef.current = now;
          playAmbient(cue.src, cue.gain);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.55,
        rootMargin: "-8% 0px -24% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled, pathname, volume]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(ENABLED_KEY, next ? "on" : "off");
    if (next) playPageTurn(volume);
    else stopAmbient();
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
