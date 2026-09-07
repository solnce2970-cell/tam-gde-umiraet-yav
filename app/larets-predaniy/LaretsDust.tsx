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
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

type IdleParticle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
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

const VORTEX: VortexParticle[] = Array.from({ length: 360 }, (_, index) => {
  const angle = ((index * 137.508) % 360) * (Math.PI / 180);
  const radiusX = 13 + ((index * 17) % 53);
  const radiusY = 8 + ((index * 19) % 39);
  const direction = index % 5 === 0 ? -1 : 1;

  const p0 = point(angle, radiusX, radiusY);
  const p1 = point(angle + direction * 1.25, radiusX * 0.94, radiusY * 0.92);
  const p2 = point(angle + direction * 2.55, radiusX * 0.78, radiusY * 0.76);
  const p3 = point(angle + direction * 4.05, radiusX * 0.96, radiusY * 0.9);
  const p4 = point(angle + direction * 5.45, radiusX * 1.22, radiusY * 1.12);

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
    size: 0.55 + ((index * 7) % 9) * 0.22,
    opacity: 0.16 + ((index * 11) % 27) / 100,
    duration: 6.1 + ((index * 13) % 8) / 10,
    delay: ((index * 29) % 8) / 24,
  };
});

const IDLE: IdleParticle[] = Array.from({ length: 30 }, (_, index) => ({
  x: 4 + ((index * 43 + 7) % 92),
  y: 6 + ((index * 37 + 13) % 88),
  dx: ((index * 19) % 110) - 55,
  dy: ((index * 23) % 54) - 27,
  size: 0.45 + ((index * 5) % 6) * 0.22,
  opacity: 0.05 + ((index * 13) % 10) / 100,
  duration: 18 + ((index * 17) % 15),
  delay: 6.7 + ((index * 23) % 19) * 0.85,
}));

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
    "--dust-size": `${particle.size}px`,
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
    "--dust-size": `${particle.size}px`,
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
