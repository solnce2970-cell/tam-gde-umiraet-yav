import type { NextRequest } from "next/server";

const OLD_ORIGIN = "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site";

function candidates(path: string) {
  const list = [path];

  if (path === "/characters/ogneara.webp") {
    list.push(
      "/characters/ogneyara.webp",
      "/characters/ogneara.png",
      "/characters/ogneyara.png"
    );
  }

  return list;
}

function imageContentType(path: string, upstreamType: string | null) {
  if (upstreamType?.startsWith("image/")) return upstreamType;
  const clean = path.toLowerCase().split("?")[0];
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path || !path.startsWith("/") || path.includes("..")) {
    return new Response("Bad image path", { status: 400 });
  }

  for (const candidate of candidates(path)) {
    try {
      const upstream = await fetch(`${OLD_ORIGIN}${candidate}`, {
        cache: "force-cache",
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!upstream.ok) continue;

      const body = await upstream.arrayBuffer();
      const contentType = imageContentType(candidate, upstream.headers.get("content-type"));

      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        },
      });
    } catch {
      // Try the next candidate. If all fail, return 404 below.
    }
  }

  return new Response("Image not found", { status: 404 });
}
