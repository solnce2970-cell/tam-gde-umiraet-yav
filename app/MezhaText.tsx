"use client";

import { useEffect, useState } from "react";

export default function MezhaText() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let fired = false;
    const show = () => {
      if (fired || window.scrollY < 850) return;
      fired = true;
      setVisible(true);
      window.setTimeout(() => setVisible(false), 5200);
    };
    window.addEventListener("scroll", show, { passive: true });
    show();
    return () => window.removeEventListener("scroll", show);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        zIndex: 2400,
        right: "7vw",
        top: "39%",
        pointerEvents: "none",
        fontFamily: "MonomakhYav, Georgia, serif",
        fontSize: "clamp(22px,2.3vw,32px)",
        letterSpacing: ".05em",
        color: "rgba(238,239,234,.98)",
        textShadow: "0 1px 4px rgba(5,8,7,.95), 0 0 22px rgba(225,230,228,.45)",
      }}
    >
      Межа стала тоньше.
    </div>
  );
}
