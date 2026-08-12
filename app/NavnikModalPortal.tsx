"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./NavnikModalPortal.module.css";

type ModalState = {
  sourceId: string;
  html: string;
  imageSrc: string;
  imageAlt: string;
};

function decorateCreatureLeaf(html: string, imageSrc: string, imageAlt: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;

  const header = template.content.querySelector<HTMLElement>(".inlineLeafHeader");
  const headerInfo = header?.firstElementChild as HTMLElement | null;
  if (headerInfo) headerInfo.classList.add("navnikHeaderInfo");

  const title = template.content.querySelector<HTMLElement>(".inlineLeafHeader h3");
  const text = title?.textContent?.trim() ?? "";

  if (title && text) {
    const first = text.slice(0, 1);
    const rest = text.slice(1);
    title.innerHTML = `<span class="navnikTitleInitial">${first}</span><span class="navnikTitleRest">${rest}</span>`;
  }

  if (header && imageSrc) {
    const portrait = document.createElement("div");
    portrait.className = "navnikModalPortrait";
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = imageAlt;
    portrait.appendChild(img);
    header.prepend(portrait);
  }

  return template.innerHTML;
}

function readOpenLeaf(): ModalState | null {
  const source = document.querySelector<HTMLElement>(".navnikInline");
  if (!source) return null;

  const entry = source.closest<HTMLElement>(".creatureEntry");
  const image = entry?.querySelector<HTMLImageElement>(".creatureImageWrap > img");
  const imageSrc = image?.getAttribute("src") ?? "";
  const imageAlt = image?.getAttribute("alt") ?? "";

  return {
    sourceId: source.id,
    html: decorateCreatureLeaf(source.innerHTML, imageSrc, imageAlt),
    imageSrc,
    imageAlt,
  };
}

export default function NavnikModalPortal() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isUnrolled, setIsUnrolled] = useState(false);
  const closingRef = useRef(false);

  useEffect(() => {
    const instruction = document.querySelector<HTMLElement>(".navnikInstruction");
    if (instruction) instruction.textContent = "Нажмите на существо — откроется старый лист Навника.";

    const sync = () => {
      const next = readOpenLeaf();

      if (closingRef.current) {
        if (!next) closingRef.current = false;
        return;
      }

      setModal((previous) => {
        if (!next) return null;
        if (
          previous?.sourceId === next.sourceId &&
          previous.html === next.html &&
          previous.imageSrc === next.imageSrc
        ) {
          return previous;
        }
        return next;
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!modal) {
      setIsUnrolled(false);
      return;
    }

    setIsUnrolled(false);
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsUnrolled(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [modal?.sourceId]);

  const closeModal = useCallback(() => {
    if (!modal) return;

    closingRef.current = true;
    const source = document.getElementById(modal.sourceId);
    const card = source?.closest<HTMLElement>(".creatureEntry")?.querySelector<HTMLButtonElement>(".creatureCard");

    card?.click();
    setModal(null);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modal, closeModal]);

  if (!modal) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
    >
      <article
        className={`${styles.parchment} ${isUnrolled ? styles.parchmentOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Лист Навника"
      >
        <button className={styles.close} type="button" onClick={closeModal} aria-label="Закрыть запись">
          ×
        </button>

        <div className={styles.scroll}>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: modal.html }} />
        </div>
      </article>
    </div>
  );
}
