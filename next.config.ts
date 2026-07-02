import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Album covers are served straight from the Spotify CDN — we never store them.
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "**.scdn.co" },
      { protocol: "https", hostname: "**.spotifycdn.com" },
    ],
  },
  experimental: {
    // sharp is used in server actions for dominant-colour extraction.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
