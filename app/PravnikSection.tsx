"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { responsiveImage } from "../lib/site/responsive-images";
import styles from "./pravnik/pravnik.module.css";

type PravnikEntry = {
  id: string;
  number: string;
  name: string;
  image: string;
  linkedLabel: string;
  linked: string;
  sections: Array<[string, string]>;
};

const entries: PravnikEntry[] = [
  {
    id: "gromyshi",
    number: "01",
    name: "Громыши",
    image: "/assets/v1/images/pravnik/illustrations/gromyshi.webp",
    linkedLabel: "Связан с",
    linked: "Перун",
    sections: [
      ["Описание", "Малые пушистые существа размером чуть больше куницы. У них густая серо-синяя шерсть, пышный хвост и тёмные глаза. Меж волосков постоянно пробегают крошечные бело-голубые разряды, а от испуга или возбуждения мех встаёт дыбом и начинает тихо потрескивать. Громыши любопытны, подвижны и удивительно быстро признают человека своим."],
      ["В Прави", "Живут при грозовом чертоге. Собирают рассеянные искры грозы, сопровождают небесные разряды и переносят накопленную молнию. Перед сильной грозой становятся беспокойными: мечутся, светятся и искрят так, что лучше не брать их на руки."],
      ["Связан с", "Перун. Громыши — малые проводники его грозовой силы."],
      ["Что говорят", "В Яви Громышей видели чаще многих других существ Прави — обычно после сильных гроз. К людям идут охотно и могут увязаться за путником до самого дома. Есть только одна беда: они совершенно не помнят, сколько молнии успели накопить. Потому, полезши ласкаться, иной от радости так шарахнет разрядом, что человек ещё долго волосы приглаживает. Смелы до безрассудства, но недалеки: способны броситься на тварь в десять раз крупнее себя и лишь потом задуматься, хорошая ли это была мысль."],
    ],
  },
  {
    id: "rosniki",
    number: "02",
    name: "Росники",
    image: "/assets/v1/images/pravnik/illustrations/rosniki.webp",
    linkedLabel: "Связан с",
    linked: "Ляля",
    sections: [
      ["Описание", "Небольшие лесные существа величиной с зайчонка. Их нельзя принять за обычного зверя: лёгкое округлое тело словно соткано из молодой зелени, мягкого мха, тонких травинок и полупрозрачных листьев, между которыми проступает слабое золотисто-зелёное сияние. Вместо ушей — два мягких листовых завитка. За спиной дрожат две пары прозрачных крыльев, похожих на крылья стрекозы, только прожилки на них повторяют рисунок листа. На зелени и крыльях всегда держится роса."],
      ["В Прави", "Росники выходят перед самым рассветом. Несут первую влагу молодым травам и побегам, касаются ещё закрытых бутонов и помогают земле проснуться после зимнего сна. Там, где прошёл Росник, почва дольше остаётся влажной, а слабая зелень легче переживает холодное утро. Они приходят раньше цветов — в тот короткий миг, когда весна уже началась, но лес ещё только догадывается об этом."],
      ["Связан с", "Ляля. Росники следуют за самым первым пробуждением весны."],
      ["Что говорят", "Росников замечают редко, чаще всего ранней весной перед восходом, когда на траве ещё лежит холодная роса. Говорят, громких голосов они не любят и от тяжёлых шагов прячутся, зато могут долго наблюдать из травы за ребёнком или раненым зверем. После них иней тает раньше, на листьях остаются необычно крупные капли, а воздух пахнет молодой зеленью. Поймать Росника никому не удалось: стоит потянуться к нему слишком быстро — зелень дрогнет, свет погаснет, и среди мокрой травы уже никого нет."],
    ],
  },
  {
    id: "roden",
    number: "03",
    name: "Родень",
    image: "/assets/v1/images/pravnik/illustrations/roden.webp",
    linkedLabel: "Связан с",
    linked: "Род",
    sections: [
      ["Описание", "Единственный. Ростом около двух пядей. Его тело напоминает древнее живое семя или кокон: цельное, овальное, почти лишённое привычных звериных очертаний. Длинные мягкие волокна цвета старого льна, сухих корней, древесной пакли и пепла слоями спадают почти до земли; из-под них едва видны короткие ножки. Нет ни заметных ушей, ни хвоста, ни выраженной шеи. На передней части тела глубоко утоплены два непропорционально больших овальных глаза. В них нет ни белка, ни радужки, ни зрачка — только густая матовая чернота, словно уходящая глубоко внутрь. Свет почти не отражается в их поверхности; лишь далеко внутри иногда мерцает крошечная холодная точка. Родень почти не движется и почти никогда не покидает корней Мирового Древа."],
      ["В Прави", "Родень никому не прислуживает. Он находится возле Рода и появляется там, где замысел Прародителя непосредственно касается мира. Когда Родень поднимается от корней Мирового Древа и куда-то уходит, это замечают даже в Прави, потому что без причины он не ходит."],
      ["Связан с", "Род. И больше никто. Родень не принадлежит Сварожьему Кругу и не исполняет приказов других богов."],
      ["Что говорят", "Никто из людей Роденя никогда не узрел, но слухами земля полнится. Старые волхвы говорят, будто у корней Мирового Древа сидит малое существо, при пробуждении которого замолкают даже боги. Одни уверяют, что Родень открывает глаза перед бедой, способной коснуться сразу трёх миров. Другие говорят иначе: от Древа он уходит лишь затем, чтобы встретить того, кого коснулся замысел самого Рода. Откуда людям известно всё это, никто сказать не может."],
    ],
  },
  {
    id: "sudenitsy",
    number: "04",
    name: "Суденицы",
    image: "/assets/v1/images/pravnik/illustrations/sudenitsy.webp",
    linkedLabel: "Связаны с",
    linked: "Макошь · Доля · Недоля",
    sections: [
      ["Описание", "Их три — три женщины без возраста, со спокойными лицами, светлыми одеждами и тонкими нитями в руках. Первая видит начало, вторая — путь, третья — конец. Рядом с ними становится необычайно тихо."],
      ["В Прави", "Суденицы приходят тогда, когда новая судьба впервые входит в Явь. Они не создают её и не меняют, а видят то, что уже легло в узор, и следят, чтобы чужая рука не подменила нить, не украла её и не связала с той, с которой связывать было не велено."],
      ["Связаны с", "Макошь, Доля и Недоля. Макошь держит великий узор, Доля и Недоля ведут человеческий путь, а Суденицы свидетельствуют его начало."],
      ["Что говорят", "Судениц не зовут — они приходят сами. Повитухи рассказывают: после необычного рождения в избе иногда вдруг становится так тихо, что даже огонь перестаёт трещать, а возле колыбели появляются три женские тени. С ними не торгуются и их не просят передумать. Говорят, Суденицы не добры и не жестоки — они просто называют то, что уже случилось с человеческой нитью. Одни клянутся, что видели их собственными глазами; другие помнят только три голоса."],
    ],
  },
  {
    id: "vily-samovily",
    number: "05",
    name: "Вилы / самовилы",
    image: "/assets/v1/images/pravnik/illustrations/vily-samovily.webp",
    linkedLabel: "Связаны с",
    linked: "Лада · Ляля · Дана · Перун",
    sections: [
      ["Описание", "Прекрасные крылатые девы с длинными распущенными волосами и серебристо-белыми крыльями. Их встречают возле гор, рек, священных источников и там, где граница между Правью и Явью становится тонкой. Красота вил почти нечеловеческая и потому тревожная."],
      ["В Прави", "Вилы охраняют воды, горные тропы и дикие места, где должен сохраняться древний порядок. Они могут исцелить, вывести заблудившегося или предупредить об опасности. Но тому, кто осквернил охраняемое ими место, лучше не ждать человеческой справедливости: у вил она своя."],
      ["Связаны с", "Не принадлежат одному богу. Близки Ладе и Ляле через весну и красоту, Дане через воду, Перуну через горы, ветер и грозовое небо. Служанками их не называют — вилы свободны."],
      ["Что говорят", "О вилах рассказывают много, и редко две истории похожи одна на другую. Одного путника они выводят из метели, другого сбрасывают с горной тропы за хвастливое слово; одному залечивают рану, другого годами не подпускают к источнику за сорванный без спроса цветок. Говорят, вилы долго помнят и добро, и обиду. Но самая большая человеческая глупость — решить, будто дева Прави принадлежит тому, кому однажды улыбнулась."],
    ],
  },
  {
    id: "zhar-ptitsa",
    number: "06",
    name: "Жар-птица",
    image: "/assets/v1/images/pravnik/illustrations/zhar-ptitsa.webp",
    linkedLabel: "Связан с",
    linked: "Даждьбог",
    sections: [
      ["Описание", "Редкая величественная птица с золотым, янтарным и алым оперением. Длинный хвост струится за ней светом, и каждое перо словно хранит собственное маленькое солнце. Её огонь не похож на ярость Рарога: он тёплый, сияющий, почти ласковый. Но от этого Жар-птица не становится ручной."],
      ["В Прави", "Она переносит и хранит солнечный свет, тепло и жизненную силу. Иногда оставляет в Яви перо, которое способно долго оставаться тёплым даже среди зимы. Жар-птица появляется редко — как знак дара, благословения или прикосновения Прави. А когда требуется, её свет способен стать оружием."],
      ["Связан с", "Даждьбог. Жар-птица несёт его солнечный дар."],
      ["Что говорят", "Саму Жар-птицу видели немногие. Гораздо чаще находили золотое перо там, где посреди ночи будто ненадолго вставал рассвет. Говорят: если птица сама опустилась рядом с человеком — не гонись за ней, не хватай и не пытайся вырвать перо. Дар дают, его не отнимают. А тот, кто решит преследовать Жар-птицу ради её света, может долго видеть золотое сияние впереди — и всё равно никогда до него не дойти."],
    ],
  },
  {
    id: "rarog",
    number: "07",
    name: "Рарог",
    image: "/assets/v1/images/pravnik/illustrations/rarog.webp",
    linkedLabel: "Связан с",
    linked: "Семаргл · Сварог",
    sections: [
      ["Описание", "Огненная хищная птица с драконьими чертами, мощными когтями и широкими полупрозрачными крыльями. Тело его словно собрано из раскалённого воздуха, углей, искр и живого пламени. Рарог не красив той красотой, которой любуются издали: он быстр, горяч и опасен."],
      ["В Прави", "Рарог несёт огненную волю и встаёт там, где священный огонь должен быть защищён или восстановлен. Навья скверна под его крыльями выгорает. Он не хранит свет — он пускает огонь в дело."],
      ["Связан с", "Семаргл и Сварог. Ближе всего — с Семарглом, хранителем священного огня и вестником между мирами."],
      ["Что говорят", "Рарога редко видят целиком. Чаще замечают огненный вихрь, хищную тень внутри пламени или яркий след над верхушками леса. К людям он не подходит и любопытства к ним не проявляет. Говорят, после его низкого полёта навья скверна выгорает до самой земли; правда, вместе с ней иногда занимается сухая трава, кора и всё, чему не посчастливилось оказаться рядом. Потому старики говорят просто: увидел Рарога — не охоться за ним. Если позволил себя заметить, значит, летел по делу."],
    ],
  },
];

