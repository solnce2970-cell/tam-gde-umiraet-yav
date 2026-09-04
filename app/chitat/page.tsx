import type { Metadata } from "next";
import Link from "next/link";
import ReturnToWorld from "../ReturnToWorld";
import { readingItems } from "./excerpts";
import styles from "./reading.module.css";

export const metadata: Metadata = {
  title: "Заглянуть в роман",
  description: "Начать с первой главы или выбрать короткий отрывок по настроению.",
};

const firstChapter = readingItems.find((item) => item.kind === "chapter")!;
const excerpts = readingItems.filter((item) => item.kind === "excerpt");

function CardAccent({ slug }: { slug: string }) {
  if (slug === "zrya-ty-ee-spas") {
    return (
      <div className={`${styles.cardAccent} ${styles.aukAccent}`} aria-hidden="true">
        <img src="/images/navnik/auk.webp" alt="" loading="lazy" decoding="async" />
      </div>
    );
  }

  if (slug === "koshka-kotoruyu-nikto-ne-prosil-govorit") {
    return (
      <div className={`${styles.cardAccent} ${styles.catAccent}`} aria-hidden="true">
        <svg viewBox="0 0 120 120" role="presentation">
          <path d="M31 47 25 24l20 14c5-2 10-3 15-3s10 1 15 3l20-14-6 23c8 8 13 20 13 34 0 24-16 39-42 39S18 105 18 81c0-14 5-26 13-34Z" />
          <path d="M43 72c5 4 10 6 17 6s12-2 17-6" />
          <path d="M49 61h.1M71 61h.1" />
          <path d="M98 81c13 4 18 13 16 25-2 8-9 13-17 12" />
        </svg>
      </div>
    );
  }

  return null;
}

export default function ReadingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Там, где умирает Явь · чтение</p>
          <h1>Заглянуть в роман</h1>
          <p className={styles.lead}>Не всякая история начинается с первой страницы. Можно начать с начала — или выбрать отрывок, который зовёт сильнее.</p>
        </header>

        <section className={styles.entryGrid} aria-label="Два способа начать чтение">
          <Link className={styles.entryCard} href={`/chitat/${firstChapter.slug}`}>
            <div>
              <p className={styles.eyebrow}>Способ I</p>
              <h2>Начать читать</h2>
              <p>Полная первая глава — для тех, кто хочет войти в историю по порядку.</p>
            </div>
            <span className={styles.entryAction}>Глава 1 →</span>
          </Link>

          <a className={`${styles.entryCard} ${styles.entryCardSecondary}`} href="#fragmenty">
            <div>
              <p className={styles.eyebrow}>Способ II</p>
              <h2>Выбрать отрывок</h2>
              <p>Семь коротких дверей в разные стороны романа.</p>
            </div>
            <span className={styles.entryAction}>Выбрать настроение ↓</span>
          </a>
        </section>

        <section id="fragmenty" aria-labelledby="fragmenty-title">
          <div className={styles.sectionHead}>
            <h2 id="fragmenty-title">Фрагменты Межи</h2>
            <p>Выберите настроение. Контекст останется за дверью.</p>
          </div>

          <div className={styles.grid}>
            {excerpts.map((item) => (
              <Link className={styles.card} key={item.slug} href={`/chitat/${item.slug}`}>
                <CardAccent slug={item.slug} />
                <div className={styles.meta}>
                  <span className={styles.pill}>{item.kicker}</span>
                  <span className={styles.pill}>{item.mood}</span>
                  <span className={styles.pill}>{item.time}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.intro}</p>
                <span className={styles.cardAction}>Читать отрывок →</span>
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.note}>
          Отрывки взяты из разных частей романа и намеренно расположены вне последовательности событий.
        </div>

        <div style={{ marginTop: 42 }}>
          <ReturnToWorld className="secondary" />
        </div>
      </div>
    </main>
  );
}
