import styles from "./genealogy.module.css";

const Node = ({ name, note, root = false }: { name: string; note?: string; root?: boolean }) => (
  <div className={`${styles.node} ${root ? styles.root : ""}`}>
    <strong>{name}</strong>
    {note && <small>{note}</small>}
  </div>
);

export default function GenealogyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">Там, где умирает Явь</a>
        <a className={styles.back} href="/#world">← Вернуться в мир</a>
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Родословная богов</p>
        <h1>Кровь, любовь<br />и право на Навь</h1>
        <p className={styles.intro}>
          Родословная показывает основные линии Сварожьего Круга и тех, чьи связи определяют устройство мира.
          Здесь приведены только те родственные линии, которые уже можно открыть читателю без раскрытия поздних тайн романа.
        </p>
      </header>

      <section className={styles.tree} aria-label="Родословная славянских богов">
        <div className={styles.rootWrap}>
          <Node name="РОД" note="прабог-творец" root />
        </div>

        <p className={styles.generationTitle}>Первое поколение · сотворённые Родом</p>
        <div className={styles.firstGen}>
          <Node name="Чернобог" note="тьма · древняя линия" />
          <Node name="Велес" note="владыка Нави" />
          <Node name="Макошь" note="пряха судеб" />
          <Node name="Сварог" note="небесный кузнец" />
          <Node name="Лада" note="семья · род · рождение" />
        </div>

        <div className={styles.branches}>
          <section className={styles.branch}>
            <div className={styles.branchHeader}>
              <h2>Сварог и Макошь</h2>
              <p>первый союз</p>
            </div>
            <div className={styles.couple}>
              <Node name="Сварог" /> <span className={styles.link}>—</span> <Node name="Макошь" />
            </div>
            <div className={styles.children}>
              <Node name="Перун" note="сын" />
              <Node name="Дажьбог" note="сын" />
              <Node name="Хорс" note="сын" />
              <Node name="Семаргл" note="сын от искры" />
            </div>
          </section>

          <section className={styles.branch}>
            <div className={styles.branchHeader}>
              <h2>Велес и Макошь</h2>
              <p>истинный союз</p>
            </div>
            <div className={styles.couple}>
              <Node name="Велес" /> <span className={styles.link}>—</span> <Node name="Макошь" />
            </div>
            <div className={styles.children}>
              <Node name="Доля" note="дочь" />
              <Node name="Недоля" note="дочь" />
              <Node name="Морана" note="дочь" />
            </div>
          </section>

          <section className={styles.branch}>
            <div className={styles.branchHeader}>
              <h2>Сварог и Лада</h2>
              <p>поздний союз</p>
            </div>
            <div className={styles.couple}>
              <Node name="Сварог" /> <span className={styles.link}>—</span> <Node name="Лада" />
            </div>
            <div className={styles.children}>
              <Node name="Лель" note="сын" />
              <Node name="Ляля" note="дочь" />
            </div>
          </section>
        </div>
      </section>

      <section className={styles.specials}>
        <p className={styles.eyebrow}>Следующие поколения</p>
        <h2>Ветви, которые сходятся в истории</h2>
        <div className={styles.specialGrid}>
          <article className={styles.special}>
            <span>Перун →</span>
            <h3>Дана</h3>
            <p>Дочь Перуна, рождённая от удара молнии. Внучка Сварога и Макоши.</p>
          </article>
          <article className={styles.special}>
            <span>Лель →</span>
            <h3>Светояра</h3>
            <p>Дочь Леля. Через эту линию принадлежит к потомкам Сварога и Лады.</p>
          </article>
          <article className={styles.special}>
            <span>Морана + Чернобог →</span>
            <h3>Морок</h3>
            <p>Сын Чернобога и Мораны. Через Морану связан с линиями Велеса и Макоши и потому имеет родовое притязание на Навь.</p>
          </article>
          <article className={styles.special}>
            <span>Сварог → смертная линия →</span>
            <h3>Огнеяра</h3>
            <p>Внучка Сварога через его смертную дочь. Божественная искра дошла до неё через человеческую ветвь.</p>
          </article>
        </div>
      </section>

      <section className={styles.notes}>
        <div className={styles.notesBox}>
          <strong>Особая линия Семаргла.</strong> Он возник из искры Сварожьей ковки: Сварог признал его сыном, а Макошь стала ему матерью не по крови, а по теплу.
          Поэтому в родословной он стоит в ветви Сварога, но его связь с Макошью не сводится к обычному материнству.
        </div>
        <p className={styles.scrollHint}>На узких экранах верхнее поколение можно прокрутить по горизонтали</p>
      </section>
    </main>
  );
}
