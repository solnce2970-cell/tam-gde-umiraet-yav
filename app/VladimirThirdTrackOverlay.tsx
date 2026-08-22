"use client";

import { useCallback, useEffect, useState } from "react";
import { VLADIMIR_TRACK_FORCE_EVENT } from "../lib/anomalies/events";
import { recordVladimirScroll, recordVladimirSeen } from "../lib/anomalies/quest-state";
import {
  hasSign,
  readTransientState,
  subscribeAnomalyStore,
  unlockSign,
  updateTransientState,
} from "../lib/anomalies/store";
import styles from "./vladimir-third-track.module.css";

type Footprint = {
  x: number;
  y: number;
  angle: number;
  foot: "left" | "right" | "stranger";
  stranger?: boolean;
};

const FOOTPRINTS: readonly Footprint[] = [
  { x: 18, y: 0, angle: -18, foot: "left" },
  { x: 26, y: 92, angle: 10, foot: "right" },
  { x: 35, y: 184, angle: -11, foot: "left" },
  { x: 44, y: 270, angle: 13, foot: "right" },
  { x: 57, y: 224, angle: 48, foot: "stranger", stranger: true },
  { x: 53, y: 360, angle: -8, foot: "left" },
  { x: 63, y: 450, angle: 16, foot: "right" },
  { x: 73, y: 536, angle: -13, foot: "left" },
];

function debugEnabled() {
  return new URLSearchParams(window.location.search).get("anomaly-debug") === "1";
}

export default function VladimirThirdTrackOverlay() {
  const [manifested, setManifested] = useState(false);
  const [fading, setFading] = useState(false);
  const [originTop, setOriginTop] = useState(0);
  const [pressed, setPressed] = useState<number[]>([]);
  const [alreadyFound, setAlreadyFound] = useState(false);

  const sync = useCallback(() => {
    setAlreadyFound(hasSign("vladimir-third-track"));
    const current = readTransientState().vladimir;
    if (current.manifested && !hasSign("vladimir-third-track")) {
      setManifested(true);
      setOriginTop((value) => value || Math.round(window.scrollY + window.innerHeight * 0.18));
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    sync();
    return subscribeAnomalyStore(sync);
  }, [sync]);

  useEffect(() => {
    if (window.location.pathname !== "/" || alreadyFound) return;
    const card = document.querySelector<HTMLElement>('[data-anomaly-character="vladimir"]');
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.34) return;
        updateTransientState((state) => recordVladimirSeen(state, window.scrollY));
      },
      { threshold: [0, 0.34, 0.6] },
    );
    observer.observe(card);

    let manifestationTimer: number | undefined;
    const onScroll = () => {
      const next = updateTransientState((state) => recordVladimirScroll(state, window.scrollY));
      if (!next.vladimir.eligible || next.vladimir.manifested || manifestationTimer) return;
      manifestationTimer = window.setTimeout(() => {
        manifestationTimer = undefined;
        const top = Math.round(window.scrollY + window.innerHeight * 0.16);
        setOriginTop(top);
        setManifested(true);
        updateTransientState((state) => ({
          ...state,
          vladimir: { ...state.vladimir, manifested: true },
        }));
      }, 850);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (manifestationTimer) window.clearTimeout(manifestationTimer);
    };
  }, [alreadyFound]);

  useEffect(() => {
    const force = () => {
      if (!debugEnabled() || alreadyFound) return;
      setOriginTop(Math.round(window.scrollY + window.innerHeight * 0.12));
      setManifested(true);
      updateTransientState((state) => ({
        ...state,
        vladimir: { seen: true, seenScrollY: window.scrollY, eligible: true, manifested: true },
      }));
    };
    window.addEventListener(VLADIMIR_TRACK_FORCE_EVENT, force);
    return () => window.removeEventListener(VLADIMIR_TRACK_FORCE_EVENT, force);
  }, [alreadyFound]);

  const clickFootprint = (index: number, stranger = false) => {
    if (!stranger) {
      setPressed((items) => [...items.filter((item) => item !== index), index]);
      window.setTimeout(() => setPressed((items) => items.filter((item) => item !== index)), 520);
      return;
    }
    const result = unlockSign("vladimir-third-track");
    if (!result.unlocked) return;
    setFading(true);
    window.setTimeout(() => {
      setManifested(false);
      updateTransientState((state) => ({
        ...state,
        vladimir: { ...state.vladimir, manifested: false },
      }));
    }, 1350);
  };

  if ((!manifested || alreadyFound) && !fading) return null;

  return (
    <div
      className={`${styles.overlay} ${fading ? styles.fading : ""}`}
      style={{ top: originTop }}
      data-vladimir-third-track="manifested"
      aria-label="Аномальная дорожка следов"
    >
      {FOOTPRINTS.map((footprint, index) => (
        <button
          className={`${styles.footprint} ${footprint.stranger ? styles.stranger : ""} ${pressed.includes(index) ? styles.pressed : ""}`}
          key={`${footprint.foot}-${index}`}
          type="button"
          onClick={() => clickFootprint(index, footprint.stranger)}
          aria-label={footprint.stranger ? "Необычный третий след" : "Обычный след"}
          style={{
            left: `${footprint.x}%`,
            top: footprint.y,
            transform: `rotate(${footprint.angle}deg)`,
            animationDelay: `${index * 190}ms`,
          }}
          data-third-footprint={footprint.stranger ? "stranger" : "ordinary"}
        >
          <span className={styles.heel} />
          <span className={styles.sole} />
        </button>
      ))}
    </div>
  );
}
