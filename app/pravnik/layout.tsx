import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правник — существа и помощники Прави",
  description: "Правник мира «Там, где умирает Явь»: Громыши, Росники, Родень, Суденицы, Вилы и самовилы, Жар-птица и Рарог.",
};

export default function PravnikLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
