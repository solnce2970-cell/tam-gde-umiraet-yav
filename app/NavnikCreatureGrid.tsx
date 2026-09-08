"use client";

import { useState } from "react";
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

export default function NavnikCreatureGrid({ creatures }: { creatures: readonly Creature[] }) {
  const [openCreatureId, setOpenCreatureId] = useState<string | null>(null);

  return (
    <div className="creatureGrid">
      {creatures.map((creature) => {
        const isOpen = openCreatureId === creature.id;
        return (
          <article className={`creatureEntry ${isOpen ? "isOpen" : ""}`} key={creature.id}>
            <button
              className="creatureCard"
              type="button"
              onClick={() => setOpenCreatureId(isOpen ? null : creature.id)}
              aria-expanded={isOpen}
              aria-controls={`navnik-entry-${creature.id}`}
              aria-label={`${isOpen ? "Закрыть" : "Открыть"} запись: ${creature.name}`}
            >
              <div className={`creatureImageWrap ${creature.id === "strzhgun" ? "strzhgunCardImage" : ""}`}>
                <img src={creature.image} {...responsiveImage(creature.image, "card")} alt={creature.alt} loading="lazy" decoding="async" />
                {creature.altImage && <img className="secondaryCreatureImage" src={creature.altImage} {...responsiveImage(creature.altImage, "card")} alt={creature.altImageAlt ?? ""} loading="lazy" decoding="async" />}
              </div>
              <div className="creatureHeading"><span>{creature.number}</span><div><h3>{creature.name}</h3><small>{creature.realm} · {creature.danger}</small></div><b>{isOpen ? "↓" : "↗"}</b></div>
            </button>
            {isOpen && <CreatureLeaf creature={creature} />}
          </article>
        );
      })}
    </div>
  );
}
