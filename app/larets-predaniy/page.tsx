"use client";

import { useEffect, useState } from "react";
import ReturnToWorld from "../ReturnToWorld";
import LaretsWisp from "./LaretsWisp";
import styles from "./larets.module.css";
import {
  EMPTY_ANOMALY_STATE,
  readAnomalyState,
  subscribeAnomalyStore,
  type AnomalyState,
} from "../../lib/anomalies/store";

type MemoryImage = { src: string; alt: string };
type MemoryScene = MemoryImage & { title: string; caption: string };

const MEMORY_SCENES: MemoryScene[] = [
  {
    src: "/images/anomalies/makosh-svarog-desktop.webp",
    alt: "Макошь и Сварог",
    title: "Макошь и Сварог",
    caption: "У каждой нити есть причина оказаться рядом.",
  },
  {
    src: "/images/anomalies/makosh-veles-desktop.webp",
    alt: "Макошь и Велес",
    title: "Макошь и Велес",
    caption: "Некоторые нити тянутся туда, куда им не велено.",
  },
  {
    src: "/images/anomalies/lada-svarog-desktop.webp",
    alt: "Лада и Сварог",
    title: "Лада и Сварог",
    caption: "Память редко объясняет, почему двое оказались рядом.",
  },
  {
    src: "/images/larets/Yarmei.webp",
    alt: "Ярмей",
    title: "Ярмей",
    caption: "Первая кровь на дороге.",
  },
  {
    src: "/images/larets/ogneyara i semargl dom.webp",
    alt: "Огнеяра и Семаргл дома",
    title: "Дом",
    caption: "Огонь тоже знает тишину.",
  },
  {
    src: "/images/larets/ogneyara i semargl strizhka.webp",
    alt: "Огнеяра стрижёт Семаргла",
    title: "Стрижка",
    caption: "Огнеяра знала, где у огня прячется сила.",
  },
  {
    src: "/images/larets/ogneyara i semargl.webp",
    alt: "Огнеяра и Семаргл с голубым камнем",
    title: "Голубой камень",
    caption: "Некоторые вещи доверяют только тем, кому доверяют себя.",
  },
  {
    src: "/images/larets/ogneyara malenkaya s cat.webp",
    alt: "Огнеяра в облике девочки с чёрной кошкой",
    title: "Девочка в лесу",
    caption: "Невинная личина опаснее.",
  },
  {
    src: "/images/larets/ogneyara staruha.webp",
    alt: "Огнеяра в облике старухи",
    title: "Чужой лик",
    caption: "Лицу, которому верят, проще приблизиться.",
  },
  {
    src: "/images/larets/shishiga s tma iz ruk.webp",
    alt: "Шишига с тьмой, идущей из рук",
    title: "Соль не помогла",
    caption: "Так не бывает.",
  },
  {
    src: "/images/larets/vlad-neveyana na rukah.webp",
    alt: "Владимир несёт Невеяну на руках, позади чёрная кошка",
    title: "На руках",
    caption: "Они ещё не видят, кто идёт следом.",
  },
  {
    src: "/images/larets/vlad-neveyana.webp",
    alt: "Владимир и Невеяна под двумя лунами Межи",
    title: "Две луны",
    caption: "В Меже даже небо умеет лгать.",
  },
  {
    src: "/images/larets/vlad-svetoyara ruchei.webp",
    alt: "Владимир и Светояра у ручья",
    title: "У ручья",
    caption: "Слишком близко к тому, чего нельзя.",
  },
];

export default function LaretsPredaniyPage() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AnomalyState>(EMPTY_ANOMALY_STATE);
  const [openedImage, setOpenedImage] = useState<MemoryImage | null>(null);

  useEffect(() => {
    const sync = () => setState(readAnomalyState());
    sync();
    setReady(true);
    return subscribeAnomalyStore(sync);
  }, []);

  useEffect(() => {
    if (!openedImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedImage(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openedImage]);

  const makoshUnlocked = state.found.includes("makosh-thread");

  return (
    <main className={styles.page}>
      <LaretsWisp />

      <div className={styles.topbar}>
        <a className={styles.brand} href="/">Там, где умирает Явь</a>
        <ReturnToWorld className={styles.back} />
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Память Межи</p>
        <h1>Ларец преданий</h1>
        <p>Образы приходят раньше слов. Смотри — и угадывай, чью историю помнит Межа.</p>
      </header>

      {!ready ? (
        <section className={styles.empty}><p>Ларец вспоминает…</p></section>
      ) : makoshUnlocked ? (
        <section className={styles.memoryBlock}>
          <div className={styles.memoryHeading}>
            <div>
              <p className={styles.memoryKicker}>Ларец открыт</p>
              <h2>Осколки памяти</h2>
              <p>Здесь нет правильного порядка. Одни сцены уже случились, другие ещё только ждут своего смысла.</p>
            </div>
          </div>

          <div className={styles.gallery}>
            {MEMORY_SCENES.map((scene) => (
              <article className={styles.sceneCard} key={scene.src}>
                <button
                  type="button"
                  className={styles.imageButton}
                  onClick={() => setOpenedImage({ src: scene.src, alt: scene.alt })}
                  aria-label={`Открыть полноразмерное изображение: ${scene.title}`}
                >
                  <img loading="lazy" decoding="async" src={scene.src} alt={scene.alt} />
                </button>
                <div className={styles.sceneText}>
                  <h3>{scene.title}</h3>
                  <p>{scene.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.empty}>
          <small>Ларец закрыт</small>
          <h2>Нити ещё не сошлись</h2>
          <p>Сначала найди на Межи чужую нить Макоши. После этого Ларец откроется целиком.</p>
          <ReturnToWorld />
        </section>
      )}

      {openedImage && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={openedImage.alt} onClick={() => setOpenedImage(null)}>
          <button type="button" className={styles.lightboxClose} aria-label="Закрыть полноразмерное изображение" onClick={() => setOpenedImage(null)}>×</button>
          <img src={openedImage.src} alt={openedImage.alt} decoding="async" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
