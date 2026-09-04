"use client";

import { useEffect } from "react";
import { SIGN_REVEAL_REQUEST_EVENT } from "../lib/anomalies/events";
import { addThreeSongsListening } from "../lib/anomalies/quest-state";
import { hasSign, readAnomalyState, setThreeSongsProgress, unlockSign } from "../lib/anomalies/store";
import "./music.css";

type Track = { id: string; title: string; note: string; src: string; cover: string };

type ThreeSongsState = {
  step: number;
  heard: Record<string, number>;
};

const mainTrack: Track = { id: "oy-tonka-mezha", title: "Ой, тонка межа…", note: "Песня о Яви, Прави и Нави", src: "/music/tracks/oy-tonka-mezha.mp3", cover: "/music/covers/oy-tonka-mezha.webp" };
const tracks: Track[] = [
  { id: "neveyana", title: "Песня Невеяны", note: "Нежная лесная песнь", src: "/music/tracks/neveyana.mp3", cover: "/music/covers/neveyana.webp" },
  { id: "ogneyara", title: "Заговор Огнеяры", note: "Огонь, жалейка и белый голос", src: "/music/tracks/ogneyara.mp3", cover: "/music/covers/ogneyara.webp" },
  { id: "auk", title: "Песня Аука", note: "Короткая аукающая лесная песенка", src: "/music/tracks/auk.mp3", cover: "/music/covers/auk.webp" },
  { id: "morok", title: "Песня Морока", note: "Его голос мягче масла, но сам он — лёд.", src: "/music/tracks/morok.mp3", cover: "/music/covers/morok.webp" },
  { id: "dushnitsa", title: "Песня Душницы", note: "Самая искренняя песня о любви к себе.", src: "/music/tracks/dushnitsa.mp3", cover: "/music/covers/dushnitsa.webp" },
];

function buildAudio(track: Track) {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
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
  return readAnomalyState().progress.threeSongs;
}

function writeThreeSongs(state: ThreeSongsState) {
  setThreeSongsProgress(state);
}

function hasThreeStepsSign() {
  return hasSign("three-worlds");
}

function markThreeStepsSign() {
  if (hasThreeStepsSign()) return;
  const result = unlockSign("three-worlds");
  if (!result.unlocked) return;
  window.requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent(SIGN_REVEAL_REQUEST_EVENT, { detail: { id: "three-worlds" } }));
  });
}

function setupThreeSongs(audios: HTMLAudioElement[]) {
  if (hasThreeStepsSign()) return () => {};

  const cleanups: Array<() => void> = [];

  audios.forEach((audio) => {
    const trackId = audio.dataset.yavTrackId;
    if (!trackId) return;
    let previousTime = audio.currentTime;
    let previousWallTime = performance.now();

    const resetClock = () => {
      previousTime = audio.currentTime;
      previousWallTime = performance.now();
    };

    const countListening = (allowPaused = false) => {
      const currentTime = audio.currentTime;
      const now = performance.now();
      const mediaDelta = currentTime - previousTime;
      const wallDelta = Math.max(0, (now - previousWallTime) / 1000);
      previousTime = currentTime;
      previousWallTime = now;

      if (
        (!allowPaused && audio.paused) ||
        audio.seeking ||
        !Number.isFinite(audio.duration) ||
        audio.duration <= 0 ||
        mediaDelta <= 0
      ) return;

      const maxCredibleDelta = Math.max(1.5, wallDelta * 1.5 + 0.75);
      if (mediaDelta > maxCredibleDelta) return;

      const current = readThreeSongs();
      const result = addThreeSongsListening(current, trackId, mediaDelta, audio.duration * 0.2);
      if (result.progress === current) return;
      writeThreeSongs(result.progress);
      if (result.completed) markThreeStepsSign();
    };

    const onTimeUpdate = () => countListening();
    const countBeforePause = () => countListening(true);

    audio.addEventListener("play", resetClock);
    audio.addEventListener("seeking", resetClock);
    audio.addEventListener("seeked", resetClock);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("pause", countBeforePause);
    audio.addEventListener("ended", countBeforePause);

    cleanups.push(() => {
      audio.removeEventListener("play", resetClock);
      audio.removeEventListener("seeking", resetClock);
      audio.removeEventListener("seeked", resetClock);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("pause", countBeforePause);
      audio.removeEventListener("ended", countBeforePause);
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
    heroCover.loading = "lazy";
    heroCover.decoding = "async";
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
      cover.loading = "lazy";
      cover.decoding = "async";
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
    const previewTimer = new URLSearchParams(window.location.search).has("three-steps-preview")
      ? window.setTimeout(markThreeStepsSign, 450)
      : undefined;
    return () => {
      stopThreeSongs();
      if (previewTimer) window.clearTimeout(previewTimer);
    };
  }, []);
  return null;
}
