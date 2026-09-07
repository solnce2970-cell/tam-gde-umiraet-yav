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

const VORTEX: VortexParticle[] = Array.from({ length: 760 }, (_, index) => {
  const angle = ((index * 137.508) % 360) * (Math.PI / 180);
  const radiusX = 8 + ((index * 17) % 68);
  const radiusY = 6 + ((index * 19) % 50);
  const direction = index % 6 === 0 ? -1 : 1;

  const p0 = point(angle, radiusX, radiusY);
  const p1 = point(angle + direction * 1.2, radiusX * 0.9, radiusY * 0.9);
  const p2 = point(angle + direction * 2.55, radiusX * 0.68, radiusY * 0.68);
  const p3 = point(angle + direction * 4.05, radiusX * 1.02, radiusY * 0.96);
  const p4 = point(angle + direction * 5.6, radiusX * 1.34, radiusY * 1.22);

  const sizeBand = index % 12;
  const base =
    sizeBand < 4 ? 0.55 + ((index * 7) % 7) * 0.12 :
    sizeBand < 9 ? 1.15 + ((index * 11) % 9) * 0.16 :
    2.4 + ((index * 13) % 8) * 0.28;

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
    width: base * (1.35 + (index % 5) * 0.2),
    height: base * (0.38 + (index % 4) * 0.11),
    opacity: 0.22 + ((index * 11) % 30) / 100,
    duration: 6.2 + ((index * 13) % 11) / 10,
    delay: ((index * 29) % 11) / 30,
  };
});

const IDLE: IdleParticle[] = Array.from({ length: 46 }, (_, index) => {
  const sizeBand = index % 8;
  const base = sizeBand < 5
    ? 0.55 + ((index * 5) % 6) * 0.14
    : 1.35 + ((index * 7) % 5) * 0.2;

  return {
    x: 3 + ((index * 43 + 7) % 94),
    y: 6 + ((index * 37 + 13) % 88),
    dx: ((index * 19) % 130) - 65,
    dy: ((index * 23) % 66) - 33,
    width: base * (1.35 + (index % 4) * 0.17),
    height: base * (0.42 + (index % 3) * 0.1),
    opacity: 0.07 + ((index * 13) % 10) / 100,
    duration: 20 + ((index * 17) % 17),
    delay: 6.8 + ((index * 23) % 18) * 0.85,
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
