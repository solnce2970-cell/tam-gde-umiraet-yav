import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31_536_000,
  },
  async headers() {
    return [
      {
        source: "/assets/v1/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return [{ source: "/assets/v1/:path*", destination: "/:path*" }];
  },
};

export default nextConfig;
