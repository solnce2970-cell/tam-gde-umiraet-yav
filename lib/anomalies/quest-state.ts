import type { AnomalyTransientState, ThreeSongsProgress } from "./store.ts";

export const MAKOSH_SEQUENCE = ["Макошь", "Велес", "Сварог", "Лада"] as const;
export const SHISHIGA_VISIBLE_MS = 10_000;
export const MEZHA_COOLDOWN_MS = 30 * 60_000;
export const MEZHA_GUARANTEED_VISIBLE_MS = 60_000;
export const THREE_SONGS_SEQUENCE = ["ogneyara", "auk", "dushnitsa"] as const;

export function addThreeSongsListening(
  progress: ThreeSongsProgress,
  trackId: string,
  listenedSeconds: number,
  requiredSeconds: number,
): { progress: ThreeSongsProgress; completed: boolean; advanced: boolean } {
  const expectedTrack = THREE_SONGS_SEQUENCE[progress.step];
  if (
    !expectedTrack ||
    trackId !== expectedTrack ||
    !Number.isFinite(listenedSeconds) ||
    !Number.isFinite(requiredSeconds) ||
    listenedSeconds <= 0 ||
    requiredSeconds <= 0
  ) {
    return { progress, completed: false, advanced: false };
  }

  const heard = Math.max(0, Number(progress.heard[trackId]) || 0) + listenedSeconds;
  if (heard < requiredSeconds) {
    return {
      progress: { ...progress, heard: { ...progress.heard, [trackId]: heard } },
      completed: false,
      advanced: false,
    };
  }

  const step = progress.step + 1;
  return {
    progress: { step, heard: {} },
    completed: step >= THREE_SONGS_SEQUENCE.length,
    advanced: true,
  };
}

export function isMezhaManifestDue(activeVisibleMs: number): boolean {
  return activeVisibleMs >= MEZHA_GUARANTEED_VISIBLE_MS;
}

export function recordAukTransition(
  state: AnomalyTransientState,
  transition: "closed-to-open" | "open-to-closed",
): AnomalyTransientState {
  if (transition === "closed-to-open") {
    if (state.auk.modalOpen) return state;
    const openCount = Math.min(3, state.auk.openCount + 1);
    return {
      ...state,
      auk: { ...state.auk, modalOpen: true, openCount, eligible: state.auk.eligible || openCount >= 3 },
    };
  }
  if (!state.auk.modalOpen) return state;
  return { ...state, auk: { ...state.auk, modalOpen: false } };
}

export function recordMakoshVisit(
  state: AnomalyTransientState,
  name: string,
): { state: AnomalyTransientState; completed: boolean } {
  const expected = MAKOSH_SEQUENCE[state.makosh.stage];
  let stage = 0;
  if (name === expected) stage = Math.min(4, state.makosh.stage + 1);
  else if (name === MAKOSH_SEQUENCE[0]) stage = 1;
  const completed = stage === MAKOSH_SEQUENCE.length;
  return { completed, state: { ...state, makosh: { stage: completed ? 0 : stage } } };
}

export function beginShishigaEncounter(state: AnomalyTransientState): AnomalyTransientState {
  return { ...state, shishiga: { modalOpen: true, visibleMs: 0, eligible: false, revealed: false } };
}

export function addVisibleShishigaTime(
  state: AnomalyTransientState,
  milliseconds: number,
): AnomalyTransientState {
  if (!state.shishiga.modalOpen || milliseconds <= 0) return state;
  const visibleMs = Math.min(SHISHIGA_VISIBLE_MS, state.shishiga.visibleMs + milliseconds);
  return { ...state, shishiga: { ...state.shishiga, visibleMs, eligible: visibleMs >= SHISHIGA_VISIBLE_MS } };
}

export function closeShishigaEncounter(state: AnomalyTransientState): AnomalyTransientState {
  const revealed = state.shishiga.eligible;
  return {
    ...state,
    shishiga: {
      ...state.shishiga,
      modalOpen: false,
      visibleMs: revealed ? state.shishiga.visibleMs : 0,
      eligible: revealed,
      revealed,
    },
  };
}

export function armMezha(state: AnomalyTransientState): AnomalyTransientState {
  if (state.mezha.armed) return state;
  return { ...state, mezha: { ...state.mezha, armed: true } };
}

export function canManifestMezha(state: AnomalyTransientState, now: number): boolean {
  return state.mezha.armed && state.mezha.cooldownUntil <= now;
}

export function recordMezhaManifestation(
  state: AnomalyTransientState,
  now: number,
): AnomalyTransientState {
  if (!canManifestMezha(state, now)) return state;
  return {
    ...state,
    mezha: { ...state.mezha, manifested: true, cooldownUntil: now + MEZHA_COOLDOWN_MS },
  };
}
