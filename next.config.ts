import type { NextConfig } from "next";

/**
 * Static export: `npm run build` writes plain files to `out/`, which GitHub Actions
 * publishes to GitHub Pages (https://blackamethyst.concerto.id). No server runtime:
 * data, auth and storage come from Supabase in the browser.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
