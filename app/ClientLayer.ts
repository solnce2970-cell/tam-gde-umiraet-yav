"use client";

import { createElement, Fragment } from "react";
import CharacterEffect from "./CharacterEffect";
import MezhaSound from "./MezhaSound";

export default function ClientLayer() {
  return createElement(
    Fragment,
    null,
    createElement(CharacterEffect),
    createElement(MezhaSound),
  );
}
