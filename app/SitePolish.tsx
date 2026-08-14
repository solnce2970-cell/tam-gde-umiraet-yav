"use client";

import { useEffect } from "react";

const GODS_HREF = "/genealogy#gods-title";
const BEYOND_HREF = "/za-mezhoy";
const STATE_KEY = "yav-anomalies-v1";

type AnomalyState = {
  found: string[];
  beyondUnlocked: boolean;
  choice: "memory" | "life" | null;
  worldSeen: string[];
};

const emptyState: AnomalyState = {
  found: [],
  beyondUnlocked: false,
  choice: null,
  worldSeen: [],
};

function readState(): AnomalyState {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw) as Partial<AnomalyState>;
    return {
      found: Array.isArray(parsed.found) ? [...new Set(parsed.found)] : [],
      beyondUnlocked: parsed.beyondUnlocked === true,
      choice: parsed.choice === "memory" || parsed.choice === "life" ? parsed.choice : null,
      worldSeen: Array.isArray(parsed.worldSeen) ? [...new Set(parsed.worldSeen)] : [],
    };
  } catch {
    return { ...emptyState };
  }
}

function writeState(state: AnomalyState) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {}
}

function markAnomaly(id: string) {
  const state = readState();
  if (state.found.includes(id)) return state;
  state.found.push(id);
  writeState(state);
  window.dispatchEvent(new CustomEvent("yav:anomaly-found", { detail: { id, count: state.found.length } }));
  return state;
}

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

function addBeyondLink() {
  const state = readState();
  if (!state.beyondUnlocked) return;

  const container = document.querySelector<HTMLElement>("footer > div");
  if (!container || container.querySelector(`a[href="${BEYOND_HREF}"]`)) return;

  const link = document.createElement("a");
  link.href = BEYOND_HREF;
  link.textContent = "За Межой";
  link.style.opacity = ".62";
  link.style.letterSpacing = ".08em";

  const gods = container.querySelector<HTMLAnchorElement>(`a[href="${GODS_HREF}"]`);
  if (gods) gods.insertAdjacentElement("afterend", link);
  else container.appendChild(link);
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
  if (links) footer.insertBefore(author, links);
  else footer.appendChild(author);
}

function setupBrokenBorderAnomaly() {
  const heading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
  if (!heading) return () => {};

  let timer: number | undefined;
  let restoreTimer: number | undefined;
  const sessionKey = "yav-border-anomaly-attempt-v1";

  const clearTimers = () => {
    if (timer) window.clearTimeout(timer);
    if (restoreTimer) window.clearTimeout(restoreTimer);
    timer = undefined;
    restoreTimer = undefined;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.55) {
        if (timer) window.clearTimeout(timer);
        timer = undefined;
        return;
      }

      if (window.sessionStorage.getItem(sessionKey)) return;
      window.sessionStorage.setItem(sessionKey, "1");

      const state = readState();
      const chance = state.found.includes("broken-border") ? 0.12 : 0.42;
      if (Math.random() > chance) return;

      timer = window.setTimeout(() => {
        if (document.visibilityState !== "visible") return;
        const original = "Три мира. Одна межа.";
        heading.textContent = "А если межа уже нарушена?";
        heading.style.transition = "opacity .22s ease, filter .22s ease";
        heading.style.filter = "blur(.15px)";
        heading.style.opacity = ".78";
        markAnomaly("broken-border");

        restoreTimer = window.setTimeout(() => {
          heading.textContent = original;
          heading.style.filter = "";
          heading.style.opacity = "";
        }, 980);
      }, 2200 + Math.random() * 2800);
    },
    { threshold: [0, 0.55, 0.8] },
  );

  observer.observe(heading);
  return () => {
    clearTimers();
    observer.disconnect();
  };
}

function setupNightNavAnomaly() {
  const hour = new Date().getHours();
  const isLate = hour >= 23 || hour < 5;
  if (!isLate) return () => {};

  const navCard = Array.from(document.querySelectorAll<HTMLElement>(".worldCard")).find(
    (card) => card.querySelector("h3")?.textContent?.trim() === "Навь",
  );
  if (!navCard) return () => {};

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      if (!navCard.querySelector("[data-night-nav]")) {
        navCard.style.position = "relative";
        const light = document.createElement("span");
        light.dataset.nightNav = "true";
        light.setAttribute("aria-hidden", "true");
        Object.assign(light.style, {
          position: "absolute",
          right: "18px",
          top: "18px",
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "rgba(202,218,220,.52)",
          boxShadow: "0 0 12px rgba(202,218,220,.42), 0 0 28px rgba(202,218,220,.18)",
          zIndex: "4",
          pointerEvents: "none",
        });
        navCard.appendChild(light);
      }
      markAnomaly("night-nav");
      observer.disconnect();
    },
    { threshold: [0, 0.5, 0.75] },
  );

  observer.observe(navCard);
  return () => observer.disconnect();
}

