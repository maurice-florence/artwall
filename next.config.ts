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
    // Allow Firebase Storage in both URL styles:
    // - firebasestorage.googleapis.com/v0/b/<bucket>/o/... (API style)
    // - storage.googleapis.com/<bucket>/... (GS style)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/artwall-by-jr.appspot.com/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/artwall-by-jr.appspot.com/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/artwall-by-jr.firebasestorage.app/**',
      },
    ],
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
};

export default nextConfig;