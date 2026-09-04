"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/chitat", label: "Читать" },
  { href: "/o-romane", label: "О романе" },
  { href: "/#navnik", label: "Навник" },
  { href: "/#characters", label: "Герои" },
  { href: "/genealogy#gods-title", label: "Лики богов" },
  { href: "/#music", label: "Музыка" },
  { href: "/#news", label: "Новости" },
];

export default function GlobalHeader() {
  const pathname = usePathname();

  // На главной уже есть собственная полноценная шапка.
  if (pathname === "/") return null;

  return (
    <header className="globalSiteHeader">
      <div className="globalSiteHeaderInner">
        <a className="globalSiteBrand" href="/">Там, где умирает Явь</a>
        <nav className="globalSiteNav" aria-label="Навигация по сайту">
          {links.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <a className="globalReturnWorld" href="/#world">← Вернуться в мир</a>
      </div>
    </header>
  );
}
