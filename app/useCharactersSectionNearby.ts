"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useCharactersSectionNearby() {
  const pathname = usePathname();
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setNearby(false);
      return;
    }

    const section = document.getElementById("characters");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry.isIntersecting),
      { rootMargin: "150% 0px", threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [pathname]);

  return pathname === "/" && nearby;
}
