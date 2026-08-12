"use client";

import { useEffect, useState } from "react";

const base = "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site";

const sections = [
  { href: "#world", label: "Мир" },
  { href: "#navnik", label: "Навник" },
  { href: "#characters", label: "Герои" },
  { href: "#music", label: "Музыка" },
  { href: "#news", label: "Новости" },
];

const worlds = [
  { roman: "I", name: "Правь", image: `${base}/world/prav.webp`, text: "Мир богов, закона и узора судеб. Свет здесь не равен добру, а порядок — милосердию.", tags: "Нити · Алатырь · Воля богов" },
  { roman: "II", name: "Явь", image: `${base}/world/yav.webp`, text: "Мир людей, живого леса и дорог. Здесь начинаются истории — и здесь же им положено заканчиваться.", tags: "Лес · Деревня · Дорога" },
  { roman: "III", name: "Навь", image: `${base}/world/nav.webp`, text: "Мир предков, духов и сохранённой памяти. Велес хранит его, но Морок желает владеть им.", tags: "Память · Тени · Древний договор" },
];

const creatures = [
  {
    id: "auk", number: "01", name: "Аук", image: `${base}/navnik/auk.webp`, realm: "Межа", danger: "средняя", known: "да",
    sections: [
      ["Где водится", "Держится старых лесов, болотных окраин и мест, где Явь близко подходит к Нави. Возле самой воды бывает редко."],
      ["Как узнать", "Ростом невелик, взрослому человеку примерно по пояс. Лохмат, кривоног, брюхат. Морда тёмная, бугристая, будто корой да мхом обросла. Глаза чёрные, зубы мелкие. Но прежде самого Аука обычно слышат его голос. Может отозваться справа, потом слева, после — за спиной. Потому по одному голосу места его не угадаешь."],
      ["Нрав и повадки", "К людям выходит неохотно. Чаще морочит издалека, сбивает с тропы, пугает либо ходит следом, не показываясь. Иногда говорит человеку прямо в голову, без голоса. Не всякий Аук злой: иной только подшутит, иной предупредит о беде."],
      ["Чего беречься", "Не следует отвечать на незнакомое «ау» в старом лесу. Не следует также гнаться за голосом: Аук любит водить человека кругами."],
      ["Что помогает", "Если ходишь одним лесом часто, можно оставлять ему мясо, рог либо камешек со дна озера. Последний дар считается лучшим."],
      ["Что говорят", "Не ведомо доподлинно, много ли Ауков живёт по лесам. Одни уверяют — много. Другие говорят: Аук один, а голосов у него столько, сколько в лесу мест для эха."],
    ],
  },
  { id: "vasilisk", number: "02", name: "Василиск", image: `${base}/navnik/vasilisk.webp`, realm: "Навь", danger: "крайняя", known: "редко", sections: [["Запись", "Древняя тварь, которую редко называют вслух. Полная запись Навника будет добавлена без сюжетных отсылок к событиям романа."]] },
  { id: "mavki", number: "03", name: "Мавки", image: `${base}/navnik/mavki.webp`, realm: "Навь", danger: "высокая", known: "да", sections: [["Запись", "Лесные и водные существа Нави. Полная запись будет перенесена на этот лист в форме старого Навника, без спойлеров романа."]] },
  { id: "strzhgun", number: "04", name: "Стрижгун", image: `${base}/navnik/strzhgun.webp`, realm: "Навь", danger: "очень высокая", known: "редко", sections: [["Запись", "Кровосос, питающийся не только плотью. Его облик и повадки будут описаны здесь как старинная запись о твари, а не как современная энциклопедия."]] },
  { id: "shishiga", number: "05", name: "Шишига", image: `${base}/navnik/shishiga.webp`, realm: "Навь", danger: "средняя", known: "да", sections: [["Как узнать", "В старых записях особо отмечают ноги, которые у иной шишиги бывают развёрнуты пятками вперёд."]] },
  { id: "pauk", number: "06", name: "Паук", image: `${base}/navnik/pauk.webp`, realm: "предположительно · Навь", danger: "крайняя", known: "мало", sections: [["Запись", "Огромная паучья тварь и её выводок. Полный лист будет перенесён из утверждённой версии Навника."]] },
];

