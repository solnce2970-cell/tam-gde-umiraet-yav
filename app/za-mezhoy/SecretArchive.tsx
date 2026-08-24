"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnomalyState } from "../../lib/anomalies/store";
import { SIGN_COUNT } from "../../lib/anomalies/registry";
import { SECRET_STORIES, SECRET_STORY_ORDER, type SecretStoryId } from "../../lib/secret-stories";
import {
  EMPTY_SECRET_ARCHIVE_STATE,
  readSecretArchiveState,
  subscribeSecretArchive,
  unlockSecretOtherSide,
  type SecretArchiveState,
} from "../../lib/secret-stories/archive-state";

function StoryCard({ id, opened }: { id: SecretStoryId; opened: boolean }) {
  const story = SECRET_STORIES[id];
  return (
    <a className="secretStoryCard" href={`/za-mezhoy/tales/${id}`}>
      <small>{opened ? "Открыто" : "Тайное сказание"}</small>
      <h3>{story.title}</h3>
      <p>{story.subtitle}</p>
      <span>Читать →</span>
    </a>
  );
}

export default function SecretArchive({ state }: { state: AnomalyState }) {
  const [archive, setArchive] = useState<SecretArchiveState>(EMPTY_SECRET_ARCHIVE_STATE);

  useEffect(() => {
    const sync = () => setArchive(readSecretArchiveState());
    sync();
    return subscribeSecretArchive(sync);
  }, []);

  if (state.found.length !== SIGN_COUNT) return null;

  if (!state.choice) {
    return (
      <section className="secretArchive">
        <p className="secretEyebrow">Тайные сказания</p>
        <h2>Одна из нитей пути потеряна.</h2>
        <p className="secretIntro">Выбор Памяти или Жизни не сохранился. Не открываю рассказы случайным образом.</p>
      </section>
    );
  }

  const primary = SECRET_STORY_ORDER[state.choice];
  const otherBranch = state.choice === "memory" ? "life" : "memory";
  const secondary = SECRET_STORY_ORDER[otherBranch];
  const primaryRead = primary.every((id) => archive.opened.includes(id));

  const openOtherSide = () => setArchive(unlockSecretOtherSide());

  return (
    <section className="secretArchive" aria-labelledby="secret-archive-title">
      <p className="secretEyebrow">Межа открылась</p>
      <h2 id="secret-archive-title">Тайные сказания</h2>
      <p className="secretIntro">
        Твой выбор — <b>{state.choice === "memory" ? "Память" : "Жизнь"}</b>. Сначала Межа отдаёт те истории, к которым привела эта нить.
      </p>

      <div className="secretStoryGrid">
        {primary.map((id) => <StoryCard key={id} id={id} opened={archive.opened.includes(id)} />)}
      </div>

      {!archive.otherSideUnlocked && primaryRead && (
        <div className="otherSideGate">
          <p>{state.choice === "memory" ? "Ты выбрал Память. Но Межа помнит и то, от чего ты отказался." : "Ты выбрал Жизнь. Но Межа хранит и то, что осталось в памяти."}</p>
          <button type="button" onClick={openOtherSide}>Посмотреть другую сторону</button>
        </div>
      )}

      {archive.otherSideUnlocked && (
        <div className="otherSideArchive">
          <p className="secretEyebrow">Другая сторона Межи</p>
          <div className="secretStoryGrid">
            {secondary.map((id) => <StoryCard key={id} id={id} opened={archive.opened.includes(id)} />)}
          </div>
        </div>
      )}

      <style>{styles}</style>
    </section>
  );
}

const styles = `
  .secretArchive{max-width:1040px;margin:0 auto 96px;padding:70px 5vw;border-top:1px solid rgba(214,196,161,.18);border-bottom:1px solid rgba(214,196,161,.18);background:linear-gradient(180deg,rgba(15,20,16,.66),rgba(8,11,9,.82));color:#e6dfd2}
  .secretEyebrow{margin:0 0 12px;color:#b9935a;font:10px/1.3 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase}
  .secretArchive h2{margin:0 0 16px;font:400 clamp(38px,5vw,64px)/1 Georgia,serif;color:#eee6d8}
  .secretIntro{max-width:680px;margin:0 0 34px;color:#9f978b;font:15px/1.8 Georgia,serif}.secretIntro b{color:#d4bd94;font-weight:400}
  .secretStoryGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .secretStoryCard{display:block;min-height:210px;padding:28px;border:1px solid rgba(203,169,110,.24);background:rgba(8,12,9,.74);color:inherit;text-decoration:none;transition:transform .18s ease,border-color .18s ease,background .18s ease}
  .secretStoryCard:hover,.secretStoryCard:focus-visible{transform:translateY(-2px);border-color:rgba(218,190,140,.5);background:rgba(15,20,16,.86);outline:none}
  .secretStoryCard small{display:block;margin-bottom:20px;color:#9f7e4e;font:9px/1.2 Arial,sans-serif;letter-spacing:.17em;text-transform:uppercase}
  .secretStoryCard h3{margin:0 0 12px;font:400 30px/1.08 Georgia,serif;color:#e9e0d2}
  .secretStoryCard p{margin:0 0 24px;color:#938b80;font:14px/1.65 Georgia,serif}
  .secretStoryCard span{color:#c8aa78;font:10px/1.2 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}
  .otherSideGate{margin-top:44px;padding:26px 0 0;border-top:1px solid rgba(214,196,161,.13)}.otherSideGate p{max-width:660px;margin:0 0 18px;color:#a8a094;font:15px/1.7 Georgia,serif}.otherSideGate button{border:1px solid rgba(203,169,110,.36);background:transparent;color:#d1b27e;padding:12px 16px;font:10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
  .otherSideArchive{margin-top:54px;padding-top:34px;border-top:1px solid rgba(214,196,161,.13)}
  @media(max-width:700px){.secretArchive{margin:0 14px 70px;padding:52px 18px}.secretStoryGrid{grid-template-columns:1fr}.secretStoryCard{min-height:190px;padding:24px}.secretStoryCard h3{font-size:27px}.secretIntro{font-size:14px}.otherSideGate button{width:100%;min-height:46px}}
`;
