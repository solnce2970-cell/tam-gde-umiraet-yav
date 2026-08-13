"use client";

import { useEffect } from "react";

const OPEN = "/images/characters/morok-open.webp";
const CLOSED = "/images/characters/morok-closed.webp";
const STARS = "/images/characters/morok-stars.webp";
const SEMARGL_WOLF = "/images/characters/semargl-wolf.webp";

type PortraitEffect = {
  alt: string;
  minDelay: number;
  maxDelay: number;
  duration: number;
  play: (image: HTMLImageElement, mobile: boolean, reducedMotion: boolean) => Animation[];
};

function portraitBox(image: HTMLImageElement) {
  return image.closest<HTMLElement>(".characterPortrait");
}

function ensureRelative(box: HTMLElement) {
  const oldPosition = box.style.position;
  if (getComputedStyle(box).position === "static") box.style.position = "relative";
  return () => {
    box.style.position = oldPosition;
  };
}

function removeOnEnd(animation: Animation, node: HTMLElement, restoreBox: () => void) {
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    node.remove();
    restoreBox();
  };
  animation.onfinish = cleanup;
  animation.oncancel = cleanup;
}

function svetoyaraGlow(image: HTMLImageElement, mobile: boolean, reducedMotion: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
  const light = document.createElement("span");
  light.setAttribute("aria-hidden", "true");
  Object.assign(light.style, {
    position: "absolute",
    inset: "0",
    zIndex: "2",
    pointerEvents: "none",
    opacity: "0",
    background:
      "radial-gradient(circle at 50% 30%, rgba(242,250,255,.58) 0%, rgba(220,239,249,.26) 34%, rgba(199,225,239,.10) 54%, transparent 76%), linear-gradient(180deg, rgba(235,247,252,.12), transparent 64%)",
    mixBlendMode: "screen",
    filter: "blur(2px)",
  });
  box.appendChild(light);

  const glow = light.animate(
    [
      { opacity: 0 },
      { opacity: mobile ? 0.52 : 0.72, offset: 0.5 },
      { opacity: 0 },
    ],
    { duration: mobile ? 2500 : 3000, easing: "ease-in-out" },
  );

  const imageGlow = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1) drop-shadow(0 0 0 rgba(225,240,255,0))" },
      {
        filter: `saturate(${mobile ? 0.7 : 0.64}) contrast(1.01) brightness(${mobile ? 1.2 : 1.3}) drop-shadow(0 0 ${mobile ? 14 : 26}px rgba(226,243,255,.68))`,
        offset: 0.5,
      },
      { filter: "saturate(.78) contrast(1.04) brightness(1) drop-shadow(0 0 0 rgba(225,240,255,0))" },
    ],
    { duration: mobile ? 2500 : 3000, easing: "ease-in-out" },
  );

  if (!reducedMotion) {
    light.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.018)", offset: 0.5 },
        { transform: "scale(1)" },
      ],
      { duration: mobile ? 2500 : 3000, easing: "ease-in-out" },
    );
  }

  removeOnEnd(glow, light, restoreBox);
  return [glow, imageGlow];
}

/* Огнеяра: JS держит маркер 4 секунды, CSS разжигает пламя снизу. */
function ogneyaraFirelight(image: HTMLImageElement) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
  const marker = document.createElement("span");
  marker.setAttribute("aria-hidden", "true");
  box.appendChild(marker);

  const lifetime = box.animate(
    [{ outlineColor: "transparent" }, { outlineColor: "transparent" }],
    { duration: 4000, easing: "linear" },
  );

  removeOnEnd(lifetime, marker, restoreBox);
  return [lifetime];
}

