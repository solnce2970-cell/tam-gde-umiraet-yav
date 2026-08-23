import { createElement, Fragment } from "react";
import Bridge from "./Bridge";
import NavigationMemory from "./NavigationMemory";
import WrongWayStar from "./WrongWayStar";
import MavkiWaterWhisper from "./MavkiWaterWhisper";
import NightNavClickGate from "./NightNavClickGate";

const beyondBackgroundFix = `
.beyondPage .hero {
  background-image:
    linear-gradient(180deg, rgba(5,8,6,.28) 0%, rgba(5,8,6,.48) 46%, rgba(7,10,8,.88) 100%),
    radial-gradient(circle at 50% 38%, rgba(5,8,6,.05) 0%, rgba(5,8,6,.28) 72%),
    url('/images/za-mezhoy/za-mezhoy-desktop.webp?v=3') !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
@media (max-width: 620px) {
  .beyondPage .hero {
    background-image:
      linear-gradient(180deg, rgba(5,8,6,.22) 0%, rgba(5,8,6,.44) 42%, rgba(7,10,8,.9) 100%),
      radial-gradient(circle at 50% 34%, rgba(5,8,6,.04) 0%, rgba(5,8,6,.3) 72%),
      url('/images/za-mezhoy/za-mezhoy-mobile.webp?v=3') !important;
    background-position: center top !important;
  }
}
`;

export default function Template({ children }: { children: React.ReactNode }) {
  const nightNavClickGate = createElement(NightNavClickGate);
  const extra = createElement(Bridge);
  const navigationMemory = createElement(NavigationMemory);
  const wrongWayStar = createElement(WrongWayStar);
  const mavkiWaterWhisper = createElement(MavkiWaterWhisper);
  const style = createElement("style", { dangerouslySetInnerHTML: { __html: beyondBackgroundFix } });
  return createElement(Fragment, null, children, nightNavClickGate, extra, navigationMemory, wrongWayStar, mavkiWaterWhisper, style);
}