export default function PravnikSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [mobileEffects, setMobileEffects] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const gromyshiCardRef = useRef<HTMLElement | null>(null);
  const rosnikiCardRef = useRef<HTMLElement | null>(null);
  const rodenCardRef = useRef<HTMLElement | null>(null);
  const activeEntry = entries.find((entry) => entry.id === activeId) ?? null;
  const manuscriptSrc = activeEntry
    ? `/assets/v1/images/pravnik/manuscript/${activeEntry.id}-01.webp`
    : null;

  useEffect(() => {
    if (!activeEntry) {
      setZoomSrc(null);
      setShowScrollHint(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setZoomSrc(null);
    setShowScrollHint(false);

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) {
          setShowScrollHint(el.scrollHeight > el.clientHeight + 8 && el.scrollTop < 10);
        }
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeEntry]);

  useEffect(() => {
    if (!activeEntry) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomSrc) setZoomSrc(null);
      else setActiveId(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeEntry, zoomSrc]);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
    if (!coarsePointer.matches) return;

    const targets = [
      ["gromyshi", gromyshiCardRef.current, 3_400],
      ["rosniki", rosnikiCardRef.current, 4_600],
      ["roden", rodenCardRef.current, 4_200],
    ] as const;

    const observers: IntersectionObserver[] = [];
    const timers: number[] = [];
    const played = new Set<string>();

    targets.forEach(([id, target, duration]) => {
      if (!target) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.46 || played.has(id)) return;
          played.add(id);

          const start = window.setTimeout(() => {
            setMobileEffects((current) => ({ ...current, [id]: true }));
            const stop = window.setTimeout(() => {
              setMobileEffects((current) => ({ ...current, [id]: false }));
            }, duration);
            timers.push(stop);
          }, 450);

          timers.push(start);
        },
        { threshold: [0, 0.46, 0.72] },
      );

      observer.observe(target);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <section className="section" id="pravnik">
      <p className="sectionMark">04 · Книга Прави</p>
      <div className="sectionBody">
        <p className="eyebrow">Существа и помощники Прави</p>
        <h2>Правник</h2>
        <p className="sectionIntro">
          Правь — обитель богов, но не только богов. В её лесах, садах, небесных чертогах и у древних корней живут те, кто несёт их волю, хранит установленный порядок, сопровождает стихии или просто существует рядом с силами, старшими человеческой памяти. Не всех из них стоит считать добрыми: Правь знает милость, но Правь знает и закон.
        </p>
        <p className={styles.instruction}>Нажмите на существо — откроется лист Правника.</p>

        <div className={styles.grid} aria-label="Существа Прави">
          {entries.map((entry) => (
            <article
              className={styles.entry}
              key={entry.id}
              ref={
                entry.id === "gromyshi"
                  ? gromyshiCardRef
                  : entry.id === "rosniki"
                    ? rosnikiCardRef
                    : entry.id === "roden"
                      ? rodenCardRef
                      : undefined
              }
              data-pravnik-id={entry.id}
            >
              <button
                type="button"
                className={styles.card}
                aria-haspopup="dialog"
                aria-label={`Открыть запись: ${entry.name}`}
                onClick={() => setActiveId(entry.id)}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={entry.image}
                    {...responsiveImage(entry.image, "card")}
                    alt={entry.name}
                    loading="lazy"
                    decoding="async"
                  />

                  {entry.id === "gromyshi" && (
                    <span
                      className={`${styles.gromyshiLightning} ${mobileEffects.gromyshi ? styles.gromyshiLightningActive : ""}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M18 28 L25 34 L21 42 L33 49" />
                        <path d="M67 18 L61 29 L70 34 L63 47" />
                        <path d="M39 54 L48 60 L43 70 L54 78" />
                        <path d="M73 59 L66 66 L74 73 L69 84" />
                        <path d="M29 15 L34 21 L31 28 L39 32" />
                      </svg>
                    </span>
                  )}

                  {entry.id === "rosniki" && (
                    <span
                      className={`${styles.rosnikiSwarm} ${mobileEffects.rosniki ? styles.rosnikiSwarmActive : ""}`}
                      aria-hidden="true"
                    >
                      {Array.from({ length: 52 }, (_, index) => {
                        const style = {
                          "--spark-x": `${6 + ((index * 17) % 88)}%`,
                          "--spark-y": `${12 + ((index * 29) % 70)}%`,
                          "--spark-dx": `${42 + ((index * 23) % 78)}px`,
                          "--spark-dy": `${-34 + ((index * 19) % 68)}px`,
                          "--spark-size": `${1.4 + (index % 4) * 0.65}px`,
                          "--spark-delay": `${(index % 13) * 58}ms`,
                          "--spark-duration": `${2.7 + (index % 7) * 0.22}s`,
                        } as CSSProperties;
                        return <i key={index} style={style} />;
                      })}
                    </span>
                  )}

                  {entry.id === "roden" && (
                    <span
                      className={`${styles.rodenFog} ${mobileEffects.roden ? styles.rodenFogActive : ""}`}
                      aria-hidden="true"
                    >
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
                <div className={styles.cardHeading}>
                  <span>{entry.number}</span>
                  <div>
                    <h3>{entry.name}</h3>
                    <small>{entry.linkedLabel}: {entry.linked}</small>
                  </div>
                  <b aria-hidden="true">↗</b>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>

      {activeEntry && (
        <div
          className={styles.overlay}
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setActiveId(null);
          }}
        >
          <article
            className={styles.parchment}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`pravnik-title-${activeEntry.id}`}
          >
            <button
              type="button"
              className={styles.close}
              aria-label="Закрыть запись"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>

            <div
              className={styles.modalScroll}
              ref={scrollRef}
              onScroll={(event) => {
                const el = event.currentTarget;
                setShowScrollHint(el.scrollTop < 10 && el.scrollHeight > el.clientHeight + 8);
              }}
            >
              <header className={styles.modalHeader}>
                {manuscriptSrc && (
                  <button
                    type="button"
                    className={styles.modalImage}
                    onClick={() => setZoomSrc(manuscriptSrc)}
                    aria-label={`Глядеть близко: рукописный рисунок ${activeEntry.name}`}
                  >
                    <img
                      src={manuscriptSrc}
                      {...responsiveImage(manuscriptSrc, "thumb")}
                      alt={`Рукописный рисунок: ${activeEntry.name}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.zoomCue}>Глядеть близко</span>
                  </button>
                )}
                <div className={styles.modalTitle}>
                  <p>✦ Лист Правника · {activeEntry.number}</p>
                  <h2 id={`pravnik-title-${activeEntry.id}`}>{activeEntry.name}</h2>
                  <div className={styles.linked}>
                    <small>{activeEntry.linkedLabel}</small>
                    <strong>{activeEntry.linked}</strong>
                  </div>
                </div>
              </header>

              <div className={styles.modalText}>
                {activeEntry.sections.map(([title, copy]) => (
                  <section key={title}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </section>
                ))}
              </div>
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
              aria-label="Рукописный рисунок крупно"
              onPointerDown={(event) => {
                event.stopPropagation();
                if (event.target === event.currentTarget) setZoomSrc(null);
              }}
            >
              <button
                type="button"
                className={styles.zoomClose}
                aria-label="Закрыть увеличенный рисунок"
                onClick={() => setZoomSrc(null)}
              >
                ×
              </button>
              <img
                className={styles.zoomImage}
                src={zoomSrc}
                alt={`Рукописный рисунок: ${activeEntry.name}`}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
