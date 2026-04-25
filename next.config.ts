import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/archive-lesson": ["./src/prompts/**"],
    },
  },
};

export default nextConfig;
