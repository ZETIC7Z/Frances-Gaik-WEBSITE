import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/config/seo';
import { site } from '@/config/siteData';

/**
 * Web app manifest. Android and Windows use this for the install prompt and
 * the name shown when the site is added to a home screen; the colours match the
 * Teal Ember defaults in `config/themes.ts`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — ${site.fullName}`,
    short_name: siteName,
    description: siteDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#081B1B',
    theme_color: '#081B1B',
    lang: 'en-US',
    categories: ['books', 'health', 'lifestyle'],
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
