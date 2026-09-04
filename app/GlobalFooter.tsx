import BeyondFooterLink from "./BeyondFooterLink";

const footerSections = [
  { href: "/#world", label: "Вернуться в мир" },
  { href: "/chitat", label: "Читать" },
  { href: "/o-romane", label: "О романе" },
  { href: "/#navnik", label: "Навник" },
  { href: "/#characters", label: "Персонажи" },
  { href: "/genealogy#gods-title", label: "Лики богов" },
  { href: "/#music", label: "Музыка" },
  { href: "/#news", label: "Новости" },
];

export default function GlobalFooter() {
  return (
    <footer>
      <img className="footerLogo" src="/images/logo-yav.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <h2>Там, где умирает Явь</h2>
      <p>Автор Инесса Логинова · Роман и музыка</p>
      <nav aria-label="Навигация в подвале">
        {footerSections.map((section, index) => (
          <a key={`${section.href}-${index}`} href={section.href}>{section.label}</a>
        ))}
        <BeyondFooterLink />
      </nav>
      <small>© 2026</small>
    </footer>
  );
}
