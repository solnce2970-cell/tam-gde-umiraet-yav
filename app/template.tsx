import Bridge from "./Bridge";
import NavigationMemory from "./NavigationMemory";
import WrongWayStar from "./WrongWayStar";
import MavkiWaterWhisper from "./MavkiWaterWhisper";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Bridge />
      <NavigationMemory />
      <WrongWayStar />
      <MavkiWaterWhisper />
    </>
  );
}
