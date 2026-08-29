import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Родословная и лики богов",
  description: "Родственные линии и лики богов мира «Там, где умирает Явь».",
};

export default function GenealogyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
