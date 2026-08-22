import { ANOMALY_STORE_EVENT, LEGACY_ANOMALY_FOUND_EVENT } from "./events.ts";
import { isActiveSignId, type SignId } from "./registry.ts";

export const ANOMALY_STORE_VERSION = 3 as const;
export const ANOMALY_STORE_KEY = "yav-anomalies-v3";
export const ANOMALY_TRANSIENT_KEY = "yav-anomalies-transient-v3";

export type MemoryChoice = "memory" | "life";
export type ThreeSongsProgress = { step: number; heard: Record<string, number> };

export type AnomalyState = {
  version: typeof ANOMALY_STORE_VERSION;
  found: SignId[];
  beyondUnlocked: boolean;
  choice: MemoryChoice | null;
  worldSeen: string[];
  progress: { threeSongs: ThreeSongsProgress };
  flags: { nightNavSceneSeen: boolean; navEncountered: boolean };
};

export type AnomalyTransientState = {
  version: typeof ANOMALY_STORE_VERSION;
  auk: { modalOpen: boolean; openCount: number; eligible: boolean; escapes: number };
  makosh: { stage: number };
  whiteEyes: { stage: number };
  shishiga: { modalOpen: boolean; visibleMs: number; eligible: boolean; revealed: boolean };
  mezha: { armed: boolean; manifested: boolean; cooldownUntil: number };
  borderAttempted: boolean;
};

export type UnlockResult = { unlocked: boolean; count: number; state: AnomalyState };

const EMPTY_THREE_SONGS: ThreeSongsProgress = { step: 0, heard: {} };

export const EMPTY_ANOMALY_STATE: AnomalyState = {
  version: ANOMALY_STORE_VERSION,
  found: [],
  beyondUnlocked: false,
  choice: null,
  worldSeen: [],
  progress: { threeSongs: EMPTY_THREE_SONGS },
  flags: { nightNavSceneSeen: false, navEncountered: false },
};

export const EMPTY_TRANSIENT_STATE: AnomalyTransientState = {
  version: ANOMALY_STORE_VERSION,
  auk: { modalOpen: false, openCount: 0, eligible: false, escapes: 0 },
  makosh: { stage: 0 },
  whiteEyes: { stage: 0 },
  shishiga: { modalOpen: false, visibleMs: 0, eligible: false, revealed: false },
  mezha: { armed: false, manifested: false, cooldownUntil: 0 },
  borderAttempted: false,
};

function parseObject(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  value.forEach((item) => {
    if (typeof item !== "string" || seen.has(item)) return;
    seen.add(item);
    result.push(item);
  });
  return result;
}

function sanitizeFound(value: unknown): SignId[] {
  return uniqueStrings(value).filter(isActiveSignId);
}

function clamp(value: unknown, minimum: number, maximum: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : minimum;
}

function sanitizeThreeSongs(value: unknown): ThreeSongsProgress {
  const parsed = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const heardValue = parsed.heard && typeof parsed.heard === "object"
    ? (parsed.heard as Record<string, unknown>)
    : {};
  const heard = Object.fromEntries(
    Object.entries(heardValue)
      .filter(([, seconds]) => Number.isFinite(Number(seconds)))
      .map(([id, seconds]) => [id, Math.max(0, Number(seconds))]),
  );
  return { step: clamp(parsed.step, 0, 3), heard };
}

export function sanitizeAnomalyState(value: unknown): AnomalyState {
  const parsed = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const progress = parsed.progress && typeof parsed.progress === "object"
    ? (parsed.progress as Record<string, unknown>)
    : {};
  const flags = parsed.flags && typeof parsed.flags === "object"
    ? (parsed.flags as Record<string, unknown>)
    : {};
  const choice = parsed.choice === "memory" || parsed.choice === "life" ? parsed.choice : null;

  return {
    version: ANOMALY_STORE_VERSION,
    found: sanitizeFound(parsed.found),
    beyondUnlocked: parsed.beyondUnlocked === true || choice !== null,
    choice,
    worldSeen: uniqueStrings(parsed.worldSeen),
    progress: { threeSongs: sanitizeThreeSongs(progress.threeSongs) },
    flags: {
      nightNavSceneSeen: flags.nightNavSceneSeen === true,
      navEncountered: flags.navEncountered === true,
    },
  };
}

export function sanitizeTransientState(value: unknown): AnomalyTransientState {
  const parsed = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const auk = parsed.auk && typeof parsed.auk === "object" ? (parsed.auk as Record<string, unknown>) : {};
  const makosh = parsed.makosh && typeof parsed.makosh === "object" ? (parsed.makosh as Record<string, unknown>) : {};
  const whiteEyes = parsed.whiteEyes && typeof parsed.whiteEyes === "object"
    ? (parsed.whiteEyes as Record<string, unknown>)
    : {};
  const shishiga = parsed.shishiga && typeof parsed.shishiga === "object"
    ? (parsed.shishiga as Record<string, unknown>)
    : {};
  const mezha = parsed.mezha && typeof parsed.mezha === "object"
    ? (parsed.mezha as Record<string, unknown>)
    : {};
  const openCount = clamp(auk.openCount, 0, 3);

  return {
    version: ANOMALY_STORE_VERSION,
    auk: {
      modalOpen: auk.modalOpen === true,
      openCount,
      eligible: auk.eligible === true || openCount >= 3,
      escapes: clamp(auk.escapes, 0, 3),
    },
    makosh: { stage: clamp(makosh.stage, 0, 4) },
    whiteEyes: { stage: clamp(whiteEyes.stage, 0, 2) },
    shishiga: {
      modalOpen: shishiga.modalOpen === true,
      visibleMs: Math.max(0, Number(shishiga.visibleMs) || 0),
      eligible: shishiga.eligible === true,
      revealed: shishiga.revealed === true,
    },
    mezha: {
      armed: mezha.armed === true,
      manifested: mezha.manifested === true,
      cooldownUntil: Math.max(0, Number(mezha.cooldownUntil) || 0),
    },
    borderAttempted: parsed.borderAttempted === true,
  };
}

