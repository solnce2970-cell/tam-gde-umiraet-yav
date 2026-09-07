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

const BURST: DustParticle[] = Array.from({ length: 170 }, (_, index) => {
  const cluster = index % 3;
  const baseX = cluster === 0 ? 42 : cluster === 1 ? 54 : 49;
  const baseY = cluster === 0 ? 63 : cluster === 1 ? 69 : 58;
  const spreadX = ((index * 37) % 33) - 16;
  const spreadY = ((index * 23) % 24) - 12;

  return {
    x: Math.max(18, Math.min(82, baseX + spreadX)),
    y: Math.max(42, Math.min(82, baseY + spreadY)),
    dx: ((index * 17) % 86) - 43,
    dy: 34 + ((index * 13) % 64),
    size: 0.65 + ((index * 7) % 6) * 0.42,
    opacity: 0.14 + ((index * 11) % 24) / 100,
    duration: 5.8 + ((index * 19) % 35) / 10,
    delay: ((index * 29) % 12) / 18,
  };
});

const IDLE: DustParticle[] = Array.from({ length: 22 }, (_, index) => ({
  x: (index * 43 + 5) % 100,
  y: 8 + ((index * 31) % 74),
  dx: ((index * 19) % 46) - 23,
  dy: 18 + ((index * 11) % 34),
  size: 0.65 + ((index * 5) % 4) * 0.36,
  opacity: 0.06 + ((index * 13) % 12) / 100,
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
