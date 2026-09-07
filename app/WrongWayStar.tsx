"use client";

import { useEffect } from "react";
import { unlockSign } from "../lib/anomalies/store";

function heroIsVisible(hero: HTMLElement) {
  const rect = hero.getBoundingClientRect();
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return visibleHeight > 0 && visibleHeight / Math.max(1, rect.height) >= 0.45;
}

export default function WrongWayStar() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const preview = new URLSearchParams(window.location.search).has("wrong-star-preview");

    const hero = document.querySelector<HTMLElement>(".hero");
    const field = hero?.querySelector<HTMLElement>(".heroSparks");
    if (!hero || !field) return;

    let timer: number | undefined;
    let unlockTimer: number | undefined;
    let animation: Animation | null = null;
    let disposed = false;
    let armed = false;
    let playedThisLoad = false;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };

    const clearUnlockTimer = () => {
      if (unlockTimer) window.clearTimeout(unlockTimer);
      unlockTimer = undefined;
    };

    const clearAnimation = () => {
      animation?.cancel();
      animation = null;
      clearUnlockTimer();
    };

    const chooseStar = () => {
      const stars = Array.from(field.querySelectorAll<HTMLElement>("i")).filter((star) => {
        const style = getComputedStyle(star);
        const rect = star.getBoundingClientRect();
        return style.display !== "none" && rect.width > 0 && rect.height > 0;
      });
      if (!stars.length) return null;
      return stars[Math.floor(Math.random() * stars.length)];
    };

    const play = () => {
      timer = undefined;
      if (disposed || playedThisLoad || document.hidden || !heroIsVisible(hero)) {
        arm();
        return;
      }

      const star = chooseStar();
      if (!star) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      const x = mobile ? -(28 + Math.random() * 30) : -(55 + Math.random() * 65);
      const y = mobile ? -(42 + Math.random() * 38) : -(72 + Math.random() * 65);
      const duration = reducedMotion ? 850 : 1550;

      // Двигаем именно одну из уже существующих звёзд. Свойство translate
      // не ломает её штатное мерцание, которое живёт в CSS transform.
      animation = star.animate(
        [
          { translate: "0 0", offset: 0 },
          { translate: `${x * 0.15}px ${y * 0.12}px`, offset: 0.16 },
          { translate: `${x}px ${y}px`, offset: 0.68 },
          { translate: `${x * 1.08}px ${y * 1.08}px`, offset: 0.82 },
          { translate: "0 0", offset: 1 },
        ],
        {
          duration,
          easing: "cubic-bezier(.2,.72,.24,1)",
        },
      );

      playedThisLoad = true;

      // Записываем знак только после того, как аномальное движение уже
      // стало заметно. Это одинаково работает на desktop и mobile.
      unlockTimer = window.setTimeout(() => {
        unlockTimer = undefined;
        if (disposed || document.hidden || !heroIsVisible(hero) || !animation) return;
        unlockSign("morok-stars");
      }, Math.round(duration * 0.72));

      animation.onfinish = () => {
        animation = null;
      };
      animation.oncancel = () => {
        animation = null;
        clearUnlockTimer();
      };
    };

    const arm = () => {
      if (disposed || armed || playedThisLoad) return;
      if (document.hidden || !heroIsVisible(hero)) return;

      armed = true;
      const delay = preview ? 700 : 4500 + Math.random() * 5500;
      timer = window.setTimeout(() => {
        armed = false;
        play();
      }, delay);
    };

    const resetIfHidden = () => {
      if (!heroIsVisible(hero) || document.hidden) {
        clearTimer();
        armed = false;
        clearAnimation();
        return;
      }
      arm();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) arm();
        else resetIfHidden();
      },
      { threshold: [0, 0.45, 0.7] },
    );

    observer.observe(hero);
    window.addEventListener("resize", resetIfHidden);
    document.addEventListener("visibilitychange", resetIfHidden);
    arm();

    return () => {
      disposed = true;
      clearTimer();
      clearUnlockTimer();
      clearAnimation();
      observer.disconnect();
      window.removeEventListener("resize", resetIfHidden);
      document.removeEventListener("visibilitychange", resetIfHidden);
    };
  }, []);

  return null;
}
