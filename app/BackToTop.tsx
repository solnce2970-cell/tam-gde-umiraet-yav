"use client";

import { useEffect, useState } from "react";

const MEZHA_SESSION_KEY = "mezha-session";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.sessionStorage.getItem(MEZHA_SESSION_KEY)) {
        window.sessionStorage.setItem(
          MEZHA_SESSION_KEY,
          JSON.stringify({ count: 0, max: 2, seen: [], last: null }),
        );
      }
    } catch {}

    const onScroll = () => setVisible(window.scrollY > 650);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Наверх сайта"
      title="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        right: "clamp(16px, 2.4vw, 34px)",
        bottom: "clamp(16px, 2.4vw, 34px)",
        zIndex: 900,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "1px solid rgba(213,192,154,.55)",
        background: "rgba(10,14,11,.88)",
        color: "#d5c09a",
        boxShadow: "0 10px 35px rgba(0,0,0,.35)",
        cursor: "pointer",
        fontSize: 23,
        lineHeight: 1,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity .22s ease, transform .22s ease, background .22s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      ↑
    </button>
  );
}
