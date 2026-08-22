"use client";

import { useCallback, useEffect, useState } from "react";
import { SILENT_PATH_FORCE_EVENT } from "../lib/anomalies/events";
import {
  recordSilentPathSection,
  resetSilentPath,
  SILENT_PATH_SEQUENCE,
  startSilentPath,
} from "../lib/anomalies/quest-state";
import {
  hasSign,
  readTransientState,
  subscribeAnomalyStore,
  unlockSign,
  updateTransientState,
} from "../lib/anomalies/store";
import styles from "./silent-path.module.css";

function debugEnabled() {
  return new URLSearchParams(window.location.search).get("anomaly-debug") === "1";
}

export default function SilentPathAnomaly() {
  const [manifested, setManifested] = useState(false);
  const [originTop, setOriginTop] = useState(0);
  const [fading, setFading] = useState(false);
  const [alreadyFound, setAlreadyFound] = useState(false);

  const sync = useCallback(() => {
    const found = hasSign("silent-path");
    setAlreadyFound(found);
    const path = readTransientState().silentPath;
    if (path.manifested && !found) {
      setOriginTop((value) => value || Math.round(window.scrollY + window.innerHeight * 0.32));
      setManifested(true);
    } else if (!path.manifested) {
      setManifested(false);
    }
  }, []);

  useEffect(() => {
    sync();
    return subscribeAnomalyStore(sync);
  }, [sync]);

  useEffect(() => {
    if (window.location.pathname !== "/" || alreadyFound) return;
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest("[data-anomaly-debug]")) return;
      if (target.closest("[data-silent-path-manifestation]")) return;
      if (target.closest("[data-enter-world]")) {
        updateTransientState(startSilentPath);
        return;
      }
      if (!target.closest('a,button,input,select,textarea,[role="button"],[data-quest-element]')) return;
      updateTransientState(resetSilentPath);
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [alreadyFound]);

  useEffect(() => {
    if (window.location.pathname !== "/" || alreadyFound) return;
    const observers: IntersectionObserver[] = [];
    SILENT_PATH_SEQUENCE.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.24) return;
          const next = updateTransientState((state) => recordSilentPathSection(state, sectionId));
          if (next.silentPath.manifested) {
            setOriginTop(Math.round(window.scrollY + window.innerHeight * 0.3));
          }
        },
        { threshold: [0, 0.24, 0.5] },
      );
      observer.observe(section);
      observers.push(observer);
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [alreadyFound]);

  useEffect(() => {
    const force = () => {
      if (!debugEnabled() || alreadyFound) return;
      setOriginTop(Math.round(window.scrollY + window.innerHeight * 0.28));
      updateTransientState((state) => ({
        ...state,
        silentPath: { started: true, stage: SILENT_PATH_SEQUENCE.length, manifested: true },
      }));
    };
    window.addEventListener(SILENT_PATH_FORCE_EVENT, force);
    return () => window.removeEventListener(SILENT_PATH_FORCE_EVENT, force);
  }, [alreadyFound]);

  const openPath = () => {
    const result = unlockSign("silent-path");
    if (!result.unlocked) return;
    setFading(true);
    window.setTimeout(() => {
      updateTransientState(resetSilentPath);
      setManifested(false);
    }, 1_000);
  };

  if ((!manifested || alreadyFound) && !fading) return null;

  return (
    <div
      className={`${styles.overlay} ${fading ? styles.fading : ""}`}
      style={{ top: originTop }}
      data-silent-path="manifested"
    >
      <div className={styles.mist} aria-hidden="true" />
      <button
        className={styles.path}
        type="button"
        onClick={openPath}
        aria-label="Ступить на тихую дорогу"
        data-silent-path-manifestation
        data-quest-element="silent-path"
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}
