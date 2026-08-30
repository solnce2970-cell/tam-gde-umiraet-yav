"use client";

import { useEffect } from "react";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function LaretsWisp() {
  useEffect(() => {
    if (window.location.pathname !== "/larets-predaniy") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

      const glow = document.createElement("span");
      const core = document.createElement("span");
      wisp.append(glow, core);

      Object.assign(wisp.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "42px",
        height: "42px",
        pointerEvents: "none",
        zIndex: "60",
        opacity: "0",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 0 11px rgba(115,255,104,.32))",
      });

      Object.assign(glow.style, {
        position: "absolute",
        inset: "4px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(248,255,203,.98) 0 13%, rgba(184,255,121,.96) 14% 30%, rgba(92,230,84,.78) 31% 48%, rgba(42,118,48,.28) 49% 67%, transparent 68%)",
        boxShadow: "0 0 10px rgba(202,255,151,.88), 0 0 24px rgba(117,255,112,.58), 0 0 44px rgba(71,187,77,.3)",
      });

      Object.assign(core.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "6px",
        height: "9px",
        borderRadius: "48% 52% 42% 58%",
        transform: "translate(-50%, -50%) rotate(12deg)",
        background: "linear-gradient(180deg, rgba(45,37,22,.95), rgba(13,12,9,1))",
      });

      document.body.appendChild(wisp);

      const startLeft = Math.random() < 0.5;
      const startX = startLeft ? -55 : window.innerWidth + 55;
      const startY = rand(window.innerHeight * 0.28, window.innerHeight * 0.78);
      const p1x = clamp(window.innerWidth * rand(0.2, 0.4), 36, window.innerWidth - 36);
      const p1y = clamp(startY + rand(-110, 90), 80, window.innerHeight - 80);
      const p2x = clamp(window.innerWidth * rand(0.42, 0.62), 36, window.innerWidth - 36);
      const p2y = clamp(p1y + rand(-130, 120), 80, window.innerHeight - 80);
      const p3x = clamp(window.innerWidth * rand(0.62, 0.82), 36, window.innerWidth - 36);
      const p3y = clamp(p2y + rand(-100, 100), 80, window.innerHeight - 80);
      const endX = startLeft ? window.innerWidth + 65 : -65;
      const endY = clamp(p3y + rand(-90, 90), 70, window.innerHeight - 70);
      const duration = rand(5200, 6800);

      const flight = wisp.animate(
        [
          { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) scale(.82)`, offset: 0 },
          { opacity: 1, transform: `translate3d(${p1x}px,${p1y}px,0) scale(1.04)`, offset: 0.18 },
          { opacity: 1, transform: `translate3d(${p1x + rand(-44, 44)}px,${p1y + rand(-28, 28)}px,0) scale(.96)`, offset: 0.31 },
          { opacity: 1, transform: `translate3d(${p2x}px,${p2y}px,0) scale(1.08)`, offset: 0.46 },
          { opacity: 1, transform: `translate3d(${p2x + rand(-52, 52)}px,${p2y + rand(-34, 34)}px,0) scale(.94)`, offset: 0.58 },
          { opacity: 1, transform: `translate3d(${p3x}px,${p3y}px,0) scale(1.02)`, offset: 0.74 },
          { opacity: 1, transform: `translate3d(${p3x + rand(-30, 30)}px,${p3y + rand(-24, 24)}px,0) scale(.98)`, offset: 0.84 },
          { opacity: 0, transform: `translate3d(${endX}px,${endY}px,0) scale(.78)`, offset: 1 },
        ],
        { duration, easing: "cubic-bezier(.28,.03,.2,1)", fill: "forwards" },
      );

      const pulse = glow.animate(
        [
          { transform: "scale(.9)", opacity: .82 },
          { transform: "scale(1.15)", opacity: 1 },
          { transform: "scale(.96)", opacity: .88 },
        ],
        { duration: 720, iterations: Math.ceil(duration / 720), easing: "ease-in-out" },
      );

      flight.addEventListener("finish", () => {
        pulse.cancel();
        wisp.remove();
        if (!cancelled && shown < 2) schedule(18000, 30000, spawn);
      });
    };

    schedule(5000, 12000, spawn);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      document.querySelectorAll("[data-larets-wisp]").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
