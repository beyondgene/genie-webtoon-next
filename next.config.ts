import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    //typedRoutes: true,
  },
  images: {
    remotePatterns: [],
  },
  eslint: {
    // keep build failing when ESLint errors exist
    ignoreDuringBuilds: false,
  },
  typescript: {
    // keep build failing when TS errors exist
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
