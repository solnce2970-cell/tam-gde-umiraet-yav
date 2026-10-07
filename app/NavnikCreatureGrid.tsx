"use client";

import { useEffect, useRef, useState } from "react";
import { responsiveImage } from "../lib/site/responsive-images";

export type Creature = {
  id: string;
  number: string;
  name: string;
  image: string;
  alt: string;
  altImage: string | null;
  altImageAlt: string | null;
  realm: string;
  danger: string;
  known: string;
  sections: [string, string][];
};

const POLUDNITSA: Creature = {
  id: "poludnitsa",
  number: "08",
  name: "Полудница",
  image: "/assets/v1/images/navnik/poludnica.webp",
  alt: "Полудница среди хлебного поля в полдень",
  altImage: "/assets/v1/images/navnik/poludnica2.webp",
  altImageAlt: "Полудница в слепящем полуденном свете",
  realm: "Навь",
  danger: "высокая",
  known: "хорошо",
  sections: [
    ["Где водится", "В хлебных полях в самый высокий полдень, когда солнце стоит почти над головой, воздух дрожит от жара, стихает ветер и даже насекомые замолкают. Не всё поле принадлежит ей всегда. Но есть час, когда старый закон отдаёт его Полуднице."],
    ["Как узнать", "Высокая, сухая женщина, вся белая: кожа, ресницы, длинные волосы и рубаха. Белизна у неё не чистая и не снежная — выгоревшая, словно льняное полотно, много лет пролежавшее под солнцем. Волосы спускаются почти до земли и могут оставаться совершенно неподвижными даже тогда, когда колосья вокруг клонятся сами собой.\n\nГолос молодой, приятный. Улыбается часто и почти всегда ласково.\n\nОт этого только хуже."],
    ["Нрав и повадки", "Полудница не бросается на человека сразу. Сначала предупреждает.\n\nЕсли человек не уходит, начинает говорить с ним. Спрашивает простые вещи. Зачем работаешь? Зачем торопишься? Зачем возвращаться домой? Зачем кормить детей? Зачем им жить?\n\nЗа каждым ответом следует новое «зачем».\n\nОна говорит до тех пор, пока человек ещё способен отвечать. Потом мысли путаются, силы уходят, желание сопротивляться истончается. Сначала человек ложится отдохнуть.\n\nИногда больше не встаёт."],
    ["Чего беречься", "Не жать в её час. Не спорить с предупреждением. Не считать древний закон пустой деревенской страшилкой.\n\nОсобенно дурно — оскорбить Полудницу и продолжить работу после того, как она трижды велела уйти.\n\nЗа пределами своего часа она такого права не имеет. Если Полудница покинет поле и пойдёт за человеком к жилью, это уже будет нарушением её собственного закона."],
    ["Что помогает", "Самое надёжное — переждать полдень.\n\nУслышал белую женщину среди ржи — оставь серп и уходи.\n\nЕсли разговор уже начался, старики советуют не пытаться переспорить её. У Полудницы времени больше."],
    ["Что говорят", "«Не бойся той, что стоит в поле. Бойся, когда она спросит: зачем»."],
  ],
};

function CreatureLeaf({ creature }: { creature: Creature }) {
  return (
    <div className="navnikInline" id={`navnik-entry-${creature.id}`}>
      <div className="inlineLeafHeader">
        <div>
          <p className="leafLabel">◇ Лист Навника · {creature.number}</p>
          <p className="leafType">Запись о существе</p>
          <h3>{creature.name}</h3>
        </div>
        <div className="creatureFacts">
          <span><small>Принадлежит</small>{creature.realm}</span>
          <span><small>Опасность</small>{creature.danger}</span>
          <span><small>Людям ведомо</small>{creature.known}</span>
        </div>
      </div>
      <div className="manuscriptLeaf">
        <span className="initial">{creature.name[0]}</span>
        <div className="leafText">
          {creature.sections.map(([title, copy]) => (
            <section key={title}>
              <h4>{title}</h4>
              <p>{copy}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatureEntry({
  creature,
  isOpen,
  onToggle,
}: {
  creature: Creature;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const entryRef = useRef<HTMLElement | null>(null);
  const [poludnitsaInView, setPoludnitsaInView] = useState(false);
  const isPoludnitsa = creature.id === "poludnitsa";

  useEffect(() => {
    if (!isPoludnitsa || !entryRef.current) return;

    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    if (!media.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPoludnitsaInView(entry.isIntersecting && entry.intersectionRatio >= 0.58),
      { threshold: [0, 0.35, 0.58, 0.8] },
    );

    observer.observe(entryRef.current);
    return () => observer.disconnect();
  }, [isPoludnitsa]);

  const articleClass = [
    "creatureEntry",
    isOpen ? "isOpen" : "",
    isPoludnitsa ? "poludnitsaEntry" : "",
    poludnitsaInView ? "poludnitsaMobileActive" : "",
  ].filter(Boolean).join(" ");

  const imageWrapClass = [
    "creatureImageWrap",
    creature.id === "strzhgun" ? "strzhgunCardImage" : "",
    isPoludnitsa ? "poludnitsaImageWrap" : "",
  ].filter(Boolean).join(" ");

  return (
    <article ref={entryRef} className={articleClass}>
      <button
        className={`creatureCard ${isPoludnitsa ? "poludnitsaCard" : ""}`}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`navnik-entry-${creature.id}`}
        aria-label={`${isOpen ? "Закрыть" : "Открыть"} запись: ${creature.name}`}
      >
        <div className={imageWrapClass}>
          <img src={creature.image} {...responsiveImage(creature.image, "card")} alt={creature.alt} loading="lazy" decoding="async" />
          {creature.altImage && <img className="secondaryCreatureImage" src={creature.altImage} {...responsiveImage(creature.altImage, "card")} alt={creature.altImageAlt ?? ""} loading="lazy" decoding="async" />}
          {isPoludnitsa && <span className="poludnitsaFlash" aria-hidden="true" />}
        </div>
        <div className="creatureHeading"><span>{creature.number}</span><div><h3>{creature.name}</h3><small>{creature.realm} · {creature.danger}</small></div><b>{isOpen ? "↓" : "↗"}</b></div>
      </button>
      {isOpen && <CreatureLeaf creature={creature} />}
    </article>
  );
}

export default function NavnikCreatureGrid({ creatures }: { creatures: readonly Creature[] }) {
  const [openCreatureId, setOpenCreatureId] = useState<string | null>(null);
  const displayedCreatures = creatures.some((creature) => creature.id === "poludnitsa")
    ? creatures
    : [...creatures, POLUDNITSA];

  return (
    <div className="creatureGrid">
      {displayedCreatures.map((creature) => {
        const isOpen = openCreatureId === creature.id;
        return (
          <CreatureEntry
            key={creature.id}
            creature={creature}
            isOpen={isOpen}
            onToggle={() => setOpenCreatureId(isOpen ? null : creature.id)}
          />
        );
      })}
    </div>
  );
}
