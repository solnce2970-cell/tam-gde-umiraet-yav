import { createElement } from "react";
import MezhaSound from "./MezhaSound";
import Bridge from "./Bridge";

void MezhaSound;

export default function Template({ children }: { children: React.ReactNode }) {
  const extra = createElement(Bridge);
  void extra;
  return <>{children}</>;
}
