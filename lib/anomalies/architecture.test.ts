import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = process.cwd();
const sourceRoots = [join(root, "app"), join(root, "lib")];

function filesAt(path: string): string[] {
  return readdirSync(path).flatMap((name) => {
    const full = join(path, name);
    if (statSync(full).isDirectory()) return filesAt(full);
    return /\.(ts|tsx|js|jsx)$/.test(name) ? [full] : [];
  });
}

const sources = sourceRoots.flatMap(filesAt).filter((path) => !path.endsWith(".test.ts"));

test("only the versioned store accesses anomaly storage keys", () => {
  const offenders = sources.filter((path) => {
    if (path.endsWith("lib/anomalies/store.ts")) return false;
    const source = readFileSync(path, "utf8");
    return /yav-anomalies|yav-larets-predaniy/.test(source);
  });
  assert.deepEqual(offenders.map((path) => relative(root, path)), []);
});

test("found is appended only inside unlockSignInState", () => {
  const offenders = sources.filter((path) => {
    const source = readFileSync(path, "utf8");
    if (path.endsWith("lib/anomalies/store.ts")) {
      const appendMatches = source.match(/found:\s*\[\.\.\.state\.found,\s*id\]/g) ?? [];
      return appendMatches.length !== 1;
    }
    return /found\.push|found\.splice|found\s*:\s*\[\.\.\.|\.found\s*=/.test(source);
  });
  assert.deepEqual(offenders.map((path) => relative(root, path)), []);
});

test("archive routes contain no unlock calls", () => {
  for (const page of ["app/za-mezhoy/page.tsx", "app/larets-predaniy/page.tsx"]) {
    assert.doesNotMatch(readFileSync(join(root, page), "utf8"), /unlockSign\s*\(/);
  }
});

test("the root layout owns one centralized successful-unlock reveal", () => {
  const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
  assert.equal((layout.match(/<SignFoundReveal\s*\/>/g) ?? []).length, 1);
  const reveal = readFileSync(join(root, "app/SignFoundReveal.tsx"), "utf8");
  assert.match(reveal, /ANOMALY_STORE_EVENT/);
  assert.match(reveal, /SIGN_REVEAL_REQUEST_EVENT/);
  assert.match(reveal, /isActiveSignId/);
  assert.match(reveal, /detail\?\.unlocked !== true/);
});

test("active White Eyes is mounted exactly once and uses the central unlock", () => {
  const clientLayer = readFileSync(join(root, "app/ClientLayer.ts"), "utf8");
  assert.equal((clientLayer.match(/createElement\(WhiteEyesSign\)/g) ?? []).length, 1);
  const whiteEyes = readFileSync(join(root, "app/WhiteEyesSign.tsx"), "utf8");
  assert.match(whiteEyes, /unlockSign\("neveyana-morok"\)/);
  assert.match(whiteEyes, /image\.style\.opacity = "1";[\s\S]*markFound\(\)[\s\S]*FIRST_WHITE_EYES_NOTICE_MS/);
});

test("all four final mechanics are centrally mounted and unlock through the store", () => {
  const clientLayer = readFileSync(join(root, "app/ClientLayer.ts"), "utf8");
  for (const component of [
    "VladimirThirdTrackOverlay",
    "SemarglSvarogSpark",
    "SilentPathAnomaly",
    "ReturnToBeginningCrack",
  ]) {
    assert.equal((clientLayer.match(new RegExp(`createElement\\(${component}\\)`, "g")) ?? []).length, 1);
  }
  const expectations = [
    ["app/VladimirThirdTrackOverlay.tsx", "vladimir-third-track"],
    ["app/SemarglSvarogSpark.tsx", "semargl-svarog"],
    ["app/SilentPathAnomaly.tsx", "silent-path"],
    ["app/ReturnToBeginningCrack.tsx", "return-to-beginning"],
  ] as const;
  for (const [path, id] of expectations) {
    assert.match(readFileSync(join(root, path), "utf8"), new RegExp(`unlockSign\\(\"${id}\"\\)`));
  }
});

test("the retired Lada mechanic is absent and the replacement uses viewport eligibility", () => {
  assert.doesNotMatch(readFileSync(join(root, "lib/anomalies/registry.ts"), "utf8"), /lada-third|Между двумя ликами/);
  const page = readFileSync(join(root, "app/page.tsx"), "utf8");
  assert.match(page, /data-anomaly-character=.*vladimir/);
  const thirdTrack = readFileSync(join(root, "app/VladimirThirdTrackOverlay.tsx"), "utf8");
  assert.match(thirdTrack, /IntersectionObserver/);
  assert.match(thirdTrack, /recordVladimirScroll/);
});

test("the final sign owns its dedicated reveal and the shared reveal excludes it", () => {
  const final = readFileSync(join(root, "app/ReturnToBeginningCrack.tsx"), "utf8");
  assert.match(final, /Знаки Межи собраны/);
  assert.match(final, /window\.location\.assign\("\/za-mezhoy"\)/);
  const shared = readFileSync(join(root, "app/SignFoundReveal.tsx"), "utf8");
  assert.match(shared, /id === "return-to-beginning"/);
});

test("the final secret container is rendered only at thirteen without placeholder copy", () => {
  const page = readFileSync(join(root, "app/za-mezhoy/page.tsx"), "utf8");
  assert.match(page, /count === SIGN_COUNT && <FinalSecretText/);
  assert.doesNotMatch(page, /Здесь появится|скоро|placeholder|lorem/i);
  const secret = readFileSync(join(root, "app/FinalSecretText.tsx"), "utf8");
  assert.match(secret, /data-final-secret-text="available"/);
});

test("Three Songs requests the shared reveal only after a successful unlock", () => {
  const music = readFileSync(join(root, "app/MusicPlayerPortal.tsx"), "utf8");
  assert.match(music, /const result = unlockSign\("three-worlds"\)/);
  assert.match(music, /if \(!result\.unlocked\) return;[\s\S]*SIGN_REVEAL_REQUEST_EVENT/);
});

test("Broken Border visibly manifests before its central unlock", () => {
  const polish = readFileSync(join(root, "app/SitePolish.tsx"), "utf8");
  assert.match(
    polish,
    /heading\.textContent = "А если межа уже нарушена\?";[\s\S]*unlockSign\("broken-border"\)/,
  );
  assert.match(polish, /unlockSign\("broken-border"\);[\s\S]*}, 700\);/);
  assert.match(polish, /heading\.textContent = original;[\s\S]*}, 3600\);/);
  assert.doesNotMatch(polish, /heading\.addEventListener\("click"/);
});

test("every standalone page exposes the reusable ReturnToWorld link", () => {
  for (const page of [
    "app/za-mezhoy/page.tsx",
    "app/larets-predaniy/page.tsx",
    "app/genealogy/page.tsx",
  ]) {
    const source = readFileSync(join(root, page), "utf8");
    assert.match(source, /import ReturnToWorld/);
    assert.match(source, /<ReturnToWorld\b/);
  }
  const component = readFileSync(join(root, "app/ReturnToWorld.tsx"), "utf8");
  assert.match(component, /href="\/#world"/);
  assert.match(component, />\s*Вернуться в мир\s*</);
});
