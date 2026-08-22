"use client";

import { useCallback, useEffect, useState } from "react";
import { RETURN_CRACK_FORCE_EVENT } from "../lib/anomalies/events";
import { canUnlockReturn } from "../lib/anomalies/quest-state";
import {
  hasSign,
  readAnomalyState,
  subscribeAnomalyStore,
  unlockSign,
} from "../lib/anomalies/store";
import styles from "./return-to-beginning.module.css";

const FINAL_REVEAL_MS = 2_600;

function debugEnabled() {
  return new URLSearchParams(window.location.search).get("anomaly-debug") === "1";
}

export default function ReturnToBeginningCrack() {
  const [eligible, setEligible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [forced, setForced] = useState(false);
  const [completed, setCompleted] = useState(false);

  const sync = useCallback(() => {
    const state = readAnomalyState();
    setEligible(canUnlockReturn(state.found.length) && !hasSign("return-to-beginning"));
  }, []);

  useEffect(() => {
    sync();
    return subscribeAnomalyStore(sync);
  }, [sync]);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting && entry.intersectionRatio >= 0.3),
      { threshold: [0, 0.3, 0.65] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const force = () => {
      if (!debugEnabled() || !canUnlockReturn(readAnomalyState().found.length)) return;
      setForced(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener(RETURN_CRACK_FORCE_EVENT, force);
    return () => window.removeEventListener(RETURN_CRACK_FORCE_EVENT, force);
  }, []);

  useEffect(() => {
    if (!completed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => window.location.assign("/za-mezhoy"), FINAL_REVEAL_MS);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [completed]);

  const openCrack = () => {
    const result = unlockSign("return-to-beginning");
    if (!result.unlocked) return;
    setCompleted(true);
  };

  return (
    <>
      {eligible && (heroVisible || forced) && !completed && (
        <button
          className={styles.crack}
          type="button"
          onClick={openCrack}
          aria-label="Коснуться трещины Межи"
          data-return-crack="manifested"
          data-quest-element="return-to-beginning"
        >
          <span /><i /><b />
        </button>
      )}
      {completed && (
        <div className={styles.finalOverlay} role="dialog" aria-modal="true" aria-live="assertive" data-final-signs-reveal>
          <div className={styles.finalSeal} aria-hidden="true">◇</div>
          <p>Межа запомнила путь</p>
          <h2>Знаки Межи собраны</h2>
          <button type="button" onClick={() => window.location.assign("/za-mezhoy")}>
            За Межу
          </button>
        </div>
      )}
    </>
  );
}
