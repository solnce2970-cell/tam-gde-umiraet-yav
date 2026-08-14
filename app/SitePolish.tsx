"use client";

import { useEffect } from "react";

const GODS_HREF = "/genealogy#gods-title";

function addGodsLink(root: ParentNode) {
  const containers = root.querySelectorAll<HTMLElement>(".navLinks, .mobileMenu, footer > div");

  containers.forEach((container) => {
    if (container.querySelector(`a[href="${GODS_HREF}"]`)) return;

    const heroes = container.querySelector<HTMLAnchorElement>('a[href="#characters"]');
    if (!heroes) return;

    const link = document.createElement("a");
    link.href = GODS_HREF;
    link.textContent = "Лики богов";
    heroes.insertAdjacentElement("afterend", link);
  });
}

function polishWorldCopy() {
  document
    .querySelectorAll<HTMLElement>("#world .sectionBody > .eyebrow, #world .sectionBody > h2")
    .forEach((node) => {
      if (node.textContent?.trim() === "Три стороны одной межи") {
        node.textContent = "Три мира. Одна межа.";
      }
    });
}

function removeDuplicateDoorNews() {
  const articles = Array.from(document.querySelectorAll<HTMLElement>("#news .newsGrid article"));
  let keptDoorStory = false;

  articles.forEach((article) => {
    const title = article.querySelector("h3")?.textContent?.trim() ?? "";
    const isDoorStory =
      title === "У мира появилась самостоятельная цифровая дверь" ||
      title === "У мира появилась первая цифровая дверь";

    if (!isDoorStory) return;

    if (!keptDoorStory) {
      keptDoorStory = true;
      return;
    }

    article.remove();
  });
}

function addAuthorToFooter() {
  const footer = document.querySelector<HTMLElement>("footer");
  if (!footer || footer.querySelector("[data-site-author]")) return;

  const author = document.createElement("p");
  author.dataset.siteAuthor = "true";
  author.textContent = "Автор · Инесса Логинова";

  const links = footer.querySelector(":scope > div");
  if (links) {
    footer.insertBefore(author, links);
  } else {
    footer.appendChild(author);
  }
}

export default function SitePolish() {
  useEffect(() => {
    polishWorldCopy();
    removeDuplicateDoorNews();
    addAuthorToFooter();
    addGodsLink(document);

    // Наблюдаем только за навигацией: это нужно для мобильного меню,
    // которое появляется после клика. Страницы и карточки больше не
    // переписываются из MutationObserver, поэтому цикл мутаций исключён.
    const nav = document.querySelector<HTMLElement>(".nav");
    if (!nav) return;

    const observer = new MutationObserver(() => addGodsLink(nav));
    observer.observe(nav, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
