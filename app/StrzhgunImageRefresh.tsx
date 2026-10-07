"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const FRESH_STRZHGUN_SRC = "/images/navnik/strzhgun.webp?v=20261007-2";

export default function StrzhgunImageRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const refresh = () => {
      document.querySelectorAll<HTMLImageElement>('img[alt="Стрижгун в полный рост на болотной дороге"]').forEach((img) => {
        if (img.dataset.strzhgunFresh === "1") return;
        img.dataset.strzhgunFresh = "1";
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = FRESH_STRZHGUN_SRC;
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
