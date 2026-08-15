"use client";

import { useEffect, useState } from "react";
import styles from "./larets.module.css";

const LARETS_KEY = "yav-larets-predaniy-v1";

type LaretsState = { makoshThread?: boolean; order?: number };

export default function LaretsPredaniyPage() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem(LARETS_KEY) || "{}") as LaretsState;
      setUnlocked(state.makoshThread === true);
    } catch {
      setUnlocked(false);
    } finally {
      setReady(true);
    }
  }, []);

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
      ) : unlocked ? (
        <section className={styles.memoryBlock}>
          <div className={styles.memoryHeading}>
            <div>
              <small>Открытый знак</small>
              <h2>Чужая нить Макоши</h2>
              <p>Четыре нити сошлись в одном месте и оставили три воспоминания.</p>
            </div>
          </div>

          <div className={styles.gallery}>
            <article>
              <picture>
                <source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-svarog-mobile.webp" />
                <img loading="lazy" src="/images/anomalies/makosh-svarog-desktop.webp" alt="Макошь и Сварог" />
              </picture>
              <span>Макошь и Сварог</span>
            </article>
            <article>
              <picture>
                <source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-veles-mobile.webp" />
                <img loading="lazy" src="/images/anomalies/makosh-veles-desktop.webp" alt="Макошь и Велес" />
              </picture>
              <span>Макошь и Велес</span>
            </article>
            <article>
              <picture>
                <source media="(max-width: 720px)" srcSet="/images/anomalies/lada-svarog-mobile.webp" />
                <img loading="lazy" src="/images/anomalies/lada-svarog-desktop.webp" alt="Лада и Сварог" />
              </picture>
              <span>Лада и Сварог</span>
            </article>
          </div>
        </section>
      ) : (
        <section className={styles.empty}>
          <small>Ларец закрыт</small>
          <h2>Память ещё не отдана</h2>
          <p>Некоторые предания появляются здесь только после того, как найден их знак на Межи.</p>
          <a href="/genealogy#gods-title">Вернуться к ликам богов</a>
        </section>
      )}
    </main>
  );
}
