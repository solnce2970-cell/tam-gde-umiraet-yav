"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const sync = () => setModal(readOpenLeaf());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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
  }, [modal]);

  const closeModal = () => {
    if (!modal) return;

    const source = document.getElementById(modal.sourceId);
    const card = source?.closest<HTMLElement>(".creatureEntry")?.querySelector<HTMLButtonElement>(".creatureCard");

    setModal(null);
    card?.click();
  };

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
