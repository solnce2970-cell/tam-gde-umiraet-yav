export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COUNTER_BASE = "https://abacus.jasoncameron.dev";
const COUNTER_NAMESPACE = "tamgdeumiraetyav-4f2d9c8a71";
const COUNTER_KEY = "mezha-13-complete-6b7e31";
const CACHE_TTL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 4_500;

let cachedCount = 0;
let cacheExpiresAt = 0;
let hasCachedCount = false;

function counterUrl(action: "get" | "hit"): string {
  return `${COUNTER_BASE}/${action}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
}

async function requestCounter(action: "get" | "hit"): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(counterUrl(action), {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (action === "get" && response.status === 404) return 0;
    if (!response.ok) throw new Error(`Counter service returned ${response.status}`);

    const data = await response.json() as { value?: unknown };
    const value = Number(data.value);
    if (!Number.isFinite(value) || value < 0) throw new Error("Counter service returned an invalid value");
    return Math.floor(value);
  } finally {
    clearTimeout(timeout);
  }
}

function responseBody(count: number, available: boolean, status = 200): Response {
  return Response.json(
    { count, available },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}

export async function GET(): Promise<Response> {
  if (hasCachedCount && Date.now() < cacheExpiresAt) {
    return responseBody(cachedCount, true);
  }

  try {
    cachedCount = await requestCounter("get");
    hasCachedCount = true;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return responseBody(cachedCount, true);
  } catch {
    return responseBody(cachedCount, false);
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: { completed?: unknown };
  try {
    body = await request.json() as { completed?: unknown };
  } catch {
    return responseBody(cachedCount, false, 400);
  }

  if (body.completed !== true) return responseBody(cachedCount, false, 400);

  try {
    cachedCount = await requestCounter("hit");
    hasCachedCount = true;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return responseBody(cachedCount, true);
  } catch {
    return responseBody(cachedCount, false, 503);
  }
}
