import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ENABLE_RESEARCH_MODE:
      process.env.NEXT_PUBLIC_ENABLE_RESEARCH_MODE ??
      process.env.ENABLE_RESEARCH_MODE ??
      "false",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  },
};

export default nextConfig;
