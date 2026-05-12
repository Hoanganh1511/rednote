import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';
    return [{ source: '/proxy-api/:path*', destination: `${apiUrl}/:path*` }];
  },
  /** Tắt badge “Static” / ISR ở góc màn hình (dev). */
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  transpilePackages: ['shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 1080, 1200],
    imageSizes: [96, 256, 384],
  },
};

export default nextConfig;
