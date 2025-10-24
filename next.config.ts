// next.config.ts
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  // Disable tracing to avoid permission issues
  tracing: false,
  // Disable telemetry
  telemetry: false,
};

export default nextConfig;