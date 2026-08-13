import { createElement, Fragment } from "react";
import MezhaSound from "./MezhaSound";
import Bridge from "./Bridge";

void MezhaSound;

export default function Template({ children }: { children: React.ReactNode }) {
  const extra = createElement(Bridge);
  return createElement(Fragment, null, children, extra);
}
