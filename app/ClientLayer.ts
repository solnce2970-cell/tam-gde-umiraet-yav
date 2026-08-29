"use client";

import { createElement, Fragment } from "react";
import CanonWorldCopy from "./CanonWorldCopy";
import HomeUniverseLayer from "./HomeUniverseLayer";
import CharacterEffect from "./CharacterEffect";
import ReturnToBeginningCrack from "./ReturnToBeginningCrack";
import SemarglSvarogSpark from "./SemarglSvarogSpark";
import SilentPathAnomaly from "./SilentPathAnomaly";
import VladimirThirdTrackOverlay from "./VladimirThirdTrackOverlay";
import WhiteEyesSign from "./WhiteEyesSign";

export default function ClientLayer() {
  return createElement(
    Fragment,
    null,
    createElement(CanonWorldCopy),
    createElement(HomeUniverseLayer),
    createElement(CharacterEffect),
    createElement(WhiteEyesSign),
    createElement(VladimirThirdTrackOverlay),
    createElement(SemarglSvarogSpark),
    createElement(SilentPathAnomaly),
    createElement(ReturnToBeginningCrack),
  );
}