/* Семаргл: случайный рой искр закрывает человека, затем остаётся волк. */
function semarglHeat(image: HTMLImageElement, mobile: boolean, reducedMotion: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
  const oldOverflow = box.style.overflow;
  box.style.overflow = "hidden";

  const wolf = document.createElement("div");
  wolf.setAttribute("aria-hidden", "true");
  Object.assign(wolf.style, {
    position: "absolute",
    inset: "0",
    zIndex: "9",
    pointerEvents: "none",
    opacity: "0",
    background: `url('${SEMARGL_WOLF}') center / cover no-repeat`,
    filter: "saturate(.92) contrast(1.07) brightness(1.02)",
  });

  const veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  Object.assign(veil.style, {
    position: "absolute",
    inset: "0",
    zIndex: "11",
    pointerEvents: "none",
    opacity: "0",
    background:
      "radial-gradient(ellipse at 50% 90%, rgba(255,111,18,.58), rgba(116,27,3,.60) 42%, rgba(20,6,2,.68) 78%), radial-gradient(circle at 25% 40%, rgba(255,173,61,.22), transparent 38%), radial-gradient(circle at 78% 56%, rgba(236,70,10,.30), transparent 42%)",
    filter: "blur(3px)",
  });

  const sparks = document.createElement("div");
  sparks.setAttribute("aria-hidden", "true");
  Object.assign(sparks.style, {
    position: "absolute",
    inset: "0",
    zIndex: "12",
    pointerEvents: "none",
    overflow: "hidden",
  });

  box.appendChild(wolf);
  box.appendChild(veil);
  box.appendChild(sparks);

  const total = 3500;
  const particleCount = mobile ? 190 : 310;
  const particleAnimations: Animation[] = [];
  const colors = ["#fff6c8", "#ffe49a", "#ffc45f", "#ff922f", "#f45a16"];

  for (let i = 0; i < particleCount; i += 1) {
    const spark = document.createElement("i");
    const roll = Math.random();
    const width = roll < 0.62 ? 1 + Math.random() * 1.6 : roll < 0.92 ? 2.3 + Math.random() * 1.8 : 4 + Math.random() * 2;
    const height = width * (1.5 + Math.random() * 2.2);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    const y = 8 + Math.random() * 98;
    const glow = 4 + width * 2.4;

    Object.assign(spark.style, {
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: `${45 + Math.random() * 45}% ${35 + Math.random() * 45}% ${45 + Math.random() * 45}% ${35 + Math.random() * 45}%`,
      background: color,
      opacity: "0",
      boxShadow: `0 0 ${glow}px ${color}, 0 0 ${glow * 1.7}px rgba(244,78,10,.42)`,
      transformOrigin: "50% 80%",
      willChange: "transform, opacity",
    });
    sparks.appendChild(spark);

    const delay = Math.random() * 360;
    const duration = 920 + Math.random() * 420;
    const driftX = reducedMotion ? 0 : -42 + Math.random() * 84;
    const rise = reducedMotion ? 8 : 55 + Math.random() * 125;
    const rotation = reducedMotion ? 0 : -35 + Math.random() * 70;
    const peak = 0.80 + Math.random() * 0.20;

    const animation = spark.animate(
      [
        { opacity: 0, transform: "translate3d(0,18px,0) scale(.35) rotate(0deg)" },
        { opacity: peak, transform: `translate3d(${driftX * 0.18}px,2px,0) scale(1) rotate(${rotation * 0.25}deg)`, offset: 0.22 },
        { opacity: peak * 0.9, transform: `translate3d(${driftX * 0.52}px,-${rise * 0.42}px,0) scale(.82) rotate(${rotation * 0.58}deg)`, offset: 0.58 },
        { opacity: 0, transform: `translate3d(${driftX}px,-${rise}px,0) scale(.28) rotate(${rotation}deg)` },
      ],
      { duration, delay, easing: "cubic-bezier(.2,.65,.35,1)", fill: "both" },
    );
    particleAnimations.push(animation);
  }

  const humanFade = image.animate(
    [
      { opacity: 1 },
      { opacity: 0.78, offset: 0.16 },
      { opacity: 0.04, offset: 0.31 },
      { opacity: 0.04, offset: 0.82 },
      { opacity: 1 },
    ],
    { duration: total, easing: "ease-in-out", fill: "both" },
  );

  const veilFade = veil.animate(
    [
      { opacity: 0 },
      { opacity: 0.34, offset: 0.12 },
      { opacity: 0.92, offset: 0.28 },
      { opacity: 0.88, offset: 0.40 },
      { opacity: 0.24, offset: 0.49 },
      { opacity: 0, offset: 0.56 },
      { opacity: 0 },
    ],
    { duration: total, easing: "ease-in-out", fill: "both" },
  );

  const wolfReveal = wolf.animate(
    [
      { opacity: 0, transform: "scale(1.018)" },
      { opacity: 0, transform: "scale(1.012)", offset: 0.30 },
      { opacity: 1, transform: "scale(1.004)", offset: 0.43 },
      { opacity: 1, transform: "scale(1)", offset: 0.80 },
      { opacity: 0, transform: "scale(.997)", offset: 0.92 },
      { opacity: 0, transform: "scale(.997)" },
    ],
    { duration: total, easing: "ease-in-out", fill: "both" },
  );

  const lifetime = box.animate(
    [{ outlineColor: "transparent" }, { outlineColor: "transparent" }],
    { duration: total, easing: "linear" },
  );

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    sparks.remove();
    veil.remove();
    wolf.remove();
    box.style.overflow = oldOverflow;
    restoreBox();
  };
  lifetime.onfinish = cleanup;
  lifetime.oncancel = cleanup;

  return [lifetime, humanFade, veilFade, wolfReveal, ...particleAnimations];
}

