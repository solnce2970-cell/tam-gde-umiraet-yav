"use client";

import { useEffect } from "react";
import "./vladimir-portrait-swap.css";

const ANOMALY_SRC = "/images/characters/vladimir-anomaly.webp";
const MOBILE_DELAY_MS = 900;

export default function VladimirPortraitSwap() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const card = document.querySelector<HTMLElement>('[data-anomaly-character="vladimir"]');
    const portrait = card?.querySelector<HTMLElement>(".characterPortrait");
    const baseImage = portrait?.querySelector<HTMLImageElement>("img");
    if (!card || !portrait || !baseImage) return;

    if (portrait.querySelector(".vladimirAnomalyImage")) return;

    portrait.classList.add("vladimirPortraitSwap");
    baseImage.draggable = false;

    const anomalyImage = document.createElement("img");
    anomalyImage.src = ANOMALY_SRC;
    anomalyImage.alt = "";
    anomalyImage.setAttribute("aria-hidden", "true");
    anomalyImage.className = "vladimirAnomalyImage";
    anomalyImage.loading = "eager";
    anomalyImage.decoding = "async";
    anomalyImage.draggable = false;
    portrait.appendChild(anomalyImage);

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let mobileTimer: number | null = null;
    let observer: IntersectionObserver | null = null;

    const show = () => {
      portrait.classList.remove("isVladimirRippleOut");
      portrait.classList.add("isVladimirAnomalyVisible", "isVladimirRippleIn");
      window.setTimeout(() => portrait.classList.remove("isVladimirRippleIn"), 900);
    };

    const hide = () => {
      portrait.classList.remove("isVladimirRippleIn");
      portrait.classList.add("isVladimirRippleOut");
      window.setTimeout(() => {
        portrait.classList.remove("isVladimirAnomalyVisible", "isVladimirRippleOut");
      }, 700);
    };

    const onEnter = () => {
      if (canHover.matches) show();
    };

    const onLeave = () => {
      if (canHover.matches) hide();
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);

    if (!canHover.matches) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (mobileTimer !== null) window.clearTimeout(mobileTimer);
            mobileTimer = window.setTimeout(show, MOBILE_DELAY_MS);
          } else {
            if (mobileTimer !== null) {
              window.clearTimeout(mobileTimer);
              mobileTimer = null;
            }
            hide();
          }
        },
        { threshold: [0, 0.55, 0.85] },
      );
      observer.observe(card);
    }

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      observer?.disconnect();
      if (mobileTimer !== null) window.clearTimeout(mobileTimer);
      portrait.classList.remove(
        "vladimirPortraitSwap",
        "isVladimirAnomalyVisible",
        "isVladimirRippleIn",
        "isVladimirRippleOut",
      );
      anomalyImage.remove();
    };
  }, []);

  return null;
}
