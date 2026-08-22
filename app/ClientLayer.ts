"use client";

import { createElement, Fragment } from "react";
import CharacterEffect from "./CharacterEffect";
import WhiteEyesSign from "./WhiteEyesSign";

export default function ClientLayer() {
  return createElement(
    Fragment,
    null,
    createElement(CharacterEffect),
    createElement(WhiteEyesSign),
  );
}
