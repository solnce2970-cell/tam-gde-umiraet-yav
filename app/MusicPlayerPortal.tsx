"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const uploadedTracks = [
  { number: "01", title: "Песня Невеяны", note: "Нежная лесная песнь" },
  { number: "02", title: "Заговор Огнеяры", note: "Огонь, жалейка и белый голос" },
  { number: "03", title: "Песня Аука", note: "Короткая аукающая лесная песенка" },
  { number: "04", title: "Песня Морока", note: "Голос тьмы и морока" },
  { number: "05", title: "Песня Душницы", note: "Голос вещи, хранящей душу" },
];

export default function MusicPlayerPortal() {
  const [playerTarget, setPlayerTarget] = useState<Element | null>(null);
  const [listTarget, setListTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPlayerTarget(document.querySelector("#music .trackHero > div:last-child"));

    const list = document.querySelector("#music .trackList");
    if (list) {
      list.replaceChildren();
      setListTarget(list);
    }
  }, []);

  if (!playerTarget) return null;

  return (
    <>
      {createPortal(
        <div style={{ marginTop: "1.1rem", maxWidth: "560px" }}>
          <audio
            controls
            preload="metadata"
            aria-label="Ой, тонка межа"
            style={{ width: "100%", display: "block" }}
          >
            <source src="/music/tracks/oy-tonka-mezha.mp3" type="audio/mpeg" />
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>
        </div>,
        playerTarget,
      )}

      {listTarget && createPortal(
        <>
          {uploadedTracks.map((track) => (
            <span key={track.number}>
              <i>{track.number}</i>
              <b>{track.title}</b>
              <small>{track.note}</small>
              <em>Готова</em>
            </span>
          ))}
        </>,
        listTarget,
      )}
    </>
  );
}
