"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./NavnikModalPortal.module.css";

type ModalState = {
  sourceId: string;
  html: string;
  imageSrc: string;
  imageAlt: string;
};

function readOpenLeaf(): ModalState | null {
  const source = document.querySelector<HTMLElement>(".navnikInline");
  if (!source) return null;

  const entry = source.closest<HTMLElement>(".creatureEntry");
  const image = entry?.querySelector<HTMLImageElement>(".creatureImageWrap > img");

  return {
    sourceId: source.id,
    html: source.innerHTML,
    imageSrc: image?.getAttribute("src") ?? "",
    imageAlt: image?.getAttribute("alt") ?? "",
  };
}

export default function NavnikModalPortal() {
  const [modal, setModal] = useState<ModalState | null>(null);
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
      <article className={styles.parchment} role="dialog" aria-modal="true" aria-label="Лист Навника">
        <button className={styles.close} type="button" onClick={closeModal} aria-label="Закрыть запись">
          ×
        </button>

        <div className={styles.scroll}>
          {modal.imageSrc && (
            <div className={styles.portrait}>
              <img src={modal.imageSrc} alt={modal.imageAlt} />
            </div>
          )}
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: modal.html }} />
        </div>
      </article>
    </div>
  );
}
