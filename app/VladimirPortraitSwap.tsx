"use client";

import { useEffect } from "react";
import "./vladimir-portrait-swap.css";

const ANOMALY_SRC = "/images/characters/vladimir-anomaly.webp";

export default function VladimirPortraitSwap() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const card = document.querySelector<HTMLElement>('[data-anomaly-character="vladimir"]');
    const portrait = card?.querySelector<HTMLElement>(".characterPortrait");
    const baseImage = portrait?.querySelector<HTMLImageElement>("img");
    if (!card || !portrait || !baseImage) return;

    if (portrait.querySelector(".vladimirAnomalyImage")) return;

    portrait.classList.add("vladimirPortraitSwap");

    const anomalyImage = document.createElement("img");
    anomalyImage.src = ANOMALY_SRC;
    anomalyImage.alt = "";
    anomalyImage.setAttribute("aria-hidden", "true");
    anomalyImage.className = "vladimirAnomalyImage";
    anomalyImage.loading = "eager";
    anomalyImage.decoding = "async";
    portrait.appendChild(anomalyImage);

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const show = () => portrait.classList.add("isVladimirAnomalyVisible");
    const hide = () => portrait.classList.remove("isVladimirAnomalyVisible");
    const toggle = (event: Event) => {
      if (canHover.matches) return;
      event.preventDefault();
      portrait.classList.toggle("isVladimirAnomalyVisible");
    };

    const onEnter = () => {
      if (canHover.matches) show();
    };
    const onLeave = () => {
      if (canHover.matches) hide();
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    portrait.addEventListener("click", toggle);

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      portrait.removeEventListener("click", toggle);
      portrait.classList.remove("vladimirPortraitSwap", "isVladimirAnomalyVisible");
      anomalyImage.remove();
    };
  }, []);

  return null;
}
