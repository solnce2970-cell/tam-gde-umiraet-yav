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

/*
 * Огнеяра: JS больше ничего не рисует. Он только держит невидимый маркер
 * четыре секунды. CSS видит этот маркер и спокойно разжигает пламя снизу.
 */
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

/*
 * Семаргл: прежнее марево/тепловой фильтр удалены. Невидимая копия нужна
 * только как надёжный CSS-триггер: искры -> волк -> возврат человека.
 */
function semarglHeat(image: HTMLImageElement) {
  const box = portraitBox(image);
  if (!box) return [];

  const restoreBox = ensureRelative(box);
  const marker = image.cloneNode(false) as HTMLImageElement;
  marker.alt = "";
  marker.setAttribute("aria-hidden", "true");
  marker.src = SEMARGL_WOLF;
  box.appendChild(marker);

  const lifetime = box.animate(
    [{ outlineColor: "transparent" }, { outlineColor: "transparent" }],
    { duration: 2200, easing: "linear" },
  );

  removeOnEnd(lifetime, marker, restoreBox);
  return [lifetime];
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
