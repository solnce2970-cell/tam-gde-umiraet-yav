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

export default function SitePolish() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("#world .sectionBody > .eyebrow, #world .sectionBody > h2").forEach((node) => {
      if (node.textContent?.trim() === "Три стороны одной межи") {
        node.textContent = "Три мира. Одна межа.";
      }
    });

    addGodsLink(document);

    const observer = new MutationObserver(() => addGodsLink(document));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
