import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_SIGN_IDS, INACTIVE_SIGN_IDS, SIGN_IDS } from "./registry.ts";
import {
  addVisibleShishigaTime,
  addThreeSongsListening,
  armMezha,
  beginShishigaEncounter,
  canManifestMezha,
  canManifestSemarglSpark,
  canUnlockReturn,
  closeShishigaEncounter,
  isMezhaManifestDue,
  MEZHA_COOLDOWN_MS,
  recordAukTransition,
  recordMakoshVisit,
  recordMezhaManifestation,
  recordSilentPathSection,
  recordSvarogSeen,
  recordVladimirScroll,
  recordVladimirSeen,
  resetSilentPath,
  SHISHIGA_VISIBLE_MS,
  SILENT_PATH_SEQUENCE,
  startSilentPath,
} from "./quest-state.ts";
import { EMPTY_TRANSIENT_STATE, sanitizeTransientState } from "./store.ts";

test("registry contains the single ordered set of 13 signs", () => {
  assert.equal(SIGN_IDS.length, 13);
  assert.equal(new Set(SIGN_IDS).size, 13);
  assert.equal(ACTIVE_SIGN_IDS.length, 13);
  assert.deepEqual(INACTIVE_SIGN_IDS, []);
  assert.deepEqual(SIGN_IDS.slice(3, 8), ["auk-echo", "makosh-thread", "vladimir-third-track", "three-worlds", "shishiga-track"]);
});

test("Auk counts only real closed to open transitions and becomes eligible on the third", () => {
  let state = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  state = recordAukTransition(state, "closed-to-open");
  state = recordAukTransition(state, "closed-to-open");
  assert.equal(state.auk.openCount, 1);
  state = recordAukTransition(state, "open-to-closed");
  state = recordAukTransition(state, "open-to-closed");
  state = recordAukTransition(state, "closed-to-open");
  state = recordAukTransition(state, "open-to-closed");
  state = recordAukTransition(state, "closed-to-open");
  assert.equal(state.auk.openCount, 3);
  assert.equal(state.auk.eligible, true);
});

test("Makosh requires the exact transient sequence and restarts cleanly", () => {
  let state = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  for (const name of ["Макошь", "Велес", "Лада"]) state = recordMakoshVisit(state, name).state;
  assert.equal(state.makosh.stage, 0);
  let completed = false;
  for (const name of ["Макошь", "Велес", "Сварог", "Лада"]) {
    const result = recordMakoshVisit(state, name);
    state = result.state;
    completed = result.completed;
  }
  assert.equal(completed, true);
  assert.equal(state.makosh.stage, 0);
});

test("Shishiga reveals only after 10 seconds of explicitly accumulated visible time", () => {
  let state = beginShishigaEncounter(sanitizeTransientState(EMPTY_TRANSIENT_STATE));
  state = addVisibleShishigaTime(state, SHISHIGA_VISIBLE_MS - 1);
  assert.equal(closeShishigaEncounter(state).shishiga.revealed, false);
  state = beginShishigaEncounter(state);
  state = addVisibleShishigaTime(state, SHISHIGA_VISIBLE_MS);
  const closed = closeShishigaEncounter(state);
  assert.equal(closed.shishiga.eligible, true);
  assert.equal(closed.shishiga.revealed, true);
});

test("Mezha only arms explicitly, never changes signs, and respects its cooldown", () => {
  const initial = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  assert.equal(canManifestMezha(initial, 1_000), false);
  const armed = armMezha(initial);
  assert.equal(canManifestMezha(armed, 1_000), true);
  const manifested = recordMezhaManifestation(armed, 1_000);
  assert.equal(manifested.mezha.manifested, true);
  assert.equal(manifested.mezha.cooldownUntil, 1_000 + MEZHA_COOLDOWN_MS);
  assert.equal(canManifestMezha(manifested, manifested.mezha.cooldownUntil - 1), false);
  assert.equal(canManifestMezha(manifested, manifested.mezha.cooldownUntil), true);
  assert.equal(isMezhaManifestDue(59_999), false);
  assert.equal(isMezhaManifestDue(60_000), true);
});

test("Three songs advance only in the Ogneyara, Auk, Dushnitsa order", () => {
  let progress = { step: 0, heard: {} };

  const wrongFirst = addThreeSongsListening(progress, "auk", 10, 5);
  assert.strictEqual(wrongFirst.progress, progress);
  assert.equal(wrongFirst.completed, false);

  const partial = addThreeSongsListening(progress, "ogneyara", 2, 5);
  progress = partial.progress;
  assert.deepEqual(progress, { step: 0, heard: { ogneyara: 2 } });

  const first = addThreeSongsListening(progress, "ogneyara", 3, 5);
  progress = first.progress;
  assert.equal(first.advanced, true);
  assert.equal(progress.step, 1);

  const second = addThreeSongsListening(progress, "auk", 5, 5);
  progress = second.progress;
  assert.equal(progress.step, 2);

  const third = addThreeSongsListening(progress, "dushnitsa", 5, 5);
  assert.equal(third.completed, true);
  assert.deepEqual(third.progress, { step: 3, heard: {} });
});

test("Third Track requires Vladimir visibility and later scrolling", () => {
  let state = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  state = recordVladimirScroll(state, 1_000, 200);
  assert.equal(state.vladimir.eligible, false);
  state = recordVladimirSeen(state, 1_000);
  state = recordVladimirScroll(state, 1_199, 200);
  assert.equal(state.vladimir.eligible, false);
  state = recordVladimirScroll(state, 1_200, 200);
  assert.equal(state.vladimir.eligible, true);
});

test("Father's Spark requires Svarog to have been seen", () => {
  let state = sanitizeTransientState(EMPTY_TRANSIENT_STATE);
  assert.equal(canManifestSemarglSpark(state), false);
  state = recordSvarogSeen(state);
  assert.equal(canManifestSemarglSpark(state), true);
});

test("Silent Path advances by real sections and resets on intervention", () => {
  let state = startSilentPath(sanitizeTransientState(EMPTY_TRANSIENT_STATE));
  state = recordSilentPathSection(state, "navnik");
  assert.equal(state.silentPath.stage, 0);
  for (const section of SILENT_PATH_SEQUENCE) state = recordSilentPathSection(state, section);
  assert.equal(state.silentPath.manifested, true);
  state = resetSilentPath(state);
  assert.deepEqual(state.silentPath, { started: false, stage: 0, manifested: false });
});

test("Return is eligible only at exactly twelve discoveries", () => {
  assert.equal(canUnlockReturn(0), false);
  assert.equal(canUnlockReturn(11), false);
  assert.equal(canUnlockReturn(12), true);
  assert.equal(canUnlockReturn(13), false);
});
