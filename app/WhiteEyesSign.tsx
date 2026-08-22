"use client";

import { useEffect } from "react";
import { hasSign, readTransientState, unlockSign, updateTransientState } from "../lib/anomalies/store";

const WHITE_EYES_IMAGE = "/images/characters/neveyana-white-eyes.webp?v=1";
const FIRST_WHITE_EYES_NOTICE_MS = 1_100;
const FIRST_WHITE_EYES_DISPLAY_MS = 1_800;
const RECURRING_WHITE_EYES_DISPLAY_MS = 1_450;

function hasFoundSign() {
  return hasSign("neveyana-morok");
}

function markFound() {
  return unlockSign("neveyana-morok");
}

function readStage() {
  return readTransientState().whiteEyes.stage;
}

function writeStage(stage: number) {
  updateTransientState((state) => ({ ...state, whiteEyes: { stage } }));
}

function findCharacter(name: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(".characterCard")).find(
    (card) => card.querySelector("h3")?.textContent?.trim() === name,
  );
}

function revealWhiteEyes(neveyana: HTMLElement, onFirstUnlock?: () => void) {
  const portrait = neveyana.querySelector<HTMLElement>(".characterPortrait");
  if (!portrait || portrait.querySelector("[data-white-eyes-sign]")) return;
  const firstReveal = !hasFoundSign();

  portrait.style.position = "relative";

  const image = document.createElement("img");
  image.src = WHITE_EYES_IMAGE;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.dataset.whiteEyesSign = "true";
  Object.assign(image.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
    opacity: "0",
    filter: "saturate(.78) contrast(1.04)",
    pointerEvents: "none",
    zIndex: "3",
    transition: firstReveal ? "opacity 120ms ease-out" : "opacity 220ms ease",
  });

  portrait.appendChild(image);

  const show = () => {
    window.requestAnimationFrame(() => {
      image.style.opacity = "1";
      image.dataset.whiteEyesState = "visible";
      writeStage(0);

      if (firstReveal) {
        window.setTimeout(() => {
          if (
            !image.isConnected ||
            image.dataset.whiteEyesState !== "visible" ||
            document.visibilityState !== "visible"
          ) return;
          const result = markFound();
          if (result.unlocked) onFirstUnlock?.();
        }, FIRST_WHITE_EYES_NOTICE_MS);
      }

      window.setTimeout(() => {
        image.dataset.whiteEyesState = "fading";
        image.style.transition = "opacity 520ms ease";
        image.style.opacity = "0";
        window.setTimeout(() => image.remove(), 560);
      }, firstReveal ? FIRST_WHITE_EYES_DISPLAY_MS : RECURRING_WHITE_EYES_DISPLAY_MS);
    });
  };

  if (image.complete) show();
  else image.addEventListener("load", show, { once: true });
}

export default function WhiteEyesSign() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const neveyana = findCharacter("Невеяна");
    const morok = findCharacter("Морок");
    if (!neveyana || !morok) return;

    const timers = new Map<Element, number>();
    let recurringTimer: number | undefined;
    let neveyanaVisible = false;

    const clearRecurring = () => {
      if (recurringTimer) window.clearTimeout(recurringTimer);
      recurringTimer = undefined;
    };

    const scheduleRecurring = () => {
      clearRecurring();
      if (!neveyanaVisible || !hasFoundSign()) return;
      recurringTimer = window.setTimeout(() => {
        recurringTimer = undefined;
        if (!neveyanaVisible) return;
        revealWhiteEyes(neveyana);
        scheduleRecurring();
      }, 7_000 + Math.random() * 8_000);
    };

    const clearTimer = (element: Element) => {
      const timer = timers.get(element);
      if (timer) window.clearTimeout(timer);
      timers.delete(element);
    };

    const observeDwell = (card: HTMLElement, name: "Невеяна" | "Морок") => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (name === "Невеяна") {
            neveyanaVisible = entry.isIntersecting && entry.intersectionRatio >= 0.62;
            if (hasFoundSign()) {
              if (neveyanaVisible) scheduleRecurring();
              else clearRecurring();
              clearTimer(card);
              return;
            }
          } else if (hasFoundSign()) {
            clearTimer(card);
            return;
          }

          if (!entry.isIntersecting || entry.intersectionRatio < 0.62) {
            clearTimer(card);
            return;
          }

          if (timers.has(card)) return;
          const timer = window.setTimeout(() => {
            timers.delete(card);
            if (hasFoundSign()) return;

            const stage = readStage();
            if (name === "Невеяна" && stage === 0) {
              writeStage(1);
              return;
            }
            if (name === "Морок" && stage === 1) {
              writeStage(2);
              return;
            }
            if (name === "Невеяна" && stage === 2) {
              revealWhiteEyes(neveyana, scheduleRecurring);
            }
          }, 1050);
          timers.set(card, timer);
        },
        { threshold: [0, 0.62, 0.8] },
      );

      observer.observe(card);
      return observer;
    };

    const neveyanaObserver = observeDwell(neveyana, "Невеяна");
    const morokObserver = observeDwell(morok, "Морок");

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      clearRecurring();
      neveyanaObserver.disconnect();
      morokObserver.disconnect();
    };
  }, []);

  return null;
}
