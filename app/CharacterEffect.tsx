"use client";

import { useEffect } from "react";

const OPEN = "/images/characters/morok-open.webp";
const CLOSED = "/images/characters/morok-closed.webp";
const STARS = "/images/characters/morok-stars.webp";

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

  return null;
}
