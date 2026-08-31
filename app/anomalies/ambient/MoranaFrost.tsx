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

type Side = "top" | "right" | "bottom" | "left";

type Root = {
  x: number;
  y: number;
  angle: number;
  maxDepth: number;
  maxLength: number;
};

function makeRoot(side: Side, width: number, height: number): Root {
  if (side === "top") {
    return {
      x: rand(12, Math.max(13, width - 12)),
      y: rand(0, 3),
      angle: Math.PI / 2 + rand(-0.28, 0.28),
      maxDepth: 3,
      maxLength: rand(13, 26),
    };
  }
  if (side === "bottom") {
    return {
      x: rand(12, Math.max(13, width - 12)),
      y: height - rand(0, 3),
      angle: -Math.PI / 2 + rand(-0.28, 0.28),
      maxDepth: 3,
      maxLength: rand(13, 26),
    };
  }
  if (side === "left") {
    return {
      x: rand(0, 3),
      y: rand(12, Math.max(13, height - 12)),
      angle: rand(-0.28, 0.28),
      maxDepth: 3,
      maxLength: rand(12, 24),
    };
  }
  return {
    x: width - rand(0, 3),
    y: rand(12, Math.max(13, height - 12)),
    angle: Math.PI + rand(-0.28, 0.28),
    maxDepth: 3,
    maxLength: rand(12, 24),
  };
}

function addCrystal(
  group: SVGGElement,
  x: number,
  y: number,
  angle: number,
  length: number,
  depth: number,
) {
  if (depth <= 0 || length < 4) return;

  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;
  const line = makeSvgEl("line");
  line.setAttribute("x1", String(x));
  line.setAttribute("y1", String(y));
  line.setAttribute("x2", String(x2));
  line.setAttribute("y2", String(y2));
  line.setAttribute("stroke", depth === 3 ? "rgba(249,253,255,.96)" : "rgba(222,241,252,.82)");
  line.setAttribute("stroke-width", depth === 3 ? "1.15" : ".78");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("pathLength", "1");
  line.style.strokeDasharray = "1";
  line.style.strokeDashoffset = "1";
  group.appendChild(line);

  const next = length * rand(0.5, 0.62);
  const split = rand(0.48, 0.66);
  const sx = x + (x2 - x) * split;
  const sy = y + (y2 - y) * split;
  const spread = rand(0.48, 0.7);

  addCrystal(group, x2, y2, angle + rand(-0.08, 0.08), next, depth - 1);
  addCrystal(group, sx, sy, angle + spread, next * 0.72, depth - 1);
  addCrystal(group, sx, sy, angle - spread, next * 0.72, depth - 1);
}

