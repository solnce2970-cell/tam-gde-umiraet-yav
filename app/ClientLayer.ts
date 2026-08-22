"use client";

import { createElement, Fragment } from "react";
import CharacterEffect from "./CharacterEffect";

export default function ClientLayer() {
  return createElement(
    Fragment,
    null,
    createElement(CharacterEffect),
  );
}