type Creature = (typeof creatures)[number];

const characters = [
  { number: "01", name: "Владимир", role: "Охотник Яви", image: `${base}/characters/vladimir.webp`, text: "Приёмный сын Яролики. Читает лес и следы лучше, чем людей, а его сила откликается прежде всего на защиту живого." },
  { number: "02", name: "Невеяна", role: "Девушка из Яви", image: `${base}/characters/neveyana.webp`, text: "Тихая снаружи и гораздо сложнее, чем привыкли думать окружающие. Её путь связан с тем, кто первым сумел увидеть её целиком." },
  { number: "03", name: "Светояра", role: "Дочь Прави", image: `${base}/characters/svetoyara.webp`, text: "Светлая сущность Прави, сильная даже тогда, когда лишена привычной силы. Её выбор всё чаще оказывается важнее закона." },
  { number: "04", name: "Огнеяра", role: "Ведьма Межи", image: `${base}/characters/ogneara.webp`, text: "Рыжая ведьма с острым языком и старой болью. Правь её отвергла, Навь приняла, а Явь стала местом, которое приходится защищать." },
  { number: "05", name: "Семаргл", role: "Огненный бог", image: `${base}/characters/semargl.webp`, text: "Сын Сварога от искры и сын Макоши по теплу. Его огонь хранит границы, а прошлое связано с Огнеярой теснее, чем они оба хотели бы." },
  { number: "06", name: "Морок", role: "Наследник тьмы", image: `${base}/characters/morok.webp`, text: "Не просто тень и не просто обман. Морок показывает человеку то, что тот сильнее всего желает увидеть, и хочет оставить миру только Правь и Навь." },
];

