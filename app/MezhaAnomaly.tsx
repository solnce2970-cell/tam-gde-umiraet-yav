"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { MEZHA_FORCE_EVENT } from "../lib/anomalies/events";
import { canManifestMezha, armMezha, getMezhaManifestChance, recordMezhaManifestation } from "../lib/anomalies/quest-state";
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
  const activeVisibleMsRef = useRef(0);
  const lastVisibleTickRef = useRef(0);
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
      const delay = 30_000 + Math.random() * 15_000;
      chanceTimerRef.current = window.setTimeout(() => {
        const state = readTransientState();
        const now = performance.now();
        if (document.visibilityState === "visible") {
          activeVisibleMsRef.current += Math.max(0, now - lastVisibleTickRef.current);
        }
        lastVisibleTickRef.current = now;
        if (
          canManifestMezha(state, Date.now()) &&
          document.visibilityState === "visible" &&
          Math.random() < getMezhaManifestChance(activeVisibleMsRef.current)
        ) {
          if (manifest()) activeVisibleMsRef.current = 0;
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
      const wasArmed = readTransientState().mezha.armed;
      updateTransientState(armMezha);
      if (!wasArmed) activeVisibleMsRef.current = 0;
      lastVisibleTickRef.current = performance.now();
      primeAudio();
      scheduleChance();
    };

    const onVisibilityChange = () => {
      const now = performance.now();
      if (document.visibilityState === "hidden" && readTransientState().mezha.armed) {
        activeVisibleMsRef.current += Math.max(0, now - lastVisibleTickRef.current);
      }
      lastVisibleTickRef.current = now;
    };

    const force = () => { manifest(true); };
    document.addEventListener("click", arm, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener(MEZHA_FORCE_EVENT, force);
    if (readTransientState().mezha.armed) {
      lastVisibleTickRef.current = performance.now();
      scheduleChance();
    }

    return () => {
      document.removeEventListener("click", arm, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
