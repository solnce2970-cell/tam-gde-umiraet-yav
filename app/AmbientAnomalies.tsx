"use client";

import { useEffect, useRef } from "react";

type Cleanup = () => void;
type AmbientEffect = () => Cleanup | null;

const MIN_DELAY = 38000;
const MAX_DELAY = 72000;
const VASILISK_CAT_SESSION_KEY = "ambient.vasilisk-cat-revenge.v1";

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

function isVasiliskVisible() {
  return Array.from(
    document.querySelectorAll<HTMLImageElement>(
      'img[src="/images/navnik/vasilisk.webp"]',
    ),
  ).some((image) => {
    const rect = image.getBoundingClientRect();

    return (
      rect.width > 100 &&
      rect.height > 100 &&
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    );
  });
}

export default function AmbientAnomalies() {
  function vasiliskCatRevenge(): Cleanup | null {
    if (window.location.pathname !== "/") return null;

    if (sessionStorage.getItem(VASILISK_CAT_SESSION_KEY) === "1") {
      return null;
    }

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        'img[src="/images/navnik/vasilisk.webp"]',
      ),
    );

    const image = images.find((candidate) => {
      const rect = candidate.getBoundingClientRect();

      return (
        rect.width > 100 &&
        rect.height > 100 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    });

    if (!image) return null;

    const audio = new Audio("/sfx/vasilisk-meow.mp3");
    audio.volume = 0.52;
    audio.preload = "auto";

    let layer: HTMLDivElement | null = null;
    let removeTimer: number | undefined;
    let cancelled = false;

    const showClaws = () => {
      if (cancelled) {
        audio.pause();
        return;
      }

      const rect = image.getBoundingClientRect();

      layer = document.createElement("div");
      layer.className = "ambientVasiliskClaws";
      layer.setAttribute("aria-hidden", "true");

      layer.style.left = `${rect.left}px`;
      layer.style.top = `${rect.top}px`;
      layer.style.width = `${rect.width}px`;
      layer.style.height = `${rect.height}px`;

      const clawProfiles = [
        { y: "24%", left: "12%", length: "40%", angle: "13deg", delay: "0ms" },
        { y: "36%", left: "9%", length: "72%", angle: "14deg", delay: "35ms" },
        { y: "48%", left: "11%", length: "58%", angle: "15deg", delay: "70ms" },
        { y: "60%", left: "14%", length: "47%", angle: "16deg", delay: "105ms" },
      ];

      clawProfiles.forEach((profile) => {
        const claw = document.createElement("i");

        claw.style.setProperty("--claw-y", profile.y);
        claw.style.setProperty("--claw-left", profile.left);
        claw.style.setProperty("--claw-length", profile.length);
        claw.style.setProperty("--claw-angle", profile.angle);
        claw.style.setProperty("--claw-delay", profile.delay);

        layer?.appendChild(claw);
      });

      document.body.appendChild(layer);
      sessionStorage.setItem(VASILISK_CAT_SESSION_KEY, "1");

      removeTimer = window.setTimeout(() => {
        layer?.remove();
        layer = null;
      }, 1800);
    };

    audio
      .play()
      .then(showClaws)
      .catch(() => {
        // Browser has not allowed audio yet. Do not consume the anomaly.
      });

    return () => {
      cancelled = true;

      if (removeTimer) {
        window.clearTimeout(removeTimer);
      }

      layer?.remove();
      layer = null;

      audio.pause();
      audio.currentTime = 0;
    };
  }

  const cleanupRef = useRef<Cleanup | null>(null);
  const vasiliskCleanupRef = useRef<Cleanup | null>(null);

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

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let triggerTimer: number | undefined;
    let disposed = false;

    const clearTrigger = () => {
      if (triggerTimer) {
        window.clearTimeout(triggerTimer);
        triggerTimer = undefined;
      }
    };

    const arm = () => {
      if (disposed) return;

      const alreadyUsed =
        sessionStorage.getItem(VASILISK_CAT_SESSION_KEY) === "1";

      if (alreadyUsed) {
        clearTrigger();
        return;
      }

      if (document.hidden || isBusy() || !isVasiliskVisible()) {
        clearTrigger();
        return;
      }

      if (triggerTimer) return;

      const delay = 4000 + Math.random() * 6000;
      triggerTimer = window.setTimeout(() => {
        triggerTimer = undefined;

        if (
          disposed ||
          document.hidden ||
          isBusy() ||
          !isVasiliskVisible() ||
          sessionStorage.getItem(VASILISK_CAT_SESSION_KEY) === "1"
        ) {
          arm();
          return;
        }

        vasiliskCleanupRef.current?.();
        vasiliskCleanupRef.current = vasiliskCatRevenge();

        // If autoplay blocked the sound, the anomaly was not consumed.
        // Re-arm while the Vasilisk remains visible.
        window.setTimeout(() => {
          if (
            !disposed &&
            sessionStorage.getItem(VASILISK_CAT_SESSION_KEY) !== "1"
          ) {
            arm();
          }
        }, 1200);
      }, delay);
    };

    const handleViewportChange = () => {
      if (!isVasiliskVisible()) {
        clearTrigger();
      }
      arm();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearTrigger();
      } else {
        arm();
      }
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", arm);
    document.addEventListener("visibilitychange", handleVisibility);

    arm();

    return () => {
      disposed = true;
      clearTrigger();
      vasiliskCleanupRef.current?.();
      vasiliskCleanupRef.current = null;
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
      document.removeEventListener("visibilitychange", handleVisibility);
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

      .ambientVasiliskClaws{
        position:fixed;
        z-index:1160;
        overflow:hidden;
        pointer-events:none;
        contain:layout paint;
      }

      .ambientVasiliskClaws i{
        --claw-y:30%;
        --claw-left:20%;
        --claw-delay:0ms;
        --claw-length:52%;
        --claw-angle:-19deg;

        position:absolute;
        left:var(--claw-left);
        top:var(--claw-y);
        width:var(--claw-length);
        height:6px;
        display:block;
        opacity:0;
        transform:rotate(var(--claw-angle)) scaleX(.03);
        transform-origin:left center;

        background:
          linear-gradient(
            180deg,
            rgba(220,228,223,.18) 0%,
            rgba(229,235,231,.92) 18%,
            rgba(18,20,19,.98) 42%,
            rgba(8,10,9,.98) 60%,
            rgba(195,207,201,.68) 78%,
            rgba(195,207,201,0) 100%
          );

        clip-path:polygon(
          0% 48%,
          7% 26%,
          18% 40%,
          31% 18%,
          43% 38%,
          57% 22%,
          71% 42%,
          84% 29%,
          100% 50%,
          83% 68%,
          69% 57%,
          55% 78%,
          41% 60%,
          28% 80%,
          14% 61%,
          4% 72%
        );

        box-shadow:0 1px 2px rgba(0,0,0,.8);
        filter:drop-shadow(0 0 2px rgba(210,226,218,.34));

        animation:
          ambientVasiliskScratch 1.55s
          cubic-bezier(.18,.8,.2,1)
          var(--claw-delay)
          forwards;
      }

      .ambientVasiliskClaws i::after{
        content:"";
        position:absolute;
        left:8%;
        top:1px;
        width:84%;
        height:1px;
        background:rgba(236,241,238,.52);
        opacity:.6;
      }

      @keyframes ambientVasiliskScratch{
        0%{
          opacity:0;
          transform:rotate(var(--claw-angle)) scaleX(.03);
        }
        9%{opacity:.98}
        22%{
          opacity:1;
          transform:rotate(var(--claw-angle)) scaleX(1);
        }
        67%{
          opacity:.94;
          transform:rotate(var(--claw-angle)) scaleX(1);
        }
        100%{
          opacity:0;
          transform:rotate(var(--claw-angle)) scaleX(1.01);
        }
      }

      @media(prefers-reduced-motion:reduce){
        .ambientReverseDust i{animation-duration:2s}
        .ambientVasiliskClaws i{
          animation-duration:1.2s;
          transform:rotate(var(--claw-angle)) scaleX(1);
        }
      }
    `}</style>
  );
}
