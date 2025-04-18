/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: '/workout-tracking-web',
  assetPrefix: '/workout-tracking-web/',
  trailingSlash: true,
  distDir: 'out',
}

module.exports = nextConfig 