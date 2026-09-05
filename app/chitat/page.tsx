import type { Metadata } from "next";
import Link from "next/link";
import ReturnToWorld from "../ReturnToWorld";
import { excerpts } from "./excerpts";
import styles from "./reading.module.css";

export const metadata: Metadata = {
  title: "Заглянуть в роман",
  description: "Начать с полной главы 0 или выбрать короткий отрывок по настроению.",
};

const cardMeta: Record<string, { mood: string; time: string }> = {
  "pamyat-ili-zhizn": { mood: "тревога", time: "≈ 4 минуты" },
  "zrya-ty-ee-spas": { mood: "нечисть", time: "≈ 3 минуты" },
  "les-prishel-k-nei-sam": { mood: "свет", time: "≈ 1,5 минуты" },
  "son-kotoryy-byl-ne-ego": { mood: "Навь и боги", time: "≈ 4 минуты" },
  "slishkom-blizko": { mood: "чувства", time: "≈ 4 минуты" },
  "koshka-kotoruyu-nikto-ne-prosil-govorit": { mood: "язвительность", time: "≈ 3 минуты" },
  "dom-kotoryy-gulyal": { mood: "немного безумия", time: "≈ 3 минуты" },
};

function CardAccent({ id }: { id: string }) {
  if (id === "zrya-ty-ee-spas") {
    return (
      <span className={`${styles.miniIllustration} ${styles.aukIllustration}`} aria-hidden="true">
        <img src="/images/mini-auk.svg" alt="" loading="lazy" decoding="async" />
      </span>
    );
  }

  if (id === "koshka-kotoruyu-nikto-ne-prosil-govorit") {
    return (
      <span className={`${styles.miniIllustration} ${styles.catIllustration}`} aria-hidden="true">
        <img src="/images/mini-cat.svg" alt="" loading="lazy" decoding="async" />
      </span>
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
          <Link className={styles.entryCard} href="/chitat/glava-0">
            <div>
              <p className={styles.eyebrow}>Способ I</p>
              <h2>Начать читать</h2>
              <p>Полная глава 0 «Мозаика» — с первых трещин в Прави, Яви и на Межи.</p>
            </div>
            <span className={styles.entryAction}>Читать главу 0 →</span>
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
            {excerpts.map((item) => {
              const meta = cardMeta[item.id] ?? { mood: "отрывок", time: "≈ 4 минуты" };
              return (
                <Link className={styles.card} key={item.id} href={`/chitat/${item.id}`}>
                  <CardAccent id={item.id} />
                  <div className={styles.meta}>
                    <span className={styles.pill}>{item.chapter}</span>
                    <span className={styles.pill}>{meta.mood}</span>
                    <span className={styles.pill}>{meta.time}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.teaser.join(" ")}</p>
                  <span className={styles.cardAction}>Читать отрывок →</span>
                </Link>
              );
            })}
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
