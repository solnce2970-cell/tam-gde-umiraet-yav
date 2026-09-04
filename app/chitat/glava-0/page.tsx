import type { Metadata } from "next";
import Link from "next/link";
import { chapter0 } from "../chapter0";
import styles from "../reading.module.css";

export const metadata: Metadata = {
  title: "Глава 0. Мозаика",
  description: "Полная глава 0 романа «Там, где умирает Явь».",
};

const realmHeadings = new Set(["ПРАВЬ.", "ЯВЬ.", "ПОГРАНИЧЬЕ ЯВИ И НАВИ."]);

export default function ChapterZeroPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.readerTop}>
          <div className={styles.readerTitle}>
            <p className={styles.eyebrow}>Там, где умирает Явь · начало романа</p>
            <h1>Глава 0. Мозаика</h1>
            <div className={styles.meta}>
              <span className={styles.pill}>полная глава</span>
              <span className={styles.pill}>≈ 30 минут</span>
            </div>
          </div>
          <Link className={styles.backLink} href="/chitat">← К выбору чтения</Link>
        </div>

        <article className={`${styles.readerPanel} ${styles.readerBody} ${styles.chapterBody}`}>
          {chapter0.map((paragraph, index) => {
            if (realmHeadings.has(paragraph)) {
              return <h2 className={styles.realmHeading} key={index}>{paragraph}</h2>;
            }

            const previous = index > 0 ? chapter0[index - 1] : "";
            if (realmHeadings.has(previous)) {
              return <p className={styles.sceneDateline} key={index}>{paragraph}</p>;
            }

            return <p key={index}>{paragraph}</p>;
          })}
        </article>

        <div className={styles.readerActions}>
          <Link className={styles.backLink} href="/chitat">← Выбрать отрывок</Link>
          <a className={styles.relatedLink} href="/o-romane">О романе →</a>
        </div>
      </div>
    </main>
  );
}
