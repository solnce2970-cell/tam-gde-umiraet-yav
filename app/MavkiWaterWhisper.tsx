"use client";

import { useEffect, useRef } from "react";
import { NAVNIK_TRANSITION_EVENT, type NavnikTransitionDetail } from "../lib/anomalies/events";

const AUDIO_SRC = "/sfx/mavki-whisper.mp3?v=2";

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

      const murk = document.createElement("div");
      murk.className = "mavkiWaterMurk";
      overlay.appendChild(murk);

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
        ring.style.animationDelay = `${i * 170}ms`;
        ring.style.setProperty("--mavki-ring-max", `${mobile ? 420 + i * 96 : 620 + i * 138}px`);
        ring.style.setProperty("--mavki-ring-y", String(0.32 + i * 0.018));
        ring.style.setProperty("--mavki-ring-opacity", String(Math.max(0.30, 0.66 - i * 0.07)));
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
        // The new five-second audio file contains its own fade-out, so do not cut it off here.
        cleanupRef.current = null;
      }, reduced ? 3000 : 5300);

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
        background:
          linear-gradient(180deg,rgba(34,48,27,.16),rgba(12,24,18,.27)),
          radial-gradient(ellipse at 50% 62%,rgba(71,82,43,.13),transparent 62%);
        backdrop-filter:blur(.9px) saturate(.72) brightness(.86) sepia(.08);
        animation:mavkiWaterField 5.2s ease-in-out forwards;
      }
      .mavkiWaterSheen{
        position:absolute;
        inset:-7%;
        opacity:0;
        background:
          radial-gradient(ellipse at 50% 43%,rgba(171,191,144,.11),transparent 48%),
          repeating-linear-gradient(178deg,rgba(185,198,157,.042) 0 1px,transparent 2px 11px);
        filter:blur(1.25px);
        animation:mavkiWaterSheen 5.2s ease-in-out forwards;
      }
      .mavkiWaterMurk{
        position:absolute;
        inset:-12%;
        opacity:0;
        background:
          radial-gradient(ellipse at 18% 84%,rgba(58,69,37,.18),transparent 28%),
          radial-gradient(ellipse at 77% 74%,rgba(45,60,34,.16),transparent 31%),
          linear-gradient(0deg,rgba(22,32,18,.14),transparent 56%);
        filter:blur(12px);
        animation:mavkiWaterMurk 5.2s ease-in-out forwards;
      }
      .mavkiRippleWrap{
        position:absolute;
        width:0;
        height:0;
        transform:translate(-50%,-50%);
        filter:drop-shadow(0 3px 3px rgba(0,0,0,.24));
      }
      .mavkiWaterWave{
        position:absolute;
        left:0;
        top:0;
        width:430px;
        height:124px;
        margin:-62px 0 0 -215px;
        border-radius:50%;
        opacity:0;
        background:
          repeating-linear-gradient(
            180deg,
            rgba(188,204,160,0) 0px,
            rgba(188,204,160,0) 7px,
            rgba(188,204,160,.19) 8px,
            rgba(90,106,64,.08) 11px,
            rgba(188,204,160,0) 16px
          );
        box-shadow:
          0 -7px 14px rgba(198,211,177,.055),
          0 11px 18px rgba(7,17,12,.17);
        filter:blur(2.2px);
        transform:translate(-50%,-50%) scale(.76,.64);
        animation:mavkiWaterWave 4.45s cubic-bezier(.16,.65,.22,1) forwards;
      }
      .mavkiWaterRing{
        --mavki-ring-max:650px;
        --mavki-ring-y:.34;
        --mavki-ring-opacity:.62;
        position:absolute;
        left:0;
        top:0;
        width:42px;
        height:42px;
        display:block;
        border-radius:50%;
        border-top:1.6px solid rgba(211,222,186,.64);
        border-bottom:1.6px solid rgba(9,25,19,.48);
        border-left:1px solid rgba(157,177,139,.27);
        border-right:1px solid rgba(157,177,139,.27);
        opacity:0;
        transform:translate(-50%,-50%) scaleX(1) scaleY(var(--mavki-ring-y));
        box-shadow:
          0 -2px 2px rgba(223,232,202,.17),
          0 5px 9px rgba(0,11,8,.24),
          inset 0 1px 3px rgba(226,234,207,.12),
          inset 0 -4px 7px rgba(0,12,9,.18);
        animation:mavkiNaturalRipple 4.25s cubic-bezier(.14,.66,.2,1) forwards;
      }
      .mavkiWaterRing::before{
        content:"";
        position:absolute;
        inset:-3px;
        border-radius:50%;
        border-top:1px solid rgba(220,228,198,.29);
        border-bottom:1px solid rgba(0,16,12,.24);
        transform:rotate(-2deg) scaleX(1.015);
        opacity:.72;
      }
      .mavkiWaterDimple{
        position:absolute;
        left:0;
        top:0;
        width:48px;
        height:16px;
        display:block;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:radial-gradient(ellipse,rgba(1,14,10,.53) 0 20%,rgba(177,194,154,.22) 42%,transparent 72%);
        filter:blur(.9px);
        opacity:0;
        animation:mavkiDimple 1.35s ease-out forwards;
      }
      @keyframes mavkiNaturalRipple{
        0%{width:42px;height:42px;opacity:0}
        10%{opacity:var(--mavki-ring-opacity)}
        48%{opacity:calc(var(--mavki-ring-opacity) * .78)}
        76%{opacity:calc(var(--mavki-ring-opacity) * .42)}
        100%{width:var(--mavki-ring-max);height:var(--mavki-ring-max);opacity:0}
      }
      @keyframes mavkiWaterWave{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.72,.58) translateY(0)}
        13%{opacity:.68}
        40%{opacity:.48;transform:translate(-50%,-50%) scale(1.04,.86) translateY(2px)}
        70%{opacity:.27;transform:translate(-50%,-50%) scale(1.31,1) translateY(4px)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.55,1.08) translateY(7px)}
      }
      @keyframes mavkiDimple{
        0%{opacity:0;transform:translate(-50%,-50%) scale(.42)}
        14%{opacity:.72}
        58%{opacity:.28;transform:translate(-50%,-50%) scale(1.28)}
        100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}
      }
      @keyframes mavkiWaterField{
        0%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1) sepia(0)}
        14%{opacity:1;backdrop-filter:blur(1.15px) saturate(.68) brightness(.84) sepia(.1)}
        70%{opacity:1;backdrop-filter:blur(.72px) saturate(.76) brightness(.9) sepia(.07)}
        100%{opacity:0;backdrop-filter:blur(0) saturate(1) brightness(1) sepia(0)}
      }
      @keyframes mavkiWaterSheen{
        0%{opacity:0;transform:translateY(1.4%) scale(1.006)}
        18%{opacity:.64}
        56%{opacity:.38;transform:translateY(-.8%) scale(1.013)}
        100%{opacity:0;transform:translateY(-1.8%) scale(1.017)}
      }
      @keyframes mavkiWaterMurk{
        0%{opacity:0;transform:translateY(4%) scale(1)}
        20%{opacity:.72}
        64%{opacity:.42;transform:translateY(-1%) scale(1.025)}
        100%{opacity:0;transform:translateY(-4%) scale(1.04)}
      }
      @media(max-width:720px){
        .mavkiWaterAnomaly{animation-duration:5.2s}
        .mavkiWaterSheen{animation-duration:5.2s}
        .mavkiWaterMurk{animation-duration:5.2s}
        .mavkiWaterWave{
          width:310px;
          height:92px;
          margin:-46px 0 0 -155px;
        }
        .mavkiWaterRing{
          border-top-width:1.35px;
          border-bottom-width:1.35px;
        }
      }
      @media(prefers-reduced-motion:reduce){
        .mavkiWaterAnomaly{animation-duration:3s;backdrop-filter:none}
        .mavkiWaterSheen{display:none}
        .mavkiWaterMurk{animation-duration:3s}
        .mavkiWaterWave{animation-duration:2.4s}
        .mavkiWaterRing{animation-duration:2.4s}
      }
    `}</style>
  );
}
