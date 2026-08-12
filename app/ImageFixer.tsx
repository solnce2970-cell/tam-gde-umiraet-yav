"use client";

import { useEffect } from "react";

const OLD_ORIGIN = "https://tam-gde-umiraet-yav.inessa1981.chatgpt.site";

function rewriteImage(img: HTMLImageElement) {
  const src = img.getAttribute("src");
  if (!src || !src.startsWith(OLD_ORIGIN)) return;

  try {
    const url = new URL(src);
    img.src = `/api/remote-image?path=${encodeURIComponent(url.pathname)}`;
  } catch {
    // Leave invalid URLs untouched.
  }
}

function scan(root: ParentNode = document) {
  root.querySelectorAll<HTMLImageElement>("img").forEach(rewriteImage);
}

export default function ImageFixer() {
  useEffect(() => {
    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
          rewriteImage(mutation.target);
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node instanceof HTMLImageElement) rewriteImage(node);
          scan(node);
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
