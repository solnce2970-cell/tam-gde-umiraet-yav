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

      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cx = 24 + Math.random() * 52;
      const cy = mobile ? 34 + Math.random() * 30 : 28 + Math.random() * 38;
      const rings = reduced ? 2 : 4;

      const sheen = document.createElement("div");
      sheen.className = "mavkiWaterSheen";
      overlay.appendChild(sheen);

      const rippleWrap = document.createElement("div");
      rippleWrap.className = "mavkiRippleWrap";
      rippleWrap.style.left = `${cx}%`;
      rippleWrap.style.top = `${cy}%`;
      overlay.appendChild(rippleWrap);

      const wave = document.createElement("div");
      wave.className = "mavkiWaterWave";
      rippleWrap.appendChild(wave);

      for (let i = 0; i < rings; i += 1) {
        const ring = document.createElement("i");
        ring.className = "mavkiWaterRing";
        ring.style.animationDelay = `${i * 180}ms`;
        ring.style.setProperty("--mavki-ring-max", `${mobile ? 330 + i * 78 : 470 + i * 110}px`);
        ring.style.setProperty("--mavki-ring-y", String(0.34 + i * 0.02));
        ring.style.setProperty("--mavki-ring-opacity", String(Math.max(0.18, 0.46 - i * 0.065)));
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
      }, reduced ? 2200 : 3800);

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
        background:linear-gradient(180deg,rgba(8,28,34,.045),rgba(3,16,20,.11));
        backdrop-filter:blur(.5px) saturate(.9) brightness(.96);
        animation:mavkiWaterField 3.8s ease-in-out forwards;
      }
      .mavkiWaterSheen{
        position:absolute;
        inset:-7%;
        opacity:0;
        background:
          radial-gradient(ellipse at 50% 43%,rgba(176,214,216,.045),transparent 46%),
          repeating-linear-gradient(179deg,rgba(196,226,226,.015) 0 1px,transparent 2px 13px);
        filter:blur(1.2px);
        animation:mavkiWaterSheen 3.8s ease-in-out forwards;
      }
      .mavkiRippleWrap{
        position:absolute;
        width:0;
        height:0;
        transform:translate(-50%,-50%);
        filter:drop-shadow(0 2px 2px rgba(0,0,0,.13));
      }
      .mavkiWaterWave{
        position:absolute;
        left:0;
        top:0;
        width:260px;
        height:74px;
        margin:-37px 0 0 -130px;
        border-radius:50%;
        opacity:0;
        background:
          repeating-linear-gradient(
            180deg,
            rgba(205,236,235,0) 0px,
            rgba(205,236,235,0) 6px,
            rgba(205,236,235,.09) 7px,
            rgba(205,236,235,.015) 9px,
            rgba(205,236,235,0) 12px
          );
        filter:blur(1.8px);
        transform:translate(-50%,-50%) scale(.82,.68);
        animation:mavkiWaterWave 3.05s ease-out forwards;
      }
      .mavkiWaterRing{
        --mavki-ring-max:500px;
        --mavki-ring-y:.36;
        --mavki-ring-opacity:.42;
        position:absolute;
        left:0;
        top:0;
        width:32px;
        height:32px;
        display:block;
        border-radius:50%;
        border-top:1px solid rgba(216,239,237,.3);
        border-bottom:1px solid rgba(5,20,24,.22);
        border-left:1px solid rgba(197,224,223,.11);
        border-right:1px solid rgba(197,224,223,.11);
        opacity:0;
        transform:translate(-50%,-50%) scaleX(1) scaleY(var(--mavki-ring-y));
        box-shadow:
          0 -1px 0 rgba(225,242,240,.08),
          0 3px 6px rgba(0,10,14,.14),
          inset 0 1px 2px rgba(227,244,242,.06),
          inset 0 -2px 4px rgba(0,10,14,.12);
        animation:mavkiNaturalRipple 2.75s cubic-bezier(.17,.67,.2,1) forwards;
      }
      .mavkiWaterRing::before{
        content:"";
        position:absolute;
        inset:-2px;
        border-radius:50%;
        border-top:1px solid rgba(224,241,239,.15);
        border-bottom:1px solid rgba(0,12,15,.13);
        transform:rotate(-1.5deg) scaleX(1.01);
        opacity:.55;
      }
      .mavkiWaterDimple{
        position:absolute;
        left:0;
        top:0;
        width:34px;
        height:10px;
        display:block;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:radial-gradient(ellipse,rgba(0,10,14,.27) 0 18%,rgba(210,234,232,.11) 38%,transparent 70%);
        filter:blur(.8px);
        opacity:0;
        animation:mavkiDimple 1.2s ease-out forwards;
      }
      @keyframes mavkiNaturalRipple{
        0%{
          width:32px;
          height:32px;
          opacity:0;
        }
        11%{
          opacity:var(--mavki-ring-opacity);
        }
        50%{
          opacity:calc(var(--mavki-ring-opacity) * .62);
        }
        100%{
          width:var(--mavki-ring-max);
          height:var(--mavki-ring-max);
          opacity:0;
        }
      }
      @keyframes mavkiWaterWave{
        0%{
          opacity:0;
          transform:translate(-50%,-50%) scale(.78,.64) translateY(0);
        }
        16%{opacity:.38}
        48%{
          opacity:.23;
          transform:translate(-50%,-50%) scale(1.08,.87) translateY(2px);
        }
        76%{
          opacity:.12;
          transform:translate(-50%,-50%) scale(1.26,.96) translateY(3px);
        }
        100%{
          opacity:0;
          transform:translate(-50%,-50%) scale(1.42,1.02) translateY(5px);
        }
      }
      @keyframes mavkiDimple{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}
        16%{opacity:.5}
        62%{opacity:.16;transform:translate(-50%,-50%) scale(1.22)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.4)}
      }
      @keyframes mavkiWaterField{
        0%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
        16%{opacity:1;backdrop-filter:blur(.7px) saturate(.88) brightness(.95)}
        72%{opacity:1;backdrop-filter:blur(.4px) saturate(.92) brightness(.98)}
        100%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1)}
      }
      @keyframes mavkiWaterSheen{
        0%{opacity:0;transform:translateY(1%) scale(1.004)}
        22%{opacity:.38}
        58%{opacity:.2;transform:translateY(-.5%) scale(1.009)}
        100%{opacity:0;transform:translateY(-1.2%) scale(1.011)}
      }
      @media(max-width:720px){
        .mavkiWaterAnomaly{animation-duration:3.2s}
        .mavkiWaterSheen{animation-duration:3.2s}
        .mavkiWaterWave{
          width:190px;
          height:56px;
          margin:-28px 0 0 -95px;
        }
        .mavkiWaterRing{border-width:.8px}
      }
      @media(prefers-reduced-motion:reduce){
        .mavkiWaterAnomaly{animation-duration:2.2s;backdrop-filter:none}
        .mavkiWaterSheen{display:none}
        .mavkiWaterWave{animation-duration:1.8s}
        .mavkiWaterRing{animation-duration:1.8s}
      }
    `}</style>
  );
}
