"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ReturnToWorld from "../../../ReturnToWorld";
import { SIGN_COUNT } from "../../../../lib/anomalies/registry";
import { EMPTY_ANOMALY_STATE, readAnomalyState, subscribeAnomalyStore, type AnomalyState } from "../../../../lib/anomalies/store";
import { getSecretStory, SECRET_STORIES, SECRET_STORY_ORDER, type SecretStoryId } from "../../../../lib/secret-stories";
import { markSecretStoryOpened, readSecretArchiveState } from "../../../../lib/secret-stories/archive-state";

export default function SecretStoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const story = useMemo(() => getSecretStory(slug), [slug]);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AnomalyState>(EMPTY_ANOMALY_STATE);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sync = () => setState(readAnomalyState());
    sync();
    setReady(true);
    return subscribeAnomalyStore(sync);
  }, []);

  const archive = ready ? readSecretArchiveState() : { opened: [], otherSideUnlocked: false };
  const primary = state.choice ? SECRET_STORY_ORDER[state.choice] : [];
  const secondaryBranch = state.choice === "memory" ? "life" : "memory";
  const secondary = state.choice ? SECRET_STORY_ORDER[secondaryBranch] : [];
  const permitted = !!story && state.found.length === SIGN_COUNT && !!state.choice && (
    primary.includes(story.id) || (archive.otherSideUnlocked && secondary.includes(story.id))
  );

  useEffect(() => {
    if (!ready || !story || !permitted) return;
    markSecretStoryOpened(story.id);
  }, [ready, story, permitted]);

  useEffect(() => {
    if (!permitted) return;
    let ticking = false;
    const update = () => {
      const root = document.documentElement;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      setProgress(Math.max(0, Math.min(1, window.scrollY / max)));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [permitted]);

  if (!ready) return <main style={{ minHeight: "100vh", background: "#0b0f0c" }} />;

  if (!story || !permitted) {
    return (
      <main className="storyLocked">
        <div>
          <p className="storyEyebrow">За Межой</p>
          <h1>Эта дорога тебе не открылась.</h1>
          <p>Тайные сказания появляются только после всех тринадцати знаков и следуют за сделанным выбором.</p>
          <a href="/za-mezhoy">← К тайным сказаниям</a>
          <ReturnToWorld />
        </div>
        <style>{styles}</style>
      </main>
    );
  }

  const pair = story.branch === state.choice ? primary : secondary;
  const index = pair.indexOf(story.id);
  const previous = index > 0 ? SECRET_STORIES[pair[index - 1]] : null;
  const next = index >= 0 && index < pair.length - 1 ? SECRET_STORIES[pair[index + 1]] : null;

  return (
    <main className="storyPage">
      <div className="readingProgress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <header className="storyTopbar">
        <a href="/za-mezhoy">← Тайные сказания</a>
        <ReturnToWorld />
      </header>

      <article className="storyArticle">
        <header className="storyHeader">
          <p className="storyEyebrow">Тайное сказание</p>
          <h1>{story.title}</h1>
          <p className="storySubtitle">{story.subtitle}</p>
        </header>

        <div className="storyBody">
          {story.paragraphs.map((paragraph, i) => (
            <p key={`${story.id}-${i}`} className={i === 0 && paragraph.includes("\n") ? "storyDateline" : undefined}>
              {paragraph.split("\n").map((line, lineIndex) => (
                <span key={lineIndex}>{line}{lineIndex < paragraph.split("\n").length - 1 ? <br /> : null}</span>
              ))}
            </p>
          ))}
        </div>

        <nav className="storyNav" aria-label="Навигация по тайным сказаниям">
          {previous ? <a href={`/za-mezhoy/tales/${previous.id}`}>← {previous.title}</a> : <span />}
          {next ? <a href={`/za-mezhoy/tales/${next.id}`}>{next.title} →</a> : <a href="/za-mezhoy">К тайным сказаниям →</a>}
        </nav>
      </article>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  *{box-sizing:border-box}.storyPage,.storyLocked{min-height:100vh;background:#0b0f0c;color:#e8e0d3;font-family:Georgia,serif}.readingProgress{position:fixed;left:0;top:0;width:100%;height:2px;z-index:30;transform-origin:left center;background:#b9935a;box-shadow:0 0 12px rgba(185,147,90,.35)}
  .storyTopbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;gap:18px;padding:15px 5vw;border-bottom:1px solid rgba(214,196,161,.11);background:rgba(8,11,9,.94);backdrop-filter:blur(10px)}.storyTopbar a{color:#bca77f;text-decoration:none;font:10px/1.2 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
  .storyArticle{width:min(100% - 36px,760px);margin:0 auto;padding:78px 0 90px}.storyHeader{text-align:center;margin:0 auto 62px;padding-bottom:38px;border-bottom:1px solid rgba(214,196,161,.14)}.storyEyebrow{margin:0 0 14px;color:#b9935a;font:10px/1.3 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase}.storyHeader h1{margin:0 0 18px;font:400 clamp(42px,7vw,72px)/1.02 Georgia,serif;letter-spacing:-.025em;color:#f0e7d9}.storySubtitle{margin:0;color:#8f887e;font-size:14px;line-height:1.6}
  .storyBody{font-size:19px;line-height:1.78;color:#ddd5c9}.storyBody p{margin:0 0 1.22em}.storyBody .storyDateline{margin-bottom:2.3em;color:#9e968a;font-style:italic;font-size:.91em;line-height:1.65}.storyBody p:first-child+ p{margin-top:0}.storyBody p:has(+ p){ }
  .storyNav{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:64px;padding-top:28px;border-top:1px solid rgba(214,196,161,.14)}.storyNav a{color:#c6aa79;text-decoration:none;font:11px/1.5 Arial,sans-serif;letter-spacing:.06em}.storyNav a:last-child{text-align:right}
  .storyLocked{display:grid;place-items:center;padding:28px;text-align:center}.storyLocked>div{max-width:680px}.storyLocked h1{margin:10px 0 20px;font:400 clamp(38px,7vw,70px)/1.04 Georgia,serif}.storyLocked>div>p:not(.storyEyebrow){color:#938c82;line-height:1.7}.storyLocked a{display:block;margin-top:18px;color:#c1a573;text-decoration:none;font:10px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
  @media(max-width:620px){.storyTopbar{padding:14px 16px}.storyTopbar a{font-size:9px}.storyArticle{width:min(100% - 30px,720px);padding:52px 0 70px}.storyHeader{margin-bottom:42px;padding-bottom:30px}.storyHeader h1{font-size:clamp(38px,12vw,54px)}.storyBody{font-size:17.5px;line-height:1.72}.storyBody p{margin-bottom:1.16em}.storyNav{grid-template-columns:1fr;margin-top:52px}.storyNav a,.storyNav a:last-child{text-align:left;padding:8px 0;min-height:40px;display:flex;align-items:center}.storyNav span{display:none}}
`;
