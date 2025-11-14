// next.config.ts
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Only fail build on actual ESLint errors, not warnings
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  typescript: {
    // Only fail on serious TypeScript errors during production builds
    ignoreBuildErrors: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/artwall-by-jr.appspot.com/**',
      },
    ],
  },
};

export default nextConfig;