function CreatureModal({ creature, onClose }: { creature: Creature; onClose: () => void }) {
  useEffect(() => {
    const closeByEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeByEscape);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeByEscape);
      document.body.style.overflow = oldOverflow;
    };
  }, [onClose]);

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="navnikModal" role="dialog" aria-modal="true" aria-label={`Запись Навника: ${creature.name}`}>
        <button className="modalClose" onClick={onClose} aria-label="Закрыть запись">×</button>
        <div className="modalTop">
          <div className={`modalCreatureImage ${creature.id === "strzhgun" ? "strzhgunImage" : ""}`}>
            <img src={creature.image} alt={creature.name} />
          </div>
          <div className="modalHeading">
            <p className="leafLabel">Лист Навника · {creature.number}</p>
            <h3>{creature.name}</h3>
            <div className="creatureFacts">
              <span><small>Принадлежит</small>{creature.realm}</span>
              <span><small>Опасность</small>{creature.danger}</span>
              <span><small>Людям ведомо</small>{creature.known}</span>
            </div>
          </div>
        </div>
        <div className="manuscriptLeaf">
          <span className="initial">{creature.name[0]}</span>
          <div className="leafText">
            {creature.sections.map(([title, text]) => (
              <section key={title}>
                <h4>{title}</h4>
                <p>{text}</p>
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function HomePage() {
  const [openCreature, setOpenCreature] = useState<Creature | null>(null);

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
          <div className="heroActions"><a className="primary" href="#world">Войти в мир</a><a className="secondary" href="#music">Слушать музыку ↘</a></div>
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
            {worlds.map((world) => <article className="worldCard" key={world.name}><img src={world.image} alt={world.name} /><div className="worldCardBody"><span className="roman">{world.roman}</span><h3>{world.name}</h3><p>{world.text}</p><small>{world.tags}</small></div></article>)}
          </div>
          <div className="genealogyBlock"><div><p className="eyebrow">Родословная богов</p><h3>Кровь, любовь и право на Навь</h3><p>Связи между богами объясняют, почему Морок считает Навь своим наследством, а Светояра и Огнеяра оказываются вплетены в один узор задолго до начала пути Владимира.</p></div><a href="/genealogy" className="secondary">Открыть схему крупно ↗</a></div>
          <blockquote>«Память или жизнь — договор нарушен.»</blockquote>
        </div>
      </section>

      <section className="section" id="navnik">
        <p className="sectionMark">02 · Книга существ</p>
        <div className="sectionBody">
          <p className="eyebrow">Записи о тех, кто выходит к людям</p>
          <h2>Навник</h2>
          <p className="sectionIntro">Нажмите на существо — старый лист Навника откроется поверх страницы. Запись можно закрыть крестиком, кликом за пределами листа или клавишей Esc.</p>
          <div className="creatureGrid">
            {creatures.map((creature) => (
              <button className="creatureCard" key={creature.id} onClick={() => setOpenCreature(creature)} aria-label={`Открыть запись: ${creature.name}`}>
                <div className={`creatureImageWrap ${creature.id === "strzhgun" ? "strzhgunCardImage" : ""}`}><img src={creature.image} alt={creature.name} /></div>
                <div className="creatureHeading"><span>{creature.number}</span><div><h3>{creature.name}</h3><small>{creature.realm} · {creature.danger}</small></div><b>↗</b></div>
              </button>
            ))}
          </div>
          <p className="navnikNote">Навник будет пополняться по мере того, как лес и Межа открывают новые имена.</p>
        </div>
      </section>

      <section className="section" id="characters">
        <p className="sectionMark">03 · Действующие лица</p>
        <div className="sectionBody">
          <p className="eyebrow">Те, чьи следы уже пересеклись</p>
          <h2>Герои</h2>
          <p className="sectionIntro">Основные лица истории — люди, боги и те, кому тесно внутри одного мира.</p>
          <div className="characterGrid">
            {characters.map((character) => (
              <article className="characterCard" key={character.name}>
                <div className="characterPortrait"><img src={character.image} alt={character.name} /></div>
                <div className="characterInfo"><span>{character.number}</span><p className="role">{character.role}</p><h3>{character.name}</h3><p>{character.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section darkSection" id="music">
        <p className="sectionMark">04 · Музыка романа</p>
        <div className="sectionBody">
          <p className="eyebrow">У каждого голоса — своя песня</p><h2>У каждого голоса — своя песня</h2>
          <p className="sectionIntro">Музыка — ещё одна дорога в этот мир: славянские инструменты, лесные зовы, заговоры и песни персонажей складываются в отдельный альбом вселенной.</p>
          <div className="trackHero"><div className="vinyl">Я · П · Н</div><div><small>Главная тема · Выпущена</small><h3>Ой, тонка межа…</h3><p>Песня о Яви, Прави и Нави — первая музыкальная дверь во вселенную романа.</p></div></div>
          <div className="trackList"><span>01 <b>Песня Невеяны</b> · нежная лесная песнь</span><span>02 <b>Заговор Огнеяры</b> · огонь, жалейка и белый голос</span><span>03 <b>Баллада о Владимире</b> · охотничий сказ у костра</span><span>04 <b>Песня Аука</b> · короткая аукающая лесная песенка</span></div>
        </div>
      </section>

      <section className="section" id="news">
        <p className="sectionMark">05 · Летопись проекта</p>
        <div className="sectionBody"><p className="eyebrow">Новости с тонкой межи</p><h2>Новости с тонкой межи</h2><div className="newsGrid"><article><small>Сайт</small><h3>У мира появилась цифровая дверь</h3><p>Развивается самостоятельная версия сайта романа с Навником, героями, музыкой и материалами мира.</p></article><article><small>Рукопись</small><h3>Путь через лес продолжается</h3><p>История Владимира и Светояры движется к моменту, когда привычное разделение на свет и тьму перестанет работать.</p></article><article><small>Музыка</small><h3>«Ой, тонка межа…»</h3><p>Главная музыкальная тема Яви, Прави и Нави уже стала голосом вселенной романа.</p></article></div></div>
      </section>

      <footer><h2>Там, где умирает Явь</h2><p>Авторский проект · Роман и музыка</p><div>{sections.map((s) => <a key={s.href} href={s.href}>{s.label}</a>)}</div><small>© 2026</small></footer>

      {openCreature && <CreatureModal creature={openCreature} onClose={() => setOpenCreature(null)} />}
    </main>
  );
}
