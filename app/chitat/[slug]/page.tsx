import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DreamSoundRecovery from "../DreamSoundRecovery";
import { excerpts } from "../excerpts";
import styles from "../reading.module.css";

type Props = {
  params: Promise<{ slug: string }>;
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

const DREAM_STEAM_SENTENCE = "Волк рухнул в омут, где вода и огонь встретились в шипении.";

export function generateStaticParams() {
  return excerpts.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = excerpts.find((excerpt) => excerpt.id === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.teaser.join(" "),
  };
}

export default async function ReadingItemPage({ params }: Props) {
  const { slug } = await params;
  const item = excerpts.find((excerpt) => excerpt.id === slug);
  if (!item) notFound();

  const meta = cardMeta[item.id] ?? { mood: "отрывок", time: "≈ 4 минуты" };

  return (
    <main className={styles.page}>
      {item.id === "son-kotoryy-byl-ne-ego" && <DreamSoundRecovery />}
      <div className={styles.shell}>
        <div className={styles.readerTop}>
          <div className={styles.readerTitle}>
            <p className={styles.eyebrow}>{item.chapter}</p>
            <h1>{item.title}</h1>
            <div className={styles.meta}>
              <span className={styles.pill}>{meta.mood}</span>
              <span className={styles.pill}>{meta.time}</span>
            </div>
            <p className={styles.readerIntro}>{item.teaser.join(" ")}</p>
          </div>
          <Link className={styles.backLink} href="/chitat">← Все фрагменты</Link>
        </div>

        <article className={`${styles.readerPanel} ${styles.readerBody}`}>
          {item.body.map((paragraph, index) => {
            if (item.id === "son-kotoryy-byl-ne-ego" && paragraph.includes(DREAM_STEAM_SENTENCE)) {
              const [before, after] = paragraph.split(DREAM_STEAM_SENTENCE);
              return (
                <p key={index}>
                  {before}
                  <span data-dream-sound-cue="dream-steam-finale">
                    Волк рухнул в омут, где вода и огонь встретились в шипе
                    <span style={{ display: "none" }} aria-hidden="true">|</span>
                    нии.
                  </span>
                  {after}
                </p>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </article>

        <div className={styles.readerActions}>
          <Link className={styles.backLink} href="/chitat">← Выбрать другой отрывок</Link>
          <a className={styles.relatedLink} href="/o-romane">О романе →</a>
        </div>
      </div>
    </main>
  );
}
