"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReadingAtmosphere.module.css";

const ENABLED_KEY = "yav-reading-atmosphere";
const VOLUME_KEY = "yav-reading-volume";

type VolumeMode = "quiet" | "medium";

function playPageTurn(volume: VolumeMode) {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const duration = 0.22;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      const t = i / data.length;
      const envelope = Math.sin(Math.PI * t) * (1 - t * 0.35);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1450;
    band.Q.value = 0.7;

    const high = ctx.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 260;

    const gain = ctx.createGain();
    const peak = volume === "medium" ? 0.09 : 0.045;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(band);
    band.connect(high);
    high.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
    source.onended = () => void ctx.close();
  } catch {
    // Audio is atmosphere, never a blocker for navigation.
  }
}

export default function ReadingAtmosphere() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState<VolumeMode>("quiet");

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem(ENABLED_KEY);
    const savedVolume = window.localStorage.getItem(VOLUME_KEY);
    if (savedEnabled === "off") setEnabled(false);
    if (savedEnabled === "on") setEnabled(true);
    if (savedVolume === "medium" || savedVolume === "quiet") setVolume(savedVolume);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.startsWith("/chitat")) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      if (enabled) playPageTurn(volume);
      window.setTimeout(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      }, enabled ? 105 : 0);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, volume, router]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    window.localStorage.setItem(ENABLED_KEY, next ? "on" : "off");
  };

  const toggleVolume = () => {
    const next: VolumeMode = volume === "quiet" ? "medium" : "quiet";
    setVolume(next);
    window.localStorage.setItem(VOLUME_KEY, next);
    if (enabled) playPageTurn(next);
  };

  return (
    <aside className={styles.controls} aria-label="Настройки атмосферы чтения">
      <button
        type="button"
        className={styles.button}
        aria-pressed={enabled}
        onClick={toggleEnabled}
        title="Включить или выключить атмосферные звуки читальни"
      >
        Атмосфера: {enabled ? "вкл" : "выкл"}
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={toggleVolume}
        disabled={!enabled}
        title="Громкость атмосферных звуков"
      >
        Звук: {volume === "quiet" ? "тихо" : "средне"}
      </button>
    </aside>
  );
}
