"use client";

import { useEffect, useMemo, useState } from "react";
import ReturnToWorld from "../ReturnToWorld";
import FinalSecretText from "../FinalSecretText";
import { SIGN_COUNT, SIGN_REGISTRY } from "../../lib/anomalies/registry";
import {
  EMPTY_ANOMALY_STATE,
  readAnomalyState,
  subscribeAnomalyStore,
  type AnomalyState,
} from "../../lib/anomalies/store";

const slots = SIGN_REGISTRY.map((sign) => ({ id: sign.id, title: sign.title, text: sign.archiveText }));

export default function BeyondPage() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AnomalyState>(EMPTY_ANOMALY_STATE);

  useEffect(() => {
    const sync = () => setState(readAnomalyState());
    sync();
    setReady(true);
    return subscribeAnomalyStore(sync);
  }, []);

  const found = useMemo(() => new Set(state.found), [state.found]);
  const count = state.found.length;

  if (!ready) return <main style={{ minHeight: "100vh", background: "#0b0f0c" }} />;

  if (!state.beyondUnlocked) {
    return (
      <main className="lockedPage">
        <div>
          <p className="eyebrow">Межа</p>
          <h1>Эта дорога не открывается по прямому пути.</h1>
          <p>Если ты ещё не нашёл вход, адрес страницы не поможет.</p>
          <ReturnToWorld />
        </div>
        <style>{styles}</style>
      </main>
    );
  }

  return (
    <main className="beyondPage">
      <header className="topbar">
        <a href="/">Там, где умирает Явь</a>
        <ReturnToWorld />
      </header>

      <section className="hero">
        <p className="eyebrow">Скрытый архив</p>
        <h1>За Межой</h1>
        <div className="progressSeal" aria-label={`Найдено знаков Межи: ${count} из ${SIGN_COUNT}`}>
          <div className="sealHalo" aria-hidden="true" />
          <div className="sealMarks" aria-hidden="true">
            {slots.map((slot, index) => (
              <span
                key={slot.id}
                className={found.has(slot.id) ? "lit" : ""}
                style={{ transform: `rotate(${index * (360 / SIGN_COUNT)}deg) translateY(-76px)` }}
              >◇</span>
            ))}
          </div>
          <div className="sealCore">
            <small>Знаки Межи</small>
            <strong>{count}</strong>
            <i>из {SIGN_COUNT}</i>
          </div>
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

      {count === SIGN_COUNT && <FinalSecretText />}

      <footer>
        {state.choice && <p>Выбор запомнен: <b>{state.choice === "memory" ? "Память" : "Жизнь"}</b>.</p>}
        <ReturnToWorld />
      </footer>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *{box-sizing:border-box}
  .beyondPage,.lockedPage{min-height:100vh;background:#0b0f0c;color:#e6dfd2;font-family:Georgia,serif}
  .lockedPage{display:grid;place-items:center;padding:28px;text-align:center;background:radial-gradient(circle at 50% 8%,rgba(41,50,42,.22),transparent 34%),#0b0f0c}.lockedPage>div{max-width:720px}.lockedPage h1{font-size:clamp(38px,7vw,74px);font-weight:400;line-height:1.04;margin:10px 0 22px}.lockedPage p:not(.eyebrow){color:#948e83;line-height:1.7}.lockedPage a{display:inline-block;margin-top:20px;color:#d3bd94;text-decoration:none;border:1px solid rgba(211,189,148,.32);padding:12px 16px;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
  .topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 5vw;border-bottom:1px solid rgba(214,196,161,.12);background:rgba(8,11,9,.92);position:sticky;top:0;z-index:10;backdrop-filter:blur(9px)}.topbar a{color:#d9d0c1;text-decoration:none;font-size:12px;letter-spacing:.07em}.topbar a:last-child{color:#bba67f;text-transform:uppercase;font-size:10px;letter-spacing:.12em}
  .hero{position:relative;min-height:min(760px,calc(100vh - 58px));margin:0;padding:clamp(78px,8vw,118px) 6vw 84px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;border-bottom:1px solid rgba(214,196,161,.12);background-image:linear-gradient(180deg,rgba(5,8,6,.28) 0%,rgba(5,8,6,.48) 46%,rgba(7,10,8,.88) 100%),radial-gradient(circle at 50% 38%,rgba(5,8,6,.05) 0%,rgba(5,8,6,.28) 72%),url('/images/za-mezhoy/za-mezhoy-desktop.webp');background-size:cover;background-position:center;background-repeat:no-repeat}.hero:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 -110px 130px rgba(7,10,8,.62);z-index:0}.hero>*{position:relative;z-index:1}.eyebrow{margin:0 0 12px;color:#c5a46d;font:11px/1.3 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;text-shadow:0 2px 18px rgba(0,0,0,.75)}.hero h1{font-size:clamp(58px,10vw,128px);font-weight:400;line-height:.9;margin:0 0 34px;letter-spacing:-.04em;color:#eee6d8;text-shadow:0 3px 24px rgba(0,0,0,.72),0 0 42px rgba(0,0,0,.35)}.hero>p:last-child{max-width:650px;margin:28px auto 0;color:#c1b8aa;line-height:1.8;font-size:16px;text-shadow:0 2px 16px rgba(0,0,0,.85)}
  .progressSeal{position:relative;width:190px;height:190px;margin:0 auto;display:grid;place-items:center;isolation:isolate}.sealHalo{position:absolute;inset:18px;border-radius:50%;border:1px solid rgba(203,169,110,.52);box-shadow:0 0 0 8px rgba(185,147,90,.025),0 0 42px rgba(185,147,90,.18),inset 0 0 30px rgba(185,147,90,.06)}.sealHalo:before,.sealHalo:after{content:"";position:absolute;inset:10px;border-radius:50%;border:1px solid rgba(226,208,173,.12)}.sealHalo:after{inset:28px;border-style:dashed;opacity:.7}.sealMarks{position:absolute;inset:0;display:grid;place-items:center}.sealMarks span{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px;color:rgba(176,166,147,.48);font:12px/18px Georgia,serif;text-align:center;transform-origin:9px 9px;transition:color .45s ease,text-shadow .45s ease,opacity .45s ease}.sealMarks span.lit{color:#ead09a;text-shadow:0 0 9px rgba(234,208,154,.9),0 0 24px rgba(185,147,90,.48);opacity:1}.sealCore{position:relative;z-index:2;width:112px;height:112px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(28,33,27,.94),rgba(9,12,10,.9));border:1px solid rgba(226,208,173,.22);box-shadow:0 8px 36px rgba(0,0,0,.42),inset 0 0 26px rgba(0,0,0,.38)}.sealCore small{color:#c0a475;font:8px/1.2 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase}.sealCore strong{margin:2px 0 -2px;color:#f0e3cc;font-size:48px;font-weight:400;line-height:1;text-shadow:0 0 22px rgba(213,192,154,.22)}.sealCore i{color:#9f9585;font:9px/1 Arial,sans-serif;font-style:normal;letter-spacing:.13em;text-transform:uppercase}
  .memoryGrid{max-width:1320px;margin:0 auto;padding:68px 5vw 90px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.memoryCard{position:relative;min-height:235px;padding:32px 28px;border:1px solid rgba(214,196,161,.13);background:linear-gradient(145deg,rgba(18,23,19,.8),rgba(9,12,10,.94))}.memoryCard.found{border-color:rgba(185,147,90,.29);box-shadow:inset 0 0 45px rgba(185,147,90,.025)}.memoryCard.lost{opacity:.58}.number{position:absolute;right:18px;top:16px;color:#5f5a51;font:10px Arial,sans-serif;letter-spacing:.14em}.status{margin:0 0 20px!important;color:#9f7e4e!important;font:9px Arial,sans-serif!important;letter-spacing:.17em;text-transform:uppercase}.memoryCard h2{margin:0 0 17px;font-size:31px;font-weight:400;line-height:1.05}.memoryCard>p:last-child{margin:0;color:#989187;font-size:14px;line-height:1.7}.lost h2{color:#7b756a;font-size:23px}
  .finalSecret{position:relative;max-width:1080px;min-height:240px;margin:0 auto 90px;border-top:1px solid rgba(214,196,161,.2);border-bottom:1px solid rgba(214,196,161,.2);display:grid;place-items:center;background:radial-gradient(circle at 50% 50%,rgba(185,147,90,.055),transparent 58%);box-shadow:0 0 80px rgba(185,147,90,.04)}.finalSecretMark{width:92px;height:92px;display:grid;place-items:center;border:1px solid rgba(210,188,143,.25);border-radius:50%;color:rgba(218,196,151,.5);font-size:30px;box-shadow:inset 0 0 26px rgba(185,147,90,.05),0 0 34px rgba(185,147,90,.04)}.finalSecret>p{max-width:720px;margin:0;padding:48px;color:#b9b0a1;font-size:17px;line-height:1.85;text-align:left}
  footer{text-align:center;padding:0 5vw 70px;color:#777168;font:12px Arial,sans-serif;letter-spacing:.05em}footer b{color:#b9935a;font-weight:400}footer a{display:inline-block;margin-top:14px;color:#bba67f;text-decoration:none;text-transform:uppercase;font-size:10px;letter-spacing:.14em}
  @media(max-width:900px){.memoryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.topbar{padding:16px 18px}.topbar a:first-child{font-size:11px}.hero{min-height:calc(100svh - 52px);padding:48px 16px 54px;background-image:linear-gradient(180deg,rgba(5,8,6,.22) 0%,rgba(5,8,6,.44) 42%,rgba(7,10,8,.9) 100%),radial-gradient(circle at 50% 34%,rgba(5,8,6,.04) 0%,rgba(5,8,6,.3) 72%),url('/images/za-mezhoy/za-mezhoy-mobile.webp');background-position:center top}.hero h1{margin-bottom:28px;font-size:clamp(54px,18vw,76px);line-height:.94}.hero>p:last-child{max-width:330px;margin-top:25px;font-size:14px;line-height:1.65}.progressSeal{width:178px;height:178px}.sealHalo{inset:17px}.sealMarks span{font-size:11px}.sealCore{width:104px;height:104px}.sealCore strong{font-size:44px}.memoryGrid{grid-template-columns:1fr;padding:48px 14px 70px}.memoryCard{min-height:205px}.finalSecret{min-height:200px;margin:0 14px 64px}}
`;
