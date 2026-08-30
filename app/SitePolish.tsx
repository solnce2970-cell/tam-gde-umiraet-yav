"use client";

import { useEffect } from "react";
import { SIGN_COUNT } from "../lib/anomalies/registry";
import {
  readAnomalyState as readState,
  readTransientState,
  setAnomalyFlag,
  setMemoryChoice,
  setWorldSeen,
  unlockSign,
  updateTransientState,
} from "../lib/anomalies/store";

const BEYOND_HREF = "/za-mezhoy";

function setupBrokenBorderAnomaly() {
  const heading = document.querySelector<HTMLElement>("#world .sectionBody > h2");
  if (!heading) return () => {};

  let timer: number | undefined;
  let unlockTimer: number | undefined;
  let restoreTimer: number | undefined;
  const clearTimers = () => {
    if (timer) window.clearTimeout(timer);
    if (unlockTimer) window.clearTimeout(unlockTimer);
    if (restoreTimer) window.clearTimeout(restoreTimer);
    timer = undefined;
    unlockTimer = undefined;
    restoreTimer = undefined;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.55) {
        if (timer) window.clearTimeout(timer);
        timer = undefined;
        return;
      }

      if (readTransientState().borderAttempted) return;
      if (timer || unlockTimer || restoreTimer) return;

      const state = readState();
      const alreadyFound = state.found.includes("broken-border");
      if (alreadyFound && Math.random() > 0.12) {
        updateTransientState((current) => ({ ...current, borderAttempted: true }));
        return;
      }

      timer = window.setTimeout(() => {
        timer = undefined;
        if (document.visibilityState !== "visible") {
          return;
        }
        const original = "Три мира, связанные одним законом";
        updateTransientState((current) => ({ ...current, borderAttempted: true }));
        heading.textContent = "Три мира. Межа ослабла. Навь проникает в Явь.";
        heading.style.transition = "opacity .22s ease, filter .22s ease";
        heading.style.filter = "blur(.15px)";
        heading.style.opacity = ".78";

        // Сначала даём аномальной фразе реально отрисоваться и побыть в поле
        // зрения, и только затем записываем знак центральным writer'ом.
        unlockTimer = window.setTimeout(() => {
          unlockTimer = undefined;
          unlockSign("broken-border");
        }, 700);

        restoreTimer = window.setTimeout(() => {
          heading.textContent = original;
          heading.style.filter = "";
          heading.style.opacity = "";
        }, 3600);
      }, 2400);
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

    const alreadyFound = readState().found.includes("night-nav");
    navCard!.style.position = "relative";
    const light = document.createElement("button");
    light.type = "button";
    light.dataset.nightNav = "true";
    light.setAttribute("aria-label", alreadyFound ? "Снова услышать ответ Нави" : "Услышать Навь");
    light.title = alreadyFound ? "Навь ответит снова" : "Навь не спит";
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
    const sceneAlreadySeen = before.flags.nightNavSceneSeen;

    if (alreadyFound && sceneAlreadySeen && !force) {
      addNightLight();
      return;
    }

    const signNumber = before.found.length;
    const overlay = document.createElement("section");
    overlay.dataset.navAwakening = "true";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", "Знак Межи: Навь не спит");
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
          <strong>${String(signNumber).padStart(2, "0")} <i>из ${SIGN_COUNT}</i></strong>
          <small>${alreadyFound ? "уже записан в скрытый архив" : "ждёт твоего ответа"}</small>
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
      font: "400 clamp(58px,12vw,172px)/.86 BlagovestYav,Georgia,serif",
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
      font: "400 25px/1 BlagovestYav,Georgia,serif",
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
    let motionPaused = false;
    const motionStartedAt = Date.now();
    const renderMotion = () => {
      if (motionPaused || !overlay.isConnected) return;

      const seconds = (Date.now() - motionStartedAt) / 1000;
      const wave = (period: number, offset = 0) => (Math.sin((seconds / period) * Math.PI * 2 + offset) + 1) / 2;
      const sealWave = wave(5.2);
      const fogWaveA = wave(5.6, -0.8);
      const fogWaveB = wave(6.4, 1.2);
      const eyeWave = wave(1.9);
      const titleWave = wave(2.7, 0.4);

      world.style.transform = `scale(${1.075 + wave(11) * 0.07}) translate3d(${(wave(13, 1) - 0.5) * 2.4}%,${(wave(9, 2) - 0.5) * 1.5}%,0)`;
      world.style.filter = `saturate(${0.42 + wave(8) * 0.12}) contrast(1.22) brightness(${0.5 + wave(7, 1.5) * 0.15})`;
      seal.style.transform = `translate(-50%,-50%) scale(${0.76 + sealWave * 0.34}) rotate(${-17 + sealWave * 38}deg)`;
      seal.style.opacity = String(0.38 + sealWave * 0.42);
      rings[0].style.transform = `rotate(${(seconds * 88) % 360}deg)`;
      rings[1].style.transform = `rotate(${(-seconds * 64) % 360}deg)`;
      fogA.style.transform = `translate3d(${-12 + fogWaveA * 28}vw,${12 - fogWaveA * 28}vh,0) scale(${0.9 + fogWaveA * 0.48})`;
      fogB.style.transform = `translate3d(${12 - fogWaveB * 27}vw,${-10 + fogWaveB * 27}vh,0) rotate(180deg) scale(${0.88 + fogWaveB * 0.46})`;
      veil.style.opacity = String(0.4 + wave(3.1) * 0.45);
      eye.style.opacity = String(0.34 + eyeWave * 0.62);
      eye.style.transform = `translate(-50%,-50%) scale(${0.86 + eyeWave * 0.3})`;
      eye.style.filter = `blur(${(1 - eyeWave) * 1.2}px)`;
      title.style.transform = `scale(${0.975 + titleWave * 0.05})`;
      title.style.textShadow = `0 4px 24px rgba(0,0,0,.98),0 0 ${12 + titleWave * 24}px rgba(190,224,216,${0.08 + titleWave * 0.2})`;
    };
    renderMotion();
    const motionTimer = window.setInterval(renderMotion, 40);

    motionButton.addEventListener("click", () => {
      motionPaused = !motionPaused;
      if (!motionPaused) renderMotion();
      motionButton.textContent = motionPaused ? "Продолжить движение" : "Остановить движение";
    });

    const whisper = document.createElement("audio");
    whisper.preload = "auto";
    whisper.volume = 0.58;
    whisper.setAttribute("playsinline", "");
    whisper.src = "/sfx/nav-whisper.mp3";
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

    let sceneRemembered = false;
    let removed = false;
    let removeTimer: number | undefined;

    const rememberScene = () => {
      if (sceneRemembered) return;
      sceneRemembered = true;
      addNightLight();
      setAnomalyFlag("nightNavSceneSeen");
    };

    const recordSign = () => {
      rememberScene();
      const result = unlockSign("night-nav");
      const strong = recordPanel.querySelector<HTMLElement>("strong");
      const small = recordPanel.querySelector<HTMLElement>("small");
      if (strong) strong.innerHTML = `${String(result.state.found.length).padStart(2, "0")} <i>из ${SIGN_COUNT}</i>`;
      if (small) small.textContent = "записан в скрытый архив";
    };

    const remove = () => {
      if (removed) return;
      removed = true;
      recordSign();
      whisper.pause();
      window.clearInterval(motionTimer);
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

    const sceneTimer = window.setTimeout(rememberScene, reduceMotion ? 120 : 900);
    closeButton.addEventListener("click", remove);
    document.addEventListener("keydown", onKeyDown);

    awakeningCleanup = () => {
      window.clearTimeout(sceneTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      whisper.pause();
      window.clearInterval(motionTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.removeAttribute("data-nav-awake");
      overlay.remove();
    };
  }

  // Ночью аномалия только отмечает карточку Нави огоньком. Полная сцена
  // запускается исключительно после осознанного клика по этому огоньку.
  addNightLight();
  const previewTimer = isPreview ? window.setTimeout(() => awakenNav(true), 350) : undefined;

  return () => {
    if (previewTimer) window.clearTimeout(previewTimer);
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

    const nextWorldSeen = [...current.worldSeen, name];
    setWorldSeen(nextWorldSeen);
    paintPath();

    if (nextWorldSeen.length === sequence.length) {
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

    const cleanupBorder = setupBrokenBorderAnomaly();
    const cleanupNight = setupNightNavAnomaly();
    const cleanupMemory = setupMemoryOrLife();

    return () => {
      cleanupBorder();
      cleanupNight();
      cleanupMemory();
    };
  }, []);

  return null;
}
