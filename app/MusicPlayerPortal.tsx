"use client";

import { useEffect } from "react";
import "./music.css";

type Track = { id: string; title: string; note: string; src: string; cover: string };

type ThreeSongsState = {
  step: number;
  heard: Record<string, number>;
};

const ANOMALY_KEY = "yav-anomalies-v1";
const THREE_SONGS_KEY = "yav-three-songs-path-v1";
const THREE_SONGS = ["ogneyara", "auk", "dushnitsa"] as const;

const mainTrack: Track = { id: "oy-tonka-mezha", title: "Ой, тонка межа…", note: "Песня о Яви, Прави и Нави", src: "/music/tracks/oy-tonka-mezha.mp3", cover: "/music/covers/oy-tonka-mezha.webp" };
const tracks: Track[] = [
  { id: "neveyana", title: "Песня Невеяны", note: "Нежная лесная песнь", src: "/music/tracks/neveyana.mp3", cover: "/music/covers/neveyana.webp" },
  { id: "ogneyara", title: "Заговор Огнеяры", note: "Огонь, жалейка и белый голос", src: "/music/tracks/ogneyara.mp3", cover: "/music/covers/ogneyara.webp" },
  { id: "auk", title: "Песня Аука", note: "Короткая аукающая лесная песенка", src: "/music/tracks/auk.mp3", cover: "/music/covers/auk.webp" },
  { id: "morok", title: "Песня Морока", note: "Песня Морока", src: "/music/tracks/morok.mp3", cover: "/music/covers/morok.webp" },
  { id: "dushnitsa", title: "Песня Душницы", note: "Песня Душницы", src: "/music/tracks/dushnitsa.mp3", cover: "/music/covers/dushnitsa.webp" },
];

function buildAudio(track: Track) {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "metadata";
  audio.setAttribute("aria-label", track.title);
  audio.dataset.yavTrackId = track.id;
  const source = document.createElement("source");
  source.src = track.src;
  source.type = "audio/mpeg";
  audio.append(source);
  audio.addEventListener("play", () => {
    document.querySelectorAll<HTMLAudioElement>("#music audio").forEach((other) => {
      if (other !== audio && !other.paused) other.pause();
    });
  });
  return audio;
}

function readThreeSongs(): ThreeSongsState {
  try {
    const raw = window.localStorage.getItem(THREE_SONGS_KEY);
    if (!raw) return { step: 0, heard: {} };
    const parsed = JSON.parse(raw) as Partial<ThreeSongsState>;
    return {
      step: Math.max(0, Math.min(THREE_SONGS.length, Number(parsed.step) || 0)),
      heard: parsed.heard && typeof parsed.heard === "object" ? parsed.heard : {},
    };
  } catch {
    return { step: 0, heard: {} };
  }
}

function writeThreeSongs(state: ThreeSongsState) {
  try {
    window.localStorage.setItem(THREE_SONGS_KEY, JSON.stringify(state));
  } catch {}
}

