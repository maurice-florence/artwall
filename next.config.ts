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
      // Add this pattern for direct storage.googleapis.com/artwall-by-jr.firebasestorage.app/* URLs
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/artwall-by-jr.firebasestorage.app/**',
      },
    ],
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
  },
  transpilePackages: ['react-responsive-masonry'],
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  },
};

module.exports = nextConfig;