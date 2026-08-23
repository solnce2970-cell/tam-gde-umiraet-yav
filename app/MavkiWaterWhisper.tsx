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
      const cx = 24 + Math.random() * 52;
      const cy = mobile ? 34 + Math.random() * 30 : 28 + Math.random() * 38;
      const rings = reduced ? 2 : 4;

      const rippleWrap = document.createElement("div");
      rippleWrap.className = "mavkiRippleWrap";
      rippleWrap.style.left = `${cx}%`;
      rippleWrap.style.top = `${cy}%`;
      overlay.appendChild(rippleWrap);

      for (let i = 0; i < rings; i += 1) {
        const ring = document.createElement("i");
        ring.className = "mavkiWaterRing";
        ring.style.animationDelay = `${i * 175}ms`;
        ring.style.setProperty("--mavki-ring-max", `${mobile ? 220 + i * 54 : 300 + i * 72}px`);
        ring.style.setProperty("--mavki-ring-y", String(0.38 + i * 0.025));
        ring.style.setProperty("--mavki-ring-opacity", String(Math.max(0.2, 0.5 - i * 0.07)));
        rippleWrap.appendChild(ring);
      }

      const dimple = document.createElement("b");
      dimple.className = "mavkiWaterDimple";
      rippleWrap.appendChild(dimple);

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
        background:linear-gradient(180deg,rgba(8,28,34,.06),rgba(3,16,20,.14));
        backdrop-filter:blur(.55px) saturate(.86) brightness(.95);
        animation:mavkiWaterField 3.6s ease-in-out forwards;
      }
      .mavkiWaterSheen{
        position:absolute;
        inset:-7%;
        opacity:0;
        background:
          radial-gradient(ellipse at 50% 43%,rgba(176,214,216,.055),transparent 45%),
          repeating-linear-gradient(179deg,rgba(196,226,226,.018) 0 1px,transparent 2px 11px);
        filter:blur(1.1px);
        animation:mavkiWaterSheen 3.6s ease-in-out forwards;
      }
      .mavkiRippleWrap{
        position:absolute;
        width:0;
        height:0;
        transform:translate(-50%,-50%);
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.16));
      }
      .mavkiWaterRing{
        --mavki-ring-max:320px;
        --mavki-ring-y:.4;
        --mavki-ring-opacity:.45;
        position:absolute;
        left:0;
        top:0;
        width:22px;
        height:22px;
        display:block;
        border-radius:50%;
        border:1px solid rgba(190,221,220,.5);
        opacity:0;
        transform:translate(-50%,-50%) scaleX(1) scaleY(var(--mavki-ring-y));
        box-shadow:
          0 -1px 0 rgba(218,239,237,.14),
          0 2px 3px rgba(0,12,16,.2),
          inset 0 1px 2px rgba(227,244,242,.08),
          inset 0 -2px 3px rgba(0,10,14,.16);
        animation:mavkiNaturalRipple 2.45s cubic-bezier(.18,.7,.22,1) forwards;
      }
      .mavkiWaterRing::before{
        content:"";
        position:absolute;
        inset:-2px;
        border-radius:50%;
        border-top:1px solid rgba(221,241,238,.22);
        border-bottom:1px solid rgba(0,12,15,.18);
        transform:rotate(-2deg) scaleX(1.015);
        opacity:.7;
      }
      .mavkiWaterDimple{
        position:absolute;
        left:0;
        top:0;
        width:24px;
        height:8px;
        display:block;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:radial-gradient(ellipse,rgba(0,10,14,.32) 0 18%,rgba(210,234,232,.14) 36%,transparent 68%);
        filter:blur(.7px);
        opacity:0;
        animation:mavkiDimple 1.15s ease-out forwards;
      }
      @keyframes mavkiNaturalRipple{
        0%{
          width:22px;
          height:22px;
          opacity:0;
          border-color:rgba(202,229,227,.18);
        }
        10%{
          opacity:var(--mavki-ring-opacity);
          border-color:rgba(205,231,229,.5);
        }
        44%{
          opacity:calc(var(--mavki-ring-opacity) * .72);
          border-color:rgba(191,219,217,.34);
        }
        100%{
          width:var(--mavki-ring-max);
          height:var(--mavki-ring-max);
          opacity:0;
          border-color:rgba(180,211,210,.08);
        }
      }
      @keyframes mavkiDimple{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}
        16%{opacity:.55}
        62%{opacity:.18;transform:translate(-50%,-50%) scale(1.18)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.35)}
      }
      @keyframes mavkiWaterField{
        0%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
        16%{opacity:1;backdrop-filter:blur(.75px) saturate(.84) brightness(.94)}
        72%{opacity:1;backdrop-filter:blur(.45px) saturate(.9) brightness(.97)}
        100%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
      }
      @keyframes mavkiWaterSheen{
        0%{opacity:0;transform:translateY(1%) scale(1.004)}
        22%{opacity:.46}
        58%{opacity:.24;transform:translateY(-.6%) scale(1.01)}
        100%{opacity:0;transform:translateY(-1.4%) scale(1.012)}
      }
      @media(max-width:720px){
        .mavkiWaterAnomaly{animation-duration:3.1s}
        .mavkiWaterSheen{animation-duration:3.1s}
        .mavkiWaterRing{border-width:.8px}
      }
      @media(prefers-reduced-motion:reduce){
        .mavkiWaterAnomaly{animation-duration:2.2s;backdrop-filter:none}
        .mavkiWaterSheen{display:none}
        .mavkiWaterRing{animation-duration:1.8s}
      }
    `}</style>
  );
}
