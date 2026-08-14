"use client";

import { useEffect } from "react";

const STATE_KEY = "yav-anomalies-v1";
const SEQUENCE_KEY = "yav-white-eyes-sequence-v1";
const SIGN_ID = "neveyana-morok";
const WHITE_EYES_IMAGE = "/images/characters/neveyana-white-eyes.webp?v=1";

type AnomalyState = {
  found?: string[];
  beyondUnlocked?: boolean;
  choice?: "memory" | "life" | null;
  worldSeen?: string[];
};

function hasFoundSign() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STATE_KEY) || "{}") as AnomalyState;
    return Array.isArray(parsed.found) && parsed.found.includes(SIGN_ID);
  } catch {
    return false;
  }
}

function markFound() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STATE_KEY) || "{}") as AnomalyState;
    const found = Array.isArray(parsed.found) ? [...new Set(parsed.found)] : [];
    if (!found.includes(SIGN_ID)) found.push(SIGN_ID);
    window.localStorage.setItem(STATE_KEY, JSON.stringify({ ...parsed, found }));
    window.dispatchEvent(new CustomEvent("yav:anomaly-found", { detail: { id: SIGN_ID, count: found.length } }));
  } catch {}
}

function readStage() {
  try {
    const value = Number(window.sessionStorage.getItem(SEQUENCE_KEY) || "0");
    return value >= 0 && value <= 2 ? value : 0;
  } catch {
    return 0;
  }
}

function writeStage(stage: number) {
  try {
    window.sessionStorage.setItem(SEQUENCE_KEY, String(stage));
  } catch {}
}

function findCharacter(name: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(".characterCard")).find(
    (card) => card.querySelector("h3")?.textContent?.trim() === name,
  );
}

function revealWhiteEyes(neveyana: HTMLElement) {
  const portrait = neveyana.querySelector<HTMLElement>(".characterPortrait");
  if (!portrait || portrait.querySelector("[data-white-eyes-sign]")) return;

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
    transition: "opacity 220ms ease",
  });

  portrait.appendChild(image);

  const show = () => {
    window.requestAnimationFrame(() => {
      image.style.opacity = "1";
      markFound();
      writeStage(0);

      window.setTimeout(() => {
        image.style.transition = "opacity 520ms ease";
        image.style.opacity = "0";
        window.setTimeout(() => image.remove(), 560);
      }, 1450);
    });
  };

  if (image.complete) show();
  else image.addEventListener("load", show, { once: true });
}

export default function WhiteEyesSign() {
  useEffect(() => {
    if (window.location.pathname !== "/" || hasFoundSign()) return;

    const neveyana = findCharacter("Невеяна");
    const morok = findCharacter("Морок");
    if (!neveyana || !morok) return;

    const timers = new Map<Element, number>();

    const clearTimer = (element: Element) => {
      const timer = timers.get(element);
      if (timer) window.clearTimeout(timer);
      timers.delete(element);
    };

    const observeDwell = (card: HTMLElement, name: "Невеяна" | "Морок") => {
      const observer = new IntersectionObserver(
        ([entry]) => {
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
              revealWhiteEyes(neveyana);
              observer.disconnect();
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
      neveyanaObserver.disconnect();
      morokObserver.disconnect();
    };
  }, []);

  return null;
}
