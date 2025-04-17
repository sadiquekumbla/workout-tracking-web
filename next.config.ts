import type { NextConfig } from "next";

const config: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: '/workout-tracking-web',
  assetPrefix: '/workout-tracking-web/'
};

export default config;
