"use client";

import { useEffect, useState } from "react";

const KEY = "mezha-session";
const EVENT = "thin-mezha";

export default function MezhaEffect() {
  const [active, setActive] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0 || window.scrollY / maxScroll < 0.42) return;

      try {
        const raw = sessionStorage.getItem(KEY);
        const state = raw ? JSON.parse(raw) : { count: 0, max: 2, seen: [], last: null };
        if (state.count >= state.max || state.seen.includes(EVENT)) {
          fired = true;
          return;
        }
        state.count += 1;
        state.seen.push(EVENT);
        state.last = EVENT;
        sessionStorage.setItem(KEY, JSON.stringify(state));
      } catch {}

      fired = true;
      setActive(true);
      setTextVisible(true);
      window.setTimeout(() => setTextVisible(false), 2600);
      window.setTimeout(() => setActive(false), 7600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!active) return null;

  return (
    <div className="mezhaEffect" aria-hidden="true">
      <style>{`
        .mezhaEffect{position:fixed;inset:0;z-index:850;pointer-events:none;overflow:hidden}
        .mezhaText{position:absolute;right:6vw;top:42%;font-family:BlagovestYav,Georgia,serif;font-size:clamp(18px,2vw,28px);letter-spacing:.05em;color:rgba(224,225,219,.9);text-shadow:0 0 18px rgba(220,225,224,.25);opacity:0;transform:translateY(8px);transition:opacity 1s ease,transform 1s ease}
        .mezhaText.show{opacity:1;transform:none}
        .mezhaFog{position:absolute;left:-18%;right:-18%;bottom:-10%;height:58%;opacity:.55;filter:blur(18px);background:radial-gradient(ellipse at 18% 74%,rgba(211,216,213,.28),transparent 42%),radial-gradient(ellipse at 55% 82%,rgba(199,205,204,.25),transparent 45%),radial-gradient(ellipse at 86% 68%,rgba(222,224,219,.2),transparent 40%);animation:mezhaFogMove 7.6s ease-out forwards}
        .mezhaFog::after{content:"";position:absolute;inset:12% -8% -8%;background:radial-gradient(ellipse at 64% 74%,rgba(210,215,214,.18),transparent 44%),radial-gradient(ellipse at 30% 78%,rgba(225,226,220,.14),transparent 38%);animation:mezhaFogDrift 6s ease-in-out infinite alternate}
        @keyframes mezhaFogMove{0%{opacity:0;transform:translate3d(-4%,12%,0) scale(.96)}18%{opacity:.52}68%{opacity:.46}100%{opacity:0;transform:translate3d(5%,-3%,0) scale(1.06)}}
        @keyframes mezhaFogDrift{from{transform:translateX(-3%)}to{transform:translateX(4%)}}
        @media(max-width:720px){.mezhaText{right:7vw;top:38%;font-size:19px}.mezhaFog{height:48%;opacity:.38;filter:blur(22px)}}
        @media(prefers-reduced-motion:reduce){.mezhaFog,.mezhaFog::after{animation:none}.mezhaFog{opacity:.22}.mezhaText{transition:opacity .3s ease}}
      `}</style>
      <div className={`mezhaText ${textVisible ? "show" : ""}`}>Межа стала тоньше.</div>
      <div className="mezhaFog" />
    </div>
  );
}
