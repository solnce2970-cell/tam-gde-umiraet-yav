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
  assert.match(reveal, /isActiveSignId/);
});

test("inactive White Eyes is not mounted", () => {
  const mountedSources = sources
    .filter((path) => !path.endsWith("app/WhiteEyesSign.tsx"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(mountedSources, /<WhiteEyesSign\b/);
});
