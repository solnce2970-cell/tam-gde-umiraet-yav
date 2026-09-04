"use client";

import { useEffect } from "react";

function ensureReadingLink(container: Element | null, className?: string) {
  if (!container || container.querySelector('a[href="/chitat"]')) return;

  const link = document.createElement("a");
  link.href = "/chitat";
  link.textContent = "Читать";
  if (className) link.className = className;

  const firstLink = container.querySelector("a");
  if (firstLink) container.insertBefore(link, firstLink);
  else container.appendChild(link);
}

function enhanceHomePage() {
  if (window.location.pathname !== "/") return;

  ensureReadingLink(document.querySelector(".navLinks"));
  ensureReadingLink(document.querySelector(".mobileMenu"));

  const heroActions = document.querySelector(".heroActions");
  if (heroActions && !heroActions.querySelector('a[href="/chitat"]')) {
    const link = document.createElement("a");
    link.href = "/chitat";
    link.className = "secondary";
    link.textContent = "Читать";

    const musicLink = heroActions.querySelector('a[href="#music"]');
    if (musicLink) heroActions.insertBefore(link, musicLink);
    else heroActions.appendChild(link);
  }

  const news = document.querySelector("#news");
  const extraRoads = document.querySelector('aside[aria-labelledby="extra-links-title"]');
  if (news && extraRoads && news.parentElement === extraRoads.parentElement) {
    news.parentElement?.insertBefore(extraRoads, news);
  }
}

export default function ReadingAccessEnhancer() {
  useEffect(() => {
    enhanceHomePage();

    const observer = new MutationObserver(() => enhanceHomePage());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
