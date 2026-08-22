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

test("all thirteen agreed signs are active", () => {
  let state = sanitizeAnomalyState(EMPTY_ANOMALY_STATE);
  for (const id of ACTIVE_SIGN_IDS.filter((id) => id !== "return-to-beginning")) {
    state = unlockSignInState(state, id).state;
  }
  state = unlockSignInState(state, "return-to-beginning").state;
  assert.deepEqual(state.found, ACTIVE_SIGN_IDS);
  assert.equal(ACTIVE_SIGN_IDS.length, 13);
  assert.equal(INACTIVE_SIGN_IDS.length, 0);
});

test("the final sign is impossible before twelve and remains idempotent at thirteen", () => {
  let state = sanitizeAnomalyState(EMPTY_ANOMALY_STATE);
  assert.equal(unlockSignInState(state, "return-to-beginning").unlocked, false);
  for (const id of ACTIVE_SIGN_IDS.filter((id) => id !== "return-to-beginning")) {
    state = unlockSignInState(state, id).state;
  }
  const final = unlockSignInState(state, "return-to-beginning");
  assert.equal(final.unlocked, true);
  assert.equal(final.count, 13);
  assert.equal(unlockSignInState(final.state, "return-to-beginning").unlocked, false);
});

test("stale inactive lada-third data never awards Third Track", () => {
  const state = sanitizeAnomalyState({ found: ["lada-third", "auk-echo"] });
  assert.deepEqual(state.found, ["auk-echo"]);
});

test("sanitization accepts the final sign only as the thirteenth discovery", () => {
  const twelve = ACTIVE_SIGN_IDS.filter((id) => id !== "return-to-beginning");
  const valid = sanitizeAnomalyState({ found: [...twelve, "return-to-beginning"] });
  assert.equal(valid.found.length, 13);
  const invalid = sanitizeAnomalyState({ found: ["return-to-beginning", ...twelve] });
  assert.deepEqual(invalid.found, twelve);
});
