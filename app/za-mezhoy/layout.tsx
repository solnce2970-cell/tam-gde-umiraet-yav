import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "За Межой",
  description: "Скрытый архив Знаков Межи и тайных сказаний.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function BeyondLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
