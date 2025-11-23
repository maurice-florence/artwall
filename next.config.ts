// next.config.ts
import type { NextConfig } from 'next';
// next.config.js (CommonJS, not TypeScript)
const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Fix for "Unconfigured Host" error
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    // domains removed; use only remotePatterns as per Next.js 15+ best practices
  },
  transpilePackages: ['react-responsive-masonry'],
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  },
};

module.exports = nextConfig;