"use client";

import { useEffect } from "react";
import { readAnomalyState, setMemoryChoice, setWorldSeen, unlockSign } from "../lib/anomalies/store";

const SEQUENCE = ["Явь", "Правь", "Навь"] as const;
const BEYOND_HREF = "/za-mezhoy";

function openChoice(stone: HTMLButtonElement) {
  if (document.querySelector("[data-memory-choice]")) return;

  const overlay = document.createElement("div");
  overlay.dataset.memoryChoice = "true";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Память или жизнь");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "5000",
    display: "grid",
    placeItems: "center",
    padding: "22px",
    background: "rgba(5,8,6,.88)",
    backdropFilter: "blur(8px)",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    width: "min(560px,100%)",
    padding: "clamp(30px,6vw,56px)",
    border: "1px solid rgba(213,192,154,.28)",
    background: "linear-gradient(145deg,rgba(18,23,19,.98),rgba(8,11,9,.99))",
    boxShadow: "0 28px 90px rgba(0,0,0,.55)",
    textAlign: "center",
    color: "#e7dfcf",
  });

  panel.innerHTML = `
    <p style="margin:0 0 12px;color:#b9935a;font-size:10px;letter-spacing:.18em;text-transform:uppercase">Древний договор</p>
    <h2 style="margin:0 0 18px;font:400 clamp(38px,7vw,64px)/1 Georgia,serif">Память или жизнь?</h2>
    <p style="margin:0 auto 30px;max-width:390px;color:#989186;line-height:1.7">Одно оставляют. Другое уносят. Выбор запомнится этому месту.</p>
    <div data-choice-buttons style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap"></div>
    <button data-choice-close type="button" style="margin-top:24px;border:0;background:transparent;color:#6f695f;cursor:pointer;font-size:11px;letter-spacing:.12em;text-transform:uppercase">Уйти</button>
  `;

  const buttons = panel.querySelector<HTMLElement>("[data-choice-buttons]")!;
  ([
    ["memory", "Память"],
    ["life", "Жизнь"],
  ] as const).forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    Object.assign(button.style, {
      minWidth: "150px",
      padding: "13px 20px",
      border: "1px solid rgba(213,192,154,.42)",
      background: "rgba(13,17,14,.72)",
      color: "#d9c9aa",
      cursor: "pointer",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      fontSize: "11px",
    });
    button.addEventListener("click", () => {
      setMemoryChoice(value);
      unlockSign("memory-or-life");
      stone.remove();
      panel.innerHTML = `
        <p style="margin:0 0 12px;color:#b9935a;font-size:10px;letter-spacing:.18em;text-transform:uppercase">Выбор принят</p>
        <h2 style="margin:0 0 18px;font:400 clamp(38px,7vw,64px)/1 Georgia,serif">За Межой</h2>
        <p style="margin:0 auto 30px;max-width:390px;color:#989186;line-height:1.7">Теперь это место помнит тебя.</p>
        <a href="${BEYOND_HREF}" style="display:inline-block;padding:13px 20px;border:1px solid rgba(213,192,154,.42);color:#d9c9aa;text-decoration:none;font-size:11px;letter-spacing:.1em;text-transform:uppercase">Перейти за Межу →</a>
      `;
    });
    buttons.appendChild(button);
  });

  const close = () => overlay.remove();
  panel.querySelector<HTMLButtonElement>("[data-choice-close]")?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function revealStone() {
  if (document.querySelector("[data-memory-stone]")) return;
  const body = document.querySelector<HTMLElement>("#world .sectionBody");
  if (!body) return;

  const stone = document.createElement("button");
  stone.type = "button";
  stone.dataset.memoryStone = "true";
  stone.setAttribute("aria-label", "Тёмный камень");
  stone.textContent = "◆";
  Object.assign(stone.style, {
    display: "block",
    margin: "18px 1.5% 0 auto",
    padding: "8px 10px",
    minWidth: "44px",
    minHeight: "44px",
    border: "0",
    background: "transparent",
    color: "rgba(115,112,103,.72)",
    textShadow: "0 0 10px rgba(185,147,90,.13)",
    cursor: "pointer",
    fontSize: "15px",
    lineHeight: "1",
    transform: "rotate(7deg)",
  });
  stone.addEventListener("click", () => openChoice(stone));
  body.appendChild(stone);
}

