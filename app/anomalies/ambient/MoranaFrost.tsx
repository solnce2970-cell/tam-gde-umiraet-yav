"use client";

import { useEffect } from "react";

const SOUND_SRC = "/sfx/morana-frost.mp3";
const FROST_SRC = "/images/anomalies/morana-frost-frame.svg";
const VISUAL_MS = 10000;
const HOLD_BEFORE_START_MIN = 4000;
const HOLD_BEFORE_START_MAX = 6000;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function MoranaFrost() {
  useEffect(() => {
    if (window.location.pathname !== "/genealogy") return;

    const card = document.querySelector<HTMLElement>('[data-god-name="Морана"]');
    if (!card) return;

    const portrait = card.querySelector<HTMLElement>(".godPortrait");
    const image = portrait?.querySelector<HTMLImageElement>("img");
    if (!portrait || !image) return;

    if (getComputedStyle(portrait).position === "static") portrait.style.position = "relative";
    portrait.style.overflow = "hidden";

    let timer: number | undefined;
    let active = false;
    let used = false;
    let audio: HTMLAudioElement | null = null;
    let overlay: HTMLDivElement | null = null;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };

    const removeOverlay = () => {
      overlay?.remove();
      overlay = null;
    };

    const run = () => {
      if (active || used) return;
      active = true;
      used = true;

      overlay = document.createElement("div");
      overlay.dataset.moranaFrost = "true";
      overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, {
        position: "absolute",
        inset: "-2px",
        zIndex: "12",
        pointerEvents: "none",
        backgroundImage: `url(${FROST_SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% 100%",
        opacity: "0",
        filter: "brightness(1.04) contrast(1.03) drop-shadow(0 0 7px rgba(220,242,255,.3))",
        willChange: "opacity",
      });
      portrait.appendChild(overlay);

      overlay.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: .2, offset: .12 },
          { opacity: .56, offset: .34 },
          { opacity: .9, offset: .58 },
          { opacity: 1, offset: .75 },
          { opacity: .74, offset: .88 },
          { opacity: 0, offset: 1 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      image.animate(
        [
          { filter: "saturate(.88) contrast(1.03) brightness(1)", offset: 0 },
          { filter: "saturate(.8) contrast(1.04) brightness(.99)", offset: .24 },
          { filter: "saturate(.72) contrast(1.06) brightness(.97)", offset: .62 },
          { filter: "saturate(.78) contrast(1.05) brightness(.98)", offset: .82 },
          { filter: "saturate(.88) contrast(1.03) brightness(1)", offset: 1 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      try {
        audio = new Audio(SOUND_SRC);
        audio.preload = "auto";
        audio.volume = 0.42;
        void audio.play().catch(() => {});
      } catch {
        // Visual anomaly remains functional if audio cannot start.
      }

      window.setTimeout(() => {
        removeOverlay();
        if (audio) {
          audio.pause();
          audio = null;
        }
        active = false;
      }, VISUAL_MS + 150);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
        if (!visible) {
          clearTimer();
          return;
        }
        if (!used && !active && !timer) {
          timer = window.setTimeout(() => {
            timer = undefined;
            run();
          }, rand(HOLD_BEFORE_START_MIN, HOLD_BEFORE_START_MAX));
        }
      },
      { threshold: [0, 0.25, 0.55, 0.8] },
    );

    observer.observe(card);
    return () => {
      clearTimer();
      observer.disconnect();
      removeOverlay();
      if (audio) audio.pause();
    };
  }, []);

  return null;
}
