"use client";

import { useEffect, useState } from "react";

const KEY = "mezha-session";
const EVENT = "thin-mezha-v3";

export default function MezhaMist() {
  const [shown, setShown] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    let fired = false;
    const trigger = () => {
      if (fired || window.scrollY < 850) return;
      try {
        const raw = sessionStorage.getItem(KEY);
        const state = raw ? JSON.parse(raw) : { count: 0, max: 2, seen: [], last: null };
        if (state.seen.includes(EVENT)) { fired = true; return; }
        state.count = Math.min((state.count || 0) + 1, state.max || 2);
        state.seen = [...(state.seen || []), EVENT];
        state.last = EVENT;
        sessionStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
      fired = true;
      setShown(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setMoving(true)));
      window.setTimeout(() => setShown(false), 8200);
    };
    window.addEventListener("scroll", trigger, { passive: true });
    trigger();
    return () => window.removeEventListener("scroll", trigger);
  }, []);

  if (!shown) return null;

  const fog = (left: string, bottom: string, width: string, delay: string) => ({
    position: "absolute" as const,
    left,
    bottom,
    width,
    height: "30vh",
    borderRadius: "50%",
    background: "rgba(220,225,222,.28)",
    filter: "blur(48px)",
    opacity: moving ? 0 : 0.72,
    transform: moving ? "translate(12vw,-8vh) scale(1.22)" : "translate(0,5vh) scale(.95)",
    transition: `opacity 8s ease ${delay}, transform 8s ease ${delay}`,
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2200, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
      <div style={{ position: "absolute", right: "7vw", top: "39%", fontFamily: "MonomakhYav, Georgia, serif", fontSize: "clamp(22px,2.3vw,32px)", letterSpacing: ".05em", color: "rgba(236,237,232,.96)", textShadow: "0 0 24px rgba(220,228,226,.35)", opacity: moving ? 0 : 1, transform: moving ? "translateY(-6px)" : "translateY(0)", transition: "opacity 3.2s ease 2.2s, transform 3.2s ease 2.2s" }}>Межа стала тоньше.</div>
      <div style={fog("-12vw", "-4vh", "60vw", "0s")} />
      <div style={fog("28vw", "-8vh", "58vw", ".3s")} />
      <div style={fog("70vw", "0vh", "46vw", ".6s")} />
    </div>
  );
}
