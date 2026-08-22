"use client";

import { useEffect, useState, type CSSProperties } from "react";
import ClientLayer from "./ClientLayer";

export default function BackToTop() {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const updateControls = () => {
      const pageBottom = document.documentElement.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;

      setCanScrollUp(window.scrollY > 160);
      setCanScrollDown(viewportBottom < pageBottom - 80);
    };

    updateControls();
    window.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, []);

  const buttonStyle = (visible: boolean): CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid rgba(213,192,154,.55)",
    background: "rgba(10,14,11,.88)",
    color: "#d5c09a",
    boxShadow: "0 10px 35px rgba(0,0,0,.35)",
    cursor: visible ? "pointer" : "default",
    fontSize: 23,
    lineHeight: 1,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity .22s ease, transform .22s ease, background .22s ease",
    backdropFilter: "blur(8px)",
  });

  return (
    <>
      <ClientLayer />
      <div
        style={{
          position: "fixed",
          right: "clamp(16px, 2.4vw, 34px)",
          bottom: "clamp(16px, 2.4vw, 34px)",
          zIndex: 900,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          type="button"
          aria-label="Наверх сайта"
          title="Наверх"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={buttonStyle(canScrollUp)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Вниз сайта"
          title="Вниз"
          onClick={() =>
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
          }
          style={buttonStyle(canScrollDown)}
        >
          ↓
        </button>
      </div>
    </>
  );
}