function openMemoryChoice(stone: HTMLButtonElement) {
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
    width: "min(560px, 100%)",
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
      const state = readState();
      state.choice = value;
      state.beyondUnlocked = true;
      if (!state.found.includes("memory-or-life")) state.found.push("memory-or-life");
      writeState(state);
      stone.remove();
      addBeyondLink();

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

function revealMemoryStone() {
  const state = readState();
  if (state.choice || document.querySelector("[data-memory-stone]")) return;

  const body = document.querySelector<HTMLElement>("#world .sectionBody");
  if (!body) return;

  const stone = document.createElement("button");
  stone.type = "button";
  stone.dataset.memoryStone = "true";
  stone.setAttribute("aria-label", "Тёмный камень");
  stone.title = "";
  stone.textContent = "◆";
  Object.assign(stone.style, {
    display: "block",
    margin: "18px 1.5% 0 auto",
    padding: "6px 8px",
    border: "0",
    background: "transparent",
    color: "rgba(115,112,103,.62)",
    textShadow: "0 0 10px rgba(185,147,90,.13)",
    cursor: "pointer",
    fontSize: "15px",
    lineHeight: "1",
    transform: "rotate(7deg)",
  });
  stone.addEventListener("click", () => openMemoryChoice(stone));
  body.appendChild(stone);
}

function setupMemoryOrLife() {
  const state = readState();
  if (state.choice) return () => {};

  const grid = document.querySelector<HTMLElement>(".worldGrid");
  if (!grid) return () => {};

  const sequence = ["Явь", "Правь", "Навь"];
  const upgradeKey = "yav-world-path-ui-v2";

  if (!window.localStorage.getItem(upgradeKey)) {
    state.worldSeen = [];
    writeState(state);
    window.localStorage.setItem(upgradeKey, "1");
  }

  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".worldCard"));
  const cardByName = new Map<string, HTMLElement>();
  cards.forEach((card) => {
    const name = card.querySelector("h3")?.textContent?.trim();
    const image = card.querySelector<HTMLImageElement>(":scope > img");
    if (!name || !image) return;
    cardByName.set(name, card);
    image.style.cursor = "pointer";
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Сделать шаг через ${name}`);
  });

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

  let feedbackTimer: number | undefined;

  const paintPath = () => {
    const current = readState();
    cards.forEach((card) => card.querySelector("[data-world-step]")?.remove());

    current.worldSeen.forEach((name, index) => {
      const card = cardByName.get(name);
      const image = card?.querySelector<HTMLImageElement>(":scope > img");
      if (!card || !image) return;
      card.style.position = "relative";
      image.style.outline = "1px solid rgba(185,147,90,.52)";
      image.style.outlineOffset = "-1px";

      const badge = document.createElement("span");
      badge.dataset.worldStep = "true";
      badge.textContent = ["I", "II", "III"][index] ?? String(index + 1);
      Object.assign(badge.style, {
        position: "absolute",
        top: "14px",
        left: "14px",
        zIndex: "5",
        display: "grid",
        placeItems: "center",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "1px solid rgba(213,192,154,.55)",
        background: "rgba(8,11,9,.8)",
        color: "#d5c09a",
        fontSize: "11px",
        letterSpacing: ".08em",
        pointerEvents: "none",
        boxShadow: "0 0 24px rgba(185,147,90,.12)",
      });
      card.appendChild(badge);
    });

    const step = current.worldSeen.length;
    if (step === 0) status.textContent = "Три мира. Три шага. Начни с Яви — нажми на изображение.";
    if (step === 1) status.textContent = "I · Явь помнит шаг. Теперь — Правь.";
    if (step === 2) status.textContent = "II · Нить натянута. Последний шаг — Навь.";
    if (step >= 3) status.textContent = "III · Три шага сделаны. Межа услышала тебя.";
  };

  const flashWrong = (card: HTMLElement, expected: string) => {
    const image = card.querySelector<HTMLImageElement>(":scope > img");
    if (!image) return;
    const oldOpacity = image.style.opacity;
    image.style.opacity = ".68";
    if (feedbackTimer) window.clearTimeout(feedbackTimer);
    status.textContent = `Не этот путь. Следующий шаг — ${expected}.`;
    feedbackTimer = window.setTimeout(() => {
      image.style.opacity = oldOpacity;
      paintPath();
    }, 850);
  };

  const activate = (image: HTMLImageElement) => {
    const card = image.closest<HTMLElement>(".worldCard");
    const name = card?.querySelector("h3")?.textContent?.trim();
    if (!card || !name) return;

    const current = readState();
    const expected = sequence[current.worldSeen.length];
    if (!expected) {
      revealMemoryStone();
      return;
    }

    if (name !== expected) {
      flashWrong(card, expected);
      return;
    }

    current.worldSeen.push(name);
    writeState(current);
    paintPath();

    if (current.worldSeen.length === sequence.length) {
      window.setTimeout(revealMemoryStone, 420);
    }
  };

  const onClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.closest(".worldCard")) return;
    activate(target);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.closest(".worldCard")) return;
    event.preventDefault();
    activate(target);
  };

  grid.addEventListener("click", onClick);
  grid.addEventListener("keydown", onKeyDown);
  paintPath();

  return () => {
    if (feedbackTimer) window.clearTimeout(feedbackTimer);
    grid.removeEventListener("click", onClick);
    grid.removeEventListener("keydown", onKeyDown);
    status.remove();
  };
}

export default function SitePolish() {
  useEffect(() => {
    // Этот слой нужен только главной странице. На родословной и скрытом архиве
    // он больше не запускает наблюдатели, обработчики и лишние DOM-поиски.
    if (window.location.pathname !== "/") return;

    polishWorldCopy();
    removeDuplicateDoorNews();
    addAuthorToFooter();
    addGodsLink(document);
    addBeyondLink();

    const cleanupBorder = setupBrokenBorderAnomaly();
    const cleanupNight = setupNightNavAnomaly();
    const cleanupMemory = setupMemoryOrLife();

    const nav = document.querySelector<HTMLElement>(".nav");
    let navObserver: MutationObserver | undefined;
    if (nav) {
      navObserver = new MutationObserver(() => addGodsLink(nav));
      navObserver.observe(nav, { childList: true, subtree: true });
    }

    return () => {
      cleanupBorder();
      cleanupNight();
      cleanupMemory();
      navObserver?.disconnect();
    };
  }, []);

  return null;
}
