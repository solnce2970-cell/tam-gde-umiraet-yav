"use client";

import { useEffect } from "react";
import { hasSign, readAnomalyState, setThreeSongsProgress, unlockSign } from "../lib/anomalies/store";
import "./music.css";
import "./three-steps.css";

type Track = { id: string; title: string; note: string; src: string; cover: string };

type ThreeSongsState = {
  step: number;
  heard: Record<string, number>;
};

const THREE_SONGS = ["ogneyara", "auk", "dushnitsa"] as const;

const mainTrack: Track = { id: "oy-tonka-mezha", title: "Ой, тонка межа…", note: "Песня о Яви, Прави и Нави", src: "/music/tracks/oy-tonka-mezha.mp3", cover: "/music/covers/oy-tonka-mezha.webp" };
const tracks: Track[] = [
  { id: "neveyana", title: "Песня Невеяны", note: "Нежная лесная песнь", src: "/music/tracks/neveyana.mp3", cover: "/music/covers/neveyana.webp" },
  { id: "ogneyara", title: "Заговор Огнеяры", note: "Огонь, жалейка и белый голос", src: "/music/tracks/ogneyara.mp3", cover: "/music/covers/ogneyara.webp" },
  { id: "auk", title: "Песня Аука", note: "Короткая аукающая лесная песенка", src: "/music/tracks/auk.mp3", cover: "/music/covers/auk.webp" },
  { id: "morok", title: "Песня Морока", note: "Его голос мягче пуха, но сам он — лёд.", src: "/music/tracks/morok.mp3", cover: "/music/covers/morok.webp" },
  { id: "dushnitsa", title: "Песня Душницы", note: "Самая искренняя песня о любви к себе.", src: "/music/tracks/dushnitsa.mp3", cover: "/music/covers/dushnitsa.webp" },
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
  return readAnomalyState().progress.threeSongs;
}

function writeThreeSongs(state: ThreeSongsState) {
  setThreeSongsProgress(state);
}

function hasThreeStepsSign() {
  return hasSign("three-worlds");
}

function threeStepsBackground() {
  return window.matchMedia("(max-width: 720px)").matches
    ? "/images/za-mezhoy/uho-mobile.webp"
    : "/images/za-mezhoy/uho-desktop.webp";
}

function preloadThreeStepsBackground() {
  const image = new Image();
  image.src = threeStepsBackground();
}

function removeThreeStepsSign() {
  document.querySelector<HTMLElement>("[data-three-steps-sign]")?.remove();
  document.body.classList.remove("threeStepsOpen");
}

function showThreeStepsSign() {
  if (document.querySelector("[data-three-steps-sign]")) return;
  const scene = document.createElement("section");
  scene.dataset.threeStepsSign = "true";
  scene.className = "threeStepsScene";
  scene.setAttribute("role", "dialog");
  scene.setAttribute("aria-modal", "true");
  scene.setAttribute("aria-labelledby", "three-steps-title");
  scene.innerHTML = `
    <picture class="threeStepsPicture" aria-hidden="true">
      <source media="(max-width: 720px)" srcset="/images/za-mezhoy/uho-mobile.webp">
      <img src="/images/za-mezhoy/uho-desktop.webp" alt="">
    </picture>
    <div class="threeStepsShade" aria-hidden="true"></div>
    <div class="threeStepsFog threeStepsFogOne" aria-hidden="true"></div>
    <div class="threeStepsFog threeStepsFogTwo" aria-hidden="true"></div>
    <div class="threeStepsPulse" aria-hidden="true"></div>
    <div class="threeStepsRipples" aria-hidden="true">
      <i></i><i></i><i></i>
    </div>
    <div class="threeStepsContent">
      <small>Знак Межи</small>
      <h2 id="three-steps-title">Три песни</h2>
      <p>Огнеяра позвала.<br>Аук отозвался.<br>Душница запомнила.</p>
      <span>Три голоса легли в один след.</span>
      <button type="button">Вернуться к музыке</button>
    </div>
  `;
  const close = () => {
    scene.classList.add("threeStepsSceneClosing");
    window.setTimeout(removeThreeStepsSign, 650);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    document.removeEventListener("keydown", onKeyDown);
    close();
  };
  scene.querySelector("button")?.addEventListener("click", () => {
    document.removeEventListener("keydown", onKeyDown);
    close();
  }, { once: true });
  document.addEventListener("keydown", onKeyDown);
  document.body.classList.add("threeStepsOpen");
  document.body.append(scene);
  requestAnimationFrame(() => {
    scene.classList.add("threeStepsSceneVisible");
    scene.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  });
}

function markThreeStepsSign() {
  if (hasThreeStepsSign()) return;
  unlockSign("three-worlds");
  showThreeStepsSign();
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
        if (state.step === 2) preloadThreeStepsBackground();
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
    let previewTimer: number | undefined;
    if (new URLSearchParams(window.location.search).has("three-steps-preview")) {
      preloadThreeStepsBackground();
      previewTimer = window.setTimeout(showThreeStepsSign, 450);
    }
    return () => {
      stopThreeSongs();
      if (previewTimer) window.clearTimeout(previewTimer);
      removeThreeStepsSign();
    };
  }, []);
  return null;
}
