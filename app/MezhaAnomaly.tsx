"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MEZHA_FORCE_EVENT } from "../lib/anomalies/events";
import { canManifestMezha, armMezha, recordMezhaManifestation } from "../lib/anomalies/quest-state";
import { readTransientState, updateTransientState } from "../lib/anomalies/store";
import styles from "./mezha-anomaly.module.css";

const SCENE_MS = 7_200;
const COPY = "Межа стала тоньше.";

type LetterStyle = CSSProperties & { "--letter-index": number };

export default function MezhaAnomaly() {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const sceneTimerRef = useRef<number | undefined>(undefined);
  const chanceTimerRef = useRef<number | undefined>(undefined);
  const lastActivityRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const finish = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const manifest = useCallback((force = false) => {
    if (activeRef.current) return false;
    if (!force) {
      const before = readTransientState();
      if (!canManifestMezha(before, Date.now())) return false;
      updateTransientState((state) => recordMezhaManifestation(state, Date.now()));
    }

    activeRef.current = true;
    setActive(true);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    if (sceneTimerRef.current) window.clearTimeout(sceneTimerRef.current);
    sceneTimerRef.current = window.setTimeout(finish, SCENE_MS);
    return true;
  }, [finish]);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const audio = new Audio("/sfx/mezha-whisper.mp3");
    audio.preload = "auto";
    audio.volume = 0.55;
    audioRef.current = audio;

    const scheduleChance = () => {
      if (chanceTimerRef.current) window.clearTimeout(chanceTimerRef.current);
      const delay = 45_000 + Math.random() * 75_000;
      chanceTimerRef.current = window.setTimeout(() => {
        const state = readTransientState();
        const recentlyActive = Date.now() - lastActivityRef.current < 45_000;
        if (
          canManifestMezha(state, Date.now()) &&
          document.visibilityState === "visible" &&
          recentlyActive &&
          Math.random() < 0.045
        ) {
          manifest();
        }
        scheduleChance();
      }, delay);
    };

    const primeAudio = () => {
      const volume = audio.volume;
      audio.volume = 0;
      void audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
      }).catch(() => { audio.volume = volume; });
    };

    const arm = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('.heroActions a.primary[href="#world"]')) return;
      updateTransientState(armMezha);
      lastActivityRef.current = Date.now();
      primeAudio();
      scheduleChance();
    };

    const noteActivity = () => {
      if (!readTransientState().mezha.armed) return;
      lastActivityRef.current = Date.now();
    };

    const force = () => { manifest(true); };
    document.addEventListener("click", arm, true);
    window.addEventListener("scroll", noteActivity, { passive: true });
    window.addEventListener("pointermove", noteActivity, { passive: true });
    window.addEventListener("keydown", noteActivity);
    window.addEventListener(MEZHA_FORCE_EVENT, force);
    if (readTransientState().mezha.armed) scheduleChance();

    return () => {
      document.removeEventListener("click", arm, true);
      window.removeEventListener("scroll", noteActivity);
      window.removeEventListener("pointermove", noteActivity);
      window.removeEventListener("keydown", noteActivity);
      window.removeEventListener(MEZHA_FORCE_EVENT, force);
      if (chanceTimerRef.current) window.clearTimeout(chanceTimerRef.current);
      if (sceneTimerRef.current) window.clearTimeout(sceneTimerRef.current);
      audio.pause();
      audioRef.current = null;
    };
  }, [manifest]);

  if (!active) return null;

  return (
    <section className={styles.scene} role="status" aria-live="polite" data-mezha-anomaly="manifested">
      <div className={`${styles.fog} ${styles.fogOne}`} aria-hidden="true" />
      <div className={`${styles.fog} ${styles.fogTwo}`} aria-hidden="true" />
      <div className={`${styles.fog} ${styles.fogThree}`} aria-hidden="true" />
      <p className={styles.copy} aria-label={COPY}>
        {Array.from(COPY).map((letter, index) => (
          <span key={`${letter}-${index}`} aria-hidden="true" style={{ "--letter-index": index } as LetterStyle}>
            {letter === " " ? "\u00a0" : letter}
          </span>
        ))}
      </p>
    </section>
  );
}