const PORTRAIT_EFFECTS: PortraitEffect[] = [
  {
    alt: "Образ персонажа Светояра",
    minDelay: 8000,
    maxDelay: 16000,
    duration: 3000,
    play: svetoyaraGlow,
  },
  {
    alt: "Образ персонажа Огнеяра",
    minDelay: 5000,
    maxDelay: 10000,
    duration: 4000,
    play: ogneyaraFirelight,
  },
  {
    alt: "Образ персонажа Семаргл",
    minDelay: 6000,
    maxDelay: 12000,
    duration: 3500,
    play: semarglHeat,
  },
];

export default function CharacterEffect() {
  useEffect(() => {
    const image = document.querySelector<HTMLImageElement>(
      '#characters img[alt="Образ персонажа Морок"]',
    );
    if (!image) return;

    [OPEN, CLOSED, STARS].forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });
    image.src = OPEN;

    let active = false;
    let timer: number | undefined;
    let restore: number | undefined;

    const clear = () => {
      if (timer) window.clearTimeout(timer);
      if (restore) window.clearTimeout(restore);
      timer = undefined;
      restore = undefined;
    };

    const schedule = () => {
      if (!active) return;
      timer = window.setTimeout(() => {
        if (!active) return;
        const stars = Math.random() < 0.2;
        image.src = stars ? STARS : CLOSED;
        restore = window.setTimeout(() => {
          image.src = OPEN;
          schedule();
        }, stars ? 850 : 720);
      }, 4500 + Math.random() * 6500);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        clear();
        image.src = OPEN;
        if (active) schedule();
      },
      { threshold: [0, 0.45, 0.7] },
    );

    observer.observe(image);
    return () => {
      clear();
      observer.disconnect();
      image.src = OPEN;
    };
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    const wolf = new Image();
    wolf.src = SEMARGL_WOLF;

    PORTRAIT_EFFECTS.forEach((effect) => {
      const image = document.querySelector<HTMLImageElement>(
        `#characters img[alt="${effect.alt}"]`,
      );
      const observed = image ? portraitBox(image) ?? image : null;
      if (!image || !observed) return;

      let visible = false;
      let timer: number | undefined;
      let runs = 0;
      let firstRun = true;
      let animations: Animation[] = [];

      const clearTimer = () => {
        if (timer) window.clearTimeout(timer);
        timer = undefined;
      };

      const stopAnimations = () => {
        animations.forEach((animation) => animation.cancel());
        animations = [];
      };

      const schedule = () => {
        clearTimer();
        if (!visible || runs >= 2) return;

        const delay = firstRun
          ? 1600 + Math.random() * 2200
          : effect.minDelay + Math.random() * (effect.maxDelay - effect.minDelay);

        timer = window.setTimeout(() => {
          if (!visible) return;
          firstRun = false;
          runs += 1;
          animations = effect.play(image, mobile, reducedMotion);
          window.setTimeout(() => {
            animations = [];
            schedule();
          }, effect.duration + 500);
        }, delay);
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
          if (nextVisible === visible) return;

          visible = nextVisible;
          clearTimer();
          stopAnimations();

          if (visible) {
            runs = 0;
            firstRun = true;
            schedule();
          }
        },
        { threshold: [0, 0.2, 0.5] },
      );

      observer.observe(observed);
      cleanups.push(() => {
        clearTimer();
        stopAnimations();
        observer.disconnect();
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
