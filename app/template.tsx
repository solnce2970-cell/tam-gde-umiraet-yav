import Bridge from "./Bridge";
import NavigationMemory from "./NavigationMemory";
import WrongWayStar from "./WrongWayStar";
import MavkiWaterWhisper from "./MavkiWaterWhisper";
import NightNavClickGate from "./NightNavClickGate";
import VasiliskCatRevenge from "./VasiliskCatRevenge";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NightNavClickGate />
      <Bridge />
      <NavigationMemory />
      <WrongWayStar />
      <MavkiWaterWhisper />
      <VasiliskCatRevenge />
    </>
  );
}
