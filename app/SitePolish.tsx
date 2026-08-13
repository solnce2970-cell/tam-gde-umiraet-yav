"use client";

import { useEffect } from "react";

function addGodsLink(root: ParentNode) {
  const containers = root.querySelectorAll<HTMLElement>(".navLinks, .mobileMenu");
  containers.forEach((container) => {
    if (container.querySelector('a[href="/genealogy#gods-title"]')) return;
    const heroes = container.querySelector<HTMLAnchorElement>('a[href="#characters"]');
    if (!heroes) return;
    const link = document.createElement("a");
    link.href = "/genealogy#gods-title";
    link.textContent = "Лики богов";
    heroes.insertAdjacentElement("afterend", link);
  });
}

function polishCopy() {
  document.querySelectorAll<HTMLElement>("#world .sectionBody > .eyebrow, #world .sectionBody > h2").forEach((node) => {
    if (node.textContent?.trim() === "Три стороны одной межи") {
      node.textContent = "Три мира. Одна межа.";
    }
  });

  const lada = document.querySelector<HTMLElement>(".ladaCard .godInfo");
  if (lada) {
    const mark = lada.querySelector<HTMLElement>("small");
    const text = lada.querySelector<HTMLElement>("p");
    if (mark) mark.textContent = "Семья. НеЛюбовь. Подлость.";
    if (text) text.textContent = "Богиня семьи и покровительница беременных. Но сама не так чиста, как принято думать.";
  }
}

export default function SitePolish() {
  useEffect(() => {
    polishCopy();
    addGodsLink(document);

    const observer = new MutationObserver(() => {
      polishCopy();
      addGodsLink(document);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
