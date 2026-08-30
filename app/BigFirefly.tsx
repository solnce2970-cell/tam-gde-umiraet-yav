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

      const insect = document.createElement("div");
      insect.dataset.bigFirefly = "true";
      insect.setAttribute("aria-hidden", "true");

      const glow = document.createElement("span");
      glow.dataset.fireflyPart = "glow";
      const abdomen = document.createElement("span");
      abdomen.dataset.fireflyPart = "abdomen";
      const thorax = document.createElement("span");
      thorax.dataset.fireflyPart = "thorax";
      const head = document.createElement("span");
      head.dataset.fireflyPart = "head";
      const wingLeft = document.createElement("span");
      wingLeft.dataset.fireflyPart = "wing-left";
      const wingRight = document.createElement("span");
      wingRight.dataset.fireflyPart = "wing-right";

      insect.append(glow, wingLeft, wingRight, abdomen, thorax, head);

      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? -90 : window.innerWidth + 90;
      const endX = fromLeft ? window.innerWidth + 130 : -130;
      const startY = window.innerHeight * randomBetween(0.56, 0.78);
      const rise = randomBetween(80, 150);
      const duration = reduceMotion ? 7_500 : randomBetween(9_000, 11_800);
      const distance = endX - startX;

      Object.assign(insect.style, {
        position: "fixed",
        left: `${startX}px`,
        top: `${startY}px`,
        width: "64px",
        height: "58px",
        zIndex: "1320",
        pointerEvents: "none",
        opacity: "0",
        transform: "translate3d(0,0,0)",
        willChange: "transform,opacity",
        filter: "drop-shadow(0 0 9px rgba(128,255,118,.2))",
      });

      Object.assign(glow.style, {
        position: "absolute",
        left: "50%",
        top: "55%",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        transform: "translate(-50%,-50%)",
        background:
          "radial-gradient(circle,rgba(244,255,183,.98) 0 8%,rgba(183,255,122,.94) 14%,rgba(101,232,92,.64) 32%,rgba(56,162,64,.28) 52%,transparent 72%)",
        boxShadow:
          "0 0 14px rgba(204,255,151,.82),0 0 30px rgba(118,246,106,.58),0 0 58px rgba(68,178,74,.3)",
        zIndex: "0",
      });

      Object.assign(abdomen.style, {
        position: "absolute",
        left: "50%",
        top: "29px",
        width: "11px",
        height: "22px",
        borderRadius: "48% 48% 55% 55%",
        transform: "translateX(-50%)",
        background:
          "linear-gradient(180deg,#34291d 0%,#17120d 42%,#252614 67%,#b8ef63 84%,#dcff91 100%)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,.08),0 0 7px rgba(186,255,106,.52)",
        zIndex: "4",
      });

      Object.assign(thorax.style, {
        position: "absolute",
        left: "50%",
        top: "20px",
        width: "13px",
        height: "13px",
        borderRadius: "48% 52% 45% 55%",
        transform: "translateX(-50%)",
        background: "linear-gradient(145deg,#3b2c1e,#16110c 68%)",
        boxShadow: "inset 1px 1px 1px rgba(255,255,255,.08)",
        zIndex: "5",
      });

      Object.assign(head.style, {
        position: "absolute",
        left: "50%",
        top: "14px",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        transform: "translateX(-50%)",
        background: "#120e0a",
        zIndex: "6",
      });

      const wingBase = {
        position: "absolute",
        top: "18px",
        width: "22px",
        height: "27px",
        border: "1px solid rgba(222,246,226,.22)",
        background: "linear-gradient(145deg,rgba(238,255,241,.22),rgba(182,218,196,.07))",
        boxShadow: "inset 0 0 8px rgba(222,246,226,.08)",
        backdropFilter: "blur(.35px)",
        zIndex: "2",
      } as const;

      Object.assign(wingLeft.style, wingBase, {
        left: "10px",
        borderRadius: "75% 32% 68% 35%",
        transformOrigin: "92% 18%",
        transform: "rotate(-20deg)",
      });
      Object.assign(wingRight.style, wingBase, {
        right: "10px",
        borderRadius: "32% 75% 35% 68%",
        transformOrigin: "8% 18%",
        transform: "rotate(20deg)",
      });

      document.body.appendChild(insect);
      active = insect;

      const flight = insect.animate(
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
        const pulse = glow.animate(
          [
            { opacity: .76, transform: "translate(-50%,-50%) scale(.88)" },
            { opacity: 1, transform: "translate(-50%,-50%) scale(1.1)", offset: .46 },
            { opacity: .82, transform: "translate(-50%,-50%) scale(.94)" },
          ],
          { duration: 1_650, iterations: Infinity, easing: "ease-in-out" },
        );
        const leftWing = wingLeft.animate(
          [
            { transform: "rotate(-16deg) scaleY(1)" },
            { transform: "rotate(-43deg) scaleY(.84)" },
            { transform: "rotate(-12deg) scaleY(1)" },
          ],
          { duration: 170, iterations: Infinity, easing: "ease-in-out" },
        );
        const rightWing = wingRight.animate(
          [
            { transform: "rotate(16deg) scaleY(1)" },
            { transform: "rotate(43deg) scaleY(.84)" },
            { transform: "rotate(12deg) scaleY(1)" },
          ],
          { duration: 170, iterations: Infinity, easing: "ease-in-out" },
        );
        animations.push(pulse, leftWing, rightWing);
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
