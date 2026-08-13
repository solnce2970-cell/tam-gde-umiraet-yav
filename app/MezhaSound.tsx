"use client";

import { useEffect } from "react";

export default function MezhaSound() {
  useEffect(() => {
    const audio = new Audio("/sfx/mezha-whisper.mp3");
    audio.preload = "auto";
    audio.volume = 0.42;

    let fired = false;
    let armed = false;

    const unlock = () => {
      if (armed) return;
      armed = true;
      const volume = audio.volume;
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
      }).catch(() => {
        audio.volume = volume;
      });
    };

    const trigger = () => {
      if (fired || window.scrollY < 850) return;
      fired = true;
      audio.currentTime = 0;
      audio.volume = 0.42;
      audio.play().catch(() => {});
    };

    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("scroll", trigger, { passive: true });
    trigger();

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("scroll", trigger);
      audio.pause();
    };
  }, []);

  return null;
}
