import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Там, где умирает Явь",
  description: "Официальный сайт романа «Там, где умирает Явь»",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
