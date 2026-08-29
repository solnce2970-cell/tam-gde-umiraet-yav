import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ларец преданий",
  description: "Образы и фрагменты памяти из мира «Там, где умирает Явь».",
};

export default function LaretsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
