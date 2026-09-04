import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReadingItem, readingItems } from "../excerpts";
import styles from "../reading.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return readingItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getReadingItem(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.intro,
  };
}

export default async function ReadingItemPage({ params }: Props) {
  const { slug } = await params;
  const item = getReadingItem(slug);
  if (!item) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.readerTop}>
          <div className={styles.readerTitle}>
            <p className={styles.eyebrow}>{item.kind === "chapter" ? "Читать подряд" : item.kicker}</p>
            <h1>{item.title}</h1>
            <div className={styles.meta}>
              <span className={styles.pill}>{item.mood}</span>
              <span className={styles.pill}>{item.time}</span>
            </div>
            <p className={styles.readerIntro}>{item.intro}</p>
          </div>
          <Link className={styles.backLink} href="/chitat">← Все фрагменты</Link>
        </div>

        <article className={styles.readerPanel} aria-label="Черновое место текста отрывка">
          <p className={styles.eyebrow}>Здесь будет текст</p>
          <div className={styles.placeholder} aria-hidden="true">
            {Array.from({ length: 13 }).map((_, index) => (
              <div className={styles.placeholderLine} key={index} />
            ))}
          </div>
          <p className={styles.placeholderText}>В черновике текст намеренно не вставлен. После утверждения структуры сюда попадёт точный фрагмент из актуальной рукописи — без пересказа и без дописанных связок.</p>
        </article>

        <div className={styles.readerActions}>
          <Link className={styles.backLink} href="/chitat">← Выбрать другой отрывок</Link>
          {item.relatedHref && item.relatedLabel ? (
            <a className={styles.relatedLink} href={item.relatedHref}>{item.relatedLabel} →</a>
          ) : null}
        </div>

        <section className={styles.logic}>
          <h2>Логика после чтения</h2>
          <p>Отрывок не ведёт автоматически к следующей главе. Читатель сам выбирает: вернуться к другим фрагментам, начать роман с первой главы или перейти в связанную часть мира — Навник, героев, музыку или Лики богов.</p>
          <p>Когда тексты будут утверждены, здесь же можно добавить очень мягкую кнопку «Начать читать с первой главы», но не ставить её выше самого отрывка и не превращать страницу в воронку продаж.</p>
        </section>
      </div>
    </main>
  );
}
