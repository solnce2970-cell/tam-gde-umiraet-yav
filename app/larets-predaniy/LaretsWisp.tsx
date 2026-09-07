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

      const eye = document.createElement("div");
      eye.dataset.laretsWisp = "true";
      eye.setAttribute("aria-hidden", "true");

      const halo = document.createElement("span");
      const eyeSurface = document.createElement("span");
      eye.append(halo, eyeSurface);

      Object.assign(eye.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "72px",
        height: "56px",
        pointerEvents: "none",
        zIndex: "9999",
        opacity: "0",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 0 10px rgba(128,255,118,.28))",
      });

      Object.assign(halo.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "66px",
        height: "50px",
        borderRadius: "50%",
        transform: "translate(-50%,-50%)",
        background:
          "radial-gradient(ellipse, rgba(209,255,167,.34) 0 18%, rgba(119,241,105,.25) 34%, rgba(56,162,64,.12) 56%, transparent 76%)",
        filter: "blur(5px)",
        zIndex: "0",
      });

      Object.assign(eyeSurface.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "68px",
        height: "52px",
        transform: "translate(-50%,-50%)",
        background:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='68' height='52' viewBox='0 0 68 52'%3E%3Cdefs%3E%3CradialGradient id='iris' cx='50%25' cy='48%25' r='55%25'%3E%3Cstop offset='0' stop-color='%23efffd2'/%3E%3Cstop offset='.34' stop-color='%23b8ff79'/%3E%3Cstop offset='.7' stop-color='%2359c955'/%3E%3Cstop offset='1' stop-color='%232f6e36'/%3E%3C/radialGradient%3E%3Cfilter id='glow' x='-60%25' y='-80%25' width='220%25' height='260%25'%3E%3CfeGaussianBlur stdDeviation='2.2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M4 26 Q17 6 34 6 Q51 6 64 26 Q51 46 34 46 Q17 46 4 26Z' fill='url(%23iris)' stroke='%23caff9a' stroke-opacity='.42' stroke-width='1.2' filter='url(%23glow)'/%3E%3Cpath d='M34 10 C41 15 41 37 34 42 C27 37 27 15 34 10Z' fill='%23070605'/%3E%3Cellipse cx='28.5' cy='19.5' rx='3.5' ry='2.4' fill='%23f7ffe9' fill-opacity='.56'/%3E%3C/svg%3E\") center / contain no-repeat",
        filter: "drop-shadow(0 0 8px rgba(183,255,122,.48))",
        zIndex: "2",
      });

      document.body.appendChild(eye);

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

      const flight = eye.animate(
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

      const pulse = eyeSurface.animate(
        [
          { opacity: .88, transform: "translate(-50%,-50%) scale(.94)" },
          { opacity: 1, transform: "translate(-50%,-50%) scale(1.045)" },
          { opacity: .9, transform: "translate(-50%,-50%) scale(.97)" },
        ],
        { duration: 1850, iterations: Math.ceil(duration / 1850), easing: "ease-in-out" },
      );

      const haloPulse = halo.animate(
        [
          { opacity: .68, transform: "translate(-50%,-50%) scale(.92)" },
          { opacity: 1, transform: "translate(-50%,-50%) scale(1.1)" },
          { opacity: .76, transform: "translate(-50%,-50%) scale(.96)" },
        ],
        { duration: 2100, iterations: Math.ceil(duration / 2100), easing: "ease-in-out" },
      );

      flight.addEventListener("finish", () => {
        pulse.cancel();
        haloPulse.cancel();
        eye.remove();
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
