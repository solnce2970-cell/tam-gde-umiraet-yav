"use client";

import { useEffect } from "react";

const SOUND_SRC = "/sfx/morana-frost.mp3";
const VISUAL_MS = 10000;
const HOLD_BEFORE_START_MIN = 4000;
const HOLD_BEFORE_START_MAX = 6000;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeSvgEl<K extends keyof SVGElementTagNameMap>(name: K) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function addBranch(group: SVGGElement, x: number, y: number, angle: number, length: number, depth: number) {
  if (depth <= 0 || length < 5) return;

  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;
  const line = makeSvgEl("line");
  line.setAttribute("x1", String(x));
  line.setAttribute("y1", String(y));
  line.setAttribute("x2", String(x2));
  line.setAttribute("y2", String(y2));
  line.setAttribute("stroke", depth >= 3 ? "rgba(247,252,255,.95)" : "rgba(220,240,251,.82)");
  line.setAttribute("stroke-width", depth >= 3 ? "1.35" : ".9");
  line.setAttribute("stroke-linecap", "round");
  group.appendChild(line);

  const spread = 0.52 + Math.random() * 0.24;
  const next = length * (0.57 + Math.random() * 0.12);
  const branchStartX = x + (x2 - x) * (0.52 + Math.random() * 0.18);
  const branchStartY = y + (y2 - y) * (0.52 + Math.random() * 0.18);

  addBranch(group, x2, y2, angle + rand(-0.11, 0.11), next, depth - 1);
  addBranch(group, branchStartX, branchStartY, angle + spread, next * 0.72, depth - 1);
  addBranch(group, branchStartX, branchStartY, angle - spread, next * 0.72, depth - 1);
}

function addIceCluster(svg: SVGSVGElement, side: "top" | "right" | "bottom" | "left", width: number, height: number, index: number) {
  const group = makeSvgEl("g");
  group.setAttribute("data-frost-cluster", String(index));
  group.style.opacity = "0";
  group.style.filter = "drop-shadow(0 0 2px rgba(220,244,255,.55))";

  let x = 0;
  let y = 0;
  let angle = 0;
  let length = 24;

  if (side === "top") {
    x = rand(20, width - 20);
    y = rand(0, 7);
    angle = Math.PI / 2 + rand(-0.42, 0.42);
    length = rand(22, 54);
  } else if (side === "bottom") {
    x = rand(20, width - 20);
    y = height - rand(0, 7);
    angle = -Math.PI / 2 + rand(-0.42, 0.42);
    length = rand(22, 54);
  } else if (side === "left") {
    x = rand(18, height - 18);
    y = 0;
    const swap = x;
    x = rand(0, 7);
    y = swap;
    angle = rand(-0.42, 0.42);
    length = rand(20, 48);
  } else {
    y = rand(18, height - 18);
    x = width - rand(0, 7);
    angle = Math.PI + rand(-0.42, 0.42);
    length = rand(20, 48);
  }

  addBranch(group, x, y, angle, length, 4);
  svg.appendChild(group);
}

function buildLayer(width: number, height: number) {
  const layer = document.createElement("div");
  layer.dataset.moranaFrost = "true";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "absolute",
    inset: "0",
    zIndex: "12",
    pointerEvents: "none",
    opacity: "1",
    overflow: "hidden",
  });

  const edge = document.createElement("div");
  Object.assign(edge.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    boxShadow: [
      "inset 0 18px 24px -13px rgba(242,250,255,.96)",
      "inset 0 -18px 24px -13px rgba(242,250,255,.94)",
      "inset 18px 0 24px -13px rgba(235,247,255,.94)",
      "inset -18px 0 24px -13px rgba(235,247,255,.94)",
      "inset 0 0 0 2px rgba(231,246,255,.72)",
    ].join(","),
  });

  const cornerIce = document.createElement("div");
  Object.assign(cornerIce.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    background: [
      "radial-gradient(ellipse at 0 0, rgba(250,253,255,.98) 0 5%, rgba(225,242,252,.88) 8%, rgba(198,226,242,.5) 13%, transparent 22%)",
      "radial-gradient(ellipse at 100% 0, rgba(250,253,255,.98) 0 5%, rgba(225,242,252,.88) 8%, rgba(198,226,242,.5) 13%, transparent 22%)",
      "radial-gradient(ellipse at 0 100%, rgba(250,253,255,.98) 0 5%, rgba(225,242,252,.88) 8%, rgba(198,226,242,.5) 13%, transparent 22%)",
      "radial-gradient(ellipse at 100% 100%, rgba(250,253,255,.98) 0 5%, rgba(225,242,252,.88) 8%, rgba(198,226,242,.5) 13%, transparent 22%)",
    ].join(","),
    filter: "contrast(1.08)",
  });

  const svg = makeSvgEl("svg");
  svg.setAttribute("viewBox", `0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`);
  svg.setAttribute("preserveAspectRatio", "none");
  Object.assign(svg.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    overflow: "visible",
  });

  const sides: Array<"top" | "right" | "bottom" | "left"> = ["top", "right", "bottom", "left"];
  for (let i = 0; i < 24; i += 1) {
    addIceCluster(svg, sides[i % sides.length], width, height, i);
  }

  const sparkle = document.createElement("div");
  Object.assign(sparkle.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    background: [
      "radial-gradient(circle at 8% 12%, rgba(255,255,255,.98) 0 1px, transparent 2px)",
      "radial-gradient(circle at 91% 18%, rgba(255,255,255,.96) 0 1px, transparent 2px)",
      "radial-gradient(circle at 15% 84%, rgba(255,255,255,.94) 0 1px, transparent 2px)",
      "radial-gradient(circle at 86% 78%, rgba(255,255,255,.96) 0 1px, transparent 2px)",
      "radial-gradient(circle at 52% 5%, rgba(255,255,255,.94) 0 1px, transparent 2px)",
      "radial-gradient(circle at 4% 52%, rgba(255,255,255,.92) 0 1px, transparent 2px)",
    ].join(","),
  });

  layer.append(edge, cornerIce, svg, sparkle);
  return { layer, edge, cornerIce, svg, sparkle };
}

