import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = process.cwd();
const appRoot = join(root, "app");

function filesAt(path: string): string[] {
  return readdirSync(path).flatMap((name) => {
    const full = join(path, name);
    if (statSync(full).isDirectory()) return filesAt(full);
    return /\.(css|ts|tsx)$/.test(name) ? [full] : [];
  });
}

const sources = filesAt(appRoot);

test("every literal public asset reference resolves to a real file", () => {
  const missing = new Set<string>();
  const assetPattern = /["'`](\/(?:assets\/v1\/)?(?:fonts|images|music|sfx)\/[^"'`]+)["'`]/g;

  for (const path of sources) {
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(assetPattern)) {
      const publicPath = decodeURIComponent(match[1].split("?")[0]).replace(/^\/assets\/v1/, "");
      if (!existsSync(join(root, "public", publicPath))) {
        missing.add(`${relative(root, path)} -> ${publicPath}`);
      }
    }
  }

  assert.deepEqual([...missing].sort(), []);
});

test("the home page ships canonical content without hydration patch layers", () => {
  const page = readFileSync(join(appRoot, "page.tsx"), "utf8");
  const clientLayer = readFileSync(join(appRoot, "ClientLayer.ts"), "utf8");

  assert.match(page, /Вселенная романа/);
  assert.match(page, /Три мира, связанные одним законом/);
  assert.match(page, /Межа между Явью и Навью становится тоньше/);
  assert.doesNotMatch(page, /<footer\b/);
  assert.doesNotMatch(clientLayer, /CanonWorldCopy|HomeUniverseLayer/);
  assert.equal(existsSync(join(appRoot, "CanonWorldCopy.tsx")), false);
  assert.equal(existsSync(join(appRoot, "HomeUniverseLayer.tsx")), false);
});

test("production copy contains no known service placeholders", () => {
  const forbidden = [
    "Ссылки на музыкальные площадки будут добавлены",
    "Начало романа появится здесь следующим шагом",
    "Deployment trigger: no visual change",
    "lorem ipsum",
  ];

  for (const path of sources) {
    const source = readFileSync(path, "utf8").toLowerCase();
    for (const phrase of forbidden) {
      assert.equal(source.includes(phrase.toLowerCase()), false, `${relative(root, path)} contains: ${phrase}`);
    }
  }
});

test("the global footer is unique and hides the secret route until it is unlocked", () => {
  const footer = readFileSync(join(appRoot, "GlobalFooter.tsx"), "utf8");
  const secretLink = readFileSync(join(appRoot, "BeyondFooterLink.tsx"), "utf8");

  assert.equal((footer.match(/<footer\b/g) ?? []).length, 1);
  assert.match(footer, /<BeyondFooterLink\s*\/>/);
  assert.match(secretLink, /readAnomalyState\(\)\.beyondUnlocked/);
  assert.match(secretLink, /href="\/za-mezhoy"/);
});

test("public routes are discoverable while the secret archive stays out of search", () => {
  const sitemap = readFileSync(join(appRoot, "sitemap.ts"), "utf8");
  const robots = readFileSync(join(appRoot, "robots.ts"), "utf8");
  const beyondLayout = readFileSync(join(appRoot, "za-mezhoy", "layout.tsx"), "utf8");

  for (const route of ["/o-romane", "/genealogy", "/larets-predaniy"]) {
    assert.match(sitemap, new RegExp(route.replace("/", "\\/")));
  }
  assert.doesNotMatch(sitemap, /\$\{origin\}\/za-mezhoy/);
  assert.match(robots, /disallow:\s*\["\/za-mezhoy"/);
  assert.match(beyondLayout, /index:\s*false/);
  assert.match(beyondLayout, /follow:\s*false/);
});

test("Night Nav stays click-only at night and keeps an accessible touch target", () => {
  const sitePolish = readFileSync(join(appRoot, "SitePolish.tsx"), "utf8");
  const layout = readFileSync(join(appRoot, "layout.tsx"), "utf8");
  const accessibility = readFileSync(join(appRoot, "audit-accessibility.css"), "utf8");
  const nightStart = sitePolish.indexOf("function setupNightNavAnomaly()");
  const memoryStart = sitePolish.indexOf("function openMemoryChoice", nightStart);
  const nightSection = sitePolish.slice(nightStart, memoryStart);

  assert.ok(nightStart >= 0 && memoryStart > nightStart, "Night Nav setup section must exist");
  assert.match(nightSection, /addNightLight\(\);/);
  assert.match(nightSection, /light\.addEventListener\("click"[\s\S]*?awakenNav\(true\)/);
  assert.doesNotMatch(nightSection, /IntersectionObserver/);
  assert.match(nightSection, /nav-awake-preview/);
  assert.match(layout, /import "\.\/audit-accessibility\.css"/);
  assert.match(accessibility, /\[data-night-nav\][\s\S]*?width:\s*44px\s*!important/);
  assert.match(accessibility, /\[data-night-nav\][\s\S]*?height:\s*44px\s*!important/);
});

test("the duplicate Vasilisk mount and Reading DOM patch are absent", () => {
  const layout = readFileSync(join(appRoot, "layout.tsx"), "utf8");
  const template = readFileSync(join(appRoot, "template.tsx"), "utf8");
  const page = readFileSync(join(appRoot, "page.tsx"), "utf8");

  assert.equal((`${layout}\n${template}`.match(/<VasiliskCatRevenge\s*\/>/g) ?? []).length, 1);
  assert.equal(existsSync(join(appRoot, "ReadingAccessEnhancer.tsx")), false);
  assert.match(page, /href="\/chitat"/);
  assert.doesNotMatch(`${layout}\n${template}`, /ReadingAccessEnhancer/);
});

test("hidden character assets wait until the character section is near", () => {
  const hook = readFileSync(join(appRoot, "useCharactersSectionNearby.ts"), "utf8");
  const effects = readFileSync(join(appRoot, "CharacterEffect.tsx"), "utf8");
  const vladimir = readFileSync(join(appRoot, "VladimirPortraitSwap.tsx"), "utf8");

  assert.match(hook, /rootMargin:\s*"150% 0px"/);
  assert.match(effects, /if \(!charactersNearby\) return/);
  assert.match(vladimir, /if \(!charactersNearby\) return/);
});

test("native images expose adaptive candidates without replacing anomaly selectors", () => {
  const page = readFileSync(join(appRoot, "page.tsx"), "utf8");
  const responsive = readFileSync(join(root, "lib/site/responsive-images.ts"), "utf8");

  assert.match(page, /<img\b/);
  assert.match(page, /responsiveImage\(/);
  assert.match(responsive, /srcSet:/);
  assert.doesNotMatch(page, /from\s+["']next\/image["']/);
  assert.match(page, /data-anomaly-character/);
});

test("Larets dust uses one managed canvas instead of particle DOM nodes", () => {
  const dust = readFileSync(join(appRoot, "larets-predaniy", "LaretsDust.tsx"), "utf8");
  assert.match(dust, /Array\.from\(\{ length: 1350 \}/);
  assert.match(dust, /Array\.from\(\{ length: 220 \}/);
  assert.match(dust, /<canvas\b/);
  assert.doesNotMatch(dust, /<i\b/);
});

test("versioned assets receive immutable cache headers", () => {
  const config = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.match(config, /\/assets\/v1\/\:path\*/);
  assert.match(config, /max-age=31536000, immutable/);
  assert.match(config, /minimumCacheTTL:\s*31_536_000/);
});

test("all four secret tales are statically enumerated and keep their access guard", () => {
  const page = readFileSync(join(appRoot, "za-mezhoy", "tales", "[slug]", "page.tsx"), "utf8");
  const client = readFileSync(join(appRoot, "za-mezhoy", "tales", "[slug]", "SecretStoryClient.tsx"), "utf8");
  assert.match(page, /generateStaticParams/);
  assert.match(page, /SECRET_STORY_IDS\.map/);
  assert.match(page, /dynamicParams = false/);
  assert.match(client, /state\.found\.length === SIGN_COUNT/);
});

test("the home page is server-rendered with isolated navigation and Navnik clients", () => {
  const page = readFileSync(join(appRoot, "page.tsx"), "utf8");
  const navigation = readFileSync(join(appRoot, "HomeNavigation.tsx"), "utf8");
  const navnik = readFileSync(join(appRoot, "NavnikCreatureGrid.tsx"), "utf8");

  assert.doesNotMatch(page, /^"use client"/);
  assert.match(page, /<HomeNavigation sections=\{sections\}/);
  assert.match(page, /<NavnikCreatureGrid creatures=\{creatures\}/);
  assert.match(navigation, /^"use client"/);
  assert.match(navnik, /^"use client"/);
});
