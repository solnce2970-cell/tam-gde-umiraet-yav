"use client";

import { useEffect } from "react";

export default function MezhaSound() {
  useEffect(() => {
    const audio = new Audio("/sfx/mezha-whisper.mp3");
    audio.preload = "auto";
    audio.volume = 0.55;

    let fired = false;
    let armed = false;
    let pending = false;

    const playSound = () => {
      if (fired) return;
      audio.currentTime = 0;
      audio.volume = 0.55;
      const result = audio.play();
      if (result) {
        result.then(() => {
          fired = true;
          pending = false;
        }).catch(() => {
          pending = true;
        });
      }
    };

    const unlock = () => {
      if (armed) {
        if (pending && window.scrollY >= 850) playSound();
        return;
      }

      armed = true;

      if (window.scrollY >= 850 || pending) {
        playSound();
        return;
      }

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
      if (!armed) {
        pending = true;
        return;
      }
      playSound();
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
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