function browserStorage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

function browserSessionStorage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.sessionStorage; } catch { return null; }
}

function persistState(state: AnomalyState): void {
  const storage = browserStorage();
  if (!storage) return;
  try { storage.setItem(ANOMALY_STORE_KEY, JSON.stringify(state)); } catch {}
}

function persistTransientState(state: AnomalyTransientState): void {
  const storage = browserSessionStorage();
  if (!storage) return;
  try { storage.setItem(ANOMALY_TRANSIENT_KEY, JSON.stringify(state)); } catch {}
}

function emitStoreChange(id?: SignId, unlocked?: true): void {
  if (typeof window === "undefined") return;
  const state = readAnomalyState();
  window.dispatchEvent(new CustomEvent(ANOMALY_STORE_EVENT, { detail: { id, state, unlocked } }));
  if (id) {
    window.dispatchEvent(new CustomEvent(LEGACY_ANOMALY_FOUND_EVENT, {
      detail: { id, count: state.found.length },
    }));
  }
}

export function readAnomalyState(): AnomalyState {
  const storage = browserStorage();
  if (!storage) return { ...EMPTY_ANOMALY_STATE, progress: { threeSongs: { ...EMPTY_THREE_SONGS } } };
  const current = storage.getItem(ANOMALY_STORE_KEY);
  const state = current ? sanitizeAnomalyState(parseObject(current)) : sanitizeAnomalyState(EMPTY_ANOMALY_STATE);
  if (!current) persistState(state);
  return state;
}

export function readTransientState(): AnomalyTransientState {
  const session = browserSessionStorage();
  if (!session) return sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  const current = session.getItem(ANOMALY_TRANSIENT_KEY);
  const state = current ? sanitizeTransientState(parseObject(current)) : sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  if (!current) persistTransientState(state);
  return state;
}

export function hasSign(id: SignId): boolean {
  return readAnomalyState().found.includes(id);
}

export function unlockSign(id: SignId): UnlockResult {
  const result = unlockSignInState(readAnomalyState(), id);
  if (!result.unlocked) return result;
  persistState(result.state);
  emitStoreChange(id, true);
  return result;
}

export function unlockSignInState(state: AnomalyState, id: SignId): UnlockResult {
  if (!isActiveSignId(id)) return { unlocked: false, count: state.found.length, state };
  if (state.found.includes(id)) return { unlocked: false, count: state.found.length, state };
  const next = { ...state, found: [...state.found, id] };
  return { unlocked: true, count: next.found.length, state: next };
}

export function setMemoryChoice(choice: MemoryChoice): AnomalyState {
  const state = readAnomalyState();
  const next = { ...state, choice, beyondUnlocked: true };
  persistState(next);
  emitStoreChange();
  return next;
}

export function setWorldSeen(worldSeen: string[]): AnomalyState {
  const state = readAnomalyState();
  const next = { ...state, worldSeen: uniqueStrings(worldSeen) };
  persistState(next);
  emitStoreChange();
  return next;
}

export function setThreeSongsProgress(progress: ThreeSongsProgress): AnomalyState {
  const state = readAnomalyState();
  const next = { ...state, progress: { ...state.progress, threeSongs: sanitizeThreeSongs(progress) } };
  persistState(next);
  emitStoreChange();
  return next;
}

export function setAnomalyFlag(flag: keyof AnomalyState["flags"], value = true): AnomalyState {
  const state = readAnomalyState();
  if (state.flags[flag] === value) return state;
  const next = { ...state, flags: { ...state.flags, [flag]: value } };
  persistState(next);
  emitStoreChange();
  return next;
}

export function updateTransientState(update: (state: AnomalyTransientState) => AnomalyTransientState): AnomalyTransientState {
  const next = sanitizeTransientState(update(readTransientState()));
  persistTransientState(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ANOMALY_STORE_EVENT, { detail: { transient: next } }));
  }
  return next;
}

export function subscribeAnomalyStore(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANOMALY_STORE_KEY || event.key === ANOMALY_TRANSIENT_KEY) listener();
  };
  window.addEventListener(ANOMALY_STORE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ANOMALY_STORE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function debugResetTransient(): AnomalyTransientState {
  const next = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  persistTransientState(next);
  if (typeof window !== "undefined") emitStoreChange();
  return next;
}

export function debugResetAll(): void {
  persistState(sanitizeAnomalyState(EMPTY_ANOMALY_STATE));
  persistTransientState(sanitizeTransientState(EMPTY_TRANSIENT_STATE));
  emitStoreChange();
}
