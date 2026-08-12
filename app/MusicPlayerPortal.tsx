"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function MusicPlayerPortal() {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    setTarget(document.querySelector("#music .trackHero > div:last-child"));
  }, []);

  if (!target) return null;

  return createPortal(
    <div style={{ marginTop: "1.1rem", maxWidth: "560px" }}>
      <audio
        controls
        preload="metadata"
        aria-label="Ой, тонка межа"
        style={{ width: "100%", display: "block" }}
      >
        <source src="/music/oy-tonka-mezha.mp3" type="audio/mpeg" />
        Ваш браузер не поддерживает воспроизведение аудио.
      </audio>
    </div>,
    target,
  );
}
