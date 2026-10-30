"use client";

import { useEffect, useState } from "react";
import { SIGN_COUNT } from "../lib/anomalies/registry";
import { readAnomalyState, subscribeAnomalyStore } from "../lib/anomalies/store";

const REGISTERED_KEY = "yav-mezha-completion-registered-v1";
const COUNTER_CACHE_KEY = "yav-mezha-completion-count-v1";
const PENDING_TTL_MS = 60_000;

type CounterResponse = {
  count: number;
  available: boolean;
};

type Props = {
  variant?: "home" | "beyond";
};

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function readCachedCount(): number | null {
  const raw = safeGet(COUNTER_CACHE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function shouldRegisterCompletion(): boolean {
  const state = readAnomalyState();
  if (state.found.length !== SIGN_COUNT) return false;

  const marker = safeGet(REGISTERED_KEY);
  if (marker === "1") return false;
  if (!marker?.startsWith("pending:")) return true;

  const startedAt = Number(marker.slice("pending:".length));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt > PENDING_TTL_MS) {
    safeRemove(REGISTERED_KEY);
    return true;
  }

  return false;
}

export default function MezhaCompletionCounter({ variant = "home" }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let alive = true;
    let inFlight = false;

    const sync = async () => {
      if (inFlight) return;
      inFlight = true;

      const register = shouldRegisterCompletion();
      const pendingMarker = register ? `pending:${Date.now()}` : null;
      if (pendingMarker) safeSet(REGISTERED_KEY, pendingMarker);

      try {
        const response = await fetch("/api/mezha-completions", {
          method: register ? "POST" : "GET",
          headers: register ? { "Content-Type": "application/json" } : undefined,
          body: register ? JSON.stringify({ completed: true }) : undefined,
          cache: "no-store",
        });

        const data = await response.json() as CounterResponse;
        if (!alive) return;

        if (response.ok && data.available && Number.isInteger(data.count) && data.count >= 0) {
          setCount(data.count);
          setAvailable(true);
          safeSet(COUNTER_CACHE_KEY, String(data.count));
          if (register) safeSet(REGISTERED_KEY, "1");
          return;
        }

        const cached = readCachedCount();
        setCount(cached);
        setAvailable(false);
        if (register && safeGet(REGISTERED_KEY) === pendingMarker) safeRemove(REGISTERED_KEY);
      } catch {
        if (!alive) return;
        const cached = readCachedCount();
        setCount(cached);
        setAvailable(false);
        if (register && safeGet(REGISTERED_KEY) === pendingMarker) safeRemove(REGISTERED_KEY);
      } finally {
        inFlight = false;
      }
    };

    void sync();
    const unsubscribe = subscribeAnomalyStore(() => void sync());
    const onStorage = (event: StorageEvent) => {
      if (event.key === REGISTERED_KEY) void sync();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const displayCount = count === null ? "—" : String(count);
  const note = !available && count === null
    ? "Счёт Межи временно молчит."
    : count === 0
      ? "Первый, кто найдёт все тринадцать знаков, откроет этот счёт."
      : "Столько путников уже нашли все тринадцать знаков.";

  return (
    <aside
      className={`mezhaCompletionCounter mezhaCompletionCounter--${variant}`}
      aria-label={count === null ? "Счётчик прошедших Межу" : `Межу перешли: ${count}`}
      aria-live="polite"
    >
      <span className="mezhaCompletionCounter__kicker">Следы путников</span>
      <p className="mezhaCompletionCounter__value">
        Межу перешли: <strong>{displayCount}</strong>
      </p>
      <p className="mezhaCompletionCounter__note">{note}</p>
      <style>{styles}</style>
    </aside>
  );
}

const styles = `
  .mezhaCompletionCounter{
    position:relative;
    overflow:hidden;
    border:1px solid rgba(185,147,90,.28);
    background:
      radial-gradient(circle at 50% 0%,rgba(185,147,90,.1),transparent 58%),
      linear-gradient(145deg,rgba(17,22,18,.76),rgba(8,11,9,.9));
    box-shadow:inset 0 0 38px rgba(185,147,90,.025);
    color:#d8cdbd;
    text-align:center;
  }
  .mezhaCompletionCounter:before,
  .mezhaCompletionCounter:after{
    content:"◇";
    position:absolute;
    top:50%;
    color:rgba(199,169,116,.22);
    font:18px/1 Georgia,serif;
    transform:translateY(-50%);
  }
  .mezhaCompletionCounter:before{left:18px}
  .mezhaCompletionCounter:after{right:18px}
  .mezhaCompletionCounter--home{margin:26px 0 22px;padding:21px 54px 20px}
  .mezhaCompletionCounter--beyond{max-width:780px;margin:30px auto 0;padding:24px 58px 23px}
  .mezhaCompletionCounter__kicker{
    display:block;
    margin:0 0 7px;
    color:#a88755;
    font:9px/1.2 Arial,sans-serif;
    letter-spacing:.18em;
    text-transform:uppercase;
  }
  .mezhaCompletionCounter__value{
    margin:0!important;
    color:#d8cdbd!important;
    font:400 clamp(20px,2.5vw,28px)/1.2 Georgia,serif!important;
  }
  .mezhaCompletionCounter__value strong{
    color:#eed49f;
    font-size:1.18em;
    font-weight:400;
    text-shadow:0 0 18px rgba(234,208,154,.28);
  }
  .mezhaCompletionCounter__note{
    margin:8px auto 0!important;
    max-width:560px;
    color:#8f887d!important;
    font:italic 13px/1.55 Georgia,serif!important;
  }
  @media(max-width:620px){
    .mezhaCompletionCounter--home{margin:22px 0 18px;padding:19px 36px 18px}
    .mezhaCompletionCounter--beyond{margin:24px 14px 0;padding:21px 38px 20px}
    .mezhaCompletionCounter:before{left:12px}
    .mezhaCompletionCounter:after{right:12px}
    .mezhaCompletionCounter__note{font-size:12px!important}
  }
`;
