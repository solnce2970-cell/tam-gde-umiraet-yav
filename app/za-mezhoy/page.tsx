"use client";

import { useEffect, useMemo, useState } from "react";

const STATE_KEY = "yav-anomalies-v1";

type AnomalyState = {
  found: string[];
  beyondUnlocked: boolean;
  choice: "memory" | "life" | null;
  worldSeen: string[];
};

const slots = [
  {
    id: "broken-border",
    title: "Нарушенная межа",
    text: "На одно мгновение слова назвали происходящее иначе.",
  },
  {
    id: "night-nav",
    title: "Навь не спит",
    text: "Некоторые огни появляются только тогда, когда Явь уже должна спать.",
  },
  {
    id: "memory-or-life",
    title: "Древний договор",
    text: "Память или жизнь. Один выбор уже сделан.",
  },
  { id: "auk-echo", title: "Ау", text: "Лес иногда отвечает не с той стороны." },
  { id: "makosh-thread", title: "Чужая нить", text: "Не всякая нить лежит в руках Макоши." },
  { id: "lada-third", title: "Между двумя ликами", text: "Один лик ещё ничего не доказывает." },
  { id: "three-worlds", title: "Три шага", text: "Миры важны не только сами по себе, но и в порядке, в котором к ним приходят." },
  { id: "shishiga-track", title: "Неверный след", text: "Иногда след выдаёт тварь раньше, чем лицо." },
  { id: "morok-stars", title: "Лишняя звезда", text: "В темноте Морока не всё остаётся на своих местах." },
  { id: "semargl-svarog", title: "Отцовская искра", text: "Некоторый огонь помнит, откуда был высечен." },
  { id: "neveyana-morok", title: "Белые глаза", text: "Не каждый взгляд принадлежит тому, кто смотрит." },
  { id: "silent-path", title: "Тихая дорога", text: "Иногда сайт замечает того, кто слишком долго ничего не делает." },
  { id: "return-to-beginning", title: "Возвращение", text: "Последний знак не лежит дальше остальных. Он ждёт в начале." },
];

const emptyState: AnomalyState = {
  found: [],
  beyondUnlocked: false,
  choice: null,
  worldSeen: [],
};

function readState(): AnomalyState {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<AnomalyState>;
    return {
      found: Array.isArray(parsed.found) ? [...new Set(parsed.found)] : [],
      beyondUnlocked: parsed.beyondUnlocked === true,
      choice: parsed.choice === "memory" || parsed.choice === "life" ? parsed.choice : null,
      worldSeen: Array.isArray(parsed.worldSeen) ? [...new Set(parsed.worldSeen)] : [],
    };
  } catch {
    return emptyState;
  }
}

