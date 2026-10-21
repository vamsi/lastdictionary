import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole dictionary is pre-rendered to static HTML: no server, no functions.
  // Deploys to Vercel or any static host from the `out/` folder.
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
