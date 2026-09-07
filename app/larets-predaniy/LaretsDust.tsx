"use client";

import type { CSSProperties } from "react";
import "./larets-dust.css";

type DustParticle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

const BURST: DustParticle[] = Array.from({ length: 120 }, (_, index) => ({
  x: (index * 37 + 11) % 100,
  y: (index * 23 + 7) % 94,
  dx: ((index * 17) % 54) - 27,
  dy: 28 + ((index * 13) % 54),
  size: 1.1 + ((index * 7) % 6) * 0.55,
  opacity: 0.3 + ((index * 11) % 46) / 100,
  duration: 5.4 + ((index * 19) % 34) / 10,
  delay: ((index * 29) % 11) / 14,
}));

const IDLE: DustParticle[] = Array.from({ length: 22 }, (_, index) => ({
  x: (index * 43 + 5) % 100,
  y: 8 + ((index * 31) % 74),
  dx: ((index * 19) % 46) - 23,
  dy: 18 + ((index * 11) % 34),
  size: 0.8 + ((index * 5) % 4) * 0.45,
  opacity: 0.09 + ((index * 13) % 18) / 100,
  duration: 16 + ((index * 17) % 13),
  delay: 5 + ((index * 23) % 24),
}));

function particleStyle(particle: DustParticle): CSSProperties {
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
      <div className="laretsDustBurst">
        {BURST.map((particle, index) => (
          <i key={`burst-${index}`} style={particleStyle(particle)} />
        ))}
      </div>
      <div className="laretsDustIdle">
        {IDLE.map((particle, index) => (
          <i key={`idle-${index}`} style={particleStyle(particle)} />
        ))}
      </div>
    </div>
  );
}
