import styles from "./genealogy.module.css";

export default function GenealogyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">Там, где умирает Явь</a>
        <a className={styles.back} href="/#world">← Вернуться в мир</a>
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Родословная</p>
        <h1>Родословная богов</h1>
        <p className={styles.intro}>Схема родственных линий мира «Там, где умирает Явь».</p>
      </header>

      <section className={styles.imageSection} aria-label="Родословная богов">
        <div className={styles.imageFrame}>
          <img
            className={styles.genealogyImage}
            src="/images/genealogy-yav.webp"
            alt="Родословная богов мира «Там, где умирает Явь»"
          />
        </div>
        <p className={styles.hint}>На телефоне изображение можно увеличить жестом.</p>
      </section>
    </main>
  );
}
