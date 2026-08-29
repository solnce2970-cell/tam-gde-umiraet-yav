"use client";

import { createElement, useEffect } from "react";
import type { NavnikTransitionDetail } from "../lib/anomalies/events";
import { NAVNIK_TRANSITION_EVENT } from "../lib/anomalies/events";
import { recordAukTransition } from "../lib/anomalies/quest-state";
import { hasSign, readTransientState, unlockSign, updateTransientState } from "../lib/anomalies/store";
import SitePolish from "./SitePolish";

function randomEchoPosition() {
  const margin = 58;
  const width = Math.max(280, window.innerWidth);
  const height = Math.max(480, window.innerHeight);
  return {
    left: margin + Math.random() * Math.max(40, width - margin * 2 - 80),
    top: 90 + Math.random() * Math.max(60, height - 210),
  };
}

function setupAukHeard() {
  const isPreview = new URLSearchParams(window.location.search).has("auk-preview");
  if (hasSign("auk-echo") && !isPreview) return () => {};
  const navnik = document.querySelector<HTMLElement>("#navnik");
  if (!navnik) return () => {};

  let spawnTimer: number | undefined;
  let echo: HTMLButtonElement | null = null;
  let suppressedTouchClick = false;
  let previewEscapes = 0;
  const call = document.createElement("audio");
  call.preload = "auto";
  call.setAttribute("aria-hidden", "true");
  call.src = "/sfx/auk-au.mp3";

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
  const currentEscapes = () => isPreview ? previewEscapes : readTransientState().auk.escapes;

  const moveEcho = () => {
    if (!echo || currentEscapes() >= 3) return;
    const next = randomEchoPosition();
    echo.style.left = `${next.left}px`;
    echo.style.top = `${next.top}px`;
    echo.style.transform = `rotate(${(Math.random() * 10 - 5).toFixed(1)}deg)`;
    if (isPreview) previewEscapes += 1;
    else {
      updateTransientState((state) => ({
        ...state,
        auk: { ...state.auk, escapes: Math.min(3, state.auk.escapes + 1) },
      }));
    }
    playCall(currentEscapes());
  };

  const removeEcho = () => { echo?.remove(); echo = null; };
  const catchEcho = () => {
    playCall(4);
    const unlocked = isPreview || unlockSign("auk-echo").unlocked;
    if (!unlocked) {
      removeEcho();
      return;
    }
    if (!echo) return;
    echo.textContent = "Аук услышал";
    echo.setAttribute("aria-label", "Аук услышал");
    echo.style.pointerEvents = "none";
    echo.style.color = "rgba(238,219,178,.96)";
    echo.style.textShadow = "0 0 24px rgba(210,163,86,.5),0 2px 12px rgba(0,0,0,.9)";
    echo.style.transform = "scale(1.08)";
    window.setTimeout(() => { if (echo) echo.style.opacity = "0"; }, 1350);
    window.setTimeout(removeEcho, 2050);
  };

  const spawnEcho = () => {
    spawnTimer = undefined;
    const auk = readTransientState().auk;
    if (echo || (hasSign("auk-echo") && !isPreview) || (!auk.eligible && !isPreview)) return;
    const eligibleSection = ["world", "characters", "music", "news"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
      .find((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        return visible > Math.min(window.innerHeight * 0.34, rect.height * 0.34);
      });
    if (!eligibleSection) return;

    echo = document.createElement("button");
    echo.type = "button";
    echo.textContent = "Ау";
    echo.setAttribute("aria-label", "Ускользающее ау");
    echo.dataset.aukEcho = "true";
    const initial = randomEchoPosition();
    Object.assign(echo.style, {
      position: "fixed", zIndex: "1950", left: `${initial.left}px`, top: `${initial.top}px`,
      padding: "10px 14px", border: "0", background: "transparent",
      color: "rgba(218,205,180,.82)", fontFamily: "BlagovestYav, Georgia, serif",
      fontSize: "clamp(18px,2vw,25px)", lineHeight: "1", letterSpacing: ".08em",
      textShadow: "0 0 14px rgba(185,147,90,.22), 0 2px 10px rgba(0,0,0,.82)",
      cursor: "pointer", transition: "left .24s ease, top .24s ease, transform .24s ease, opacity .35s ease",
      opacity: "0",
    });
    echo.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") moveEcho(); });
    echo.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" || currentEscapes() >= 3) return;
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
      if (currentEscapes() < 3) { moveEcho(); return; }
      catchEcho();
    });
    document.body.appendChild(echo);
    requestAnimationFrame(() => { if (echo) echo.style.opacity = "1"; });
    playCall(0);
  };

  const maybeScheduleEcho = () => {
    const auk = readTransientState().auk;
    if ((!auk.eligible && !isPreview) || auk.modalOpen || echo || spawnTimer ||
      (hasSign("auk-echo") && !isPreview) || navnikVisiblePixels() > 2) return;
    spawnTimer = window.setTimeout(spawnEcho, 1100 + Math.random() * 2200);
  };

  const onNavnikTransition = (event: Event) => {
    const detail = (event as CustomEvent<NavnikTransitionDetail>).detail;
    if (detail?.creatureId !== "auk") return;
    if (detail.transition === "closed-to-open") {
      call.load();
      updateTransientState((state) => recordAukTransition(state, detail.transition));
      return;
    }
    updateTransientState((state) => recordAukTransition(state, detail.transition));
    maybeScheduleEcho();
  };

  window.addEventListener(NAVNIK_TRANSITION_EVENT, onNavnikTransition);
  window.addEventListener("scroll", maybeScheduleEcho, { passive: true });
  window.addEventListener("resize", maybeScheduleEcho, { passive: true });
  maybeScheduleEcho();
  return () => {
    window.removeEventListener(NAVNIK_TRANSITION_EVENT, onNavnikTransition);
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
