import type { Metadata } from "next";
import Link from "next/link";
import ReturnToWorld from "../ReturnToWorld";
import { readingItems } from "./excerpts";
import styles from "./reading.module.css";

export const metadata: Metadata = {
  title: "Заглянуть в роман",
  description: "Два способа войти в роман: начать с первой главы или выбрать короткий отрывок по настроению.",
};

const firstChapter = readingItems.find((item) => item.kind === "chapter")!;
const excerpts = readingItems.filter((item) => item.kind === "excerpt");

export default function ReadingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Там, где умирает Явь · чтение</p>
          <h1>Заглянуть в роман</h1>
          <p className={styles.lead}>Не всё начинается с первой страницы. Можно войти в историю по порядку — или выбрать сцену по настроению и посмотреть, какой стороной мир повернётся к вам.</p>
        </header>

        <section className={styles.entryGrid} aria-label="Два способа начать чтение">
          <Link className={styles.entryCard} href={`/chitat/${firstChapter.slug}`}>
            <div>
              <p className={styles.eyebrow}>Способ I</p>
              <h2>Начать читать</h2>
              <p>Полная первая глава. Для тех, кто хочет войти в историю обычным путём и читать подряд.</p>
            </div>
            <span className={styles.entryAction}>Глава 1 →</span>
          </Link>

          <a className={`${styles.entryCard} ${styles.entryCardSecondary}`} href="#fragmenty">
            <div>
              <p className={styles.eyebrow}>Способ II</p>
              <h2>Выбрать отрывок</h2>
              <p>Короткие самодостаточные сцены без ключевых спойлеров: страх, тайна, свет, ведьмовство, юмор и Правь.</p>
            </div>
            <span className={styles.entryAction}>Выбрать настроение ↓</span>
          </a>
        </section>

        <section id="fragmenty" aria-labelledby="fragmenty-title">
          <div className={styles.sectionHead}>
            <h2 id="fragmenty-title">Фрагменты Межи</h2>
            <p>Карточка обещает только настроение и ситуацию. Сюжетный контекст остаётся за дверью — сам отрывок должен работать без пояснений.</p>
          </div>

          <div className={styles.grid}>
            {excerpts.map((item) => (
              <Link className={styles.card} key={item.slug} href={`/chitat/${item.slug}`}>
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
          Черновик показывает только формат, переходы и ритм страницы. Точные границы отрывков, время чтения и финальные тексты карточек добавим после отдельного утверждения.
        </div>

        <div style={{ marginTop: 42 }}>
          <ReturnToWorld className="secondary" />
        </div>
      </div>
    </main>
  );
}
