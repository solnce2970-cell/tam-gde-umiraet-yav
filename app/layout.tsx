import type { Metadata } from "next";
import "./globals.css";
import "./hero.css";
import "./fonts.css";
import "./nav-awakening.css";
import BackToTop from "./BackToTop";
import MusicPlayerPortal from "./MusicPlayerPortal";
import NavnikModalPortal from "./NavnikModalPortal";
import MezhaMist from "./MezhaMist";
import MezhaText from "./MezhaText";
import MakoshThread from "./MakoshThread";

export const metadata: Metadata = {
  title: "Там, где умирает Явь",
  description: "Официальный сайт романа «Там, где умирает Явь»",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <NavnikModalPortal />
        <MusicPlayerPortal />
        <MezhaMist />
        <MezhaText />
        <MakoshThread />
        <BackToTop />
      </body>
    </html>
  );
}
