import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    rules: {
      '*.svg': {
        as: '*.js',
        loaders: ['@svgr/webpack'],
      },
    },
  },
};

export default nextConfig;
