"use client";

import { useEffect } from "react";

const GODS_HREF = "/genealogy#gods-title";
const BEYOND_HREF = "/za-mezhoy";
const STATE_KEY = "yav-anomalies-v1";
const NIGHT_NAV_SCENE_KEY = "yav-night-nav-scene-v4";

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
  const isPreview = new URLSearchParams(window.location.search).has("nav-awake-preview");
  const isLate = hour >= 23 || hour < 5 || isPreview;
  if (!isLate) return () => {};

  const navCard = Array.from(document.querySelectorAll<HTMLElement>(".worldCard")).find(
    (card) => card.querySelector("h3")?.textContent?.trim() === "Навь",
  );
  if (!navCard) return () => {};

  let awakeningCleanup: (() => void) | undefined;

  function addNightLight() {
    if (navCard!.querySelector("[data-night-nav]")) return;

    navCard!.style.position = "relative";
    const light = document.createElement("button");
    light.type = "button";
    light.dataset.nightNav = "true";
    light.setAttribute("aria-label", "Снова услышать ответ Нави");
    light.title = "Навь ответит снова";
    Object.assign(light.style, {
      position: "absolute",
      right: "14px",
      top: "14px",
      width: "28px",
      height: "28px",
      padding: "0",
      border: "1px solid rgba(202,218,220,.28)",
      borderRadius: "50%",
      background:
        "radial-gradient(circle,rgba(231,242,239,.95) 0 8%,rgba(155,199,192,.5) 12% 25%,rgba(6,17,15,.82) 30% 100%)",
      boxShadow: "0 0 14px rgba(202,218,220,.5),0 0 34px rgba(152,198,191,.28)",
      zIndex: "6",
      cursor: "pointer",
    });
    light.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      awakenNav(true);
    });
    navCard!.appendChild(light);
  }

  function awakenNav(force = false) {
    if (document.querySelector("[data-nav-awakening]")) return;

    const before = readState();
    const alreadyFound = before.found.includes("night-nav");
    let sceneAlreadySeen = false;
    try {
      sceneAlreadySeen = window.localStorage.getItem(NIGHT_NAV_SCENE_KEY) === "1";
    } catch {}

    if (alreadyFound && sceneAlreadySeen && !force) {
      addNightLight();
      return;
    }

    const previousPosition = before.found.indexOf("night-nav") + 1;
    const signNumber = Math.min(13, alreadyFound ? Math.max(1, previousPosition) : before.found.length + 1);
    const overlay = document.createElement("section");
    overlay.dataset.navAwakening = "true";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", "Открыт знак Межи: Навь не спит");
    overlay.innerHTML = `
      <div data-nav-world aria-hidden="true"></div>
      <div data-nav-fog="a" aria-hidden="true"></div>
      <div data-nav-fog="b" aria-hidden="true"></div>
      <div data-nav-veil aria-hidden="true"></div>
      <div data-nav-seal aria-hidden="true">
        <span data-nav-ring="outer"></span>
        <span data-nav-ring="inner"></span>
        <span data-nav-eye>◒</span>
      </div>
      <div data-nav-copy>
        <p data-nav-omen>Ты заметил огонь, которого не должно быть</p>
        <h2>Навь не спит</h2>
        <p data-nav-answer>И теперь она знает, что ты смотришь.</p>
        <div data-nav-record>
          <span>Знак Межи</span>
          <strong>${String(signNumber).padStart(2, "0")} <i>из 13</i></strong>
          <small>записан в скрытый архив</small>
        </div>
      </div>
      <div data-nav-controls>
        <button data-nav-motion type="button">Остановить движение</button>
        <button data-nav-sound type="button">Услышать Навь</button>
      </div>
      <button data-nav-close type="button">Вернуться в Явь</button>
    `;

    const world = overlay.querySelector<HTMLElement>("[data-nav-world]")!;
    const fogA = overlay.querySelector<HTMLElement>('[data-nav-fog="a"]')!;
    const fogB = overlay.querySelector<HTMLElement>('[data-nav-fog="b"]')!;
    const veil = overlay.querySelector<HTMLElement>("[data-nav-veil]")!;
    const seal = overlay.querySelector<HTMLElement>("[data-nav-seal]")!;
    const rings = Array.from(overlay.querySelectorAll<HTMLElement>("[data-nav-ring]"));
    const eye = overlay.querySelector<HTMLElement>("[data-nav-eye]")!;
    const copy = overlay.querySelector<HTMLElement>("[data-nav-copy]")!;
    const omen = overlay.querySelector<HTMLElement>("[data-nav-omen]")!;
    const title = overlay.querySelector<HTMLElement>("[data-nav-copy] h2")!;
    const answer = overlay.querySelector<HTMLElement>("[data-nav-answer]")!;
    const recordPanel = overlay.querySelector<HTMLElement>("[data-nav-record]")!;
    const controls = overlay.querySelector<HTMLElement>("[data-nav-controls]")!;
    const motionButton = overlay.querySelector<HTMLButtonElement>("[data-nav-motion]")!;
    const soundButton = overlay.querySelector<HTMLButtonElement>("[data-nav-sound]")!;
    const closeButton = overlay.querySelector<HTMLButtonElement>("[data-nav-close]")!;

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "6000",
      display: "grid",
      placeItems: "center",
      minHeight: "100svh",
      overflow: "hidden",
      isolation: "isolate",
      color: "#edf2ef",
      background: "#020605",
      opacity: "1",
      visibility: "visible",
    });
    Object.assign(world.style, {
      position: "absolute",
      inset: "-8%",
      zIndex: "-4",
      backgroundImage:
        "linear-gradient(180deg,rgba(1,6,5,.43),rgba(1,5,4,.91)),url('/images/world/nav.webp')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      filter: "saturate(.5) contrast(1.22) brightness(.63)",
      transform: "scale(1.08)",
    });
    [fogA, fogB].forEach((fog, index) =>
      Object.assign(fog.style, {
        position: "absolute",
        zIndex: "-2",
        left: index === 0 ? "-20vw" : "auto",
        right: index === 1 ? "-20vw" : "auto",
        top: index === 1 ? "-12vh" : "auto",
        bottom: index === 0 ? "-12vh" : "auto",
        width: "125vw",
        height: "55vh",
        borderRadius: "50%",
        filter: "blur(34px)",
        opacity: index === 0 ? ".58" : ".42",
        background:
          "radial-gradient(ellipse at 20% 50%,rgba(207,228,223,.38),transparent 29%),radial-gradient(ellipse at 52% 42%,rgba(137,181,174,.34),transparent 32%),radial-gradient(ellipse at 83% 55%,rgba(219,231,226,.34),transparent 28%)",
      }),
    );
    Object.assign(veil.style, {
      position: "absolute",
      inset: "0",
      zIndex: "-1",
      opacity: ".7",
      background:
        "radial-gradient(circle at 50% 42%,transparent 0 10%,rgba(4,12,10,.24) 34%,rgba(0,3,2,.84) 79%),linear-gradient(105deg,transparent 0 42%,rgba(213,235,229,.16) 49%,transparent 56%)",
      boxShadow: "inset 0 0 18vw rgba(0,0,0,.92)",
    });
    Object.assign(seal.style, {
      position: "absolute",
      left: "50%",
      top: "43%",
      width: "min(78vw,660px)",
      aspectRatio: "1",
      transform: "translate(-50%,-50%) rotate(-8deg)",
      border: "1px solid rgba(200,225,220,.3)",
      borderRadius: "50%",
      boxShadow: "0 0 80px rgba(156,205,196,.11),inset 0 0 70px rgba(156,205,196,.08)",
      opacity: ".72",
    });
    rings.forEach((ring, index) =>
      Object.assign(ring.style, {
        position: "absolute",
        inset: index === 0 ? "11%" : "24%",
        border: index === 0 ? "1px dashed rgba(210,232,227,.3)" : "1px solid rgba(210,232,227,.22)",
        borderRadius: "50%",
      }),
    );
    Object.assign(eye.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      color: "rgba(220,239,234,.34)",
      font: "400 clamp(92px,17vw,210px)/1 Georgia,serif",
      textShadow: "0 0 46px rgba(177,215,210,.3)",
      transform: "translate(-50%,-50%)",
    });
    Object.assign(copy.style, {
      position: "relative",
      zIndex: "2",
      width: "min(940px,92vw)",
      minHeight: "74svh",
      display: "grid",
      placeItems: "center",
      alignContent: "center",
      textAlign: "center",
      textShadow: "0 4px 24px rgba(0,0,0,.98)",
    });
    Object.assign(omen.style, {
      position: "absolute",
      top: "7%",
      width: "92%",
      margin: "0",
      color: "rgba(222,235,231,.82)",
      font: "400 clamp(10px,1.25vw,14px)/1.7 Arial,sans-serif",
      letterSpacing: ".22em",
      textTransform: "uppercase",
    });
    Object.assign(title.style, {
      margin: "0",
      color: "#f0f5f2",
      font: "400 clamp(58px,12vw,172px)/.86 MonomakhYav,Georgia,serif",
      letterSpacing: "-.045em",
      textWrap: "balance",
    });
    Object.assign(answer.style, {
      position: "absolute",
      bottom: "17%",
      width: "92%",
      margin: "0",
      color: "rgba(229,238,234,.94)",
      font: "italic 400 clamp(17px,2.2vw,25px)/1.5 Georgia,serif",
      letterSpacing: ".03em",
    });
    Object.assign(recordPanel.style, {
      position: "absolute",
      bottom: "1%",
      display: "grid",
      minWidth: "min(340px,84vw)",
      gap: "5px",
      padding: "16px 28px 14px",
      borderTop: "1px solid rgba(201,220,216,.3)",
      borderBottom: "1px solid rgba(201,220,216,.2)",
      background: "linear-gradient(90deg,transparent,rgba(5,15,13,.78) 18% 82%,transparent)",
    });
    recordPanel.querySelectorAll<HTMLElement>("span,small").forEach((line) =>
      Object.assign(line.style, {
        color: "rgba(193,214,209,.72)",
        font: "400 9px/1.4 Arial,sans-serif",
        letterSpacing: ".22em",
        textTransform: "uppercase",
      }),
    );
    Object.assign(recordPanel.querySelector<HTMLElement>("strong")!.style, {
      color: "#dfe9e5",
      font: "400 25px/1 MonomakhYav,Georgia,serif",
      letterSpacing: ".08em",
    });
    Object.assign(recordPanel.querySelector<HTMLElement>("i")!.style, {
      color: "rgba(193,214,209,.65)",
      font: "normal 400 11px/1 Arial,sans-serif",
      letterSpacing: ".12em",
    });
    Object.assign(closeButton.style, {
      position: "absolute",
      right: "clamp(18px,3vw,42px)",
      bottom: "clamp(17px,3vw,36px)",
      zIndex: "4",
      padding: "10px 0",
      border: "0",
      borderBottom: "1px solid rgba(220,234,229,.4)",
      color: "rgba(226,237,233,.8)",
      background: "transparent",
      font: "400 10px/1 Arial,sans-serif",
      letterSpacing: ".17em",
      textTransform: "uppercase",
      cursor: "pointer",
    });
    Object.assign(controls.style, {
      position: "absolute",
      left: "clamp(18px,3vw,42px)",
      bottom: "clamp(17px,3vw,36px)",
      zIndex: "4",
      display: "flex",
      alignItems: "center",
      gap: "18px",
    });
    [motionButton, soundButton].forEach((button) =>
      Object.assign(button.style, {
        padding: "10px 0",
        border: "0",
        borderBottom: "1px solid rgba(220,234,229,.4)",
        color: "rgba(226,237,233,.8)",
        background: "transparent",
        font: "400 10px/1 Arial,sans-serif",
        letterSpacing: ".13em",
        textTransform: "uppercase",
        cursor: "pointer",
      }),
    );
    soundButton.style.display = "none";

    document.documentElement.dataset.navAwake = "true";
    document.body.appendChild(overlay);
    closeButton.focus({ preventScroll: true });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animations: Animation[] = [];
    if (typeof world.animate === "function") {
      animations.push(
        world.animate(
          [
            { transform: "scale(1.16)", filter: "saturate(.34) contrast(1.15) brightness(.42) blur(4px)" },
            { transform: "scale(1.04)", filter: "saturate(.5) contrast(1.22) brightness(.64) blur(0)" },
          ],
          { duration: 11000, easing: "cubic-bezier(.18,.72,.2,1)", direction: "alternate", iterations: Infinity },
        ),
        seal.animate(
          [
            { transform: "translate(-50%,-50%) scale(.72) rotate(-14deg)", opacity: ".34" },
            { transform: "translate(-50%,-50%) scale(1.08) rotate(16deg)", opacity: ".76" },
          ],
          { duration: 5200, easing: "cubic-bezier(.2,.7,.2,1)", direction: "alternate", iterations: Infinity },
        ),
        rings[0].animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
          duration: 3800,
          easing: "linear",
          iterations: Infinity,
        }),
        rings[1].animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }], {
          duration: 5400,
          easing: "linear",
          iterations: Infinity,
        }),
        fogA.animate(
          [{ transform: "translate3d(-12vw,12vh,0) scale(.9)" }, { transform: "translate3d(14vw,-15vh,0) scale(1.38)" }],
          { duration: 5200, easing: "ease-in-out", direction: "alternate", iterations: Infinity },
        ),
        fogB.animate(
          [
            { transform: "translate3d(12vw,-10vh,0) rotate(180deg) scale(.88)" },
            { transform: "translate3d(-13vw,16vh,0) rotate(180deg) scale(1.34)" },
          ],
          { duration: 6200, easing: "ease-in-out", direction: "alternate", iterations: Infinity },
        ),
        veil.animate([{ opacity: ".38" }, { opacity: ".86" }, { opacity: ".52" }], {
          duration: 3000,
          easing: "ease-in-out",
          iterations: Infinity,
        }),
        eye.animate(
          [
            { opacity: ".35", transform: "translate(-50%,-50%) scale(.88)", filter: "blur(1px)" },
            { opacity: ".95", transform: "translate(-50%,-50%) scale(1.12)", filter: "blur(0)" },
          ],
          { duration: 1900, easing: "ease-in-out", direction: "alternate", iterations: Infinity },
        ),
        title.animate(
          [
            { transform: "scale(.975)", textShadow: "0 4px 24px rgba(0,0,0,.98),0 0 12px rgba(190,224,216,.08)" },
            { transform: "scale(1.025)", textShadow: "0 4px 24px rgba(0,0,0,.98),0 0 32px rgba(190,224,216,.26)" },
          ],
          { duration: 2700, easing: "ease-in-out", direction: "alternate", iterations: Infinity },
        ),
      );
    }

    let motionPaused = false;
    motionButton.addEventListener("click", () => {
      motionPaused = !motionPaused;
      animations.forEach((animation) => (motionPaused ? animation.pause() : animation.play()));
      motionButton.textContent = motionPaused ? "Продолжить движение" : "Остановить движение";
    });

    const whisper = document.createElement("audio");
    whisper.preload = "auto";
    whisper.volume = 0.58;
    whisper.setAttribute("playsinline", "");
    ([
      ["/sfx/nav-whisper.mp3", "audio/mpeg"],
      ["/sfx/nav-whisper.wav", "audio/wav"],
      ["/sfx/nav-whisper.ogg", "audio/ogg"],
      ["/sfx/nav-whisper.m4a", "audio/mp4"],
      ["/sfx/nav-whisper.webm", "audio/webm"],
    ] as const).forEach(([src, type]) => {
      const source = document.createElement("source");
      source.src = src;
      source.type = type;
      whisper.appendChild(source);
    });
    overlay.appendChild(whisper);

    const showSoundControl = () => {
      soundButton.style.display = "block";
      void whisper.play().then(
        () => {
          soundButton.textContent = "Приглушить Навь";
        },
        () => {
          soundButton.textContent = "Услышать Навь";
        },
      );
    };
    whisper.addEventListener("canplay", showSoundControl, { once: true });
    whisper.addEventListener("ended", () => {
      soundButton.textContent = "Услышать снова";
    });
    soundButton.addEventListener("click", () => {
      if (!whisper.paused) {
        whisper.pause();
        soundButton.textContent = "Услышать Навь";
        return;
      }
      if (whisper.ended) whisper.currentTime = 0;
      void whisper.play().then(() => {
        soundButton.textContent = "Приглушить Навь";
      });
    });
    whisper.load();

    let recorded = false;
    let removed = false;
    let removeTimer: number | undefined;

    const record = () => {
      if (recorded) return;
      recorded = true;
      if (!alreadyFound) markAnomaly("night-nav");
      addNightLight();
      try {
        window.localStorage.setItem(NIGHT_NAV_SCENE_KEY, "1");
      } catch {}
    };

    const remove = () => {
      if (removed) return;
      removed = true;
      record();
      whisper.pause();
      animations.forEach((animation) => animation.cancel());
      overlay.style.transition = reduceMotion ? "opacity .12s ease" : "opacity .55s ease,filter .55s ease";
      overlay.style.opacity = "0";
      overlay.style.filter = reduceMotion ? "none" : "blur(7px)";
      removeTimer = window.setTimeout(() => {
        document.documentElement.removeAttribute("data-nav-awake");
        overlay.remove();
      }, reduceMotion ? 140 : 620);
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") remove();
    };

    const recordTimer = window.setTimeout(record, reduceMotion ? 120 : 900);
    closeButton.addEventListener("click", remove);
    document.addEventListener("keydown", onKeyDown);

    awakeningCleanup = () => {
      window.clearTimeout(recordTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      whisper.pause();
      animations.forEach((animation) => animation.cancel());
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.removeAttribute("data-nav-awake");
      overlay.remove();
    };
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      awakenNav();
      observer.disconnect();
    },
    { threshold: [0, 0.5, 0.75] },
  );

  observer.observe(navCard);
  const previewTimer = isPreview ? window.setTimeout(() => awakenNav(true), 350) : undefined;

  return () => {
    observer.disconnect();
    if (previewTimer) window.clearTimeout(previewTimer);
    awakeningCleanup?.();
  };
}

