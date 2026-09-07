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

const BURST: DustParticle[] = Array.from({ length: 260 }, (_, index) => ({
  x: (index * 47 + (index % 11) * 13 + 7) % 100,
  y: (index * 61 + (index % 17) * 9 + 3) % 100,
  dx: ((index * 29) % 120) - 60,
  dy: 24 + ((index * 17) % 72),
  size: 0.45 + ((index * 7) % 8) * 0.27,
  opacity: 0.12 + ((index * 11) % 24) / 100,
  duration: 6.4 + ((index * 19) % 44) / 10,
  delay: ((index * 31) % 15) / 22,
}));

const IDLE: DustParticle[] = Array.from({ length: 42 }, (_, index) => ({
  x: (index * 43 + 5) % 100,
  y: (index * 37 + 11) % 100,
  dx: ((index * 19) % 74) - 37,
  dy: 20 + ((index * 11) % 46),
  size: 0.45 + ((index * 5) % 5) * 0.25,
  opacity: 0.05 + ((index * 13) % 12) / 100,
  duration: 18 + ((index * 17) % 16),
  delay: 6 + ((index * 23) % 28),
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
