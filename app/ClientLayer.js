"use client";

import React from "react";
import CharacterEffect from "./CharacterEffect";
import MezhaSound from "./MezhaSound";

export default function ClientLayer() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(CharacterEffect),
    React.createElement(MezhaSound),
  );
}
