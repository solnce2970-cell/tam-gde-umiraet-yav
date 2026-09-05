"use client";

import { useEffect, useRef } from "react";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";
const DWELL_MS = 900;

type Cue = {
  id: string;
  trigger: string;
  src: string;
  quietVolume: number;
  mediumVolume: number;
};

// Первый звук мавок остаётся в основном ReadingAtmosphere.
// Здесь один переиспользуемый audio-канал для двух последующих точек сна:
// это надёжнее на мобильных браузерах, которые могут разрешить запуск только
// одного из нескольких созданных Audio-объектов после пользовательского жеста.
const CUES: Cue[] = [
  {
    id: "dream-dead-gait-recovery",
    trigger: "Когда они кружились в танце, сквозь разрывы плоти сверкали блёстки болотного света",
    src: "/sfx/mertvetsyi-idut--hromaya-pohodka%206s.mp3",
    quietVolume: 0.12,
    mediumVolume: 0.24,
  },
  {
    id: "dream-dark-whisper-recovery",
    trigger: "Они звали — голосами детей и женщин, нежных и беззащитных.",
    src: "/sfx/whisper-dark.mp3",
    quietVolume: 0.08,
    mediumVolume: 0.16,
  },
];

export default function DreamSoundRecovery() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const enabled = window.localStorage.getItem(ENABLED_KEY) !== "off";
    if (!enabled) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.setAttribute("playsinline", "");
    audioRef.current = audio;

    const unlock = () => {
      const current = audioRef.current;
      if (!current) return;
      try {
        const previousMuted = current.muted;
        current.muted = true;
        current.src = CUES[0].src;
        const attempt = current.play();
        if (attempt) {
          void attempt.then(() => {
            current.pause();
            current.currentTime = 0;
            current.muted = previousMuted;
          }).catch(() => {
            current.muted = previousMuted;
          });
        }
      } catch {
        // Звук не должен мешать чтению.
      }
    };

    document.addEventListener("pointerdown", unlock, { capture: true, once: true });

    const targets = new Map<Element, Cue>();
    CUES.forEach((cue) => {
      const target = Array.from(article.querySelectorAll("p")).find((element) =>
        element.textContent?.includes(cue.trigger),
      );
      if (target) targets.set(target, cue);
    });

    const timers = new Map<Element, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const cue = targets.get(entry.target);
        if (!cue || playedRef.current.has(cue.id)) return;

        if (!entry.isIntersecting) {
          const timer = timers.get(entry.target);
          if (timer !== undefined) {
            window.clearTimeout(timer);
            timers.delete(entry.target);
          }
          return;
        }

        if (timers.has(entry.target)) return;
        const timer = window.setTimeout(() => {
          timers.delete(entry.target);
          if (playedRef.current.has(cue.id)) return;
          playedRef.current.add(cue.id);

          const current = audioRef.current;
          if (!current) return;
          const mode = window.localStorage.getItem(VOLUME_KEY) === "medium" ? "medium" : "quiet";
          current.pause();
          current.src = cue.src;
          current.currentTime = 0;
          current.muted = false;
          current.volume = mode === "medium" ? cue.mediumVolume : cue.quietVolume;
          void current.play().catch(() => undefined);
          observer.unobserve(entry.target);
        }, DWELL_MS);
        timers.set(entry.target, timer);
      });
    }, { threshold: 0, rootMargin: "-32% 0px -32% 0px" });

    targets.forEach((_cue, element) => observer.observe(element));

    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true } as AddEventListenerOptions);
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      playedRef.current.clear();
    };
  }, []);

  return null;
}
