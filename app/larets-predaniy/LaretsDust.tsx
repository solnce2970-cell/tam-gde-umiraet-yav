"use client";

import type { CSSProperties } from "react";
import "./larets-dust.css";

type VortexParticle = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
};

type IdleParticle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
};

function point(angle: number, radiusX: number, radiusY: number) {
  return {
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY,
  };
}

const VORTEX: VortexParticle[] = Array.from({ length: 420 }, (_, index) => {
  const angle = ((index * 137.508) % 360) * (Math.PI / 180);
  const radiusX = 16 + ((index * 17) % 58);
  const radiusY = 10 + ((index * 19) % 43);
  const direction = index % 5 === 0 ? -1 : 1;

  const p0 = point(angle, radiusX, radiusY);
  const p1 = point(angle + direction * 1.15, radiusX * 0.9, radiusY * 0.88);
  const p2 = point(angle + direction * 2.45, radiusX * 0.72, radiusY * 0.7);
  const p3 = point(angle + direction * 3.9, radiusX * 0.98, radiusY * 0.92);
  const p4 = point(angle + direction * 5.3, radiusX * 1.28, radiusY * 1.16);
  const base = 0.9 + ((index * 7) % 9) * 0.24;

  return {
    x0: p0.x,
    y0: p0.y,
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
    x3: p3.x,
    y3: p3.y,
    x4: p4.x,
    y4: p4.y,
    width: base * (1.6 + (index % 4) * 0.18),
    height: base * (0.48 + (index % 3) * 0.09),
    opacity: 0.24 + ((index * 11) % 24) / 100,
    duration: 6.0 + ((index * 13) % 9) / 10,
    delay: ((index * 29) % 8) / 26,
  };
});

const IDLE: IdleParticle[] = Array.from({ length: 36 }, (_, index) => {
  const base = 0.7 + ((index * 5) % 6) * 0.2;
  return {
    x: 4 + ((index * 43 + 7) % 92),
    y: 8 + ((index * 37 + 13) % 84),
    dx: ((index * 19) % 120) - 60,
    dy: ((index * 23) % 58) - 29,
    width: base * (1.45 + (index % 3) * 0.16),
    height: base * (0.46 + (index % 2) * 0.1),
    opacity: 0.08 + ((index * 13) % 9) / 100,
    duration: 19 + ((index * 17) % 15),
    delay: 6.7 + ((index * 23) % 17) * 0.9,
  };
});

function vortexStyle(particle: VortexParticle): CSSProperties {
  return {
    "--dust-x0": `${particle.x0}vw`,
    "--dust-y0": `${particle.y0}vh`,
    "--dust-x1": `${particle.x1}vw`,
    "--dust-y1": `${particle.y1}vh`,
    "--dust-x2": `${particle.x2}vw`,
    "--dust-y2": `${particle.y2}vh`,
    "--dust-x3": `${particle.x3}vw`,
    "--dust-y3": `${particle.y3}vh`,
    "--dust-x4": `${particle.x4}vw`,
    "--dust-y4": `${particle.y4}vh`,
    "--dust-width": `${particle.width}px`,
    "--dust-height": `${particle.height}px`,
    "--dust-opacity": particle.opacity,
    "--dust-duration": `${particle.duration}s`,
    "--dust-delay": `${particle.delay}s`,
  } as CSSProperties;
}

function idleStyle(particle: IdleParticle): CSSProperties {
  return {
    "--dust-x": `${particle.x}%`,
    "--dust-y": `${particle.y}%`,
    "--dust-dx": `${particle.dx}px`,
    "--dust-dy": `${particle.dy}px`,
    "--dust-width": `${particle.width}px`,
    "--dust-height": `${particle.height}px`,
    "--dust-opacity": particle.opacity,
    "--dust-duration": `${particle.duration}s`,
    "--dust-delay": `${particle.delay}s`,
  } as CSSProperties;
}

export default function LaretsDust() {
  return (
    <div className="laretsDust" aria-hidden="true">
      <div className="laretsDustVortex">
        {VORTEX.map((particle, index) => (
          <i key={`vortex-${index}`} style={vortexStyle(particle)} />
        ))}
      </div>
      <div className="laretsDustIdle">
        {IDLE.map((particle, index) => (
          <i key={`idle-${index}`} style={idleStyle(particle)} />
        ))}
      </div>
    </div>
  );
}
