"use client";

import { useEffect, useState } from "react";
import styles from "./larets.module.css";
import {
  EMPTY_ANOMALY_STATE,
  readAnomalyState,
  subscribeAnomalyStore,
  type AnomalyState,
} from "../../lib/anomalies/store";
type MemoryImage = { src: string; alt: string };

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

  const openDesktopImage = (image: MemoryImage) => {
    if (window.matchMedia("(min-width: 761px)").matches) {
      setOpenedImage(image);
    }
  };

  const makoshUnlocked = state.found.includes("makosh-thread");
  const shishigaUnlocked = state.found.includes("shishiga-track");
  const hasRewards = makoshUnlocked || shishigaUnlocked;

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">Там, где умирает Явь</a>
        <a className={styles.back} href="/genealogy#gods-title">← К ликам богов</a>
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Память Межи</p>
        <h1>Ларец преданий</h1>
        <p>Здесь остаются образы и истории, которые открылись не каждому.</p>
      </header>

      {!ready ? (
        <section className={styles.empty}><p>Ларец вспоминает…</p></section>
      ) : hasRewards ? (
        <>
        {makoshUnlocked && <section className={styles.memoryBlock}>
          <div className={styles.memoryHeading}>
            <div>
              <h2>Чужая нить Макоши</h2>
              <p>Четыре нити сошлись в одном месте и оставили три воспоминания.</p>
            </div>
          </div>

          <div className={styles.gallery}>
            <article>
              <button
                type="button"
                className={styles.imageButton}
                onClick={() => openDesktopImage({ src: "/images/anomalies/makosh-svarog-desktop.webp", alt: "Макошь и Сварог" })}
                aria-label="Открыть полноразмерное изображение: Макошь и Сварог"
              >
                <picture>
                  <source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-svarog-mobile.webp" />
                  <img loading="lazy" src="/images/anomalies/makosh-svarog-desktop.webp" alt="Макошь и Сварог" />
                </picture>
              </button>
              <span>Макошь и Сварог</span>
            </article>
            <article>
              <button
                type="button"
                className={styles.imageButton}
                onClick={() => openDesktopImage({ src: "/images/anomalies/makosh-veles-desktop.webp", alt: "Макошь и Велес" })}
                aria-label="Открыть полноразмерное изображение: Макошь и Велес"
              >
                <picture>
                  <source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-veles-mobile.webp" />
                  <img loading="lazy" src="/images/anomalies/makosh-veles-desktop.webp" alt="Макошь и Велес" />
                </picture>
              </button>
              <span>Макошь и Велес</span>
            </article>
            <article>
              <button
                type="button"
                className={styles.imageButton}
                onClick={() => openDesktopImage({ src: "/images/anomalies/lada-svarog-desktop.webp", alt: "Лада и Сварог" })}
                aria-label="Открыть полноразмерное изображение: Лада и Сварог"
              >
                <picture>
                  <source media="(max-width: 720px)" srcSet="/images/anomalies/lada-svarog-mobile.webp" />
                  <img loading="lazy" src="/images/anomalies/lada-svarog-desktop.webp" alt="Лада и Сварог" />
                </picture>
              </button>
              <span>Лада и Сварог</span>
            </article>
          </div>
        </section>}
        {shishigaUnlocked && <section className={styles.memoryBlock}>
          <div className={styles.memoryHeading}>
            <div>
              <h2>След шишиги</h2>
              <p>Шишига ушла пятками вперёд, но оставила в Ларце собственную тень.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.imageButton}
            style={{ maxWidth: 760, margin: "0 auto" }}
            onClick={() => openDesktopImage({ src: "/images/navnik/shishiga-shadow.webp", alt: "Тень Шишиги" })}
            aria-label="Открыть полноразмерное изображение: Тень Шишиги"
          >
            <img loading="lazy" src="/images/navnik/shishiga-shadow.webp" alt="Тень Шишиги" />
          </button>
        </section>}
        </>
      ) : (
        <section className={styles.empty}>
          <small>Ларец закрыт</small>
          <h2>Память ещё не отдана</h2>
          <p>Некоторые предания появляются здесь только после того, как найден их знак на Межи.</p>
          <a href="/genealogy#gods-title">Вернуться к ликам богов</a>
        </section>
      )}

      {openedImage && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={openedImage.alt} onClick={() => setOpenedImage(null)}>
          <button type="button" className={styles.lightboxClose} aria-label="Закрыть полноразмерное изображение" onClick={() => setOpenedImage(null)}>×</button>
          <img src={openedImage.src} alt={openedImage.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
