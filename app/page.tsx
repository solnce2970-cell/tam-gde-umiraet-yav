"use client";

import { useState } from "react";

const sections = [
  { href: "#world", label: "Мир" },
  { href: "#navnik", label: "Навник" },
  { href: "#characters", label: "Герои" },
  { href: "#music", label: "Музыка" },
  { href: "#news", label: "Новости" },
];

const worlds = [
  {
    roman: "I",
    name: "Правь",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/world/prav.webp",
    text: "Мир богов, закона и узора судеб. Свет здесь не равен добру, а порядок — милосердию.",
    tags: "Нити · Алатырь · Воля богов",
  },
  {
    roman: "II",
    name: "Явь",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/world/yav.webp",
    text: "Мир людей, живого леса и дорог. Здесь начинаются истории — и здесь же им положено заканчиваться.",
    tags: "Лес · Деревня · Дорога",
  },
  {
    roman: "III",
    name: "Навь",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/world/nav.webp",
    text: "Мир предков, духов и сохранённой памяти. Велес хранит его, но Морок желает владеть им.",
    tags: "Память · Тени · Древний договор",
  },
];

const creatures = [
  {
    id: "auk",
    number: "01",
    name: "Аук",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/auk.webp",
    realm: "Межа",
    danger: "средняя",
    known: "Да",
    sections: [
      ["Где водится", "Держится старых лесов, болотных окраин и мест, где Явь близко подходит к Нави. Возле самой воды бывает редко."],
      ["Как узнать", "Ростом невелик, взрослому человеку примерно по пояс. Лохмат, кривоног, брюхат. Морда тёмная, бугристая, будто корой да мхом обросла. Глаза чёрные, зубы мелкие. Но прежде самого Аука обычно слышат его голос: может отозваться справа, потом слева, после — за спиной."],
      ["Нрав и повадки", "К людям выходит неохотно. Чаще морочит издалека, сбивает с тропы, пугает либо ходит следом, не показываясь. Иногда говорит человеку прямо в голову, без голоса. Не всякий Аук злой: иной только подшутит, иной предупредит о беде."],
      ["Чего беречься", "Не следует отвечать на незнакомое «ау» в старом лесу. Не следует также гнаться за голосом: Аук любит водить человека кругами."],
      ["Что помогает", "Если ходишь одним лесом часто, можно оставлять ему мясо, рог либо камешек со дна озера. Последний дар считается лучшим."],
      ["Что говорят", "Не ведомо доподлинно, много ли Ауков живёт по лесам. Одни уверяют — много. Другие говорят: Аук один, а голосов у него столько, сколько в лесу мест для эха."],
    ],
  },
  {
    id: "vasilisk",
    number: "02",
    name: "Василиск",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/vasilisk.webp",
    realm: "Навь",
    danger: "крайняя",
    known: "редко",
    sections: [["Запись", "Полный лист Василиска будет перенесён следующим этапом. Карточка уже работает в новой схеме: описание раскрывается прямо под изображением существа."]],
  },
  {
    id: "mavki",
    number: "03",
    name: "Мавки",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/mavki.webp",
    realm: "Навь",
    danger: "высокая",
    known: "да",
    sections: [["Запись", "Полный лист Мавок будет перенесён следующим этапом без сюжетных спойлеров — как страницу старого Навника."]],
  },
  {
    id: "strzhgun",
    number: "04",
    name: "Стржигун",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/strzhgun.webp",
    realm: "Навь",
    danger: "очень высокая",
    known: "редко",
    sections: [["Запись", "Полный лист Стржигуна будет перенесён следующим этапом. В новой версии длинное описание не уезжает вниз страницы."]],
  },
  {
    id: "shishiga",
    number: "05",
    name: "Шишига",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/shishiga.webp",
    realm: "Навь",
    danger: "средняя",
    known: "да",
    sections: [["Как узнать", "В старых записях особо отмечают ноги, которые у иной шишиги бывают развёрнуты пятками вперёд. Остальной лист будет перенесён из утверждённой версии Навника."]],
  },
  {
    id: "pauk",
    number: "06",
    name: "Паук",
    image: "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/navnik/pauk.webp",
    realm: "предположительно · Навь",
    danger: "крайняя",
    known: "мало",
    sections: [["Запись", "Полный лист Паука будет перенесён из утверждённого текста Навника. Здесь уже закреплена новая логика раскрытия карточки."]],
  },
];

