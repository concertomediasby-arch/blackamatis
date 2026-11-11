import type { NextConfig } from "next";

/**
 * Static export for Hostinger Premium: `npm run build` writes plain files to `out/`,
 * which are uploaded to the subdomain's public_html. No server runtime: data, auth
 * and storage come from Supabase in the browser.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
