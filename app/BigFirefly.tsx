"use client";

import { useEffect } from "react";

const FIRST_DELAY_MIN = 7_000;
const FIRST_DELAY_MAX = 12_000;
const REPEAT_DELAY_MIN = 38_000;
const REPEAT_DELAY_MAX = 62_000;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function BigFirefly() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let spawnTimer: number | undefined;
    let active: HTMLDivElement | null = null;
    const animations: Animation[] = [];

    const cleanupActive = () => {
      animations.splice(0).forEach((animation) => animation.cancel());
      active?.remove();
      active = null;
    };

    const schedule = (first = false) => {
      if (disposed) return;
      const delay = first
        ? randomBetween(FIRST_DELAY_MIN, FIRST_DELAY_MAX)
        : randomBetween(REPEAT_DELAY_MIN, REPEAT_DELAY_MAX);
      spawnTimer = window.setTimeout(spawn, delay);
    };

    const spawn = () => {
      spawnTimer = undefined;
      if (disposed || document.hidden || document.querySelector("[data-big-firefly]")) {
        schedule(false);
        return;
      }

      const eye = document.createElement("div");
      eye.dataset.bigFirefly = "true";
      eye.setAttribute("aria-hidden", "true");

      const halo = document.createElement("span");
      halo.dataset.fireflyPart = "halo";
      const eyeSurface = document.createElement("span");
      eyeSurface.dataset.fireflyPart = "eye";
      eye.append(halo, eyeSurface);

      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? -90 : window.innerWidth + 90;
      const endX = fromLeft ? window.innerWidth + 130 : -130;
      const startY = window.innerHeight * randomBetween(0.56, 0.78);
      const rise = randomBetween(80, 150);
      const duration = reduceMotion ? 7_500 : randomBetween(9_000, 11_800);
      const distance = endX - startX;

      Object.assign(eye.style, {
        position: "fixed",
        left: `${startX}px`,
        top: `${startY}px`,
        width: "72px",
        height: "56px",
        zIndex: "1320",
        pointerEvents: "none",
        opacity: "0",
        transform: "translate3d(0,0,0)",
        willChange: "transform,opacity",
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
      active = eye;

      const flight = eye.animate(
        [
          { opacity: 0, transform: "translate3d(0,12px,0) scale(.92)" },
          { opacity: 1, transform: `translate3d(${distance * .12}px,-10px,0) scale(1)`, offset: .1 },
          { opacity: 1, transform: `translate3d(${distance * .34}px,${-rise * .72}px,0) scale(1.03)`, offset: .35 },
          { opacity: 1, transform: `translate3d(${distance * .58}px,${-rise * .42}px,0) scale(.98)`, offset: .58 },
          { opacity: 1, transform: `translate3d(${distance * .78}px,${-rise}px,0) scale(1.02)`, offset: .79 },
          { opacity: 0, transform: `translate3d(${distance}px,${-rise * .68}px,0) scale(.92)` },
        ],
        { duration, easing: "cubic-bezier(.42,0,.24,1)", fill: "forwards" },
      );
      animations.push(flight);

      if (!reduceMotion) {
        const pulse = eyeSurface.animate(
          [
            { opacity: .88, transform: "translate(-50%,-50%) scale(.94)" },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1.045)", offset: .5 },
            { opacity: .9, transform: "translate(-50%,-50%) scale(.97)" },
          ],
          { duration: 1_850, iterations: Infinity, easing: "ease-in-out" },
        );
        const haloPulse = halo.animate(
          [
            { opacity: .68, transform: "translate(-50%,-50%) scale(.92)" },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1.1)", offset: .48 },
            { opacity: .76, transform: "translate(-50%,-50%) scale(.96)" },
          ],
          { duration: 2_100, iterations: Infinity, easing: "ease-in-out" },
        );
        animations.push(pulse, haloPulse);
      }

      flight.addEventListener("finish", () => {
        cleanupActive();
        schedule(false);
      }, { once: true });
    };

    schedule(true);

    return () => {
      disposed = true;
      if (spawnTimer) window.clearTimeout(spawnTimer);
      cleanupActive();
    };
  }, []);

  return null;
}
