import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@budega/shared", "@budega/supabase"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