function installFallback(grid: HTMLElement) {
  const initial = readAnomalyState();
  if (initial.found.includes("memory-or-life")) return () => {};

  if (initial.choice) setWorldSeen([]);

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".worldCard"));
  const status = document.createElement("p");
  status.dataset.worldPathStatus = "true";
  Object.assign(status.style, {
    margin: "18px auto 0",
    maxWidth: "720px",
    textAlign: "center",
    color: "#8f887d",
    fontSize: "12px",
    lineHeight: "1.65",
    letterSpacing: ".05em",
  });
  grid.insertAdjacentElement("afterend", status);

  const paint = () => {
    const state = readAnomalyState();
    const step = state.worldSeen.length;
    status.textContent = step === 0
      ? "Три мира. Три шага. Начни с Яви — нажми на карточку."
      : step === 1
        ? "I · Явь помнит шаг. Теперь — Правь."
        : step === 2
          ? "II · Нить натянута. Последний шаг — Навь."
          : "III · Три шага сделаны. Межа услышала тебя.";
  };

  const activate = (card: HTMLElement) => {
    const name = card.querySelector("h3")?.textContent?.trim();
    if (!name) return;
    const state = readAnomalyState();
    const expected = SEQUENCE[state.worldSeen.length];
    if (!expected) {
      revealStone();
      return;
    }
    if (name !== expected) {
      status.textContent = `Не этот путь. Следующий шаг — ${expected}.`;
      return;
    }
    const next = [...state.worldSeen, name];
    setWorldSeen(next);
    paint();
    if (next.length === SEQUENCE.length) window.setTimeout(revealStone, 420);
  };

  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (!target || target.closest("button,a,input,select,textarea")) return;
    const card = target.closest<HTMLElement>(".worldCard");
    if (!card) return;
    activate(card);
  };

  cards.forEach((card) => {
    card.style.cursor = "pointer";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const name = card.querySelector("h3")?.textContent?.trim();
    if (name) card.setAttribute("aria-label", `Сделать шаг через ${name}`);
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("worldCard")) return;
    event.preventDefault();
    activate(target);
  };

  grid.addEventListener("click", onClick);
  grid.addEventListener("keydown", onKeyDown);
  paint();

  return () => {
    grid.removeEventListener("click", onClick);
    grid.removeEventListener("keydown", onKeyDown);
    status.remove();
  };
}

export default function MemoryContractInputFix() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let fallbackCleanup = () => {};
    let grid: HTMLElement | null = null;

    const install = () => {
      grid = document.querySelector<HTMLElement>(".worldGrid");
      if (!grid) return false;

      const state = readAnomalyState();
      if (state.choice && state.found.includes("memory-or-life")) return true;

      const forwardWholeCardClick = (event: Event) => {
        const target = event.target as Element | null;
        if (!target || target instanceof HTMLImageElement || target.closest("button,a,input,select,textarea")) return;
        const card = target.closest<HTMLElement>(".worldCard");
        const image = card?.querySelector<HTMLImageElement>(":scope > img");
        if (!card || !image) return;
        image.click();
      };

      grid.addEventListener("click", forwardWholeCardClick);

      const checkTimer = window.setTimeout(() => {
        if (!document.querySelector("[data-world-path-status]")) {
          grid?.removeEventListener("click", forwardWholeCardClick);
          if (grid) fallbackCleanup = installFallback(grid);
        }
      }, 350);

      fallbackCleanup = () => {
        window.clearTimeout(checkTimer);
        grid?.removeEventListener("click", forwardWholeCardClick);
      };
      return true;
    };

    if (install()) return () => fallbackCleanup();

    const observer = new MutationObserver(() => {
      if (!install()) return;
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      fallbackCleanup();
    };
  }, []);

  return null;
}
