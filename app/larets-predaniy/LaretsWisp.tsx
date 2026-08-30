"use client";

import { useEffect } from "react";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function LaretsWisp() {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/larets-predaniy")) return;

    let cancelled = false;
    let shown = 0;
    const timers: number[] = [];

    const schedule = (min: number, max: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, rand(min, max));
      timers.push(id);
    };

    const spawn = () => {
      if (cancelled || shown >= 2 || document.querySelector("[data-larets-wisp]")) return;
      shown += 1;

      const wisp = document.createElement("div");
      wisp.dataset.laretsWisp = "true";
      wisp.setAttribute("aria-hidden", "true");

      const halo = document.createElement("span");
      const glow = document.createElement("span");
      const core = document.createElement("span");
      wisp.append(halo, glow, core);

      Object.assign(wisp.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "58px",
        height: "58px",
        pointerEvents: "none",
        zIndex: "9999",
        opacity: "0",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 0 16px rgba(115,255,104,.46))",
      });

      Object.assign(halo.style, {
        position: "absolute",
        inset: "0",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(219,255,184,.22) 0 18%, rgba(129,255,118,.28) 19% 40%, rgba(55,153,63,.15) 41% 65%, transparent 66%)",
        filter: "blur(4px)",
      });

      Object.assign(glow.style, {
        position: "absolute",
        inset: "7px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(252,255,212,.99) 0 14%, rgba(193,255,133,.98) 15% 31%, rgba(101,239,91,.88) 32% 50%, rgba(44,126,50,.3) 51% 69%, transparent 70%)",
        boxShadow: "0 0 14px rgba(211,255,161,.95), 0 0 30px rgba(121,255,112,.72), 0 0 54px rgba(71,187,77,.38)",
      });

      Object.assign(core.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "7px",
        height: "11px",
        borderRadius: "48% 52% 42% 58%",
        transform: "translate(-50%, -50%) rotate(12deg)",
        background: "linear-gradient(180deg, rgba(45,37,22,.96), rgba(13,12,9,1))",
      });

      document.body.appendChild(wisp);

      const startLeft = Math.random() < 0.5;
      const startX = startLeft ? -70 : window.innerWidth + 70;
      const startY = rand(window.innerHeight * 0.24, window.innerHeight * 0.76);
      const p1x = clamp(window.innerWidth * rand(0.2, 0.38), 44, window.innerWidth - 44);
      const p1y = clamp(startY + rand(-120, 100), 90, window.innerHeight - 90);
      const p2x = clamp(window.innerWidth * rand(0.42, 0.62), 44, window.innerWidth - 44);
      const p2y = clamp(p1y + rand(-140, 130), 90, window.innerHeight - 90);
      const p3x = clamp(window.innerWidth * rand(0.64, 0.84), 44, window.innerWidth - 44);
      const p3y = clamp(p2y + rand(-110, 110), 90, window.innerHeight - 90);
      const endX = startLeft ? window.innerWidth + 80 : -80;
      const endY = clamp(p3y + rand(-95, 95), 80, window.innerHeight - 80);
      const duration = rand(6200, 7800);

      const flight = wisp.animate(
        [
          { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) scale(.8)`, offset: 0 },
          { opacity: 1, transform: `translate3d(${p1x}px,${p1y}px,0) scale(1.06)`, offset: 0.16 },
          { opacity: 1, transform: `translate3d(${p1x + rand(-50, 50)}px,${p1y + rand(-30, 30)}px,0) scale(.97)`, offset: 0.3 },
          { opacity: 1, transform: `translate3d(${p2x}px,${p2y}px,0) scale(1.12)`, offset: 0.46 },
          { opacity: 1, transform: `translate3d(${p2x + rand(-58, 58)}px,${p2y + rand(-38, 38)}px,0) scale(.95)`, offset: 0.6 },
          { opacity: 1, transform: `translate3d(${p3x}px,${p3y}px,0) scale(1.05)`, offset: 0.76 },
          { opacity: 1, transform: `translate3d(${p3x + rand(-34, 34)}px,${p3y + rand(-26, 26)}px,0) scale(.99)`, offset: 0.86 },
          { opacity: 0, transform: `translate3d(${endX}px,${endY}px,0) scale(.78)`, offset: 1 },
        ],
        { duration, easing: "cubic-bezier(.28,.03,.2,1)", fill: "forwards" },
      );

      const pulse = glow.animate(
        [
          { transform: "scale(.9)", opacity: .86 },
          { transform: "scale(1.18)", opacity: 1 },
          { transform: "scale(.96)", opacity: .9 },
        ],
        { duration: 680, iterations: Math.ceil(duration / 680), easing: "ease-in-out" },
      );

      const haloPulse = halo.animate(
        [
          { transform: "scale(.92)", opacity: .7 },
          { transform: "scale(1.16)", opacity: 1 },
          { transform: "scale(.98)", opacity: .82 },
        ],
        { duration: 920, iterations: Math.ceil(duration / 920), easing: "ease-in-out" },
      );

      flight.addEventListener("finish", () => {
        pulse.cancel();
        haloPulse.cancel();
        wisp.remove();
        if (!cancelled && shown < 2) schedule(14000, 22000, spawn);
      });
    };

    schedule(1800, 3200, spawn);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      document.querySelectorAll("[data-larets-wisp]").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
