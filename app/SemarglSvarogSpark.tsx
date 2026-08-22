"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SEMARGL_SPARK_FORCE_EVENT } from "../lib/anomalies/events";
import { canManifestSemarglSpark, recordSvarogSeen } from "../lib/anomalies/quest-state";
import {
  hasSign,
  readTransientState,
  subscribeAnomalyStore,
  unlockSign,
  updateTransientState,
} from "../lib/anomalies/store";
import styles from "./semargl-svarog-spark.module.css";

const SPARK_VISIBLE_MS = 7_500;
const SVAROG_RESPONSE_MS = 1_100;

function debugEnabled() {
  return new URLSearchParams(window.location.search).get("anomaly-debug") === "1";
}

export default function SemarglSvarogSpark() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [semarglVisible, setSemarglVisible] = useState(false);
  const [manifested, setManifested] = useState(false);
  const [responding, setResponding] = useState(false);
  const [alreadyFound, setAlreadyFound] = useState(false);

  const sync = useCallback(() => {
    const found = hasSign("semargl-svarog");
    setAlreadyFound(found);
    setManifested(!found && readTransientState().semargl.manifested);
  }, []);

  useEffect(() => {
    sync();
    return subscribeAnomalyStore(sync);
  }, [sync]);

  useEffect(() => {
    if (window.location.pathname !== "/genealogy") return;
    const svarog = document.querySelector<HTMLElement>('[data-anomaly-god="svarog"]');
    if (!svarog) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.34) return;
        updateTransientState(recordSvarogSeen);
      },
      { threshold: [0, 0.34, 0.65] },
    );
    observer.observe(svarog);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.location.pathname !== "/" || alreadyFound) return;
    const portrait = document.querySelector<HTMLElement>('[data-anomaly-character="semargl"] .characterPortrait');
    if (!portrait) return;
    setHost(portrait);
    const observer = new IntersectionObserver(
      ([entry]) => setSemarglVisible(entry.isIntersecting && entry.intersectionRatio >= 0.38),
      { threshold: [0, 0.38, 0.7] },
    );
    observer.observe(portrait);
    return () => observer.disconnect();
  }, [alreadyFound]);

  useEffect(() => {
    if (!semarglVisible || manifested || alreadyFound || responding) return;
    if (!canManifestSemarglSpark(readTransientState())) return;
    const timer = window.setTimeout(() => {
      updateTransientState((state) => ({
        ...state,
        semargl: { ...state.semargl, manifested: true },
      }));
    }, 1_150);
    return () => window.clearTimeout(timer);
  }, [alreadyFound, manifested, responding, semarglVisible]);

  useEffect(() => {
    if (!manifested || responding) return;
    const timer = window.setTimeout(() => {
      updateTransientState((state) => ({
        ...state,
        semargl: { ...state.semargl, manifested: false },
      }));
    }, SPARK_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [manifested, responding]);

  useEffect(() => {
    const force = () => {
      if (!debugEnabled() || alreadyFound) return;
      updateTransientState((state) => ({
        ...state,
        semargl: { svarogSeen: true, manifested: true },
      }));
    };
    window.addEventListener(SEMARGL_SPARK_FORCE_EVENT, force);
    return () => window.removeEventListener(SEMARGL_SPARK_FORCE_EVENT, force);
  }, [alreadyFound]);

  const activate = () => {
    if (responding || alreadyFound) return;
    setResponding(true);
    window.setTimeout(() => {
      const result = unlockSign("semargl-svarog");
      updateTransientState((state) => ({
        ...state,
        semargl: { ...state.semargl, manifested: false },
      }));
      if (!result.unlocked) setResponding(false);
    }, SVAROG_RESPONSE_MS);
  };

  if (!host || alreadyFound || (!manifested && !responding)) return null;

  return createPortal(
    <div className={styles.layer} data-semargl-svarog={responding ? "response" : "spark"}>
      {responding && (
        <div className={styles.svarogResponse} role="status" aria-label="В огне проявился отблеск Сварога">
          <img src="/images/characters/svarog.webp?v=2" alt="Отблеск Сварога в огне Семаргла" />
        </div>
      )}
      {!responding && (
        <button
          className={styles.sparkTarget}
          type="button"
          onClick={activate}
          aria-label="Поймать искру, идущую против огня"
          data-quest-element="semargl-svarog"
        >
          <span className={styles.spark} />
        </button>
      )}
    </div>,
    host,
  );
}
