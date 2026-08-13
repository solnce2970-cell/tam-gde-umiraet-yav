"use client";

import { useEffect } from "react";

const OPEN = "/images/characters/morok-open.webp";
const CLOSED = "/images/characters/morok-closed.webp";
const STARS = "/images/characters/morok-stars.webp";

type PortraitEffect = {
  alt: string;
  minDelay: number;
  maxDelay: number;
  duration: number;
  play: (image: HTMLImageElement, mobile: boolean) => Animation[];
};

function portraitBox(image: HTMLImageElement) {
  return image.closest<HTMLElement>(".characterPortrait");
}

function svetoyaraGlow(image: HTMLImageElement, mobile: boolean) {
  const strength = mobile ? 1.13 : 1.2;
  const animation = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1) drop-shadow(0 0 0 rgba(225,240,255,0))" },
      { filter: `saturate(.72) contrast(1.02) brightness(${strength}) drop-shadow(0 0 ${mobile ? 10 : 18}px rgba(225,240,255,.48))`, offset: 0.5 },
      { filter: "saturate(.78) contrast(1.04) brightness(1) drop-shadow(0 0 0 rgba(225,240,255,0))" },
    ],
    { duration: mobile ? 2200 : 2700, easing: "ease-in-out" },
  );
  return [animation];
}

function ogneyaraFirelight(image: HTMLImageElement, mobile: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const oldPosition = box.style.position;
  if (getComputedStyle(box).position === "static") box.style.position = "relative";

  const light = document.createElement("span");
  light.setAttribute("aria-hidden", "true");
  Object.assign(light.style, {
    position: "absolute",
    inset: "-18% -28%",
    pointerEvents: "none",
    zIndex: "2",
    opacity: "0",
    background: "linear-gradient(108deg, transparent 20%, rgba(255,150,65,.08) 38%, rgba(255,204,118,.34) 50%, rgba(184,52,20,.16) 61%, transparent 78%)",
    mixBlendMode: "screen",
    filter: "blur(9px)",
  });
  box.appendChild(light);

  const sweep = light.animate(
    [
      { opacity: 0, transform: "translateX(-22%) skewX(-5deg)" },
      { opacity: mobile ? 0.38 : 0.58, transform: "translateX(0) skewX(-2deg)", offset: 0.48 },
      { opacity: 0, transform: "translateX(23%) skewX(3deg)" },
    ],
    { duration: mobile ? 1050 : 1350, easing: "ease-in-out" },
  );

  const warm = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
      { filter: `saturate(${mobile ? 0.9 : 1.02}) contrast(1.04) brightness(${mobile ? 1.04 : 1.08}) sepia(.08)`, offset: 0.5 },
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
    ],
    { duration: mobile ? 1050 : 1350, easing: "ease-in-out" },
  );

  sweep.finished.finally(() => {
    light.remove();
    box.style.position = oldPosition;
  });

  return [sweep, warm];
}

function semarglHeat(image: HTMLImageElement, mobile: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const oldPosition = box.style.position;
  if (getComputedStyle(box).position === "static") box.style.position = "relative";

  const haze = image.cloneNode(true) as HTMLImageElement;
  haze.alt = "";
  haze.setAttribute("aria-hidden", "true");
  Object.assign(haze.style, {
    position: "absolute",
    inset: "0",
    zIndex: "2",
    width: "100%",
    height: "100%",
    objectFit: getComputedStyle(image).objectFit || "cover",
    objectPosition: getComputedStyle(image).objectPosition || "center top",
    pointerEvents: "none",
    opacity: "0",
    filter: `blur(${mobile ? 0.7 : 1.15}px) brightness(1.08) saturate(1.16) sepia(.12)`,
    mixBlendMode: "screen",
  });
  box.appendChild(haze);

  const shimmer = haze.animate(
    [
      { opacity: 0, transform: "translateY(2px) scale(1.002)" },
      { opacity: mobile ? 0.12 : 0.2, transform: `translateY(${mobile ? -1 : -3}px) scale(${mobile ? 1.004 : 1.008})`, offset: 0.48 },
      { opacity: 0, transform: "translateY(1px) scale(1.002)" },
    ],
    { duration: mobile ? 1300 : 1800, easing: "ease-in-out" },
  );

  const warmth = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
      { filter: `saturate(${mobile ? 0.86 : 0.94}) contrast(1.04) brightness(${mobile ? 1.03 : 1.06}) sepia(.07)`, offset: 0.5 },
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
    ],
    { duration: mobile ? 1300 : 1800, easing: "ease-in-out" },
  );

  shimmer.finished.finally(() => {
    haze.remove();
    box.style.position = oldPosition;
  });

  return [shimmer, warmth];
}

const PORTRAIT_EFFECTS: PortraitEffect[] = [
  {
    alt: "Образ персонажа Светояра",
    minDelay: 8000,
    maxDelay: 16000,
    duration: 2700,
    play: svetoyaraGlow,
  },
  {
    alt: "Образ персонажа Огнеяра",
    minDelay: 5000,
    maxDelay: 10000,
    duration: 1350,
    play: ogneyaraFirelight,
  },
  {
    alt: "Образ персонажа Семаргл",
    minDelay: 6000,
    maxDelay: 12000,
    duration: 1800,
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const cleanups: Array<() => void> = [];

    PORTRAIT_EFFECTS.forEach((effect) => {
      const image = document.querySelector<HTMLImageElement>(
        `#characters img[alt="${effect.alt}"]`,
      );
      if (!image) return;

      let visible = false;
      let timer: number | undefined;
      let runs = 0;
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
        const delay = effect.minDelay + Math.random() * (effect.maxDelay - effect.minDelay);
        timer = window.setTimeout(() => {
          if (!visible) return;
          runs += 1;
          animations = effect.play(image, mobile);
          window.setTimeout(() => {
            animations = [];
            schedule();
          }, effect.duration + 450);
        }, delay);
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
          if (nextVisible === visible) return;
          visible = nextVisible;
          clearTimer();
          stopAnimations();
          if (visible) {
            runs = 0;
            schedule();
          }
        },
        { threshold: [0, 0.45, 0.7] },
      );

      observer.observe(image);
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
