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
  }, []);

  return null;
}
