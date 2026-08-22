import type { AnomalyTransientState } from "./store.ts";

export const MAKOSH_SEQUENCE = ["Макошь", "Велес", "Сварог", "Лада"] as const;
export const SHISHIGA_VISIBLE_MS = 20_000;
export const MEZHA_COOLDOWN_MS = 30 * 60_000;

export function getMezhaManifestChance(activeVisibleMs: number): number {
  const elapsed = Math.max(0, activeVisibleMs);
  const interpolate = (from: number, to: number, start: number, end: number) => (
    from + (to - from) * Math.min(1, Math.max(0, (elapsed - start) / (end - start)))
  );
  if (elapsed < 60_000) return 0;
  if (elapsed < 90_000) return interpolate(0.002, 0.008, 60_000, 90_000);
  if (elapsed < 180_000) return interpolate(0.015, 0.11, 90_000, 180_000);
  if (elapsed < 420_000) return interpolate(0.11, 0.32, 180_000, 420_000);
  if (elapsed < 600_000) return interpolate(0.32, 0.55, 420_000, 600_000);
  return 0.62;
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
