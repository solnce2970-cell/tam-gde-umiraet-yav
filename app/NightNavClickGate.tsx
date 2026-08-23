"use client";

import { useLayoutEffect } from "react";

function isNightWindow() {
  const hour = new Date().getHours();
  const preview = new URLSearchParams(window.location.search).has("nav-awake-preview");
  return hour >= 23 || hour < 5 || preview;
}

function isNavCard(target: Element) {
  return target.classList.contains("worldCard") && target.querySelector("h3")?.textContent?.trim() === "Навь";
}

export default function NightNavClickGate() {
  useLayoutEffect(() => {
    if (window.location.pathname !== "/" || !isNightWindow()) return;

    const NativeIntersectionObserver = window.IntersectionObserver;
    let nightCallback: IntersectionObserverCallback | null = null;
    let nightObserver: IntersectionObserver | null = null;
    let nightTarget: Element | null = null;
    let restored = false;
    let overlaySeen = false;
    let headingRestore: (() => void) | null = null;

    const restoreConstructor = () => {
      if (restored) return;
      restored = true;
      window.IntersectionObserver = NativeIntersectionObserver;
    };

    const PatchedIntersectionObserver = function (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      const observer = new NativeIntersectionObserver(callback, options);
      const nativeObserve = observer.observe.bind(observer);

      observer.observe = (target: Element) => {
        if (!nightCallback && isNavCard(target)) {
          nightCallback = callback;
          nightObserver = observer;
          nightTarget = target;
          return;
        }
        nativeObserve(target);
      };

      return observer;
    } as unknown as typeof IntersectionObserver;

    PatchedIntersectionObserver.prototype = NativeIntersectionObserver.prototype;
    window.IntersectionObserver = PatchedIntersectionObserver;

    const navCard = Array.from(document.querySelectorAll<HTMLElement>(".worldCard")).find(
      (card) => card.querySelector("h3")?.textContent?.trim() === "Навь",
    );

    if (!navCard) {
      restoreConstructor();
      return;
    }

    navCard.style.position = "relative";

    let light = navCard.querySelector<HTMLButtonElement>("[data-night-nav]");
    if (!light) {
      light = document.createElement("button");
      light.type = "button";
      light.dataset.nightNav = "true";
      light.setAttribute("aria-label", "Услышать Навь");
      light.title = "Навь не спит";
      Object.assign(light.style, {
        position: "absolute",
        right: "14px",
        top: "14px",
        width: "28px",
        height: "28px",
        padding: "0",
        border: "1px solid rgba(202,218,220,.28)",
        borderRadius: "50%",
        background:
          "radial-gradient(circle,rgba(231,242,239,.95) 0 8%,rgba(155,199,192,.5) 12% 25%,rgba(6,17,15,.82) 30% 100%)",
        boxShadow: "0 0 14px rgba(202,218,220,.5),0 0 34px rgba(152,198,191,.28)",
        zIndex: "6",
        cursor: "pointer",
      });
      navCard.appendChild(light);
    }

    const restoreHeading = () => {
      headingRestore?.();
      headingRestore = null;
    };

    const overlayObserver = new MutationObserver(() => {
      const overlay = document.querySelector("[data-nav-awakening]");
      if (overlay) {
        overlaySeen = true;
        return;
      }
      if (overlaySeen) {
        overlaySeen = false;
        restoreHeading();
      }
    });
    overlayObserver.observe(document.body, { childList: true });

    const suppressBrokenBorderWhileOpening = () => {
      const heading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
      if (!heading || headingRestore) return;
      const oldTransform = heading.style.transform;
      const oldTransition = heading.style.transition;
      heading.style.transition = "none";
      heading.style.transform = "translateY(-200vh)";
      headingRestore = () => {
        heading.style.transform = oldTransform;
        heading.style.transition = oldTransition;
      };
    };

    const fireNightScene = () => {
      if (!nightCallback || !nightObserver || !nightTarget) {
        restoreHeading();
        return;
      }
      const rect = nightTarget.getBoundingClientRect();
      const entry = {
        time: performance.now(),
        target: nightTarget,
        rootBounds: null,
        boundingClientRect: rect,
        intersectionRect: rect,
        isIntersecting: true,
        intersectionRatio: 1,
      } as IntersectionObserverEntry;
      nightCallback([entry], nightObserver);
    };

    const onClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      if (document.querySelector("[data-nav-awakening]")) return;

      suppressBrokenBorderWhileOpening();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fireNightScene();
          window.setTimeout(() => {
            if (!document.querySelector("[data-nav-awakening]")) restoreHeading();
          }, 700);
        });
      });
    };

    light.addEventListener("click", onClick, true);

    const restoreTimer = window.setTimeout(restoreConstructor, 1800);

    return () => {
      window.clearTimeout(restoreTimer);
      restoreConstructor();
      light?.removeEventListener("click", onClick, true);
      overlayObserver.disconnect();
      restoreHeading();
    };
  }, []);

  return null;
}
