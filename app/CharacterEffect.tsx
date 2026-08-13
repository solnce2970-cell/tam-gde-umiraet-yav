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

function ogneyaraFirelight(image: HTMLImageElement, mobile: boolean, reducedMotion: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
  const light = document.createElement("span");
  light.setAttribute("aria-hidden", "true");
  Object.assign(light.style, {
    position: "absolute",
    inset: "-16% -34%",
    pointerEvents: "none",
    zIndex: "2",
    opacity: "0",
    background:
      "radial-gradient(circle at 32% 72%, rgba(255,92,20,.44), transparent 34%), linear-gradient(108deg, transparent 18%, rgba(255,121,38,.16) 34%, rgba(255,218,132,.60) 49%, rgba(221,70,18,.34) 61%, transparent 78%)",
    mixBlendMode: "screen",
    filter: `blur(${mobile ? 7 : 5}px)`,
  });
  box.appendChild(light);

  const startTransform = reducedMotion ? "translateX(0)" : "translateX(-25%) skewX(-5deg)";
  const middleTransform = reducedMotion ? "translateX(0)" : "translateX(0) skewX(-2deg)";
  const endTransform = reducedMotion ? "translateX(0)" : "translateX(26%) skewX(3deg)";

  const sweep = light.animate(
    [
      { opacity: 0, transform: startTransform },
      { opacity: mobile ? 0.66 : 0.88, transform: middleTransform, offset: 0.48 },
      { opacity: 0, transform: endTransform },
    ],
    { duration: mobile ? 1250 : 1550, easing: "ease-in-out" },
  );

  const warm = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
      {
        filter: `saturate(${mobile ? 1.02 : 1.16}) contrast(1.04) brightness(${mobile ? 1.09 : 1.14}) sepia(${mobile ? 0.1 : 0.16})`,
        offset: 0.5,
      },
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
    ],
    { duration: mobile ? 1250 : 1550, easing: "ease-in-out" },
  );

  removeOnEnd(sweep, light, restoreBox);
  return [sweep, warm];
}

function semarglHeat(image: HTMLImageElement, mobile: boolean, reducedMotion: boolean) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
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
    filter: `blur(${mobile ? 1 : 1.65}px) brightness(1.14) saturate(1.28) sepia(.18)`,
    mixBlendMode: "screen",
  });
  box.appendChild(haze);

  const heat = document.createElement("span");
  heat.setAttribute("aria-hidden", "true");
  Object.assign(heat.style, {
    position: "absolute",
    inset: "0",
    zIndex: "3",
    pointerEvents: "none",
    opacity: "0",
    background:
      "radial-gradient(ellipse at 50% 86%, rgba(255,156,55,.34), rgba(255,112,28,.10) 38%, transparent 68%)",
    mixBlendMode: "screen",
    filter: "blur(7px)",
  });
  box.appendChild(heat);

  const startTransform = reducedMotion ? "scale(1)" : "translateY(3px) scale(1.002)";
  const middleTransform = reducedMotion ? "scale(1)" : `translateY(${mobile ? -2 : -5}px) scale(${mobile ? 1.008 : 1.014})`;
  const endTransform = reducedMotion ? "scale(1)" : "translateY(2px) scale(1.003)";

  const shimmer = haze.animate(
    [
      { opacity: 0, transform: startTransform },
      { opacity: mobile ? 0.24 : 0.38, transform: middleTransform, offset: 0.48 },
      { opacity: 0, transform: endTransform },
    ],
    { duration: mobile ? 1650 : 2200, easing: "ease-in-out" },
  );

  const ember = heat.animate(
    [
      { opacity: 0 },
      { opacity: mobile ? 0.42 : 0.62, offset: 0.5 },
      { opacity: 0 },
    ],
    { duration: mobile ? 1650 : 2200, easing: "ease-in-out" },
  );

  const warmth = image.animate(
    [
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
      {
        filter: `saturate(${mobile ? 0.96 : 1.06}) contrast(1.04) brightness(${mobile ? 1.07 : 1.11}) sepia(${mobile ? 0.1 : 0.15})`,
        offset: 0.5,
      },
      { filter: "saturate(.78) contrast(1.04) brightness(1)" },
    ],
    { duration: mobile ? 1650 : 2200, easing: "ease-in-out" },
  );

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    haze.remove();
    heat.remove();
    restoreBox();
  };
  shimmer.onfinish = cleanup;
  shimmer.oncancel = cleanup;

  return [shimmer, ember, warmth];
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
    duration: 1550,
    play: ogneyaraFirelight,
  },
  {
    alt: "Образ персонажа Семаргл",
    minDelay: 6000,
    maxDelay: 12000,
    duration: 2200,
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
