import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_SIGN_IDS, INACTIVE_SIGN_IDS } from "./registry.ts";
import { EMPTY_ANOMALY_STATE, sanitizeAnomalyState, unlockSignInState } from "./store.ts";

test("unlockSignInState is idempotent and append-only", () => {
  const initial = sanitizeAnomalyState(EMPTY_ANOMALY_STATE);
  const first = unlockSignInState(initial, "auk-echo");
  assert.equal(first.unlocked, true);
  assert.deepEqual(first.state.found, ["auk-echo"]);
  const duplicate = unlockSignInState(first.state, "auk-echo");
  assert.equal(duplicate.unlocked, false);
  assert.strictEqual(duplicate.state, first.state);
  const second = unlockSignInState(duplicate.state, "makosh-thread");
  assert.deepEqual(second.state.found, ["auk-echo", "makosh-thread"]);
});

test("sanitization preserves valid discovery order without duplicates", () => {
  const state = sanitizeAnomalyState({ found: ["makosh-thread", "auk-echo", "makosh-thread", "unknown"] });
  assert.deepEqual(state.found, ["makosh-thread", "auk-echo"]);
});

test("only the agreed eight signs can be unlocked", () => {
  let state = sanitizeAnomalyState(EMPTY_ANOMALY_STATE);
  for (const id of [...ACTIVE_SIGN_IDS, ...INACTIVE_SIGN_IDS]) state = unlockSignInState(state, id).state;
  for (const id of ACTIVE_SIGN_IDS) state = unlockSignInState(state, id).state;
  assert.deepEqual(state.found, ACTIVE_SIGN_IDS);
  assert.equal(ACTIVE_SIGN_IDS.length, 8);
  assert.equal(INACTIVE_SIGN_IDS.length, 5);
});
