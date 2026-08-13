"use client";

import "./music.css";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Track = {
  id: string;
  title: string;
  note: string;
  src: string;
  cover: string;
};

const mainTrack: Track = {
  id: "oy-tonka-mezha",
  title: "Ой, тонка межа…",
  note: "Песня о Яви, Прави и Нави",
  src: "/music/tracks/oy-tonka-mezha.mp3",
  cover: "/music/covers/oy-tonka-mezha.webp",
};

const tracks: Track[] = [
  { id: "neveyana", title: "Песня Невеяны", note: "Нежная лесная песнь", src: "/music/tracks/neveyana.mp3", cover: "/music/covers/neveyana.webp" },
  { id: "ogneyara", title: "Заговор Огнеяры", note: "Огонь, жалейка и белый голос", src: "/music/tracks/ogneyara.mp3", cover: "/music/covers/ogneyara.webp" },
  { id: "auk", title: "Песня Аука", note: "Короткая аукающая лесная песенка", src: "/music/tracks/auk.mp3", cover: "/music/covers/auk.webp" },
  { id: "morok", title: "Песня Морока", note: "Песня Морока", src: "/music/tracks/morok.mp3", cover: "/music/covers/morok.webp" },
  { id: "dushnitsa", title: "Песня Душницы", note: "Песня Душницы", src: "/music/tracks/dushnitsa.mp3", cover: "/music/covers/dushnitsa.webp" },
];

function TrackPlayer({ track }: { track: Track }) {
  return (
    <audio
      controls
      preload="metadata"
      aria-label={track.title}
      onPlay={(event) => {
        document.querySelectorAll<HTMLAudioElement>("#music audio").forEach((audio) => {
          if (audio !== event.currentTarget && !audio.paused) audio.pause();
        });
      }}
    >
      <source src={track.src} type="audio/mpeg" />
      Ваш браузер не поддерживает воспроизведение аудио.
    </audio>
  );
}

export default function MusicPlayerPortal() {
  const [heroTarget, setHeroTarget] = useState<Element | null>(null);
  const [coverTarget, setCoverTarget] = useState<Element | null>(null);
  const [listTarget, setListTarget] = useState<Element | null>(null);

  useEffect(() => {
    const hero = document.querySelector("#music .trackHero > div:last-child");
    const cover = document.querySelector("#music .vinyl");
    const list = document.querySelector("#music .trackList");
    setHeroTarget(hero);
    setCoverTarget(cover);
    if (list) {
      list.replaceChildren();
      setListTarget(list);
    }
  }, []);

  if (!heroTarget) return null;

  return (
    <>
      {coverTarget && createPortal(
        <img className="musicHeroCover" src={mainTrack.cover} alt={`Обложка: ${mainTrack.title}`} />,
        coverTarget,
      )}
      {createPortal(
        <div className="musicHeroPlayer"><TrackPlayer track={mainTrack} /></div>,
        heroTarget,
      )}
      {listTarget && createPortal(
        <div className="musicTrackGrid">
          {tracks.map((track) => (
            <article className="musicTrackCard" key={track.id}>
              <img className="musicTrackCover" src={track.cover} alt={`Обложка: ${track.title}`} />
              <div className="musicTrackInfo">
                <small>Песня из мира романа</small>
                <h3>{track.title}</h3>
                <p>{track.note}</p>
                <TrackPlayer track={track} />
              </div>
            </article>
          ))}
        </div>,
        listTarget,
      )}
    </>
  );
}