export default function BeyondPage() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AnomalyState>(emptyState);

  useEffect(() => {
    const sync = () => setState(readState());
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener("yav:anomaly-found", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("yav:anomaly-found", sync as EventListener);
    };
  }, []);

  const found = useMemo(() => new Set(state.found), [state.found]);
  const count = Math.min(slots.length, slots.filter((slot) => found.has(slot.id)).length);

  if (!ready) {
    return <main style={{ minHeight: "100vh", background: "#0b0f0c" }} />;
  }

  if (!state.beyondUnlocked) {
    return (
      <main className="lockedPage">
        <div>
          <p className="eyebrow">Межа</p>
          <h1>Эта дорога не открывается по прямому пути.</h1>
          <p>Если ты ещё не нашёл вход, адрес страницы не поможет.</p>
          <a href="/">Вернуться в Явь</a>
        </div>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="beyondPage">
      <header className="topbar">
        <a href="/">Там, где умирает Явь</a>
        <a href="/">← Вернуться</a>
      </header>

      <section className="hero">
        <p className="eyebrow">Скрытый архив</p>
        <h1>За Межой</h1>
        <div className="progress" aria-label={`Найдено знаков Межи: ${count} из 13`}>
          <span>Знаки Межи</span>
          <b>{count}<i> из 13</i></b>
        </div>
        <p>Это место существует только для тех, кого сайт уже запомнил.</p>
      </section>

      <section className="memoryGrid" aria-label="Найденные знаки Межи">
        {slots.map((slot, index) => {
          const isFound = found.has(slot.id);
          return (
            <article className={`memoryCard ${isFound ? "found" : "lost"}`} key={slot.id}>
              <span className="number">{String(index + 1).padStart(2, "0")}</span>
              {isFound ? (
                <>
                  <p className="status">Найдено</p>
                  <h2>{slot.title}</h2>
                  <p>{slot.id === "memory-or-life" && state.choice ? `${slot.text} Ты выбрал${state.choice === "memory" ? " память" : " жизнь"}.` : slot.text}</p>
                </>
              ) : (
                <>
                  <p className="status">Не найдено</p>
                  <h2>◇</h2>
                  <p>{index % 2 === 0 ? "Память ещё не вернулась." : "Эта нить пока не найдена."}</p>
                </>
              )}
            </article>
          );
        })}
      </section>

      <section className={`excerpt ${count >= 13 ? "open" : "locked"}`}>
        <p className="eyebrow">Награда за 13 знаков Межи</p>
        <h2>{count >= 13 ? "Отрывок открыт" : "Скрытый отрывок романа"}</h2>
        {count >= 13 ? (
          <p>Здесь появится скрытый отрывок романа. Текст добавим, когда будет утверждён сам фрагмент.</p>
        ) : (
          <p>Он откроется только после того, как будут найдены все тринадцать знаков Межи.</p>
        )}
      </section>

      <footer>
        <p>Выбор запомнен: <b>{state.choice === "memory" ? "Память" : "Жизнь"}</b>.</p>
        <a href="/">Вернуться к дороге</a>
      </footer>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *{box-sizing:border-box}
  .beyondPage,.lockedPage{min-height:100vh;background:radial-gradient(circle at 50% 8%,rgba(41,50,42,.22),transparent 34%),#0b0f0c;color:#e6dfd2;font-family:Georgia,serif}
  .lockedPage{display:grid;place-items:center;padding:28px;text-align:center}.lockedPage>div{max-width:720px}.lockedPage h1{font-size:clamp(38px,7vw,74px);font-weight:400;line-height:1.04;margin:10px 0 22px}.lockedPage p:not(.eyebrow){color:#948e83;line-height:1.7}.lockedPage a{display:inline-block;margin-top:20px;color:#d3bd94;text-decoration:none;border:1px solid rgba(211,189,148,.32);padding:12px 16px;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  .topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 5vw;border-bottom:1px solid rgba(214,196,161,.12);background:rgba(8,11,9,.9);position:sticky;top:0;z-index:10;backdrop-filter:blur(9px)}.topbar a{color:#d9d0c1;text-decoration:none;font-size:12px;letter-spacing:.07em}.topbar a:last-child{color:#bba67f;text-transform:uppercase;font-size:10px;letter-spacing:.12em}
  .hero{max-width:1100px;margin:0 auto;padding:90px 6vw 56px;text-align:center}.eyebrow{margin:0 0 12px;color:#b9935a;font:11px/1.3 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase}.hero h1{font-size:clamp(58px,10vw,128px);font-weight:400;line-height:.9;margin:0 0 28px;letter-spacing:-.04em}.hero>p:last-child{max-width:650px;margin:24px auto 0;color:#9e978b;line-height:1.8;font-size:16px}.progress{display:inline-flex;justify-content:center;gap:16px;align-items:baseline;padding:12px 18px;border-top:1px solid rgba(185,147,90,.22);border-bottom:1px solid rgba(185,147,90,.22);font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;color:#918a7d;font-size:10px}.progress b{color:#d5c09a;font-size:25px;font-weight:400;letter-spacing:.04em}.progress i{font-style:normal;font-size:11px;color:#8e8678;letter-spacing:.1em}
  .memoryGrid{max-width:1320px;margin:0 auto;padding:0 5vw 90px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.memoryCard{position:relative;min-height:235px;padding:32px 28px;border:1px solid rgba(214,196,161,.13);background:linear-gradient(145deg,rgba(18,23,19,.8),rgba(9,12,10,.94))}.memoryCard.found{border-color:rgba(185,147,90,.29);box-shadow:inset 0 0 45px rgba(185,147,90,.025)}.memoryCard.lost{opacity:.58}.number{position:absolute;right:18px;top:16px;color:#5f5a51;font:10px Arial,sans-serif;letter-spacing:.14em}.status{margin:0 0 20px!important;color:#9f7e4e!important;font:9px Arial,sans-serif!important;letter-spacing:.17em;text-transform:uppercase}.memoryCard h2{margin:0 0 17px;font-size:31px;font-weight:400;line-height:1.05}.memoryCard>p:last-child{margin:0;color:#989187;font-size:14px;line-height:1.7}.lost h2{color:#7b756a;font-size:23px}
  .excerpt{max-width:1080px;margin:0 auto 90px;padding:64px 6vw;border-top:1px solid rgba(214,196,161,.15);border-bottom:1px solid rgba(214,196,161,.15);text-align:center}.excerpt h2{font-size:clamp(38px,6vw,70px);font-weight:400;margin:0 0 20px}.excerpt>p:last-child{max-width:650px;margin:0 auto;color:#928b80;line-height:1.8}.excerpt.locked{opacity:.7}.excerpt.open{box-shadow:0 0 80px rgba(185,147,90,.05)}
  footer{text-align:center;padding:0 5vw 70px;color:#777168;font:12px Arial,sans-serif;letter-spacing:.05em}footer b{color:#b9935a;font-weight:400}footer a{display:inline-block;margin-top:14px;color:#bba67f;text-decoration:none;text-transform:uppercase;font-size:10px;letter-spacing:.14em}
  @media(max-width:900px){.memoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.topbar{padding:16px 18px}.topbar a:first-child{font-size:11px}.hero{padding:58px 16px 42px}.hero h1{margin-bottom:22px}.hero>p:last-child{margin-top:20px;font-size:14px}.progress{display:flex;width:min(100%,340px);margin:0 auto;padding:15px 16px;justify-content:space-between;align-items:center;border:1px solid rgba(185,147,90,.28);background:rgba(185,147,90,.035);font-size:10px}.progress b{font-size:30px}.progress i{font-size:10px}.memoryGrid{grid-template-columns:1fr;padding:0 14px 70px}.memoryCard{min-height:205px}.excerpt{margin-bottom:64px}}
`;
