const footerSections = [
  { href: "/#world", label: "Мир" },
  { href: "/#navnik", label: "Навник" },
  { href: "/#characters", label: "Персонажи" },
  { href: "/genealogy#gods-title", label: "Лики богов" },
  { href: "/za-mezhoy", label: "За Межой" },
  { href: "/#music", label: "Музыка" },
  { href: "/#news", label: "Новости" },
];

export default function GlobalFooter() {
  return (
    <>
      <style>{`body > main > footer { display: none !important; }`}</style>
      <footer>
        <img className="footerLogo" src="/images/logo-yav.webp" alt="" aria-hidden="true" />
        <h2>Там, где умирает Явь</h2>
        <p>Автор Инесса Логинова · Роман и музыка</p>
        <div>
          {footerSections.map((section) => (
            <a key={section.href} href={section.href}>{section.label}</a>
          ))}
        </div>
        <small>© 2026</small>
      </footer>
    </>
  );
}
