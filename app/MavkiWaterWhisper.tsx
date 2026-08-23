"use client";

import { useEffect, useRef } from "react";
import { NAVNIK_TRANSITION_EVENT, type NavnikTransitionDetail } from "../lib/anomalies/events";

const AUDIO_SRC = "/sfx/mavki-whisper.mp3";

function isBusy() {
  return Boolean(document.querySelector('dialog[open], [role="dialog"], [data-sign-found-reveal]'));
}

export default function MavkiWaterWhisper() {
  const firstCloseRef = useRef(true);
  const timerRef = useRef<number | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.volume = 0.42;
    audioRef.current = audio;

    let disposed = false;
    let audioPrimed = false;

    const clearTimer = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };

    const clearActive = () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };

    const primeAudio = () => {
      if (audioPrimed) return;
      audioPrimed = true;
      const oldVolume = audio.volume;
      audio.volume = 0;
      void audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = oldVolume;
      }).catch(() => {
        audio.volume = oldVolume;
      });
    };

    const playWater = () => {
      timerRef.current = undefined;
      if (disposed || document.hidden || isBusy()) return;

      clearActive();

      const overlay = document.createElement("div");
      overlay.className = "mavkiWaterAnomaly";
      overlay.setAttribute("aria-hidden", "true");

      const sheen = document.createElement("div");
      sheen.className = "mavkiWaterSheen";
      overlay.appendChild(sheen);

      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cx = 28 + Math.random() * 44;
      const cy = mobile ? 34 + Math.random() * 32 : 28 + Math.random() * 38;
      const rings = reduced ? 2 : 4;

      for (let i = 0; i < rings; i += 1) {
        const ring = document.createElement("i");
        ring.className = "mavkiWaterRing";
        ring.style.left = `${cx}%`;
        ring.style.top = `${cy}%`;
        ring.style.animationDelay = `${i * 190}ms`;
        ring.style.setProperty("--mavki-ring-scale", String((mobile ? 6.2 : 8.2) + i * 1.15));
        overlay.appendChild(ring);
      }

      document.body.appendChild(overlay);

      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.42;
      void audio.play().catch(() => {
        // Visual anomaly still works if the browser blocks delayed audio.
      });

      const removeTimer = window.setTimeout(() => {
        overlay.remove();
        if (!audio.paused) audio.pause();
        audio.currentTime = 0;
        cleanupRef.current = null;
      }, reduced ? 2200 : 3600);

      cleanupRef.current = () => {
        window.clearTimeout(removeTimer);
        overlay.remove();
        audio.pause();
        audio.currentTime = 0;
      };
    };

    const scheduleAfterMavkiClose = () => {
      clearTimer();
      const first = firstCloseRef.current;
      firstCloseRef.current = false;
      const delay = first ? 180 : 6500 + Math.random() * 12500;
      timerRef.current = window.setTimeout(playWater, delay);
    };

    const onTransition = (event: Event) => {
      const detail = (event as CustomEvent<NavnikTransitionDetail>).detail;
      if (!detail || detail.creatureId !== "mavki") return;
      if (detail.transition === "closed-to-open") {
        primeAudio();
        return;
      }
      if (detail.transition === "open-to-closed") scheduleAfterMavkiClose();
    };

    const onPointer = () => primeAudio();
    const onVisibility = () => {
      if (document.hidden) {
        clearTimer();
        clearActive();
      }
    };

    window.addEventListener(NAVNIK_TRANSITION_EVENT, onTransition as EventListener);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      clearTimer();
      clearActive();
      audio.pause();
      audioRef.current = null;
      window.removeEventListener(NAVNIK_TRANSITION_EVENT, onTransition as EventListener);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <style>{`
      .mavkiWaterAnomaly{
        position:fixed;
        inset:0;
        z-index:1180;
        overflow:hidden;
        pointer-events:none;
        opacity:1;
        background:linear-gradient(180deg,rgba(12,37,42,.08),rgba(2,18,23,.18));
        backdrop-filter:blur(.8px) saturate(.82) brightness(.92);
        animation:mavkiWaterField 3.6s ease-in-out forwards;
      }
      .mavkiWaterSheen{
        position:absolute;
        inset:-8%;
        opacity:0;
        background:
          radial-gradient(ellipse at 50% 42%,rgba(190,229,229,.10),transparent 42%),
          repeating-linear-gradient(178deg,rgba(194,232,231,.035) 0 1px,transparent 2px 9px);
        filter:blur(1px);
        animation:mavkiWaterSheen 3.6s ease-in-out forwards;
      }
      .mavkiWaterRing{
        position:absolute;
        width:48px;
        height:18px;
        margin:-9px 0 0 -24px;
        border:1px solid rgba(194,232,230,.58);
        border-radius:50%;
        opacity:0;
        box-shadow:
          0 0 5px rgba(196,235,232,.22),
          inset 0 0 5px rgba(196,235,232,.14);
        transform:scale(.35);
        animation:mavkiWaterRing 2.35s cubic-bezier(.16,.64,.22,1) forwards;
      }
      @keyframes mavkiWaterRing{
        0%{opacity:0;transform:scale(.35)}
        12%{opacity:.78}
        60%{opacity:.38}
        100%{opacity:0;transform:scale(var(--mavki-ring-scale))}
      }
      @keyframes mavkiWaterField{
        0%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
        16%{opacity:1;backdrop-filter:blur(1.2px) saturate(.8) brightness(.9)}
        72%{opacity:1;backdrop-filter:blur(.7px) saturate(.86) brightness(.94)}
        100%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
      }
      @keyframes mavkiWaterSheen{
        0%{opacity:0;transform:translateY(1.5%) scale(1.01)}
        22%{opacity:.72}
        58%{opacity:.42;transform:translateY(-1%) scale(1.018)}
        100%{opacity:0;transform:translateY(-2%) scale(1.02)}
      }
      @media(max-width:720px){
        .mavkiWaterAnomaly{animation-duration:3.1s}
        .mavkiWaterSheen{animation-duration:3.1s}
        .mavkiWaterRing{width:40px;height:15px;margin:-7.5px 0 0 -20px}
      }
      @media(prefers-reduced-motion:reduce){
        .mavkiWaterAnomaly{animation-duration:2.2s;backdrop-filter:none}
        .mavkiWaterSheen{display:none}
        .mavkiWaterRing{animation-duration:1.8s}
      }
    `}</style>
  );
}
