import type { Metadata } from "next";
import "./globals.css";
import BackToTop from "./BackToTop";
import MusicPlayerPortal from "./MusicPlayerPortal";

export const metadata: Metadata = {
  title: "Там, где умирает Явь",
  description: "Официальный сайт романа «Там, где умирает Явь»",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <MusicPlayerPortal />
        <BackToTop />
      </body>
    </html>
  );
}
