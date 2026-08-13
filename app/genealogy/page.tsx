"use client";

import { useEffect } from "react";
import styles from "./genealogy.module.css";

const gods = [
  {
    name: "Макошь",
    image: "/images/characters/makosh.webp?v=2",
    mark: "Нити судеб · Алатырь",
    text: "Та, в чьих руках сходятся нити судеб. Но есть места, куда не проходит даже её нить.",
    preserveFrame: false,
  },
  {
    name: "Велес",
    image: "/images/gods/veles.webp",
    mark: "Навь · Память мёртвых",
    text: "Хранитель Нави и памяти мёртвых. Бережёт мир предков, но не считает его своей собственностью.",
    preserveFrame: false,
  },
  {
    name: "Сварог",
    image: "/images/characters/svarog.webp?v=2",
    mark: "Огонь · Ковка · Искра",
    text: "Бог огня и ковки. Искра его кузни стала началом Семаргла.",
    preserveFrame: false,
  },
];

export default function GenealogyPage() {
  useEffect(() => {
    const box = document.querySelector<HTMLElement>("[data-lada-portrait]");
    const second = box?.querySelector<HTMLImageElement>("[data-lada-second]");
    if (!box || !second) return;

    let visible = false;
    let showingSecond = false;
    let firstRun = true;
    let timer: number | undefined;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };

    const schedule = () => {
      clearTimer();
      if (!visible) return;

      const delay = firstRun
        ? 2200 + Math.random() * 1800
        : 8000 + Math.random() * 8000;

      timer = window.setTimeout(() => {
        if (!visible) return;
        firstRun = false;
        showingSecond = !showingSecond;
        second.style.opacity = showingSecond ? "1" : "0";
        schedule();
      }, delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.08;
        if (nextVisible === visible) return;

        visible = nextVisible;
        clearTimer();

        if (visible) {
          firstRun = true;
          schedule();
        } else {
          showingSecond = false;
          second.style.opacity = "0";
        }
      },
      { threshold: [0, 0.08, 0.3] },
    );

    observer.observe(box);
    return () => {
      clearTimer();
      observer.disconnect();
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a className={styles.brand} href="/">Там, где умирает Явь</a>
        <a className={styles.back} href="/#world">← Вернуться в мир</a>
      </div>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Родословная</p>
        <h1>Родословная богов</h1>
        <p className={styles.intro}>Схема родственных линий мира «Там, где умирает Явь».</p>
      </header>

      <section className={styles.imageSection} aria-label="Родословная богов">
        <div className={styles.imageFrame}>
          <img
            className={styles.genealogyImage}
            src="/images/genealogy-yav.webp"
            alt="Родословная богов мира «Там, где умирает Явь»"
          />
        </div>
        <p className={styles.hint}>На телефоне изображение можно увеличить жестом.</p>
      </section>

      <section className="godsSection" aria-labelledby="gods-title">
        <div className="godsHeading">
          <p className="godsEyebrow">Те, чьи имена уже прозвучали в этой истории</p>
          <h2 id="gods-title">Лики богов</h2>
          <p>Родословная показывает связи. Здесь — лица тех, чья воля уже касается Яви, Прави и Нави.</p>
        </div>

        <div className="godsGrid">
          {gods.map((god, index) => (
            <article className="godCard" key={god.name}>
              <div className={`godPortrait${god.preserveFrame ? " preserveFrame" : ""}`}>
                <img src={god.image} alt={`Образ бога ${god.name}`} />
                <span className="godNumber">0{index + 1}</span>
              </div>
              <div className="godInfo">
                <small>{god.mark}</small>
                <h3>{god.name}</h3>
                <p>{god.text}</p>
              </div>
            </article>
          ))}

          <article className="godCard ladaCard">
            <div className="godPortrait ladaPortrait" data-lada-portrait>
              <img src="/images/gods/Lada.webp" alt="Образ богини Лады" />
              <img
                className="ladaSecond"
                data-lada-second
                src="/images/gods/Lada2.webp"
                alt="Другой образ богини Лады"
              />
              <span className="godNumber">04</span>
            </div>
            <div className="godInfo">
              <small>Семья. НеЛюбовь. Подлость.</small>
              <h3>Лада</h3>
              <p>Богиня семьи и покровительница беременных. Но сама не так чиста, как принято думать.</p>
            </div>
          </article>
        </div>
      </section>

      <style>{`
        .godsSection{max-width:1500px;margin:96px auto 0;padding:76px 5vw 24px;border-top:1px solid rgba(214,196,161,.14)}
        .godsHeading{max-width:820px;margin:0 auto 46px;text-align:center}
        .godsEyebrow{margin:0 0 13px;color:#b9935a;font-size:11px;letter-spacing:.19em;text-transform:uppercase}
        .godsHeading h2{margin:0 0 18px;font-size:clamp(42px,6vw,76px);font-weight:400;line-height:1;letter-spacing:-.035em;color:#e7dfcf}
        .godsHeading>p:last-child{max-width:670px;margin:0 auto;color:#918b80;font-size:16px;line-height:1.7}
        .godsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
        .godCard{display:grid;grid-template-columns:minmax(220px,46%) 1fr;min-height:430px;background:linear-gradient(145deg,rgba(21,27,22,.94),rgba(11,15,12,.98));border:1px solid rgba(214,196,161,.15);overflow:hidden;box-shadow:0 18px 55px rgba(0,0,0,.2)}
        .godPortrait{position:relative;min-height:430px;overflow:hidden;background:#090c0a}
        .godPortrait>img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;filter:saturate(.88) contrast(1.03);transition:transform 1.2s ease,filter 1.2s ease}
        .godPortrait.preserveFrame>img{object-fit:contain;object-position:center center;background:#090c0a}
        .godCard:hover .godPortrait>img{transform:scale(1.018);filter:saturate(.96) contrast(1.04)}
        .godCard:hover .godPortrait.preserveFrame>img{transform:scale(1.005)}
        .godPortrait:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 58%,rgba(6,9,7,.52));pointer-events:none;z-index:2}
        .godNumber{position:absolute;left:16px;bottom:14px;z-index:4;color:#d5c09a;font-size:11px;letter-spacing:.16em}
        .godInfo{display:flex;flex-direction:column;justify-content:center;padding:34px 32px}
        .godInfo small{color:#b9935a;font-size:10px;line-height:1.5;letter-spacing:.14em;text-transform:uppercase}
        .godInfo h3{margin:10px 0 18px;color:#e7dfcf;font-size:clamp(31px,3vw,47px);font-weight:400;line-height:1}
        .godInfo p{margin:0;color:#aaa397;font-size:15px;line-height:1.72}
        .ladaPortrait .ladaSecond{z-index:1;opacity:0;transition:opacity 2.2s cubic-bezier(.4,0,.2,1),transform 2.2s ease}
        .ladaPortrait .godNumber{z-index:4}
        .ladaPortrait:after{z-index:3}
        @media(max-width:1050px){.godsGrid{grid-template-columns:1fr}.godCard{grid-template-columns:minmax(240px,42%) 1fr}}
        @media(max-width:720px){.godsSection{margin-top:64px;padding:56px 12px 12px}.godsHeading{margin-bottom:32px;padding:0 10px}.godsHeading h2{font-size:43px}.godsHeading>p:last-child{font-size:14px}.godsGrid{gap:18px}.godCard{display:block;min-height:0}.godPortrait{min-height:0;aspect-ratio:4/5}.godInfo{padding:24px 22px 28px}.godInfo h3{font-size:34px;margin-bottom:14px}.godInfo p{font-size:14px}.godPortrait>img{object-position:center 18%}.godPortrait.preserveFrame>img{object-position:center center}}
        @media(prefers-reduced-motion:reduce){.godPortrait>img{transition:none!important}.ladaPortrait .ladaSecond{transition:opacity .6s ease!important}.godCard:hover .godPortrait>img{transform:none}}
      `}</style>
    </main>
  );
}
