"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordMakoshVisit } from "../lib/anomalies/quest-state";
import { hasSign, unlockSign, updateTransientState } from "../lib/anomalies/store";
import styles from "./makosh-thread.module.css";
import threadStyles from "./makosh-thread-refactor.module.css";

const PORTRAIT_HOLD_MS = 520;
const THREAD_DRAW_MS = 1_080;

function pulseCard(card: HTMLElement) {
  card.classList.remove("yav-god-zoom");
  void card.offsetWidth;
  card.classList.add("yav-god-zoom");
  window.setTimeout(() => card.classList.remove("yav-god-zoom"), 760);
}

export default function MakoshThread() {
  const [active, setActive] = useState(false);
  const [threadsReady, setThreadsReady] = useState(false);
  const activeRef = useRef(false);
  const crossRef = useRef<HTMLButtonElement | null>(null);
  const threadRefs = useRef<Array<SVGPathElement | null>>([]);

  const close = useCallback(() => {
    setActive(false);
    setThreadsReady(false);
    activeRef.current = false;
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/genealogy") return;
    const preview = new URLSearchParams(window.location.search).has("makosh-thread-preview");
    if (preview) {
      activeRef.current = true;
      setActive(true);
      return;
    }
    if (hasSign("makosh-thread")) return;

    const register = (card: HTMLElement) => {
      if (activeRef.current) return;
      const name = card.dataset.godName;
      if (!name) return;
      pulseCard(card);
      let completed = false;
      updateTransientState((state) => {
        const result = recordMakoshVisit(state, name);
        completed = result.completed;
        return result.state;
      });
      if (completed) {
        window.setTimeout(() => {
          activeRef.current = true;
          setActive(true);
        }, 620);
      }
    };

    const onClick = (event: MouseEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-god-name]");
      if (card) register(card);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-god-name]");
      if (!card) return;
      event.preventDefault();
      register(card);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setThreadsReady(false);
    let cancelled = false;
    let holdTimer: number | undefined;
    const animations: Animation[] = [];

    const stageThreads = () => {
      for (const path of threadRefs.current) {
        if (!path) continue;
        const length = path.getTotalLength();
        path.style.animation = "none";
        path.style.visibility = "hidden";
        path.style.opacity = "0";
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = `${length}`;
      }
    };

    const drawThreads = async () => {
      stageThreads();
      await new Promise<void>((resolve) => {
        holdTimer = window.setTimeout(resolve, PORTRAIT_HOLD_MS);
      });
      if (cancelled) return;

      for (const path of threadRefs.current) {
        if (!path || cancelled) return;
        const length = path.getTotalLength();
        path.style.visibility = "visible";
        path.style.opacity = "1";
        const animation = path.animate(
          [
            { strokeDashoffset: `${length}` },
            { strokeDashoffset: "0" },
          ],
          { duration: THREAD_DRAW_MS, easing: "cubic-bezier(.42, 0, .24, 1)", fill: "forwards" },
        );
        animations.push(animation);
        try {
          await animation.finished;
        } catch {
          return;
        }
        if (cancelled) return;
        path.style.strokeDashoffset = "0";
        animation.cancel();
      }

      if (!cancelled) setThreadsReady(true);
    };

    void drawThreads();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelled = true;
      if (holdTimer) window.clearTimeout(holdTimer);
      for (const animation of animations) animation.cancel();
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close]);

  useEffect(() => {
    if (threadsReady) crossRef.current?.focus({ preventScroll: true });
  }, [threadsReady]);

  const discover = () => {
    if (!threadsReady) return;
    const result = unlockSign("makosh-thread");
    if (result.unlocked || hasSign("makosh-thread")) close();
  };

  if (!active) return null;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Чужая нить Макоши">
      <div className={styles.veil} />
      <div className={`${styles.ritual} ${threadsReady ? styles.ready : ""}`}>
        <div className={styles.heading}>
          <small>Чужая нить Макоши</small>
          <strong>{threadsReady ? "Нити сошлись" : "Четыре нити ищут пересечение"}</strong>
        </div>
        <figure className={`${styles.seal} ${styles.makosh}`}><img src="/images/characters/makosh.webp?v=2" alt="Макошь" /><figcaption>Макошь</figcaption></figure>
        <figure className={`${styles.seal} ${styles.veles}`}><img src="/images/gods/veles.webp" alt="Велес" /><figcaption>Велес</figcaption></figure>
        <figure className={`${styles.seal} ${styles.svarog}`}><img src="/images/characters/svarog.webp?v=2" alt="Сварог" /><figcaption>Сварог</figcaption></figure>
        <figure className={`${styles.seal} ${styles.lada}`}><img src="/images/gods/Lada.webp" alt="Лада" /><figcaption>Лада</figcaption></figure>
        <svg className={styles.threads} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="thread-gold-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-silver-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-fire-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-white-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path
            ref={(node) => { threadRefs.current[0] = node; }}
            className={`${styles.threadLine} ${styles.silver} ${threadStyles.runtimeThread}`}
            style={{ animation: "none", visibility: "hidden", opacity: 0 }}
            d="M760 510 Q635 420 500 350 Q430 245 350 155"
          />
          <path
            ref={(node) => { threadRefs.current[1] = node; }}
            className={`${styles.threadLine} ${styles.gold} ${threadStyles.runtimeThread}`}
            style={{ animation: "none", visibility: "hidden", opacity: 0 }}
            d="M180 510 Q350 420 500 350 Q430 245 350 155"
          />
          <path
            ref={(node) => { threadRefs.current[2] = node; }}
            className={`${styles.threadLine} ${styles.white} ${threadStyles.runtimeThread}`}
            style={{ animation: "none", visibility: "hidden", opacity: 0 }}
            d="M350 155 Q420 260 500 350 Q350 405 180 510"
          />
          <path
            ref={(node) => { threadRefs.current[3] = node; }}
            className={`${styles.threadLine} ${styles.fire} ${threadStyles.runtimeThread}`}
            style={{ animation: "none", visibility: "hidden", opacity: 0 }}
            d="M760 155 Q620 250 500 350 Q640 430 760 510"
          />
          <circle className={`${styles.crossGlow} ${threadsReady ? threadStyles.glowReady : threadStyles.glowPending}`} cx="500" cy="350" r="25" />
        </svg>
        <button ref={crossRef} className={`${styles.crossButton} ${threadsReady ? threadStyles.centerReady : threadStyles.centerPending}`} type="button" disabled={!threadsReady} aria-disabled={!threadsReady} onClick={discover} aria-label={threadsReady ? "Коснуться места пересечения нитей" : "Нити ещё не сошлись"}><span /></button>
      </div>
      <button className={styles.close} type="button" onClick={close} aria-label="Закрыть нити">×</button>
    </div>
  );
}
