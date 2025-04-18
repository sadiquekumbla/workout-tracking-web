/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/workout-tracking-web' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/workout-tracking-web/' : '',
  trailingSlash: true,
  distDir: 'out',
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig 