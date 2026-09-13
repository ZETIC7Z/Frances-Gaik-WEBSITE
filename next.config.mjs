/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * The ambient film is served from `/media/ambient` rather than its own
   * `/video/ambient-loop.mp4`.
   *
   * A URL that ends in `.mp4` is what makes a download manager offer the
   * backdrop as a file to save, and what makes a browser with "always download
   * video files" set do exactly that — the film was being intercepted instead
   * of played. The rewrite costs nothing (the bytes are still served from the
   * same static asset, and the browser still receives `video/mp4`), but the
   * address the page asks for no longer looks like something to download.
   */
  async rewrites() {
    return [{ source: '/media/ambient', destination: '/video/ambient-loop.mp4' }];
  },
  // The live Chrome verification session uses loopback; allow Next's dev
  // asset requests from both localhost and 127.0.0.1 without warnings.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    // AVIF/WebP first — the covers and source logos are the heaviest paint on
    // the page, and the optimizer caches them for a month.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [],
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
      {
        /**
         * The ambient film is the heaviest asset on the site (2.6 MB) and it is
         * requested on every page. Without a cache rule it was revalidated on
         * every navigation, so a visitor paging through the site re-fetched the
         * whole file each time — which is also what makes a download manager
         * offer it over and over. It is immutable between builds (the build
         * script rewrites it wholesale), so it is served once and then from the
         * browser's cache, and `inline` states outright that this is media to
         * play, not a file to save. The rule covers the address the page asks
         * for (`/media/ambient`) as well as the file behind it.
         */
        source: '/(video|media)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
      {
        /**
         * Brand marks and source logos: small, content-stable, and re-fetched on
         * every page view otherwise.
         */
        source: '/:dir(stores|sources|brand)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, immutable' }],
      },
    ];
  },
};

export default nextConfig;
