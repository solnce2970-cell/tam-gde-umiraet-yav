"use client";

import { useEffect, useRef, useState } from "react";
import type { NavnikTransitionDetail } from "../lib/anomalies/events";
import { NAVNIK_TRANSITION_EVENT } from "../lib/anomalies/events";
import { beginShishigaEncounter, closeShishigaEncounter, SHISHIGA_VISIBLE_MS } from "../lib/anomalies/quest-state";
import { hasSign, readTransientState, subscribeAnomalyStore, unlockSign, updateTransientState } from "../lib/anomalies/store";
import styles from "./shishiga-track.module.css";

function Footprint({
  step,
  side,
  special = false,
  ready = true,
  onActivate,
}: {
  step: number;
  side: "left" | "right";
  special?: boolean;
  ready?: boolean;
  onActivate?: () => void;
}) {
  const shape = (
    <svg viewBox="0 0 48 78" aria-hidden="true">
      <ellipse cx="24" cy="61" rx="11" ry="13" />
      <path d="M14 52c-4-9-4-21 1-29 4-6 14-7 18 0 5 9 5 21 1 30-4 8-16 8-20-1Z" />
      <circle cx="9" cy="18" r="4" /><circle cx="16" cy="11" r="4.5" />
      <circle cx="25" cy="8" r="5" /><circle cx="34" cy="11" r="4.5" /><circle cx="41" cy="18" r="3.5" />
    </svg>
  );
  const positionClass = styles[`step${step}`];
  const sideClass = side === "left" ? styles.leftFoot : styles.rightFoot;
  return special ? (
    <button
      className={`${styles.special} ${positionClass} ${sideClass} ${ready ? styles.specialReady : styles.specialWaiting}`}
      type="button"
      aria-label="Коснуться особого следа шишиги"
      disabled={!ready}
      tabIndex={ready ? 0 : -1}
      onClick={onActivate}
    >{shape}</button>
  ) : <span className={`${styles.footprint} ${positionClass} ${sideClass}`}>{shape}</span>;
}

export default function ShishigaTrack() {
  const [revealed, setRevealed] = useState(false);
  const [trailReady, setTrailReady] = useState(false);
  const activeRef = useRef(false);
  const visibleMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPersistedRef = useRef(0);

  useEffect(() => {
    const existing = readTransientState().shishiga;
    setRevealed(existing.revealed && !hasSign("shishiga-track"));
    const unsubscribe = subscribeAnomalyStore(() => {
      const current = readTransientState().shishiga;
      setRevealed(current.revealed && !hasSign("shishiga-track"));
    });
    const persistAttempt = (values: { modalOpen: boolean; eligible: boolean; revealed: boolean }) => {
      updateTransientState((state) => ({
        ...state,
        shishiga: { ...state.shishiga, ...values, visibleMs: visibleMsRef.current },
      }));
      lastPersistedRef.current = visibleMsRef.current;
    };
    const onTransition = (event: Event) => {
      const detail = (event as CustomEvent<NavnikTransitionDetail>).detail;
      if (detail?.creatureId !== "shishiga" || hasSign("shishiga-track")) return;
      if (detail.transition === "closed-to-open") {
        const next = updateTransientState(beginShishigaEncounter);
        activeRef.current = next.shishiga.modalOpen;
        visibleMsRef.current = next.shishiga.visibleMs;
        lastPersistedRef.current = 0;
        lastTickRef.current = performance.now();
        setRevealed(false);
        return;
      }
      const now = performance.now();
      if (activeRef.current && document.visibilityState === "visible") {
        visibleMsRef.current = Math.min(
          SHISHIGA_VISIBLE_MS,
          visibleMsRef.current + Math.max(0, now - lastTickRef.current),
        );
      }
      activeRef.current = false;
      const next = updateTransientState((state) => closeShishigaEncounter({
        ...state,
        shishiga: {
          ...state.shishiga,
          visibleMs: visibleMsRef.current,
          eligible: visibleMsRef.current >= SHISHIGA_VISIBLE_MS,
        },
      }));
      visibleMsRef.current = next.shishiga.visibleMs;
      setRevealed(next.shishiga.revealed);
    };
    const onVisibilityChange = () => { lastTickRef.current = performance.now(); };
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!activeRef.current || document.visibilityState !== "visible") {
        lastTickRef.current = now;
        return;
      }
      visibleMsRef.current = Math.min(
        SHISHIGA_VISIBLE_MS,
        visibleMsRef.current + Math.max(0, now - lastTickRef.current),
      );
      lastTickRef.current = now;
      if (visibleMsRef.current >= SHISHIGA_VISIBLE_MS || visibleMsRef.current - lastPersistedRef.current >= 1_000) {
        persistAttempt({ modalOpen: true, eligible: visibleMsRef.current >= SHISHIGA_VISIBLE_MS, revealed: false });
      }
    }, 250);
    window.addEventListener(NAVNIK_TRANSITION_EVENT, onTransition);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
      window.removeEventListener(NAVNIK_TRANSITION_EVENT, onTransition);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!revealed) {
      setTrailReady(false);
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setTrailReady(true), reducedMotion ? 250 : 3_150);
    return () => window.clearTimeout(timer);
  }, [revealed]);

  const discover = () => {
    if (!trailReady) return;
    const result = unlockSign("shishiga-track");
    if (!result.unlocked) return;
    setRevealed(false);
    updateTransientState((state) => ({ ...state, shishiga: { ...state.shishiga, revealed: false } }));
  };

  if (!revealed) return null;
  return (
    <aside className={styles.reveal} aria-live="polite">
      <p>Кто-то вышел из Навника не той дорогой.</p>
      <div className={styles.trail}>
        <Footprint step={0} side="left" />
        <Footprint step={1} side="right" />
        <Footprint step={2} side="left" />
        <Footprint step={3} side="right" />
        <Footprint step={4} side="left" />
        <Footprint step={5} side="right" />
        <Footprint step={6} side="left" special ready={trailReady} onActivate={discover} />
      </div>
    </aside>
  );
}