function addEdgeCluster(
  svg: SVGSVGElement,
  side: Side,
  width: number,
  height: number,
  index: number,
) {
  const root = makeRoot(side, width, height);
  const group = makeSvgEl("g");
  group.dataset.frostCluster = String(index);
  group.dataset.side = side;
  group.style.opacity = "0";
  group.style.filter = "drop-shadow(0 0 1.4px rgba(223,245,255,.72))";
  addCrystal(group, root.x, root.y, root.angle, root.maxLength, root.maxDepth);
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
    overflow: "hidden",
  });

  const coldEdge = document.createElement("div");
  Object.assign(coldEdge.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    background: [
      "linear-gradient(180deg, rgba(248,252,255,.96) 0%, rgba(225,241,250,.78) 3%, rgba(199,226,241,.32) 7%, transparent 13%)",
      "linear-gradient(0deg, rgba(248,252,255,.96) 0%, rgba(225,241,250,.78) 3%, rgba(199,226,241,.32) 7%, transparent 13%)",
      "linear-gradient(90deg, rgba(248,252,255,.94) 0%, rgba(225,241,250,.74) 3%, rgba(199,226,241,.3) 7%, transparent 13%)",
      "linear-gradient(270deg, rgba(248,252,255,.94) 0%, rgba(225,241,250,.74) 3%, rgba(199,226,241,.3) 7%, transparent 13%)",
    ].join(","),
    boxShadow: "inset 0 0 0 1px rgba(241,250,255,.8)",
  });

  const roughEdge = document.createElement("div");
  Object.assign(roughEdge.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    background: [
      "radial-gradient(ellipse at 0 0, rgba(255,255,255,.98) 0 4%, rgba(226,243,252,.78) 8%, transparent 17%)",
      "radial-gradient(ellipse at 100% 0, rgba(255,255,255,.98) 0 4%, rgba(226,243,252,.78) 8%, transparent 17%)",
      "radial-gradient(ellipse at 0 100%, rgba(255,255,255,.98) 0 4%, rgba(226,243,252,.78) 8%, transparent 17%)",
      "radial-gradient(ellipse at 100% 100%, rgba(255,255,255,.98) 0 4%, rgba(226,243,252,.78) 8%, transparent 17%)",
      "repeating-radial-gradient(circle at 0 50%, rgba(255,255,255,.62) 0 1px, transparent 1.5px 6px)",
      "repeating-radial-gradient(circle at 100% 50%, rgba(255,255,255,.58) 0 1px, transparent 1.5px 7px)",
    ].join(","),
    filter: "contrast(1.12)",
  });

  const svg = makeSvgEl("svg");
  svg.setAttribute("viewBox", `0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`);
  svg.setAttribute("preserveAspectRatio", "none");
  Object.assign(svg.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  });

  const sides: Side[] = ["top", "right", "bottom", "left"];
  for (let i = 0; i < 32; i += 1) {
    addEdgeCluster(svg, sides[i % sides.length], width, height, i);
  }

  const glitter = document.createElement("div");
  Object.assign(glitter.style, {
    position: "absolute",
    inset: "0",
    opacity: "0",
    background: [
      "radial-gradient(circle at 3% 20%, rgba(255,255,255,.96) 0 1px, transparent 1.8px)",
      "radial-gradient(circle at 97% 28%, rgba(255,255,255,.96) 0 1px, transparent 1.8px)",
      "radial-gradient(circle at 8% 91%, rgba(255,255,255,.92) 0 1px, transparent 1.8px)",
      "radial-gradient(circle at 92% 84%, rgba(255,255,255,.92) 0 1px, transparent 1.8px)",
      "radial-gradient(circle at 24% 2%, rgba(255,255,255,.94) 0 1px, transparent 1.8px)",
      "radial-gradient(circle at 76% 98%, rgba(255,255,255,.94) 0 1px, transparent 1.8px)",
    ].join(","),
  });

  layer.append(coldEdge, roughEdge, svg, glitter);
  return { layer, coldEdge, roughEdge, svg, glitter };
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
      const { layer, coldEdge, roughEdge, svg, glitter } = buildLayer(rect.width, rect.height);
      portrait.appendChild(layer);

      image.animate(
        [
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
          { filter: "saturate(.78) contrast(1.05) brightness(.98)", offset: .2 },
          { filter: "saturate(.7) contrast(1.08) brightness(.96)", offset: .62 },
          { filter: "saturate(.76) contrast(1.05) brightness(.98)", offset: .84 },
          { filter: "saturate(.88) contrast(1.03) brightness(1)" },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      coldEdge.animate(
        [
          { opacity: 0 },
          { opacity: .76, offset: .1 },
          { opacity: 1, offset: .44 },
          { opacity: 1, offset: .72 },
          { opacity: .45, offset: .9 },
          { opacity: 0 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      roughEdge.animate(
        [
          { opacity: 0 },
          { opacity: .5, offset: .14 },
          { opacity: .92, offset: .5 },
          { opacity: .88, offset: .74 },
          { opacity: 0 },
        ],
        { duration: VISUAL_MS, easing: "ease-in-out", fill: "forwards" },
      );

      const clusters = Array.from(svg.querySelectorAll<SVGGElement>("[data-frost-cluster]"));
      clusters.forEach((cluster, index) => {
        const delay = 500 + index * 55 + rand(0, 260);
        const lines = Array.from(cluster.querySelectorAll<SVGLineElement>("line"));
        cluster.animate(
          [
            { opacity: 0 },
            { opacity: .98, offset: .12 },
            { opacity: .98, offset: .72 },
            { opacity: 0 },
          ],
          { duration: Math.max(1200, VISUAL_MS - delay), delay, easing: "ease-in-out", fill: "forwards" },
        );
        lines.forEach((line, lineIndex) => {
          line.animate(
            [
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, offset: .38 },
              { strokeDashoffset: 0, offset: .8 },
              { strokeDashoffset: 1 },
            ],
            {
              duration: Math.max(1100, VISUAL_MS - delay - lineIndex * 18),
              delay: lineIndex * 18,
              easing: "ease-out",
              fill: "forwards",
            },
          );
        });
      });

      glitter.animate(
        [
          { opacity: 0 },
          { opacity: .72, offset: .22 },
          { opacity: .92, offset: .58 },
          { opacity: .5, offset: .78 },
          { opacity: 0 },
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
