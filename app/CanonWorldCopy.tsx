"use client";

import { useLayoutEffect } from "react";

const HERO_COPY = "Межа между Явью и Навью становится тоньше.";
const WORLD_TITLE = "Три мира, связанные одним законом";
const WORLD_ANOMALY_RESTORE = "Три мира. Одна межа.";
const WORLD_INTRO = "Слабая Межа меняет не только Явь и Навь. Её нарушение отзывается даже в Прави.";
const SHISHIGA_OLD = "Старое средство — заговорённая соль: ею режут твари путь и жгут горло. Камень Семаргла также считается защитой. Но если границы миров нарушены, привычные обереги могут не сработать — это худший знак из всех.";
const SHISHIGA_NEW = "Старое средство — заговорённая соль: ею режут твари путь и жгут горло. Камень Семаргла также считается защитой. Но если Явь и Навь подошли друг к другу слишком близко, привычные обереги могут не сработать — это худший знак из всех.";

function applyCanonCopy() {
  if (window.location.pathname !== "/") return;

  const heroLead = document.querySelector<HTMLElement>(".hero .heroContent > .lead");
  if (heroLead) heroLead.textContent = HERO_COPY;

  const worldEyebrow = document.querySelector<HTMLElement>("#world .sectionBody > .eyebrow");
  if (worldEyebrow) worldEyebrow.textContent = WORLD_TITLE;

  const worldHeading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
  if (worldHeading && worldHeading.textContent?.trim() !== "А если межа уже нарушена?") {
    worldHeading.textContent = WORLD_TITLE;
  }

  const worldIntro = document.querySelector<HTMLElement>("#world .sectionBody > .sectionIntro");
  if (worldIntro) worldIntro.textContent = WORLD_INTRO;

  document.querySelectorAll<HTMLElement>("#navnik .leafText p").forEach((paragraph) => {
    if (paragraph.textContent?.trim() === SHISHIGA_OLD) paragraph.textContent = SHISHIGA_NEW;
  });
}

export default function CanonWorldCopy() {
  useLayoutEffect(() => {
    if (window.location.pathname !== "/") return;

    applyCanonCopy();

    const worldHeading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
    const headingObserver = worldHeading
      ? new MutationObserver(() => {
          if (worldHeading.textContent?.trim() === WORLD_ANOMALY_RESTORE) {
            worldHeading.textContent = WORLD_TITLE;
          }
        })
      : null;

    headingObserver?.observe(worldHeading!, { childList: true, characterData: true, subtree: true });

    const navnik = document.querySelector<HTMLElement>("#navnik");
    const navnikObserver = navnik
      ? new MutationObserver(() => {
          document.querySelectorAll<HTMLElement>("#navnik .leafText p").forEach((paragraph) => {
            if (paragraph.textContent?.trim() === SHISHIGA_OLD) paragraph.textContent = SHISHIGA_NEW;
          });
        })
      : null;

    navnikObserver?.observe(navnik!, { childList: true, subtree: true });

    return () => {
      headingObserver?.disconnect();
      navnikObserver?.disconnect();
    };
  }, []);

  return null;
}
