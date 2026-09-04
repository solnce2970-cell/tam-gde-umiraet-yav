import type { Metadata } from "next";
import ReturnToWorld from "../ReturnToWorld";
import { excerpts } from "./excerpts";
import styles from "./chitat.module.css";

export const metadata: Metadata = {
  title: "Читать отрывки",
  description: "Семь отрывков из романа «Там, где умирает Явь» без раскрытия ключевых тайн.",
};

export default function ReadingPage() {
  return (
    <main className={styles.page} id="top">
      <div className={styles.shell}>
        <div className={styles.top}>
          <a className={styles.brand} href="/">Там, где умирает Явь</a>
          <ReturnToWorld className={styles.back} />
        </div>

        <header className={styles.hero}>
          <p className={styles.kicker}>Отрывки из романа</p>
          <h1>Читать</h1>
          <p>Семь фрагментов из разных частей истории. Можно войти в мир с любого — без раскрытия ключевых тайн.</p>
        </header>

        <nav className={styles.index} aria-label="Отрывки">
          {excerpts.map((excerpt) => (
            <a key={excerpt.id} href={`#${excerpt.id}`}>
              <small>{excerpt.chapter}</small>
              <b>{excerpt.title}</b>
            </a>
          ))}
        </nav>

        {excerpts.map((excerpt) => (
          <article className={styles.excerpt} id={excerpt.id} key={excerpt.id}>
            <p className={styles.chapter}>{excerpt.chapter}</p>
            <h2>{excerpt.title}</h2>
            <div className={styles.teaser}>
              {excerpt.teaser.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div className={styles.body}>
              {excerpt.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <div className={styles.divider} aria-hidden="true">— · —</div>
            <a className={styles.toTop} href="#top">К списку отрывков ↑</a>
          </article>
        ))}
      </div>
    </main>
  );
}
