"use client";

import { useEffect, useRef, useState } from "react";
import { SIGN_COUNT } from "../lib/anomalies/registry";
import { recordMakoshVisit } from "../lib/anomalies/quest-state";
import { hasSign, unlockSign, updateTransientState } from "../lib/anomalies/store";
import styles from "./makosh-thread.module.css";

function pulseCard(card: HTMLElement) {
  card.classList.remove("yav-god-zoom");
  void card.offsetWidth;
  card.classList.add("yav-god-zoom");
  window.setTimeout(() => card.classList.remove("yav-god-zoom"), 760);
}

export default function MakoshThread() {
  const [active, setActive] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [count, setCount] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (window.location.pathname !== "/genealogy") return;

    const preview = new URLSearchParams(window.location.search).has("makosh-thread-preview");
    if (preview) {
      activeRef.current = true;
      setActive(true);
      return;
    }

    if (hasSign("makosh-thread")) return;

    const register = (card: HTMLElement) => {
      if (activeRef.current) return;
      const name = card.dataset.godName;
      if (!name) return;

      pulseCard(card);

      let completed = false;
      updateTransientState((state) => {
        const result = recordMakoshVisit(state, name);
        completed = result.completed;
        return result.state;
      });

      if (completed) {
        window.setTimeout(() => {
          activeRef.current = true;
          setActive(true);
        }, 620);
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>("[data-god-name]");
      if (card) register(card);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>("[data-god-name]");
      if (!card) return;
      event.preventDefault();
      register(card);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  const discover = () => {
    if (awarded) return;
    const result = unlockSign("makosh-thread");
    setCount(result.count);
    setAwarded(true);
  };

  const close = () => {
    setActive(false);
    setGalleryVisible(false);
    activeRef.current = false;
  };

  if (!active) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Чужая нить Макоши">
      <div className={styles.veil} />
      <div className={`${styles.ritual} ${awarded ? styles.awarded : ""}`}>
        <div className={styles.heading}>
          <small>Чужая нить Макоши</small>
          <strong>{awarded ? "Знак межи открыт" : "Четыре нити сошлись в одном месте"}</strong>
          {awarded && <span>{count} из {SIGN_COUNT}</span>}
        </div>

        <figure className={`${styles.seal} ${styles.makosh}`}>
          <img src="/images/characters/makosh.webp?v=2" alt="Макошь" />
          <figcaption>Макошь</figcaption>
        </figure>
        <figure className={`${styles.seal} ${styles.veles}`}>
          <img src="/images/gods/veles.webp" alt="Велес" />
          <figcaption>Велес</figcaption>
        </figure>
        <figure className={`${styles.seal} ${styles.svarog}`}>
          <img src="/images/characters/svarog.webp?v=2" alt="Сварог" />
          <figcaption>Сварог</figcaption>
        </figure>
        <figure className={`${styles.seal} ${styles.lada}`}>
          <img src="/images/gods/Lada.webp" alt="Лада" />
          <figcaption>Лада</figcaption>
        </figure>

        <svg className={styles.threads} viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="thread-gold-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-silver-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-fire-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="thread-white-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path className={`${styles.threadLine} ${styles.gold}`} d="M180 510 Q350 420 500 350 Q430 245 350 155" />
          <path className={`${styles.threadLine} ${styles.silver}`} d="M760 510 Q630 420 500 350 Q440 250 350 155" />
          <path className={`${styles.threadLine} ${styles.fire}`} d="M760 155 Q620 250 500 350 Q640 430 760 510" />
          <path className={`${styles.threadLine} ${styles.white}`} d="M350 155 Q420 260 500 350 Q350 405 180 510" />
          <circle className={styles.crossGlow} cx="500" cy="350" r="25" />
        </svg>

        {!awarded && (
          <button className={styles.crossButton} type="button" onClick={discover} aria-label="Коснуться места пересечения нитей">
            <span />
          </button>
        )}

        {awarded && (
          <div className={styles.actions}>
            <button type="button" onClick={() => setGalleryVisible((value) => !value)}>
              {galleryVisible ? "Закрыть память" : "Заглянуть в память"}
            </button>
            <a href="/larets-predaniy">Ларец преданий ↗</a>
          </div>
        )}

        {galleryVisible && (
          <section className={styles.memoryPanel} aria-label="Открытые воспоминания">
            <article>
              <picture><source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-svarog-mobile.webp"/><img loading="lazy" src="/images/anomalies/makosh-svarog-desktop.webp" alt="Макошь и Сварог"/></picture>
              <span>Макошь и Сварог</span>
            </article>
            <article>
              <picture><source media="(max-width: 720px)" srcSet="/images/anomalies/makosh-veles-mobile.webp"/><img loading="lazy" src="/images/anomalies/makosh-veles-desktop.webp" alt="Макошь и Велес"/></picture>
              <span>Макошь и Велес</span>
            </article>
            <article>
              <picture><source media="(max-width: 720px)" srcSet="/images/anomalies/lada-svarog-mobile.webp"/><img loading="lazy" src="/images/anomalies/lada-svarog-desktop.webp" alt="Лада и Сварог"/></picture>
              <span>Лада и Сварог</span>
            </article>
          </section>
        )}
      </div>

      <button className={styles.close} type="button" onClick={close} aria-label="Закрыть знак">×</button>
    </div>
  );
}
