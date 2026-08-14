"use client";

import { createElement, useEffect } from "react";
import SitePolish from "./SitePolish";

const ANOMALY_KEY = "yav-anomalies-v1";
const AUK_KEY = "yav-auk-echo-path-v1";

type AukProgress = {
  opens: number;
  leftAfterOpen: boolean;
  ready: boolean;
  escapes: number;
};

const emptyAuk: AukProgress = {
  opens: 0,
  leftAfterOpen: false,
  ready: false,
  escapes: 0,
};

function readAuk(): AukProgress {
  try {
    const raw = window.localStorage.getItem(AUK_KEY);
    if (!raw) return { ...emptyAuk };
    const parsed = JSON.parse(raw) as Partial<AukProgress>;
    const opens = Math.max(0, Math.min(3, Number(parsed.opens) || 0));
    return {
      opens,
      leftAfterOpen: parsed.leftAfterOpen === true,
      ready: parsed.ready === true || opens >= 3,
      escapes: Math.max(0, Math.min(3, Number(parsed.escapes) || 0)),
    };
  } catch {
    return { ...emptyAuk };
  }
}

function writeAuk(state: AukProgress) {
  try {
    window.localStorage.setItem(AUK_KEY, JSON.stringify(state));
  } catch {}
}

function hasAukSign() {
  try {
    const raw = window.localStorage.getItem(ANOMALY_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { found?: unknown };
    return Array.isArray(parsed.found) && parsed.found.includes("auk-echo");
  } catch {
    return false;
  }
}

function markAukSign() {
  try {
    const raw = window.localStorage.getItem(ANOMALY_KEY);
    const state = raw ? JSON.parse(raw) : {};
    const found = Array.isArray(state.found) ? [...new Set(state.found)] : [];
    if (!found.includes("auk-echo")) found.push("auk-echo");
    state.found = found;
    window.localStorage.setItem(ANOMALY_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("yav:anomaly-found", { detail: { id: "auk-echo", count: found.length } }));
  } catch {}
}

function randomEchoPosition() {
  const margin = 58;
  const width = Math.max(280, window.innerWidth);
  const height = Math.max(480, window.innerHeight);
  const left = margin + Math.random() * Math.max(40, width - margin * 2 - 80);
  const top = 90 + Math.random() * Math.max(60, height - 210);
  return { left, top };
}

function setupAukHeard() {
  const isPreview = new URLSearchParams(window.location.search).has("auk-preview");
  if (hasAukSign() && !isPreview) return () => {};

  const navnik = document.querySelector<HTMLElement>("#navnik");
  const aukButton = document.querySelector<HTMLButtonElement>('button[aria-controls="navnik-entry-auk"]');
  if (!navnik || !aukButton) return () => {};

  let spawnTimer: number | undefined;
  let echo: HTMLButtonElement | null = null;
  let suppressedTouchClick = false;

  const call = document.createElement("audio");
  call.preload = "auto";
  call.setAttribute("aria-hidden", "true");
  [
    ["/sfx/auk-au.mp3", "audio/mpeg"],
    ["/sfx/auu.mp3", "audio/mpeg"],
    ["/sfx/auk-auu.mp3", "audio/mpeg"],
    ["/sfx/ауу.mp3", "audio/mpeg"],
    ["/sfx/auu.wav", "audio/wav"],
  ].forEach(([src, type]) => {
    const source = document.createElement("source");
    source.src = src;
    source.type = type;
    call.append(source);
  });

  const playCall = (closeness = 0) => {
    call.pause();
    call.currentTime = 0;
    call.volume = Math.min(0.72, 0.34 + closeness * 0.1);
    call.playbackRate = Math.min(1.04, 0.94 + closeness * 0.025);
    call.play().catch(() => {});
  };

  const navnikVisiblePixels = () => {
    const rect = navnik.getBoundingClientRect();
    return Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  };

  const updateLeaveState = () => {
    const progress = readAuk();
    if (progress.ready || progress.opens === 0 || progress.leftAfterOpen) return;
    if (navnikVisiblePixels() > 2) return;
    progress.leftAfterOpen = true;
    writeAuk(progress);
  };

  const moveEcho = () => {
    if (!echo) return;
    const progress = readAuk();
    if (progress.escapes >= 3) return;
    const next = randomEchoPosition();
    echo.style.left = `${next.left}px`;
    echo.style.top = `${next.top}px`;
    echo.style.transform = `rotate(${(Math.random() * 10 - 5).toFixed(1)}deg)`;
    progress.escapes += 1;
    writeAuk(progress);
    playCall(progress.escapes);
  };

  const removeEcho = () => {
    if (!echo) return;
    echo.remove();
    echo = null;
  };

  const catchEcho = () => {
    playCall(4);
    markAukSign();
    if (!echo) return;
    echo.textContent = "Аук услышал.";
    echo.setAttribute("aria-label", "Знак Межи найден: Аук услышал");
    echo.style.pointerEvents = "none";
    echo.style.color = "rgba(238,219,178,.96)";
    echo.style.textShadow = "0 0 24px rgba(210,163,86,.5),0 2px 12px rgba(0,0,0,.9)";
    echo.style.transform = "scale(1.08)";
    window.setTimeout(() => {
      if (echo) echo.style.opacity = "0";
    }, 1350);
    window.setTimeout(removeEcho, 2050);
  };

  const spawnEcho = () => {
    spawnTimer = undefined;
    if (echo || (hasAukSign() && !isPreview) || (!readAuk().ready && !isPreview)) return;

    const eligible = ["world", "characters", "music", "news"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
      .find((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        return visible > Math.min(window.innerHeight * 0.34, rect.height * 0.34);
      });

    if (!eligible) return;

    echo = document.createElement("button");
    echo.type = "button";
    echo.textContent = "Ау.";
    echo.setAttribute("aria-label", "Ускользающее ау");
    echo.dataset.aukEcho = "true";
    const initial = randomEchoPosition();
    Object.assign(echo.style, {
      position: "fixed",
      zIndex: "1950",
      left: `${initial.left}px`,
      top: `${initial.top}px`,
      padding: "10px 14px",
      border: "0",
      background: "transparent",
      color: "rgba(218,205,180,.82)",
      fontFamily: "MonomakhYav, Georgia, serif",
      fontSize: "clamp(18px,2vw,25px)",
      lineHeight: "1",
      letterSpacing: ".08em",
      textShadow: "0 0 14px rgba(185,147,90,.22), 0 2px 10px rgba(0,0,0,.82)",
      cursor: "pointer",
      transition: "left .24s ease, top .24s ease, transform .24s ease, opacity .35s ease",
      opacity: "0",
    });

    echo.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      if (readAuk().escapes < 3) moveEcho();
    });

    echo.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      if (readAuk().escapes >= 3) return;
      event.preventDefault();
      suppressedTouchClick = true;
      moveEcho();
    });

    echo.addEventListener("click", (event) => {
      if (suppressedTouchClick) {
        suppressedTouchClick = false;
        event.preventDefault();
        return;
      }
      const progress = readAuk();
      if (progress.escapes < 3) {
        moveEcho();
        return;
      }
      catchEcho();
    });

    document.body.appendChild(echo);
    requestAnimationFrame(() => {
      if (echo) echo.style.opacity = "1";
    });
    playCall(0);
  };

  const maybeScheduleEcho = () => {
    updateLeaveState();
    const progress = readAuk();
    if ((!progress.ready && !isPreview) || echo || spawnTimer || (hasAukSign() && !isPreview)) return;
    if (navnikVisiblePixels() > 2) return;
    spawnTimer = window.setTimeout(spawnEcho, 1100 + Math.random() * 2200);
  };

  const onAukClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('button[aria-controls="navnik-entry-auk"]');
    if (!button) return;

    const isOpening = button.getAttribute("aria-expanded") !== "true";
    if (!isOpening) return;

    call.load();

    const progress = readAuk();
    if (progress.ready) return;

    if (progress.opens === 0) {
      progress.opens = 1;
      progress.leftAfterOpen = false;
      writeAuk(progress);
      return;
    }

    if (!progress.leftAfterOpen) return;

    progress.opens = Math.min(3, progress.opens + 1);
    progress.leftAfterOpen = false;
    if (progress.opens >= 3) progress.ready = true;
    writeAuk(progress);
    window.setTimeout(maybeScheduleEcho, 0);
  };

  document.addEventListener("click", onAukClick);
  window.addEventListener("scroll", maybeScheduleEcho, { passive: true });
  window.addEventListener("resize", maybeScheduleEcho, { passive: true });
  maybeScheduleEcho();

  return () => {
    document.removeEventListener("click", onAukClick);
    window.removeEventListener("scroll", maybeScheduleEcho);
    window.removeEventListener("resize", maybeScheduleEcho);
    if (spawnTimer) window.clearTimeout(spawnTimer);
    call.pause();
    removeEcho();
  };
}

export default function Bridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    return setupAukHeard();
  }, []);

  return createElement(SitePolish);
}
