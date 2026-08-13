"use client";

import { useEffect } from "react";
import "./music.css";

type Track = { id: string; title: string; note: string; src: string; cover: string };

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
  }, []);
  return null;
}
