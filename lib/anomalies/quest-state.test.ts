import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_SIGN_IDS, INACTIVE_SIGN_IDS, SIGN_IDS } from "./registry.ts";
import {
  addVisibleShishigaTime,
  beginShishigaEncounter,
  closeShishigaEncounter,
  recordAukTransition,
  recordMakoshVisit,
  SHISHIGA_VISIBLE_MS,
} from "./quest-state.ts";
import { EMPTY_TRANSIENT_STATE, sanitizeTransientState } from "./store.ts";

test("registry contains the single ordered set of 13 signs", () => {
  assert.equal(SIGN_IDS.length, 13);
  assert.equal(new Set(SIGN_IDS).size, 13);
  assert.equal(ACTIVE_SIGN_IDS.length, 8);
  assert.deepEqual(INACTIVE_SIGN_IDS, ["lada-third", "semargl-svarog", "neveyana-morok", "silent-path", "return-to-beginning"]);
  assert.deepEqual(SIGN_IDS.slice(3, 8), ["auk-echo", "makosh-thread", "lada-third", "three-worlds", "shishiga-track"]);
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

test("Shishiga reveals only after 20 seconds of explicitly accumulated visible time", () => {
  let state = beginShishigaEncounter(sanitizeTransientState(EMPTY_TRANSIENT_STATE));
  state = addVisibleShishigaTime(state, SHISHIGA_VISIBLE_MS - 1);
  assert.equal(closeShishigaEncounter(state).shishiga.revealed, false);
  state = beginShishigaEncounter(state);
  state = addVisibleShishigaTime(state, SHISHIGA_VISIBLE_MS);
  const closed = closeShishigaEncounter(state);
  assert.equal(closed.shishiga.eligible, true);
  assert.equal(closed.shishiga.revealed, true);
});
