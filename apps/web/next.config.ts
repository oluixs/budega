import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@budega/shared", "@budega/supabase", "@budega/sources"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      // Logos e capas de encarte importados dos sites oficiais (packages/sources).
      { protocol: "https", hostname: "cometasupermercados.com.br" },
      { protocol: "https", hostname: "adminx.cometasupermercados.com.br" },
    ],
  },
};

export default nextConfig;