export default function MoranaFrost() {
  useEffect(() => {
    const card = document.querySelector<HTMLElement>('[data-god-name="Морана"]');
    if (!card) return;

    const portrait = card.querySelector<HTMLElement>(".godPortrait");
    const image = portrait?.querySelector<HTMLImageElement>("img");
    if (!portrait || !image) return;

    let timer: number | undefined;
    let active = false;
    let used = false;
    let audio: HTMLAudioElement | null = null;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };

    const run = () => {
      if (active || used) return;
      active = true;
      used = true;

      const rect = portrait.getBoundingClientRect();
      const { layer, edge, cornerIce, svg, sparkle } = buildLayer(rect.width, rect.height);
      portrait.appendChild(layer);

      image.animate(
        [
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
          { filter: "saturate(.72) contrast(1.08) brightness(.96)", offset: .18 },
          { filter: "saturate(.64) contrast(1.1) brightness(.94)", offset: .48 },
          { filter: "saturate(.78) contrast(1.05) brightness(.98)", offset: .78 },
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      edge.animate(
        [
          { opacity: 0 },
          { opacity: .92, offset: .16 },
          { opacity: 1, offset: .48 },
          { opacity: .62, offset: .76 },
          { opacity: 0 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      cornerIce.animate(
        [
          { opacity: 0, transform: "scale(1.08)" },
          { opacity: .96, transform: "scale(1)", offset: .2 },
          { opacity: 1, transform: "scale(1)", offset: .5 },
          { opacity: .48, transform: "scale(1.015)", offset: .8 },
          { opacity: 0, transform: "scale(1.04)" },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      const clusters = Array.from(svg.querySelectorAll<SVGGElement>("[data-frost-cluster]"));
      clusters.forEach((cluster, index) => {
        const delay = 180 + index * 42 + rand(0, 220);
        cluster.animate(
          [
            { opacity: 0, transform: "scale(.72)", transformOrigin: "center" },
            { opacity: 1, transform: "scale(1)", offset: .34 },
            { opacity: 1, transform: "scale(1)", offset: .62 },
            { opacity: 0, transform: "scale(1.025)" },
          ],
          { duration: VISUAL_MS - delay, delay, easing: "ease-in-out", fill: "forwards" },
        );
      });

      sparkle.animate(
        [
          { opacity: 0 },
          { opacity: .95, offset: .2 },
          { opacity: .72, offset: .52 },
          { opacity: 0, offset: 1 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      try {
        audio = new Audio(SOUND_SRC);
        audio.preload = "auto";
        audio.volume = 0.42;
        void audio.play().catch(() => {});
      } catch {
        // Visual anomaly remains functional if audio cannot start.
      }

      window.setTimeout(() => {
        layer.remove();
        if (audio) {
          audio.pause();
          audio = null;
        }
        active = false;
      }, VISUAL_MS + 120);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
        if (!visible) {
          clearTimer();
          return;
        }
        if (!used && !active && !timer) {
          timer = window.setTimeout(() => {
            timer = undefined;
            run();
          }, rand(HOLD_BEFORE_START_MIN, HOLD_BEFORE_START_MAX));
        }
      },
      { threshold: [0, 0.25, 0.55, 0.8] },
    );

    observer.observe(card);
    return () => {
      clearTimer();
      observer.disconnect();
      portrait.querySelectorAll("[data-morana-frost]").forEach((node) => node.remove());
      if (audio) audio.pause();
    };
  }, []);

  return null;
}
