import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/archive-lesson": ["./src/prompts/**"],
  },
};

export default nextConfig;