function hasThreeStepsSign() {
  try {
    const raw = window.localStorage.getItem(ANOMALY_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { found?: unknown };
    return Array.isArray(parsed.found) && parsed.found.includes("three-worlds");
  } catch {
    return false;
  }
}

function showThreeStepsSign() {
  if (document.querySelector("[data-three-steps-sign]")) return;
  const notice = document.createElement("aside");
  notice.dataset.threeStepsSign = "true";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  notice.innerHTML = `
    <small>Знак Межи</small>
    <strong>Три шага</strong>
    <span>Огнеяра позвала. Аук отозвался. Душница запомнила.</span>
  `;
  Object.assign(notice.style, {
    position: "fixed",
    zIndex: "4200",
    right: "clamp(14px,3vw,38px)",
    bottom: "clamp(14px,3vw,34px)",
    display: "grid",
    width: "min(390px,calc(100vw - 28px))",
    gap: "7px",
    padding: "20px 22px",
    border: "1px solid rgba(193,160,101,.42)",
    background: "linear-gradient(135deg,rgba(21,17,12,.97),rgba(6,11,9,.97))",
    boxShadow: "0 18px 70px rgba(0,0,0,.62),inset 0 0 34px rgba(178,130,61,.08)",
    color: "#e9dfca",
    opacity: "0",
    transform: "translateY(18px)",
    transition: "opacity .7s ease,transform .7s ease",
    pointerEvents: "none",
  });
  const small = notice.querySelector<HTMLElement>("small")!;
  const strong = notice.querySelector<HTMLElement>("strong")!;
  const span = notice.querySelector<HTMLElement>("span")!;
  Object.assign(small.style, {
    color: "rgba(202,170,111,.8)",
    font: "600 10px/1.2 Arial,sans-serif",
    letterSpacing: ".2em",
    textTransform: "uppercase",
  });
  Object.assign(strong.style, {
    font: "400 32px/1.05 MonomakhYav,Georgia,serif",
    letterSpacing: ".02em",
  });
  Object.assign(span.style, {
    color: "rgba(232,222,202,.78)",
    font: "italic 400 14px/1.5 Georgia,serif",
  });
  document.body.append(notice);
  requestAnimationFrame(() => {
    notice.style.opacity = "1";
    notice.style.transform = "translateY(0)";
  });
  window.setTimeout(() => {
    notice.style.opacity = "0";
    notice.style.transform = "translateY(12px)";
    window.setTimeout(() => notice.remove(), 750);
  }, 6200);
}

function markThreeStepsSign() {
  if (hasThreeStepsSign()) return;
  try {
    const raw = window.localStorage.getItem(ANOMALY_KEY);
    const state = raw ? JSON.parse(raw) : {};
    const found = Array.isArray(state.found) ? [...new Set(state.found)] : [];
    found.push("three-worlds");
    state.found = found;
    window.localStorage.setItem(ANOMALY_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("yav:anomaly-found", { detail: { id: "three-worlds", count: found.length } }));
    showThreeStepsSign();
  } catch {}
}

function setupThreeSongs(audios: HTMLAudioElement[]) {
  if (hasThreeStepsSign()) return () => {};

  const cleanups: Array<() => void> = [];

  audios.forEach((audio) => {
    const trackId = audio.dataset.yavTrackId;
    if (!trackId) return;
    let previousTime = audio.currentTime;

    const resetClock = () => {
      previousTime = audio.currentTime;
    };

    const countListening = () => {
      const currentTime = audio.currentTime;
      const delta = currentTime - previousTime;
      previousTime = currentTime;
      if (audio.paused || audio.seeking || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      if (delta <= 0 || delta > 2) return;

      const state = readThreeSongs();
      const expectedTrack = THREE_SONGS[state.step];
      if (!expectedTrack || trackId !== expectedTrack) return;

      const heard = Math.max(0, Number(state.heard[trackId]) || 0) + delta;
      const required = audio.duration * 0.2;
      state.heard = { ...state.heard, [trackId]: heard };

      if (heard >= required) {
        state.step += 1;
        state.heard = {};
        if (state.step >= THREE_SONGS.length) {
          writeThreeSongs(state);
          markThreeStepsSign();
          return;
        }
      }
      writeThreeSongs(state);
    };

    audio.addEventListener("play", resetClock);
    audio.addEventListener("seeked", resetClock);
    audio.addEventListener("timeupdate", countListening);
    cleanups.push(() => {
      audio.removeEventListener("play", resetClock);
      audio.removeEventListener("seeked", resetClock);
      audio.removeEventListener("timeupdate", countListening);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

export default function MusicPlayerPortal() {
  useEffect(() => {
    const heroInfo = document.querySelector<HTMLElement>("#music .trackHero > div:last-child");
    const vinyl = document.querySelector<HTMLElement>("#music .vinyl");
    const list = document.querySelector<HTMLElement>("#music .trackList");
    if (!heroInfo || !vinyl || !list) return;

    const heroCover = document.createElement("img");
    heroCover.className = "musicHeroCover";
    heroCover.src = mainTrack.cover;
    heroCover.alt = `Обложка: ${mainTrack.title}`;
    vinyl.replaceChildren(heroCover);

    heroInfo.querySelectorAll(".musicHeroPlayer").forEach((node) => node.remove());
    const heroPlayer = document.createElement("div");
    heroPlayer.className = "musicHeroPlayer";
    heroPlayer.append(buildAudio(mainTrack));
    heroInfo.append(heroPlayer);

    const grid = document.createElement("div");
    grid.className = "musicTrackGrid";
    tracks.forEach((track) => {
      const card = document.createElement("article");
      card.className = "musicTrackCard";
      const cover = document.createElement("img");
      cover.className = "musicTrackCover";
      cover.src = track.cover;
      cover.alt = `Обложка: ${track.title}`;
      const info = document.createElement("div");
      info.className = "musicTrackInfo";
      const label = document.createElement("small");
      label.textContent = "Песня из мира романа";
      const title = document.createElement("h3");
      title.textContent = track.title;
      const note = document.createElement("p");
      note.textContent = track.note;
      info.append(label, title, note, buildAudio(track));
      card.append(cover, info);
      grid.append(card);
    });
    list.replaceChildren(grid);

    const stopThreeSongs = setupThreeSongs(
      Array.from(document.querySelectorAll<HTMLAudioElement>("#music audio[data-yav-track-id]")),
    );
    return stopThreeSongs;
  }, []);
  return null;
}
