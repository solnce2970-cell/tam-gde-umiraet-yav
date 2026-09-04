import ReadingAtmosphere from "./ReadingAtmosphere";

export default function ReadingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <ReadingAtmosphere />
    </>
  );
}
