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
  drift: number;
  rise: number;
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

const VORTEX: VortexParticle[] = Array.from({ length: 1350 }, (_, index) => {
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
  const base =
    sizeBand < 10 ? 0.48 + ((index * 7) % 8) * 0.11 :
    sizeBand < 17 ? 1.15 + ((index * 11) % 10) * 0.17 :
    2.65 + ((index * 13) % 10) * 0.31;

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
    width: base * (1.3 + (index % 6) * 0.22),
    height: base * (0.36 + (index % 5) * 0.1),
    opacity: 0.28 + ((index * 11) % 35) / 100,
    duration: 6.15 + ((index * 13) % 12) / 10,
    delay: ((index * 29) % 13) / 34,
  };
});

const IDLE: IdleParticle[] = Array.from({ length: 220 }, (_, index) => {
  const sizeBand = index % 12;
  const base =
    sizeBand < 7 ? 0.5 + ((index * 5) % 7) * 0.12 :
    sizeBand < 10 ? 1.1 + ((index * 7) % 6) * 0.17 :
    1.9 + ((index * 11) % 5) * 0.24;

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
    "--dust-drift": `${particle.drift}vw`,
    "--dust-rise": `${particle.rise}vh`,
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
