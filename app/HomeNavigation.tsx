"use client";

import { useState } from "react";

type NavigationItem = { href: string; label: string };

export default function HomeNavigation({ sections }: { sections: readonly NavigationItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Основная навигация">
      <a className="brand" href="#top">Там, где умирает Явь</a>
      <div className="navLinks">{sections.map((section) => <a key={section.href} href={section.href}>{section.label}</a>)}</div>
      <button className="menuToggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-menu">
        {menuOpen ? "Закрыть меню" : "Открыть меню"}
      </button>
      {menuOpen && (
        <div className="mobileMenu" id="mobile-menu">
          {sections.map((section) => <a key={section.href} href={section.href} onClick={() => setMenuOpen(false)}>{section.label}</a>)}
        </div>
      )}
    </nav>
  );
}
