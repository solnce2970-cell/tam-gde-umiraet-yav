"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./ReadingAtmosphere.module.css";
import { PAGE_TURN_SRC } from "./pageTurnAudio";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";

const MUD_STEPS_SRC = "/sfx/steps-mud-37s.mp3";
const MUD_STEPS_TRIGGER = "За ними шли. Не бежали. Шли. Мокро. Мягко. Тяжело. Шлёп. Шлёп. Шлёп.";
const MUD_STEPS_DWELL_MS = 1200;
const MUD_STEPS_PLAY_MS = 7000;
const MUD_STEPS_FADE_MS = 1000;

const FOREST_PATH = "/chitat/les-prishel-k-nei-sam";
const FOREST_SRC = "/sfx/forest-lark-and-european-robin-at-the-stream%204m16s.mp3";

type VolumeMode = "quiet" | "medium";

export default function ReadingAtmosphere() {
  const router = useRouter();
  const pathname = usePathname();
  const pageTurnRef = useRef<HTMLAudioElement | null>(null);
  const mudStepsRef = useRef<HTMLAudioElement | null>(null);
  const forestRef = useRef<HTMLAudioElement | null>(null);
  const mudStepsPlayedRef = useRef(false);
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

  const getMudStepsAudio = () => {
    const existing = mudStepsRef.current;
    if (existing) return existing;
    const audio = new Audio(MUD_STEPS_SRC);
    audio.preload = "auto";
    mudStepsRef.current = audio;
    return audio;
  };

  const unlockMudSteps = () => {
    try {
      const audio = getMudStepsAudio();
      if (!audio.paused || audio.currentTime > 0) return;
      const previousMuted = audio.muted;
      audio.muted = true;
      const attempt = audio.play();
      if (attempt) {
        void attempt.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        }).catch(() => {
          audio.muted = previousMuted;
        });
      }
    } catch {
      // Если браузер не разрешил разблокировку, чтение всё равно продолжается.
    }
  };

  const stopMudSteps = () => {
    const audio = mudStepsRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const playMudSteps = (mode: VolumeMode) => {
    try {
      const audio = getMudStepsAudio();
      const targetVolume = mode === "medium" ? 0.24 : 0.12;
      audio.muted = false;
      audio.volume = targetVolume;
      audio.currentTime = 0;

      const fadeTimer = window.setTimeout(() => {
        const steps = 10;
        const interval = MUD_STEPS_FADE_MS / steps;
        let step = 0;
        const fade = window.setInterval(() => {
          step += 1;
          audio.volume = Math.max(0, targetVolume * (1 - step / steps));
          if (step >= steps) {
            window.clearInterval(fade);
            audio.pause();
            audio.currentTime = 0;
          }
        }, interval);
      }, MUD_STEPS_PLAY_MS);

      audio.addEventListener("ended", () => {
        window.clearTimeout(fadeTimer);
      }, { once: true });

      void audio.play().catch(() => {
        window.clearTimeout(fadeTimer);
      });
    } catch {
      // Атмосфера не должна мешать чтению.
    }
  };

  const getForestAudio = () => {
    const existing = forestRef.current;
    if (existing) return existing;
    const audio = new Audio(FOREST_SRC);
    audio.preload = "metadata";
    audio.loop = true;
    forestRef.current = audio;
    return audio;
  };

  const unlockForest = () => {
    try {
      const audio = getForestAudio();
      if (!audio.paused || audio.currentTime > 0) return;
      const previousMuted = audio.muted;
      audio.muted = true;
      const attempt = audio.play();
      if (attempt) {
        void attempt.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        }).catch(() => {
          audio.muted = previousMuted;
        });
      }
    } catch {
      // Браузер может ждать первого пользовательского жеста.
    }
  };

  const playForest = (mode: VolumeMode) => {
    try {
      const audio = getForestAudio();
      audio.muted = false;
      audio.volume = mode === "medium" ? 0.16 : 0.08;
      if (!audio.paused) return;
      void audio.play().catch(() => undefined);
    } catch {
      // Фоновый лес не должен мешать чтению.
    }
  };

  const stopForest = () => {
    const audio = forestRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
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
    getMudStepsAudio();

    return () => {
      audio.pause();
      pageTurnRef.current = null;
      stopMudSteps();
      stopForest();
      mudStepsRef.current = null;
      forestRef.current = null;
    };
  }, []);

  useEffect(() => {
    mudStepsPlayedRef.current = false;
    stopMudSteps();
    if (pathname !== FOREST_PATH) stopForest();
  }, [pathname]);

  useEffect(() => {
    if (!enabled || pathname !== FOREST_PATH) {
      stopForest();
      return;
    }

    const timer = window.setTimeout(() => playForest(volume), 450);
    return () => window.clearTimeout(timer);
  }, [enabled, pathname, volume]);

  useEffect(() => {
    const onPointerDown = () => {
      if (!enabled) return;
      unlockMudSteps();
      if (pathname === FOREST_PATH) {
        unlockForest();
        window.setTimeout(() => playForest(volume), 60);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [enabled, pathname, volume]);

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
      if (enabled) {
        unlockMudSteps();
        if (url.pathname === FOREST_PATH) unlockForest();
        playPageTurn(volume);
      }
      window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, enabled ? 140 : 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, volume, router]);

  useEffect(() => {
    if (!enabled || pathname !== "/chitat/glava-0" || mudStepsPlayedRef.current) return;

    const article = document.querySelector("article");
    if (!article) return;

    const target = Array.from(article.querySelectorAll("p")).find((element) =>
      element.textContent?.includes(MUD_STEPS_TRIGGER),
    );
    if (!target) return;

    let dwellTimer: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (dwellTimer !== null) return;
          dwellTimer = window.setTimeout(() => {
            dwellTimer = null;
            if (mudStepsPlayedRef.current) return;
            mudStepsPlayedRef.current = true;
            playMudSteps(volume);
            observer.disconnect();
          }, MUD_STEPS_DWELL_MS);
        } else if (dwellTimer !== null) {
          window.clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      },
      {
        threshold: 0,
        rootMargin: "-36% 0px -36% 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (dwellTimer !== null) window.clearTimeout(dwellTimer);
    };
  }, [enabled, pathname, volume]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(ENABLED_KEY, next ? "on" : "off");
    if (next) {
      unlockMudSteps();
      if (pathname === FOREST_PATH) {
        unlockForest();
        window.setTimeout(() => playForest(volume), 60);
      }
      playPageTurn(volume);
    } else {
      stopMudSteps();
      stopForest();
    }
  };

  const toggleVolume = () => {
    const next: VolumeMode = volume === "quiet" ? "medium" : "quiet";
    setVolume(next);
    window.localStorage.setItem(VOLUME_KEY, next);
    if (enabled) {
      unlockMudSteps();
      if (pathname === FOREST_PATH) {
        const forest = getForestAudio();
        forest.volume = next === "medium" ? 0.16 : 0.08;
        if (forest.paused) {
          unlockForest();
          window.setTimeout(() => playForest(next), 60);
        }
      }
      playPageTurn(next);
    }
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
