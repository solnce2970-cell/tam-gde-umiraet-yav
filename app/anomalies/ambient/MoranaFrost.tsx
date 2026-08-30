"use client";

import { useEffect } from "react";

const SOUND_SRC = "/sfx/morana-frost.mp3";
const VISUAL_MS = 10000;
const HOLD_BEFORE_START_MIN = 4000;
const HOLD_BEFORE_START_MAX = 6000;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function buildLayer() {
  const layer = document.createElement("div");
  layer.dataset.moranaFrost = "true";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "absolute",
    inset: "0",
    zIndex: "12",
    pointerEvents: "none",
    opacity: "0",
    overflow: "hidden",
  });

  const cold = document.createElement("div");
  Object.assign(cold.style, {
    position: "absolute",
    inset: "0",
    background: "linear-gradient(180deg, rgba(213,234,247,.16), rgba(163,204,229,.28) 45%, rgba(224,241,250,.12))",
    mixBlendMode: "screen",
  });

  const rim = document.createElement("div");
  Object.assign(rim.style, {
    position: "absolute",
    inset: "0",
    background: `
      radial-gradient(circle at 0 0, rgba(248,252,255,.98) 0 13%, transparent 26%),
      radial-gradient(circle at 100% 0, rgba(248,252,255,.98) 0 13%, transparent 26%),
      radial-gradient(circle at 0 100%, rgba(248,252,255,.98) 0 13%, transparent 26%),
      radial-gradient(circle at 100% 100%, rgba(248,252,255,.98) 0 13%, transparent 26%),
      linear-gradient(180deg, rgba(246,251,255,.96) 0 6%, rgba(210,232,246,.72) 10%, rgba(174,211,234,.36) 18%, transparent 30%),
      linear-gradient(0deg, rgba(246,251,255,.96) 0 6%, rgba(210,232,246,.72) 10%, rgba(174,211,234,.36) 18%, transparent 30%),
      linear-gradient(90deg, rgba(246,251,255,.94) 0 6%, rgba(210,232,246,.7) 10%, rgba(174,211,234,.34) 18%, transparent 30%),
      linear-gradient(270deg, rgba(246,251,255,.94) 0 6%, rgba(210,232,246,.7) 10%, rgba(174,211,234,.34) 18%, transparent 30%)
    `,
    filter: "blur(.35px)",
  });

  const crystals = document.createElement("div");
  Object.assign(crystals.style, {
    position: "absolute",
    inset: "0",
    background: `
      repeating-linear-gradient(128deg, transparent 0 21px, rgba(244,250,255,.5) 22px, transparent 23px 47px),
      repeating-linear-gradient(38deg, transparent 0 27px, rgba(226,241,251,.34) 28px, transparent 29px 61px),
      radial-gradient(circle at 14% 18%, rgba(255,255,255,.95) 0 1.3%, transparent 1.5%),
      radial-gradient(circle at 82% 16%, rgba(255,255,255,.9) 0 1.2%, transparent 1.4%),
      radial-gradient(circle at 18% 83%, rgba(255,255,255,.92) 0 1.2%, transparent 1.4%),
      radial-gradient(circle at 84% 80%, rgba(255,255,255,.92) 0 1.4%, transparent 1.6%)
    `,
    opacity: ".95",
    mixBlendMode: "screen",
  });

  const cracks = document.createElement("div");
  Object.assign(cracks.style, {
    position: "absolute",
    inset: "0",
    background: `
      linear-gradient(112deg, transparent 0 42%, rgba(247,252,255,.78) 42.3%, transparent 42.7%),
      linear-gradient(68deg, transparent 0 58%, rgba(232,245,254,.6) 58.2%, transparent 58.6%),
      linear-gradient(138deg, transparent 0 71%, rgba(224,241,252,.48) 71.2%, transparent 71.6%)
    `,
    opacity: ".6",
    mixBlendMode: "screen",
  });

  layer.append(cold, rim, crystals, cracks);
  return layer;
}

export default function MoranaFrost() {
  useEffect(() => {
    const card = document.querySelector<HTMLElement>('[data-god-name="Морана"]');
    if (!card) return;

    const portrait = card.querySelector<HTMLElement>(".godPortrait");
    const image = portrait?.querySelector<HTMLImageElement>("img");
    if (!portrait || !image) return;

    let timer: number | undefined;
    let active = false;
    let used = false;
    let audio: HTMLAudioElement | null = null;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };

    const run = () => {
      if (active || used) return;
      active = true;
      used = true;

      const layer = buildLayer();
      portrait.appendChild(layer);

      const originalFilter = image.style.filter;
      const originalTransform = image.style.transform;

      image.animate(
        [
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
          { filter: "saturate(.56) contrast(1.1) brightness(.9) hue-rotate(4deg)" , offset: .2 },
          { filter: "saturate(.48) contrast(1.14) brightness(.88) hue-rotate(6deg)" , offset: .48 },
          { filter: "saturate(.7) contrast(1.07) brightness(.94)", offset: .78 },
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      layer.animate(
        [
          { opacity: 0, transform: "scale(1.025)" },
          { opacity: 1, transform: "scale(1)", offset: .14 },
          { opacity: 1, transform: "scale(1)", offset: .42 },
          { opacity: .78, transform: "scale(1.006)", offset: .68 },
          { opacity: 0, transform: "scale(1.02)" },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      try {
        audio = new Audio(SOUND_SRC);
        audio.preload = "auto";
        audio.volume = 0.42;
        void audio.play().catch(() => {});
      } catch {
        // Visual anomaly must still work when autoplay is blocked.
      }

      window.setTimeout(() => {
        layer.remove();
        image.style.filter = originalFilter;
        image.style.transform = originalTransform;
        if (audio) {
          audio.pause();
          audio = null;
        }
        active = false;
      }, VISUAL_MS + 120);
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
      portrait.querySelectorAll("[data-morana-frost]").forEach((node) => node.remove());
      if (audio) audio.pause();
    };
  }, []);

  return null;
}
