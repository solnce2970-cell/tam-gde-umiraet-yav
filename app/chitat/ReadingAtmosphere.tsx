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

const HOUSE_PATH = "/chitat/dom-kotoryy-gulyal";
const HOUSE_DWELL_MS = 900;

const DREAM_PATH = "/chitat/son-kotoryy-byl-ne-ego";
const DREAM_DWELL_MS = 950;

type VolumeMode = "quiet" | "medium";

type StagedCue = {
  id: string;
  trigger: string;
  src: string;
  quietVolume: number;
  mediumVolume: number;
  maxPlayMs?: number;
  fadeMs?: number;
};

const HOUSE_CUES: StagedCue[] = [
  {
    id: "house-wind",
    trigger: "Лес ответил тишиной.",
    src: "/sfx/wind-4s.mp3",
    quietVolume: 0.07,
    mediumVolume: 0.14,
  },
  {
    id: "house-approach",
    trigger: "Где-то далеко хрустнула ветка. Потом другая. Потом земля дрогнула.",
    src: "/sfx/branch-crack%2011s.mp3",
    quietVolume: 0.12,
    mediumVolume: 0.24,
    maxPlayMs: 7000,
    fadeMs: 700,
  },
  {
    id: "house-first-creak",
    trigger: "Изба скрипнула. Окна моргнули.",
    src: "/sfx/door-creak-3s.mp3",
    quietVolume: 0.11,
    mediumVolume: 0.22,
  },
  {
    id: "house-shift",
    trigger: "Изба обиженно переступила с лапы на лапу.",
    src: "/sfx/zov-predkov--pochva%204s.mp3",
    quietVolume: 0.09,
    mediumVolume: 0.18,
  },
  {
    id: "house-close-creak",
    trigger: "Старые брёвна заскрипели. Окно моргнуло.",
    src: "/sfx/tree-creak%2047s.mp3",
    quietVolume: 0.09,
    mediumVolume: 0.18,
    maxPlayMs: 6000,
    fadeMs: 900,
  },
];

const DREAM_CUES: StagedCue[] = [
  {
    id: "dream-mavki",
    trigger: "Среди тростников слышался тихий смех — то пели мавки, неупокоенные девы.",
    src: "/sfx/mavki-whisper.mp3",
    quietVolume: 0.09,
    mediumVolume: 0.18,
    maxPlayMs: 5200,
    fadeMs: 700,
  },
  {
    id: "dream-dead-gait",
    trigger: "Когда они кружились в танце, сквозь разрывы плоти сверкали блёстки болотного света",
    src: "/sfx/mertvetsyi-idut--hromaya-pohodka%206s.mp3",
    quietVolume: 0.12,
    mediumVolume: 0.24,
  },
  {
    id: "dream-steam-finale",
    trigger: "Волк рухнул в омут, где вода и огонь встретились в шипении.",
    src: "/sfx/steam-evaporation%2021s.mp3",
    quietVolume: 0.1,
    mediumVolume: 0.2,
    maxPlayMs: 9000,
    fadeMs: 1200,
  },
];

