/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The live Chrome verification session uses loopback; allow Next's dev
  // asset requests from both localhost and 127.0.0.1 without warnings.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    // AVIF/WebP first — the covers and source logos are the heaviest paint on
    // the page, and the optimizer caches them for a month.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
    ],
  },
  /**
   * Baseline hardening plus one explicit cache rule: the share card is fetched
   * by crawlers that will not run JavaScript, so it must be a plain static file
   * they can retrieve in a single request — and it is immutable between builds,
   * so it is served from the edge cache rather than the function.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/og/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
