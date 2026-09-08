export type ResponsiveImagePreset = "card" | "wide" | "thumb";

const PRESETS: Record<ResponsiveImagePreset, { widths: number[]; sizes: string }> = {
  card: {
    widths: [384, 640, 828],
    sizes: "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 34vw",
  },
  wide: {
    widths: [640, 1080, 1920],
    sizes: "(max-width: 720px) 100vw, 90vw",
  },
  thumb: {
    widths: [256, 384, 640],
    sizes: "(max-width: 720px) 44vw, 280px",
  },
};

function optimizedSrc(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export function responsiveImage(src: string, preset: ResponsiveImagePreset) {
  const config = PRESETS[preset];
  return {
    srcSet: config.widths.map((width) => `${optimizedSrc(src, width)} ${width}w`).join(", "),
    sizes: config.sizes,
  };
}