const characters = [
  ["01", "Владимир"], ["02", "Невеяна"], ["03", "Светояра"],
  ["04", "Огнеяра"], ["05", "Семаргл"], ["06", "Морок"],
];

export default function HomePage() {
  const [openCreature, setOpenCreature] = useState<string | null>("auk");

  return (
    <main>
      <section className="hero" id="top">
        <div className="heroMist" />
        <nav className="nav" aria-label="Основная навигация">
          <a className="brand" href="#top">Там, где умирает Явь</a>
          <div className="navLinks">{sections.map((s) => <a key={s.href} href={s.href}>{s.label}</a>)}</div>
        </nav>
        <div className="heroContent">
          <p className="eyebrow">Роман в жанре тёмного славянского фэнтези</p>
          <h1>Там, где<br />умирает Явь</h1>
          <p className="lead">Три мира держатся на тонкой меже. Но память вернулась к тому, кто должен был забыть, — и древний договор нарушен впервые.</p>
          <div className="heroActions">
            <a className="primary" href="#world">Войти в мир</a>
            <a className="secondary" href="#music">Слушать музыку ↘</a>
          </div>
        </div>
        <a className="scrollHint" href="#world">Листать ↓</a>
      </section>

      <section className="section" id="world">
        <p className="sectionMark">01 · Устройство мира</p>
        <div className="sectionBody">
          <p className="eyebrow">Три стороны одной межи</p>
          <h2>Три стороны одной межи</h2>
          <p className="sectionIntro">Когда границы слабеют, ни один мир не остаётся прежним. Боги теряют власть над нитями судьбы, мёртвые вспоминают жизнь, а люди замечают следы тех, кого не должно быть рядом.</p>
          <div className="worldGrid">
            {worlds.map((world) => (
              <article className="worldCard" key={world.name}>
                <img src={world.image} alt={world.name} />
                <div className="worldCardBody">
                  <span className="roman">{world.roman}</span>
                  <h3>{world.name}</h3>
                  <p>{world.text}</p>
                  <small>{world.tags}</small>
                </div>
              </article>
            ))}
          </div>
          <div className="genealogyBlock">
            <div>
              <p className="eyebrow">Родословная богов</p>
              <h3>Кровь, любовь и право на Навь</h3>
              <p>Связи между богами объясняют, почему Морок считает Навь своим наследством, а Светояра и Огнеяра оказываются вплетены в один узор задолго до начала пути Владимира.</p>
            </div>
            <a href="/genealogy" className="secondary">Открыть схему крупно ↗</a>
          </div>
          <blockquote>«Память или жизнь — договор нарушен.»</blockquote>
        </div>
      </section>

      <section className="section" id="navnik">
        <p className="sectionMark">02 · Книга существ</p>
        <div className="sectionBody">
          <p className="eyebrow">Записи о тех, кто выходит к людям</p>
          <h2>Навник</h2>
          <p className="sectionIntro">Записи о тех, кто выходит к людям из леса, воды и сумрака Межи. Одни живут рядом с Явью, другие помнят дорогу в Навь.</p>
          <div className="creatureGrid">
            {creatures.map((creature) => {
              const isOpen = openCreature === creature.id;
              return (
                <article className={`creatureCard ${isOpen ? "open" : ""}`} key={creature.id}>
                  <button className="creatureButton" onClick={() => setOpenCreature(isOpen ? null : creature.id)} aria-expanded={isOpen}>
                    <div className="creatureImageWrap"><img src={creature.image} alt={creature.name} /></div>
                    <div className="creatureHeading">
                      <span>{creature.number}</span>
                      <div><h3>{creature.name}</h3><small>{creature.realm} · {creature.danger}</small></div>
                      <b>{isOpen ? "−" : "+"}</b>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="creatureDetail">
                      <div className="creatureFacts">
                        <span><small>Принадлежит</small>{creature.realm}</span>
                        <span><small>Опасность</small>{creature.danger}</span>
                        <span><small>Людям ведомо</small>{creature.known}</span>
                      </div>
                      <div className="navnikLeaf">
                        <span className="initial">{creature.name[0]}</span>
                        <div>
                          <p className="leafLabel">Запись о существе</p>
                          <h4>{creature.name}</h4>
                          {creature.sections.map(([title, text]) => <section key={title}><h5>{title}</h5><p>{text}</p></section>)}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <p className="navnikNote">Навник будет пополняться по мере того, как лес и Межа открывают новые имена.</p>
        </div>
      </section>

      <section className="section" id="characters">
        <p className="sectionMark">03 · Действующие лица</p>
        <div className="sectionBody">
          <p className="eyebrow">Те, чьи следы уже пересеклись</p>
          <h2>Те, чьи следы уже пересеклись</h2>
          <div className="characterTabs">{characters.map(([n, name]) => <span key={name}>{n} {name}</span>)}</div>
          <div className="featuredCharacter">
            <img src="https://tam-gde-umiraet-yav.inessa1981.chatgpt.site/characters/vladimir.webp" alt="Владимир" />
            <div>
              <p className="eyebrow">След</p>
              <p className="role">Охотник, умеющий читать лес</p>
              <h3>Владимир</h3>
              <blockquote>«Лес знает дорогу. Но сегодня он лжёт.»</blockquote>
              <p>Приёмный сын Яролики, привыкший доверять следам больше, чем словам. Дорога в Город должна была быть простой — пока лес не начал удерживать его у границы миров.</p>
              <small>Авторский образ персонажа</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="music">
        <p className="sectionMark">04 · Музыка романа</p>
        <div className="sectionBody">
          <p className="eyebrow">У каждого голоса — своя песня</p>
          <h2>У каждого голоса — своя песня</h2>
          <p className="sectionIntro">Музыка — ещё одна дорога в этот мир: славянские инструменты, лесные зовы, заговоры и песни персонажей складываются в отдельный альбом вселенной.</p>
          <div className="musicHero"><span>Я · П · Н</span><div><small>Главная тема · Выпущена</small><h3>Ой, тонка межа…</h3><p>Песня о Яви, Прави и Нави — первая музыкальная дверь во вселенную романа.</p></div></div>
          <div className="trackGrid">
            {[['01','Песня Невеяны','Нежная лесная песнь','В работе'],['02','Заговор Огнеяры','Огонь, жалейка и белый голос','В работе'],['03','Баллада о Владимире','Охотничий сказ у костра','В работе'],['04','Песня Аука','Короткая аукающая лесная песенка','Готова']].map(([n,t,d,s]) => <article key={n}><span>{n}</span><h4>{t}</h4><p>{d}</p><small>{s}</small></article>)}
          </div>
        </div>
      </section>

      <section className="section" id="news">
        <p className="sectionMark">05 · Летопись проекта</p>
        <div className="sectionBody">
          <p className="eyebrow">Новости с тонкой межи</p>
          <h2>Новости с тонкой межи</h2>
          <div className="newsGrid">
            <article><small>Июль 2026 · Сайт</small><h3>У мира появилась первая цифровая дверь</h3><p>Запущен черновик сайта романа. Здесь будут появляться главы, иллюстрации, музыка и новости проекта.</p></article>
            <article><small>В работе · Рукопись</small><h3>Путь через лес продолжается</h3><p>История Владимира и Светояры движется к моменту, когда привычное разделение на свет и тьму перестанет работать.</p></article>
            <article><small>Уже звучит · Музыка</small><h3>«Ой, тонка межа…» — песня трёх миров</h3><p>Главная музыкальная тема Яви, Прави и Нави уже выпущена и стала голосом будущего трейлера романа.</p></article>
          </div>
        </div>
      </section>

      <footer><div><strong>Там, где умирает Явь</strong><span>Авторский проект · Роман и музыка</span></div><nav>{sections.map((s) => <a key={s.href} href={s.href}>{s.label}</a>)}</nav><span>© 2026 · Черновик сайта</span></footer>
    </main>
  );
}
