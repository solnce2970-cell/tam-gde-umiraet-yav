"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./makosh-thread.module.css";

const ANOMALY_ID = "makosh-thread";
const ANOMALY_KEY = "yav-anomalies-v1";
const ROUTE_KEY = "yav-makosh-thread-route-v1";

type RouteState = { stage: 0 | 1 | 2 };

function readRoute(): RouteState {
  try {
    const value = JSON.parse(localStorage.getItem(ROUTE_KEY) || "{}");
    return { stage: value.stage === 1 || value.stage === 2 ? value.stage : 0 };
  } catch {
    return { stage: 0 };
  }
}

function writeRoute(stage: RouteState["stage"]) {
  localStorage.setItem(ROUTE_KEY, JSON.stringify({ stage }));
}

function isFound() {
  try {
    const state = JSON.parse(localStorage.getItem(ANOMALY_KEY) || "{}");
    return Array.isArray(state.found) && state.found.includes(ANOMALY_ID);
  } catch {
    return false;
  }
}

function awardAnomaly() {
  let state: { found: string[]; choice?: string | null } = { found: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(ANOMALY_KEY) || "{}");
    if (Array.isArray(parsed.found)) state = { ...parsed, found: parsed.found };
  } catch {
    // A damaged save should not make the anomaly impossible to complete.
  }

  if (!state.found.includes(ANOMALY_ID)) state.found.push(ANOMALY_ID);
  localStorage.setItem(ANOMALY_KEY, JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent("yav:anomaly-found", {
      detail: { id: ANOMALY_ID, count: state.found.length },
    }),
  );
}

export default function MakoshThread() {
  const [active, setActive] = useState(false);
  const [memoryVisible, setMemoryVisible] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (window.location.pathname !== "/genealogy" || isFound()) return;

    const makosh = document.querySelector<HTMLElement>("[data-makosh-card]");
    const genealogy = document.querySelector<HTMLElement>("[data-genealogy-image]");
    if (!makosh || !genealogy) return;

    const preview = new URLSearchParams(window.location.search).has("makosh-thread-preview");
    let route = readRoute();

    const show = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      setActive(true);
      writeRoute(0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;

          if (entry.target === makosh) {
            if (preview || route.stage === 2) {
              window.setTimeout(show, 650);
            } else if (route.stage === 0) {
              route = { stage: 1 };
              writeRoute(1);
            }
          }

          if (entry.target === genealogy && route.stage === 1) {
            route = { stage: 2 };
            writeRoute(2);
          }
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );

    observer.observe(makosh);
    observer.observe(genealogy);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const showMemory = window.setTimeout(() => setMemoryVisible(true), 1550);
    const hideMemory = window.setTimeout(() => setMemoryVisible(false), 3300);
    const dismiss = window.setTimeout(() => {
      if (!awarded) {
        setActive(false);
        activeRef.current = false;
      }
    }, 12000);
    return () => {
      window.clearTimeout(showMemory);
      window.clearTimeout(hideMemory);
      window.clearTimeout(dismiss);
    };
  }, [active, awarded]);

  const discover = () => {
    if (awarded) return;
    awardAnomaly();
    setAwarded(true);
    setMemoryVisible(true);
  };

  const close = () => {
    setActive(false);
    setMemoryVisible(false);
    activeRef.current = false;
  };

  if (!active) return null;

  return (
    <div className={`${styles.overlay} ${awarded ? styles.awarded : ""}`} role="dialog" aria-modal="true" aria-label="Чужая нить Макоши">
      <picture className={`${styles.memory} ${memoryVisible ? styles.memoryVisible : ""}`}>
        <source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-veles-mobile.webp" />
        <img src="/images/anomalies/makosh-veles-desktop.webp" alt="Скрытое воспоминание Макоши и Велеса" />
      </picture>
      <div className={styles.veil} />

      <figure className={`${styles.seal} ${styles.svarog}`}>
        <img src="/images/characters/svarog.webp?v=2" alt="Сварог" />
        <figcaption>Сварог</figcaption>
      </figure>
      <figure className={`${styles.seal} ${styles.veles}`}>
        <img src="/images/gods/veles.webp" alt="Велес" />
        <figcaption>Велес</figcaption>
      </figure>

      <svg className={styles.thread} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="false">
        <defs>
          <filter id="makosh-thread-glow" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path className={styles.threadShadow} d="M 92 304 C 286 170, 436 520, 602 316 S 802 238, 908 334" />
        <path className={styles.threadLine} d="M 92 304 C 286 170, 436 520, 602 316 S 802 238, 908 334" />
        <path className={styles.threadHit} d="M 92 304 C 286 170, 436 520, 602 316 S 802 238, 908 334" />
      </svg>

      <button
        className={styles.threadButton}
        type="button"
        aria-label="Коснуться золотой нити"
        onClick={discover}
      />

      <div className={styles.message} aria-live="polite">
        {awarded ? (
          <><small>Аномалия найдена</small><strong>Чужая нить Макоши</strong><span>Не всякая нить принадлежит той, что её прядёт.</span></>
        ) : (
          <><small>В узоре есть чужая воля</small><strong>Коснитесь нити</strong></>
        )}
      </div>

      <button className={styles.close} type="button" onClick={close} aria-label="Закрыть воспоминание">×</button>
    </div>
  );
}
