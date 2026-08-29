"use client";

import { useEffect, useRef } from "react";

type Cleanup = () => void;
type AmbientEffect = () => Cleanup | null;

const MIN_DELAY = 38000;
const MAX_DELAY = 72000;

function isBusy() {
  return Boolean(
    document.querySelector(
      'dialog[open], [role="dialog"], [data-sign-found-reveal], [data-anomaly-active="true"]',
    ),
  );
}

function findTextElement(selector: string, text: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(
    (element) => element.textContent?.trim() === text,
  );
}

function disappearingSvetoyaraName(): Cleanup | null {
  if (window.location.pathname !== "/") return null;

  const name = findTextElement(".characterCard h3", "Светояра");
  if (!name) return null;

  const previousTransition = name.style.transition;
  const previousOpacity = name.style.opacity;
  name.style.transition = "opacity .72s ease-in-out";

  requestAnimationFrame(() => {
    name.style.opacity = "0";
  });

  const timer = window.setTimeout(() => {
    name.style.opacity = previousOpacity || "1";
  }, 1450);

  const restoreTimer = window.setTimeout(() => {
    name.style.transition = previousTransition;
    name.style.opacity = previousOpacity;
  }, 2300);

  return () => {
    window.clearTimeout(timer);
    window.clearTimeout(restoreTimer);
    name.style.transition = previousTransition;
    name.style.opacity = previousOpacity;
  };
}

function foreignLetter(): Cleanup | null {
  if (window.location.pathname !== "/genealogy") return null;

  const names = Array.from(document.querySelectorAll<HTMLElement>(".godInfo h3")).filter(
    (element) => (element.textContent?.trim().length ?? 0) > 3,
  );
  if (!names.length) return null;

  const name = names[Math.floor(Math.random() * names.length)];
  const originalText = name.textContent ?? "";
  const letters = Array.from(originalText);
  if (letters.length < 4) return null;

  const index = Math.min(letters.length - 2, Math.max(1, Math.floor(letters.length / 2)));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shift = reducedMotion ? 1 : 3;

  name.textContent = "";
  letters.forEach((letter, letterIndex) => {
    const span = document.createElement("span");
    span.textContent = letter;
    if (letterIndex === index) {
      span.style.display = "inline-block";
      span.style.transform = `translate(${shift}px, -1px) rotate(${reducedMotion ? 0 : -3}deg)`;
      span.style.opacity = ".78";
      span.style.textShadow = "0 0 7px rgba(213,192,154,.28)";
      span.style.transition = "transform .25s ease, opacity .25s ease";
    }
    name.appendChild(span);
  });

  const timer = window.setTimeout(() => {
    name.textContent = originalText;
  }, 1400);

  return () => {
    window.clearTimeout(timer);
    name.textContent = originalText;
  };
}

function reverseDust(): Cleanup | null {
  if (window.location.pathname !== "/") return null;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".characterPortrait, .worldCard, .creatureImageWrap",
    ),
  ).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 100;
  });

  if (!candidates.length) return null;

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const rect = target.getBoundingClientRect();
  const layer = document.createElement("div");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  layer.className = "ambientReverseDust";
  layer.setAttribute("aria-hidden", "true");
  layer.style.left = `${Math.max(0, rect.left)}px`;
  layer.style.top = `${Math.max(0, rect.top)}px`;
  layer.style.width = `${Math.min(window.innerWidth - Math.max(0, rect.left), rect.width)}px`;
  layer.style.height = `${Math.min(window.innerHeight - Math.max(0, rect.top), rect.height)}px`;

  for (let i = 0; i < 12; i += 1) {
    const particle = document.createElement("i");
    particle.style.left = `${8 + Math.random() * 84}%`;
    particle.style.bottom = `${4 + Math.random() * 22}%`;
    particle.style.width = `${2 + Math.random() * 2.5}px`;
    particle.style.height = particle.style.width;
    particle.style.animationDelay = `${Math.random() * 500}ms`;
    particle.style.setProperty("--ambient-rise", `${reducedMotion ? 14 : 54 + Math.random() * 48}px`);
    particle.style.setProperty("--ambient-drift", `${-8 + Math.random() * 18}px`);
    layer.appendChild(particle);
  }

  document.body.appendChild(layer);
  const timer = window.setTimeout(() => layer.remove(), 3800);

  return () => {
    window.clearTimeout(timer);
    layer.remove();
  };
}

export default function AmbientAnomalies() {
  const cleanupRef = useRef<Cleanup | null>(null);

  useEffect(() => {
    let schedulerTimer: number | undefined;
    let disposed = false;

    const schedule = () => {
      if (disposed) return;
      const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
      schedulerTimer = window.setTimeout(run, delay);
    };

    const run = () => {
      cleanupRef.current?.();
      cleanupRef.current = null;

      if (document.hidden || isBusy()) {
        schedule();
        return;
      }

      const path = window.location.pathname;
      let effects: AmbientEffect[] = [];

      if (path === "/") {
        effects = [disappearingSvetoyaraName, reverseDust];
      } else if (path === "/genealogy") {
        effects = [foreignLetter];
      }

      if (effects.length) {
        const effect = effects[Math.floor(Math.random() * effects.length)];
        cleanupRef.current = effect();
      }

      schedule();
    };

    schedule();

    return () => {
      disposed = true;
      if (schedulerTimer) window.clearTimeout(schedulerTimer);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <style>{`
      .ambientReverseDust{
        position:fixed;
        z-index:1150;
        overflow:hidden;
        pointer-events:none;
        contain:layout paint;
      }
      .ambientReverseDust i{
        position:absolute;
        display:block;
        border-radius:50%;
        background:rgba(218,205,178,.72);
        box-shadow:0 0 7px rgba(218,205,178,.32);
        opacity:0;
        animation:ambientDustRise 3s ease-out forwards;
      }
      @keyframes ambientDustRise{
        0%{opacity:0;transform:translate3d(0,0,0) scale(.85)}
        18%{opacity:.78}
        72%{opacity:.5}
        100%{opacity:0;transform:translate3d(var(--ambient-drift),calc(-1 * var(--ambient-rise)),0) scale(1.08)}
      }

      @media(prefers-reduced-motion:reduce){
        .ambientReverseDust i{animation-duration:2s}
      }
    `}</style>
  );
}
