const sections = [
  { href: "#world", label: "Мир" },
  { href: "#characters", label: "Герои" },
  { href: "#navnik", label: "Навник" },
  { href: "#music", label: "Музыка" },
  { href: "#news", label: "Новости" },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="veil" />
        <nav className="nav" aria-label="Основная навигация">
          <a className="brand" href="#top">Там, где умирает Явь</a>
          <div className="navLinks">
            {sections.map((section) => (
              <a key={section.href} href={section.href}>{section.label}</a>
            ))}
          </div>
        </nav>

        <div className="heroContent" id="top">
          <p className="eyebrow">тёмное славянское фэнтези</p>
          <h1>Там, где умирает Явь</h1>
          <p className="lead">
            Мир ещё помнит старые законы. Но дороги перестают быть дорогами,
            обереги начинают лгать, а Навь выходит туда, где ей не место.
          </p>
          <div className="heroActions">
            <a className="primary" href="#world">Войти в мир</a>
            <a className="secondary" href="#navnik">Открыть Навник</a>
          </div>
        </div>
      </section>

      <section className="section" id="world">
        <p className="sectionMark">01</p>
        <div>
          <p className="eyebrow">три пласта мира</p>
          <h2>Явь. Навь. Правь.</h2>
          <p>
            Здесь будет перенесён раздел мира: его законы, трещины, Пограничье,
            Гора Забвения, живые переходы и всё, что постепенно перестаёт держать форму.
          </p>
        </div>
      </section>

      <section className="section" id="characters">
        <p className="sectionMark">02</p>
        <div>
          <p className="eyebrow">лица истории</p>
          <h2>Герои</h2>
          <p>
            Карточки Владимира, Светояры, Огнеяры, Невеяны, Семаргла, Морока и других
            персонажей будут перенесены сюда без потери нынешней атмосферы.
          </p>
        </div>
      </section>

      <section className="section navnikPreview" id="navnik">
        <p className="sectionMark">03</p>
        <div>
          <p className="eyebrow">древняя книга о тварях</p>
          <h2>Навник</h2>
          <p>
            В новой версии описание существа будет раскрываться непосредственно под
            выбранной карточкой, а не уходить вниз под весь список.
          </p>
          <div className="creatureGrid">
            {['Аук', 'Шишига', 'Василиск', 'Стрижгун', 'Мавка', 'Паук'].map((name) => (
              <article className="creatureCard" key={name}>
                <div className="creatureImage" aria-hidden="true" />
                <h3>{name}</h3>
                <span>лист Навника</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="music">
        <p className="sectionMark">04</p>
        <div>
          <p className="eyebrow">голоса мира</p>
          <h2>Музыка</h2>
          <p>Перенесём существующие композиции и оформим для них отдельный музыкальный раздел.</p>
        </div>
      </section>

      <section className="section" id="news">
        <p className="sectionMark">05</p>
        <div>
          <p className="eyebrow">летопись проекта</p>
          <h2>Новости</h2>
          <p>Здесь появятся обновления романа, иллюстраций, музыки и самого сайта.</p>
        </div>
      </section>

      <footer>
        <span>Там, где умирает Явь</span>
        <span>tamgdeumiraetyav.ru</span>
      </footer>
    </main>
  );
}