export default function ReadingAtmosphere() {
  const router = useRouter();
  const pathname = usePathname();
  const pageTurnRef = useRef<HTMLAudioElement | null>(null);
  const mudStepsRef = useRef<HTMLAudioElement | null>(null);
  const forestRef = useRef<HTMLAudioElement | null>(null);
  const houseAudioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const housePlayedRef = useRef<Set<string>>(new Set());
  const dreamAudioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const dreamPlayedRef = useRef<Set<string>>(new Set());
  const activeDreamAudioRef = useRef<HTMLAudioElement | null>(null);
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

  const unlockAudio = (audio: HTMLAudioElement) => {
    try {
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
      // Браузер может ждать пользовательского жеста.
    }
  };

  const unlockMudSteps = () => unlockAudio(getMudStepsAudio());

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

      audio.addEventListener("ended", () => window.clearTimeout(fadeTimer), { once: true });
      void audio.play().catch(() => window.clearTimeout(fadeTimer));
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

  const unlockForest = () => unlockAudio(getForestAudio());

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

  const getStagedAudio = (store: Map<string, HTMLAudioElement>, cue: StagedCue) => {
    const existing = store.get(cue.id);
    if (existing) return existing;
    const audio = new Audio(cue.src);
    audio.preload = "metadata";
    store.set(cue.id, audio);
    return audio;
  };

  const stopAudioMap = (store: Map<string, HTMLAudioElement>) => {
    store.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  const playStagedCue = (audio: HTMLAudioElement, cue: StagedCue, mode: VolumeMode) => {
    const targetVolume = mode === "medium" ? cue.mediumVolume : cue.quietVolume;
    audio.muted = false;
    audio.volume = targetVolume;
    audio.currentTime = 0;

    let stopTimer: number | null = null;
    if (cue.maxPlayMs) {
      stopTimer = window.setTimeout(() => {
        if (!cue.fadeMs) {
          audio.pause();
          audio.currentTime = 0;
          return;
        }
        const steps = 10;
        const interval = cue.fadeMs / steps;
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
      }, cue.maxPlayMs);
    }

    audio.addEventListener("ended", () => {
      if (stopTimer !== null) window.clearTimeout(stopTimer);
    }, { once: true });
    void audio.play().catch(() => {
      if (stopTimer !== null) window.clearTimeout(stopTimer);
    });
  };

  const getHouseAudio = (cue: StagedCue) => getStagedAudio(houseAudioRef.current, cue);
  const unlockHouseSounds = () => HOUSE_CUES.forEach((cue) => unlockAudio(getHouseAudio(cue)));
  const stopHouseSounds = () => stopAudioMap(houseAudioRef.current);
  const playHouseCue = (cue: StagedCue, mode: VolumeMode) => {
    try {
      playStagedCue(getHouseAudio(cue), cue, mode);
    } catch {
      // Постановочный эффект не должен мешать чтению.
    }
  };

  const getDreamAudio = (cue: StagedCue) => getStagedAudio(dreamAudioRef.current, cue);
  const unlockDreamSounds = () => DREAM_CUES.forEach((cue) => unlockAudio(getDreamAudio(cue)));
  const stopDreamSounds = () => {
    stopAudioMap(dreamAudioRef.current);
    activeDreamAudioRef.current = null;
  };
  const playDreamCue = (cue: StagedCue, mode: VolumeMode) => {
    try {
      const audio = getDreamAudio(cue);
      const active = activeDreamAudioRef.current;
      if (active && active !== audio) {
        active.pause();
        active.currentTime = 0;
      }
      activeDreamAudioRef.current = audio;
      playStagedCue(audio, cue, mode);
    } catch {
      // Сон должен оставаться читаемым даже без звука.
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
    getMudStepsAudio();

    return () => {
      audio.pause();
      pageTurnRef.current = null;
      stopMudSteps();
      stopForest();
      stopHouseSounds();
      stopDreamSounds();
      mudStepsRef.current = null;
      forestRef.current = null;
      houseAudioRef.current.clear();
      dreamAudioRef.current.clear();
    };
  }, []);

  useEffect(() => {
    mudStepsPlayedRef.current = false;
    housePlayedRef.current = new Set();
    dreamPlayedRef.current = new Set();
    stopMudSteps();
    if (pathname !== FOREST_PATH) stopForest();
    if (pathname !== HOUSE_PATH) stopHouseSounds();
    if (pathname !== DREAM_PATH) stopDreamSounds();
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
      if (pathname === HOUSE_PATH) unlockHouseSounds();
      if (pathname === DREAM_PATH) unlockDreamSounds();
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
        if (url.pathname === HOUSE_PATH) unlockHouseSounds();
        if (url.pathname === DREAM_PATH) unlockDreamSounds();
        playPageTurn(volume);
      }
      window.setTimeout(() => router.push(`${url.pathname}${url.search}${url.hash}`), enabled ? 140 : 0);
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
      { threshold: 0, rootMargin: "-36% 0px -36% 0px" },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
      if (dwellTimer !== null) window.clearTimeout(dwellTimer);
    };
  }, [enabled, pathname, volume]);

  useEffect(() => {
    if (!enabled || pathname !== HOUSE_PATH) return;
    const article = document.querySelector("article");
    if (!article) return;

    const timers = new Map<Element, number>();
    const cueByElement = new Map<Element, StagedCue>();

    HOUSE_CUES.forEach((cue) => {
      const target = Array.from(article.querySelectorAll("p")).find((element) =>
        element.textContent?.includes(cue.trigger),
      );
      if (target) cueByElement.set(target, cue);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cue = cueByElement.get(entry.target);
          if (!cue || housePlayedRef.current.has(cue.id)) return;

          if (entry.isIntersecting) {
            if (timers.has(entry.target)) return;
            const timer = window.setTimeout(() => {
              timers.delete(entry.target);
              if (housePlayedRef.current.has(cue.id)) return;
              housePlayedRef.current.add(cue.id);
              playHouseCue(cue, volume);
              observer.unobserve(entry.target);
            }, HOUSE_DWELL_MS);
            timers.set(entry.target, timer);
          } else {
            const timer = timers.get(entry.target);
            if (timer !== undefined) {
              window.clearTimeout(timer);
              timers.delete(entry.target);
            }
          }
        });
      },
      { threshold: 0, rootMargin: "-34% 0px -34% 0px" },
    );

    cueByElement.forEach((_cue, element) => observer.observe(element));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [enabled, pathname, volume]);

  useEffect(() => {
    if (!enabled || pathname !== DREAM_PATH) return;
    const article = document.querySelector("article");
    if (!article) return;

    const timers = new Map<Element, number>();
    const cueByElement = new Map<Element, StagedCue>();

    DREAM_CUES.forEach((cue) => {
      const target = Array.from(article.querySelectorAll("p")).find((element) =>
        element.textContent?.includes(cue.trigger),
      );
      if (target) cueByElement.set(target, cue);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cue = cueByElement.get(entry.target);
          if (!cue || dreamPlayedRef.current.has(cue.id)) return;

          if (entry.isIntersecting) {
            if (timers.has(entry.target)) return;
            const timer = window.setTimeout(() => {
              timers.delete(entry.target);
              if (dreamPlayedRef.current.has(cue.id)) return;
              dreamPlayedRef.current.add(cue.id);
              playDreamCue(cue, volume);
              observer.unobserve(entry.target);
            }, DREAM_DWELL_MS);
            timers.set(entry.target, timer);
          } else {
            const timer = timers.get(entry.target);
            if (timer !== undefined) {
              window.clearTimeout(timer);
              timers.delete(entry.target);
            }
          }
        });
      },
      { threshold: 0, rootMargin: "-32% 0px -32% 0px" },
    );

    cueByElement.forEach((_cue, element) => observer.observe(element));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
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
      if (pathname === HOUSE_PATH) unlockHouseSounds();
      if (pathname === DREAM_PATH) unlockDreamSounds();
      playPageTurn(volume);
    } else {
      stopMudSteps();
      stopForest();
      stopHouseSounds();
      stopDreamSounds();
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
      if (pathname === HOUSE_PATH) unlockHouseSounds();
      if (pathname === DREAM_PATH) unlockDreamSounds();
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