function setupNightNavAnomalyLegacy() {
  const hour = new Date().getHours();
  const isLocalPreview =
    process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).has("nav-awake");
  const isLate = hour >= 23 || hour < 5 || isLocalPreview;
  if (!isLate) return () => {};

  const navCard = Array.from(document.querySelectorAll<HTMLElement>(".worldCard")).find(
    (card) => card.querySelector("h3")?.textContent?.trim() === "Навь",
  );
  if (!navCard) return () => {};

  let awakeningCleanup: (() => void) | undefined;

  const addNightLight = () => {
    if (navCard.querySelector("[data-night-nav]")) return;

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
  };

  const awakenNav = () => {
    if (document.querySelector("[data-nav-awakening]")) return;

    const before = readState();
    const alreadyFound = before.found.includes("night-nav");
    let sceneAlreadySeen = false;
    try {
      sceneAlreadySeen = window.localStorage.getItem(NIGHT_NAV_SCENE_KEY) === "1";
    } catch {}

    if (alreadyFound && sceneAlreadySeen) {
      addNightLight();
      return;
    }

    const previousPosition = before.found.indexOf("night-nav") + 1;
    const signNumber = Math.min(13, alreadyFound ? Math.max(1, previousPosition) : before.found.length + 1);
    const overlay = document.createElement("section");
    overlay.dataset.navAwakening = "true";
    overlay.className = "navAwakening";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", "Открыт знак Межи: Навь не спит");
    overlay.innerHTML = `
      <div class="navAwakeningFog navAwakeningFogA" aria-hidden="true"></div>
      <div class="navAwakeningFog navAwakeningFogB" aria-hidden="true"></div>
      <div class="navAwakeningVeil" aria-hidden="true"></div>
      <div class="navAwakeningSeal" aria-hidden="true">
        <span class="navAwakeningRing"></span>
        <span class="navAwakeningEye">◒</span>
      </div>
      <div class="navAwakeningCopy">
        <p class="navAwakeningOmen">Ты заметил огонь, которого не должно быть</p>
        <h2>Навь не спит</h2>
        <p class="navAwakeningAnswer">И теперь она знает, что ты смотришь.</p>
        <div class="navAwakeningRecord">
          <span>Знак Межи</span>
          <strong>${String(signNumber).padStart(2, "0")} <i>из 13</i></strong>
          <small>записан в скрытый архив</small>
        </div>
      </div>
      <button class="navAwakeningSkip" type="button">Вернуться в Явь</button>
    `;

    document.documentElement.dataset.navAwake = "true";
    document.body.appendChild(overlay);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) overlay.classList.add("navAwakeningReduced");

    let recorded = false;
    let removed = false;
    let removeTimer: number | undefined;

    const record = () => {
      if (recorded) return;
      recorded = true;
      if (!alreadyFound) markAnomaly("night-nav");
      addNightLight();
      try {
        window.localStorage.setItem(NIGHT_NAV_SCENE_KEY, "1");
      } catch {}
      overlay.classList.add("navAwakeningRecorded");
    };

    const remove = () => {
      if (removed) return;
      removed = true;
      record();
      overlay.classList.add("navAwakeningLeaving");
      removeTimer = window.setTimeout(() => {
        document.documentElement.removeAttribute("data-nav-awake");
        overlay.remove();
      }, reduceMotion ? 180 : 900);
      document.removeEventListener("keydown", onKeyDown);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") remove();
    };

    const recordTimer = window.setTimeout(record, reduceMotion ? 500 : 5100);
    const finishTimer = window.setTimeout(remove, reduceMotion ? 2600 : 7900);
    overlay.querySelector<HTMLButtonElement>(".navAwakeningSkip")?.addEventListener("click", remove);
    document.addEventListener("keydown", onKeyDown);

    awakeningCleanup = () => {
      window.clearTimeout(recordTimer);
      window.clearTimeout(finishTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.removeAttribute("data-nav-awake");
      overlay.remove();
    };
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      awakenNav();
      observer.disconnect();
    },
    { threshold: [0, 0.5, 0.75] },
  );

  observer.observe(navCard);
  return () => {
    observer.disconnect();
    awakeningCleanup?.();
  };
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
