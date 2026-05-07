import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['shared-types'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
