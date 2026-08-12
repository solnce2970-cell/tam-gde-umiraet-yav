"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./NavnikModalPortal.module.css";

type ModalState = {
  sourceId: string;
  html: string;
  imageAlt: string;
  illustrationSrcs: string[];
};

const illustrationMap: Record<string, string[]> = {
  auk: [
    "/images/navnik/illustrations/auk.webp",
    "/images/navnik/illustrations/аук рукопись.png",
  ],
  vasilisk: ["/images/navnik/illustrations/vasilisk.webp"],
  mavki: ["/images/navnik/illustrations/mavki.webp"],
  strzhgun: ["/images/navnik/illustrations/strzhgun.webp"],
  shishiga: ["/images/navnik/illustrations/shishiga.webp"],
  pauk: ["/images/navnik/illustrations/pauk.webp"],
};

function decorateCreatureLeaf(
  html: string,
  illustrationSrcs: string[],
  imageAlt: string,
): string {
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

  if (header && illustrationSrcs.length) {
    const gallery = document.createElement("div");
    gallery.className = `navnikModalGallery${illustrationSrcs.length > 1 ? " navnikModalGalleryMultiple" : ""}`;

    illustrationSrcs.forEach((src, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "navnikModalPortrait";
      button.setAttribute("data-zoom-src", src);
      button.setAttribute("aria-label", `Открыть рисунок ${index + 1} крупно`);

      const img = document.createElement("img");
      img.setAttribute("src", src);
      img.alt = illustrationSrcs.length > 1 ? `${imageAlt}, рисунок ${index + 1}` : `${imageAlt}, рисунок`;

      button.appendChild(img);
      gallery.appendChild(button);
    });

    header.prepend(gallery);
  }

  return template.innerHTML;
}

function readOpenLeaf(): ModalState | null {
  const source = document.querySelector<HTMLElement>(".navnikInline");
  if (!source) return null;

  const entry = source.closest<HTMLElement>(".creatureEntry");
  const image = entry?.querySelector<HTMLImageElement>(".creatureImageWrap > img");
  const imageAlt = image?.getAttribute("alt") ?? "Существо из Навника";
  const creatureId = source.id.replace("navnik-entry-", "");
  const illustrationSrcs = illustrationMap[creatureId] ?? [];

  return {
    sourceId: source.id,
    html: decorateCreatureLeaf(source.innerHTML, illustrationSrcs, imageAlt),
    imageAlt,
    illustrationSrcs,
  };
}

export default function NavnikModalPortal() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isUnrolled, setIsUnrolled] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const closingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
          previous.html === next.html
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
      setShowScrollHint(false);
      setZoomSrc(null);
      return;
    }

    setIsUnrolled(false);
    setShowScrollHint(false);
    setZoomSrc(null);
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setIsUnrolled(true);
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el) setShowScrollHint(el.scrollHeight > el.clientHeight + 8 && el.scrollTop < 10);
        });
      });
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
    setZoomSrc(null);
    setModal(null);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomSrc) {
        setZoomSrc(null);
      } else {
        closeModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modal, zoomSrc, closeModal]);

  const handleContentClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLElement>("[data-zoom-src]");
    const src = trigger?.getAttribute("data-zoom-src");
    if (src) setZoomSrc(src);
  }, []);

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

        <div
          className={styles.scroll}
          ref={scrollRef}
          onScroll={(event) => setShowScrollHint(event.currentTarget.scrollTop < 10 && event.currentTarget.scrollHeight > event.currentTarget.clientHeight + 8)}
        >
          <div
            className={styles.content}
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: modal.html }}
          />
        </div>

        {showScrollHint && (
          <div className={styles.scrollHint} aria-hidden="true">
            <span>Листать</span>
            <b>⌄</b>
          </div>
        )}
      </article>

      {zoomSrc && (
        <div
          className={styles.zoomOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Рисунок крупно"
          onMouseDown={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) setZoomSrc(null);
          }}
        >
          <button
            className={styles.zoomClose}
            type="button"
            onClick={() => setZoomSrc(null)}
            aria-label="Закрыть увеличенный рисунок"
          >
            ×
          </button>
          <img className={styles.zoomImage} src={zoomSrc} alt={modal.imageAlt} />
        </div>
      )}
    </div>
  );
}
