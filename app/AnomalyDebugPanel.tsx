"use client";

import { useEffect, useState } from "react";
import { MEZHA_FORCE_EVENT } from "../lib/anomalies/events";
import { SIGN_COUNT, SIGN_REGISTRY, type SignId } from "../lib/anomalies/registry";
import {
  debugResetAll, EMPTY_ANOMALY_STATE, readAnomalyState, setMemoryChoice,
  subscribeAnomalyStore, unlockSign, updateTransientState, type AnomalyState,
} from "../lib/anomalies/store";
import styles from "./anomaly-debug.module.css";

export default function AnomalyDebugPanel() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<AnomalyState>(EMPTY_ANOMALY_STATE);
  useEffect(() => {
    const active = new URLSearchParams(window.location.search).get("anomaly-debug") === "1";
    setEnabled(active);
    if (!active) return;
    const sync = () => setState(readAnomalyState());
    sync();
    return subscribeAnomalyStore(sync);
  }, []);
  if (!enabled) return null;
  const unlock = (id: SignId) => unlockSign(id);
  const reset = () => {
    if (!window.confirm("Сбросить все знаки и временный прогресс версии 3?")) return;
    debugResetAll();
  };
  return (
    <aside className={`${styles.panel} ${open ? "" : styles.closed}`} aria-label="Отладка знаков Межи">
      <button className={styles.toggle} type="button" onClick={() => setOpen((value) => !value)}>
        Debug · {state.found.length}/{SIGN_COUNT}
      </button>
      {open && <div className={styles.body}>
        <div className={styles.shortcuts}>
          <button type="button" onClick={() => setMemoryChoice("memory")}>За Межой: память</button>
          <button type="button" onClick={() => updateTransientState((current) => ({ ...current, auk: { ...current.auk, openCount: 3, eligible: true, modalOpen: false } }))}>Аук eligible</button>
          <button type="button" onClick={() => updateTransientState((current) => ({ ...current, makosh: { stage: 3 } }))}>Макошь: до Лады</button>
          <button type="button" onClick={() => updateTransientState((current) => ({ ...current, shishiga: { ...current.shishiga, eligible: true, revealed: true, modalOpen: false } }))}>Следы Шишиги</button>
          <button type="button" onClick={() => window.dispatchEvent(new Event(MEZHA_FORCE_EVENT))}>Межа: проявить</button>
        </div>
        <ol>{SIGN_REGISTRY.map((sign) => {
          const found = state.found.includes(sign.id);
          return <li key={sign.id}><span>{found ? "✓" : sign.active ? "◇" : "—"} {sign.title}</span><button type="button" disabled={found || !sign.active} onClick={() => unlock(sign.id)}>{sign.active ? "Открыть" : "Неактивен"}</button></li>;
        })}</ol>
        <button className={styles.reset} type="button" onClick={reset}>Сбросить v3</button>
      </div>}
    </aside>
  );
}
