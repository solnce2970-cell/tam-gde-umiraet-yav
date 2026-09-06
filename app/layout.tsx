import type { Metadata } from "next";
import "./globals.css";
import "./hero.css";
import "./fonts.css";
import "./nav-awakening.css";
import "./global-header.css";
import "./global-footer.css";
import "./audit-accessibility.css";
import "./atmosphere-effects.css";
import "./atmosphere-motion-fix.css";
import BackToTop from "./BackToTop";
import MusicPlayerPortal from "./MusicPlayerPortal";
import NavnikModalPortal from "./NavnikModalPortal";
import MezhaAnomaly from "./MezhaAnomaly";
import ShishigaTrack from "./ShishigaTrack";
import AnomalyDebugPanel from "./AnomalyDebugPanel";
import SignFoundReveal from "./SignFoundReveal";
import GlobalHeader from "./GlobalHeader";
import GlobalFooter from "./GlobalFooter";
import AmbientAnomalies from "./AmbientAnomalies";
import ReadingAccessEnhancer from "./ReadingAccessEnhancer";
import MemoryContractInputFix from "./MemoryContractInputFix";
import VasiliskCatRevenge from "./VasiliskCatRevenge";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tamgdeumiraetyav.ru"),
  title: {
    default: "Там, где умирает Явь",
    template: "%s · Там, где умирает Явь",
  },
  description: "Официальный сайт тёмного славянского фэнтези «Там, где умирает Явь»: три мира, герои, Навник, музыка и Знаки Межи.",
  keywords: ["тёмное славянское фэнтези", "славянская мифология", "Там, где умирает Явь", "Инесса Логинова"],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Там, где умирает Явь",
    title: "Там, где умирает Явь",
    description: "Тёмное славянское фэнтези о мире, в котором древние правила перестали работать.",
    images: [{ url: "/images/hero-new.webp", width: 3504, height: 2336, alt: "Там, где умирает Явь" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Там, где умирает Явь",
    description: "Тёмное славянское фэнтези о мире, в котором древние правила перестали работать.",
    images: ["/images/hero-new.webp"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <GlobalHeader />
        {children}
        <GlobalFooter />
        <NavnikModalPortal />
        <MusicPlayerPortal />
        <MezhaAnomaly />
        <AmbientAnomalies />
        <VasiliskCatRevenge />
        <BackToTop />
        <ShishigaTrack />
        <SignFoundReveal />
        <AnomalyDebugPanel />
        <ReadingAccessEnhancer />
        <MemoryContractInputFix />
      </body>
    </html>
  );
}
