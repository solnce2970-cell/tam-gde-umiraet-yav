"use client";

import { useEffect, useRef } from "react";
import "./larets-dust.css";

type VortexParticle = {
  x0: number; y0: number; x1: number; y1: number; x2: number; y2: number;
  x3: number; y3: number; x4: number; y4: number;
  width: number; height: number; opacity: number; duration: number; delay: number;
  color: string; colorAlpha: number;
};

type IdleParticle = {
  x: number; y: number; drift: number; rise: number;
  width: number; height: number; opacity: number; duration: number; delay: number;
  color: string; colorAlpha: number;
};

function point(angle: number, radiusX: number, radiusY: number) {
  return { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
}

const VORTEX: VortexParticle[] = Array.from({ length: 1350 }, (_, index) => {
  const child = index + 1;
  const angle = ((index * 137.508) % 360) * (Math.PI / 180);
  const radiusX = 6 + ((index * 17) % 76);
  const radiusY = 5 + ((index * 19) % 56);
  const direction = index % 7 === 0 ? -1 : 1;
  const p0 = point(angle, radiusX, radiusY);
  const p1 = point(angle + direction * 1.22, radiusX * 0.92, radiusY * 0.9);
  const p2 = point(angle + direction * 2.58, radiusX * 0.7, radiusY * 0.7);
  const p3 = point(angle + direction * 4.08, radiusX * 1.04, radiusY * 0.98);
  const p4 = point(angle + direction * 5.62, radiusX * 1.38, radiusY * 1.26);
  const sizeBand = index % 20;
  const base = sizeBand < 10
    ? 0.48 + ((index * 7) % 8) * 0.11
    : sizeBand < 17
      ? 1.15 + ((index * 11) % 10) * 0.17
      : 2.65 + ((index * 13) % 10) * 0.31;
  const gold = child % 5 === 0;
  const shadow = !gold && child % 3 === 0;

  return {
    x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
    x3: p3.x, y3: p3.y, x4: p4.x, y4: p4.y,
    width: base * (1.3 + (index % 6) * 0.22),
    height: base * (0.36 + (index % 5) * 0.1),
    opacity: 0.28 + ((index * 11) % 35) / 100,
    duration: 6.15 + ((index * 13) % 12) / 10,
    delay: ((index * 29) % 13) / 34,
    color: gold ? "rgb(187 162 120)" : shadow ? "rgb(126 110 87)" : "rgb(161 140 108)",
    colorAlpha: gold ? 0.47 : shadow ? 0.52 : 0.58,
  };
});

const IDLE: IdleParticle[] = Array.from({ length: 220 }, (_, index) => {
  const child = index + 1;
  const sizeBand = index % 12;
  const base = sizeBand < 7
    ? 0.5 + ((index * 5) % 7) * 0.12
    : sizeBand < 10
      ? 1.1 + ((index * 7) % 6) * 0.17
      : 1.9 + ((index * 11) % 5) * 0.24;
  const dark = child % 5 === 0;
  const light = !dark && child % 3 === 0;

  return {
    x: 1 + ((index * 43 + 7) % 98),
    y: 38 + ((index * 37 + 13) % 68),
    drift: ((index * 19) % 22) - 11,
    rise: 72 + ((index * 23) % 58),
    width: base * (1.3 + (index % 5) * 0.16),
    height: base * (0.38 + (index % 4) * 0.09),
    opacity: 0.09 + ((index * 13) % 11) / 100,
    duration: 13 + ((index * 17) % 10),
    delay: 6.1 + ((index * 23) % 13) * 0.2,
    color: dark ? "rgb(126 112 90)" : light ? "rgb(181 158 118)" : "rgb(155 137 107)",
    colorAlpha: dark ? 0.42 : light ? 0.4 : 0.46,
  };
});

function between(a: number, b: number, progress: number) {
  return a + (b - a) * progress;
}

function segment(progress: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

function drawVortexParticle(
  context: CanvasRenderingContext2D,
  particle: VortexParticle,
  progress: number,
  width: number,
  height: number,
) {
  let x: number;
  let y: number;
  let rotation: number;
  let scale: number;
  if (progress < 0.28) {
    const t = segment(progress, 0, 0.28);
    x = between(particle.x0, particle.x1, t); y = between(particle.y0, particle.y1, t);
    rotation = between(-12, 18, t); scale = between(0.72, 0.92, t);
  } else if (progress < 0.52) {
    const t = segment(progress, 0.28, 0.52);
    x = between(particle.x1, particle.x2, t); y = between(particle.y1, particle.y2, t);
    rotation = between(18, -8, t); scale = between(0.92, 1, t);
  } else if (progress < 0.76) {
    const t = segment(progress, 0.52, 0.76);
    x = between(particle.x2, particle.x3, t); y = between(particle.y2, particle.y3, t);
    rotation = between(-8, 16, t); scale = between(1, 1.04, t);
  } else {
    const t = segment(progress, 0.76, 1);
    x = between(particle.x3, particle.x4, t); y = between(particle.y3, particle.y4, t);
    rotation = between(16, -6, t); scale = between(1.04, 1.08, t);
  }

  drawParticle(context, width * 0.5 + (x / 100) * width, height * 0.54 + (y / 100) * height, particle.width * scale, particle.height * scale, rotation, particle.color, vortexOpacity(particle, progress) * particle.colorAlpha);
}

function vortexOpacity(particle: VortexParticle, progress: number) {
  if (progress < 0.07) return particle.opacity * segment(progress, 0, 0.07);
  if (progress < 0.52) return particle.opacity;
  if (progress < 0.76) return between(particle.opacity, 0.12, segment(progress, 0.52, 0.76));
  return 0.12 * (1 - segment(progress, 0.76, 1));
}

function drawIdleParticle(
  context: CanvasRenderingContext2D,
  particle: IdleParticle,
  progress: number,
  width: number,
  height: number,
) {
  let dx: number;
  let dy: number;
  let rotation: number;
  let scale: number;
  if (progress < 0.34) {
    const t = segment(progress, 0, 0.34);
    dx = between(0, particle.drift * 0.34, t); dy = between(8, particle.rise * -0.34, t);
    rotation = between(-5, 4, t); scale = between(0.84, 0.96, t);
  } else if (progress < 0.68) {
    const t = segment(progress, 0.34, 0.68);
    dx = between(particle.drift * 0.34, particle.drift * 0.72, t); dy = between(particle.rise * -0.34, particle.rise * -0.72, t);
    rotation = between(4, -3, t); scale = between(0.96, 1.02, t);
  } else {
    const t = segment(progress, 0.68, 1);
    dx = between(particle.drift * 0.72, particle.drift, t); dy = between(particle.rise * -0.72, -particle.rise, t);
    rotation = between(-3, 6, t); scale = between(1.02, 1.05, t);
  }

  drawParticle(context, (particle.x / 100) * width + (dx / 100) * width, (particle.y / 100) * height + (dy / 100) * height, particle.width * scale, particle.height * scale, rotation, particle.color, idleOpacity(particle, progress) * particle.colorAlpha);
}

function idleOpacity(particle: IdleParticle, progress: number) {
  if (progress < 0.1) return particle.opacity * segment(progress, 0, 0.1);
  if (progress < 0.34) return particle.opacity;
  if (progress < 0.68) return between(particle.opacity, particle.opacity * 0.78, segment(progress, 0.34, 0.68));
  if (progress < 0.88) return between(particle.opacity * 0.78, particle.opacity * 0.36, segment(progress, 0.68, 0.88));
  return particle.opacity * 0.36 * (1 - segment(progress, 0.88, 1));
}

function drawParticle(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rotation: number, color: string, opacity: number) {
  if (opacity <= 0) return;
  context.save();
  context.translate(x, y);
  context.rotate(rotation * (Math.PI / 180));
  context.fillStyle = color;
  context.globalAlpha = opacity;
  context.beginPath();
  context.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export default function LaretsDust() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    const startedAt = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      const elapsed = (now - startedAt) / 1000;
      const mobile = width <= 760;

      if (elapsed < 8) {
        for (let index = 0; index < VORTEX.length; index += 1) {
          if (mobile && (index + 1) % 3 === 0) continue;
          const particle = VORTEX[index];
          const progress = (elapsed - particle.delay) / particle.duration;
          if (progress < 0 || progress > 1) continue;
          drawVortexParticle(context, particle, progress, width, height);
        }
      }

      for (let index = 0; index < IDLE.length; index += 1) {
        if (mobile && (index + 1) % 4 === 0) continue;
        const particle = IDLE[index];
        const local = elapsed - particle.delay;
        if (local < 0) continue;
        const progress = (local % particle.duration) / particle.duration;
        drawIdleParticle(context, particle, progress, width, height);
      }

      frame = requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <div className="laretsDust" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
