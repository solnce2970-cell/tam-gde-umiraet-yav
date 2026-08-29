"use client";

import { useEffect } from "react";
import "./vasilisk-cat-revenge.css";

const SESSION_KEY = "ambient.vasilisk-cat-revenge.v2";
const AUDIO_SRC = "/sfx/vasilisk-meow.mp3";

function isBusy() {
  return Boolean(
    document.querySelector(
      'dialog[open], [role="dialog"], [data-sign-found-reveal], [data-anomaly-active="true"], [data-nav-awakening]',
    ),
  );
}

function getVisibleVasilisk() {
  return Array.from(
    document.querySelectorAll<HTMLImageElement>('img[src="/images/navnik/vasilisk.webp"]'),
  ).find((image) => {
    const rect = image.getBoundingClientRect();
    return (
      rect.width > 100 &&
      rect.height > 100 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    );
  });
}

export default function VasiliskCatRevenge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const preview = new URLSearchParams(window.location.search).has("vasilisk-revenge-preview");
    if (preview) sessionStorage.removeItem(SESSION_KEY);

    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.volume = 0.52;
    let disposed = false;
    let triggerTimer: number | undefined;
    let removeTimer: number | undefined;
    let layer: HTMLDivElement | null = null;
    let primed = false;

    const clearTrigger = () => {
      if (triggerTimer) window.clearTimeout(triggerTimer);
      triggerTimer = undefined;
    };

    const clearLayer = () => {
      if (removeTimer) window.clearTimeout(removeTimer);
      removeTimer = undefined;
      layer?.remove();
      layer = null;
    };

    const primeAudio = () => {
      if (primed || disposed) return;
      const previousVolume = audio.volume;
      audio.volume = 0;
      audio.currentTime = 0;
      void audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = previousVolume;
        primed = true;
      }).catch(() => {
        audio.volume = previousVolume;
      });
    };

    const showClaws = (image: HTMLImageElement) => {
      if (disposed || sessionStorage.getItem(SESSION_KEY) === "1") return;

      const rect = image.getBoundingClientRect();
      if (rect.width <= 100 || rect.height <= 100) return;

      clearLayer();
      layer = document.createElement("div");
      layer.className = "ambientVasiliskClaws";
      layer.setAttribute("aria-hidden", "true");
      layer.dataset.dushnitsaRevenge = "true";
      layer.style.left = `${rect.left}px`;
      layer.style.top = `${rect.top}px`;
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;

      const clawProfiles = [
        { y: "24%", left: "12%", length: "40%", angle: "13deg", delay: "0ms" },
        { y: "36%", left: "9%", length: "72%", angle: "14deg", delay: "35ms" },
        { y: "48%", left: "11%", length: "58%", angle: "15deg", delay: "70ms" },
        { y: "60%", left: "14%", length: "47%", angle: "16deg", delay: "105ms" },
      ];

      clawProfiles.forEach((profile) => {
        const claw = document.createElement("i");
        claw.style.setProperty("--claw-y", profile.y);
        claw.style.setProperty("--claw-left", profile.left);
        claw.style.setProperty("--claw-length", profile.length);
        claw.style.setProperty("--claw-angle", profile.angle);
        claw.style.setProperty("--claw-delay", profile.delay);
        layer?.appendChild(claw);
      });

      document.body.appendChild(layer);
      sessionStorage.setItem(SESSION_KEY, "1");

      // The visual revenge no longer depends on autoplay permission.
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.52;
      void audio.play().catch(() => {
        // Keep the scratches even if this browser still refuses delayed sound.
      });

      removeTimer = window.setTimeout(clearLayer, 1800);
    };

    const arm = () => {
      if (disposed) return;
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        clearTrigger();
        return;
      }

      const image = getVisibleVasilisk();
      if (document.hidden || isBusy() || !image) {
        clearTrigger();
        return;
      }

      if (triggerTimer) return;
      const delay = preview ? 900 : 4000 + Math.random() * 6000;
      triggerTimer = window.setTimeout(() => {
        triggerTimer = undefined;
        const currentImage = getVisibleVasilisk();
        if (
          disposed ||
          document.hidden ||
          isBusy() ||
          !currentImage ||
          sessionStorage.getItem(SESSION_KEY) === "1"
        ) {
          arm();
          return;
        }
        showClaws(currentImage);
      }, delay);
    };

    const onInteraction = () => {
      primeAudio();
      arm();
    };

    const onViewportChange = () => {
      if (!getVisibleVasilisk()) clearTrigger();
      arm();
    };

    const onVisibilityChange = () => {
      if (document.hidden) clearTrigger();
      else arm();
    };

    window.addEventListener("pointerdown", onInteraction, { passive: true });
    window.addEventListener("keydown", onInteraction);
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    arm();

    return () => {
      disposed = true;
      clearTrigger();
      clearLayer();
      audio.pause();
      audio.currentTime = 0;
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
