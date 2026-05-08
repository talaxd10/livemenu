import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript type checking is skipped during build to avoid WASM SWC crash on this platform.
  // Run `npx tsc --noEmit` manually to type-check.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default nextConfig;
